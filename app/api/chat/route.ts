import { ai, GEMINI_MODEL, GEMINI_FALLBACK_MODEL } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

type ChatMessage = { role: "user" | "assistant"; content: string };

function isRateLimitError(err: unknown): boolean {
  if (!err) return false;
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes("429") ||
    msg.toLowerCase().includes("quota") ||
    msg.toLowerCase().includes("resource_exhausted") ||
    msg.toLowerCase().includes("rate limit")
  );
}

export async function POST(req: Request) {
  try {
    const { messages } = (await req.json()) as { messages: ChatMessage[] };
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages are required." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    let resumeContext = "";
    try {
      const supabase = await createClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("resume_text, full_name")
          .eq("id", user.id)
          .single();
        if (data?.resume_text) {
          resumeContext = `\n\nThe user's saved resume (for context, do not quote verbatim unless asked):\n"""\n${data.resume_text.slice(0, 8000)}\n"""`;
        }
      }
    } catch {
      // no context, continue
    }

    const systemInstruction = `You are CareerCraft Copilot, a sharp, senior career consultant and resume writer.
You are concise, specific, and actionable. You help users:
- Rewrite resume bullets with measurable impact (use the STAR or XYZ formula when useful)
- Prepare for interviews
- Reason about career transitions and job search strategy
You avoid fluff, generic advice, and disclaimers. When rewriting bullets, output the improved version directly, then a one-line rationale.
${resumeContext}`;

    const trimmed = messages.slice(-12);
    const firstUserIdx = trimmed.findIndex((m) => m.role === "user");
    const sanitized = trimmed
      .slice(firstUserIdx === -1 ? 0 : firstUserIdx)
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));

    // Try streaming on primary; on 429, retry with backoff, then fallback model
    const modelsToTry = [GEMINI_MODEL, GEMINI_FALLBACK_MODEL];
    let lastErr: unknown = null;

    for (const modelName of modelsToTry) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const streamResult = await ai.models.generateContentStream({
            model: modelName,
            contents: sanitized as never,
            config: { systemInstruction } as never
          });

          const encoder = new TextEncoder();
          const readable = new ReadableStream({
            async start(controller) {
              try {
                for await (const chunk of streamResult) {
                  const text = chunk.text ?? "";
                  if (text) controller.enqueue(encoder.encode(text));
                }
                controller.close();
              } catch (e) {
                controller.error(e);
              }
            }
          });

          return new Response(readable, {
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "Cache-Control": "no-cache, no-transform",
              "X-Model": modelName
            }
          });
        } catch (err) {
          lastErr = err;
          if (isRateLimitError(err) && attempt === 0) {
            const delayMs = 1000;
            console.warn(
              `Rate-limited on ${modelName}. Retrying in ${delayMs}ms.`
            );
            await new Promise((r) => setTimeout(r, delayMs));
            continue;
          }
          break; // move to next model
        }
      }
    }

    console.error("chat error:", lastErr);
    return new Response(
      JSON.stringify({
        error: "rate_limited",
        message:
          "I'm thinking too fast — please wait a moment and try again."
      }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("chat error:", err);
    return new Response(
      JSON.stringify({ error: "Chat failed." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
