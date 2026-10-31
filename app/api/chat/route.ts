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
    msg.toLowerCase().includes("rate limit") ||
    msg.includes("503") ||
    msg.toLowerCase().includes("unavailable")
  );
}

export async function POST(req: Request) {
  try {
    const { messages, guestResume } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages are required." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    let resumeContext = "";
    if (guestResume) {
      resumeContext = `\n\nThe user's saved resume (for context):\n\n${guestResume.slice(0, 8000)}\n`;
    } else {
      try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from("profiles")
            .select("resume_text, full_name")
            .eq("id", user.id)
            .single();

          if (data?.resume_text) {
            resumeContext = `\n\nThe user's saved resume (for context):\n\n${data.resume_text.slice(0, 8000)}\n`;
          }
        }
      } catch {}
    }

    const systemInstruction = `You are CareerCraft Copilot, a sharp, senior career consultant and resume writer. You are concise, specific, and actionable. ${resumeContext}`;

    const trimmed = messages.slice(-12);
    const firstUserIdx = trimmed.findIndex((m: ChatMessage) => m.role === "user");
    const sanitized = trimmed
      .slice(firstUserIdx === -1 ? 0 : firstUserIdx)
      .map((m: ChatMessage) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const modelsToTry = [GEMINI_MODEL, GEMINI_FALLBACK_MODEL];
    let lastErr: unknown = null;

    for (const modelName of modelsToTry) {
      try {
        // Initialize the model with the dynamic system instruction
        const model = ai.getGenerativeModel({
          model: modelName,
          systemInstruction: systemInstruction,
        });

        // Request a streaming response from the Google Gen AI SDK
        const responseStream = await model.generateContentStream({
          contents: sanitized,
        });

        // Setup a clean modern standard ReadableStream for Next.js
        const stream = new ReadableStream({
          async start(controller) {
            try {
              for await (const chunk of responseStream.stream) {
                const text = chunk.text();
                if (text) {
                  controller.enqueue(new TextEncoder().encode(text));
                }
              }
              controller.close();
            } catch (streamErr) {
              controller.error(streamErr);
            }
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Transfer-Encoding": "chunked",
          },
        });
      } catch (err) {
        lastErr = err;
        // Fall back immediately if we run into a rate limit or 503 instance
        if (isRateLimitError(err)) {
          continue;
        }
        // Break out early for syntax/invalid authentication issues
        break;
      }
    }

    // Both models failed or unexpected static configuration error
    return new Response(
      JSON.stringify({
        error: "Failed to generate text response.",
        details: lastErr instanceof Error ? lastErr.message : String(lastErr),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } catch (globalErr) {
    return new Response(
      JSON.stringify({ error: "An unexpected internal error occurred." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
