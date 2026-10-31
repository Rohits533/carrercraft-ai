import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(request: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY environment variable is missing' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { prompt, messages, systemInstruction, modelName = 'gemini-2.5-flash' } = body;

    const ai = new GoogleGenAI({ apiKey });

    // FIX: Using the correct @google/genai SDK syntax instead of getGenerativeModel
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt || messages,
      config: {
        systemInstruction: systemInstruction || 'You are a helpful AI career assistant.',
      },
    });

    return NextResponse.json({ text: response.text }, { status: 200 });

  } catch (error: any) {
    console.error('[Chat API Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate chat response' },
      { status: 500 }
    );
  }
}
