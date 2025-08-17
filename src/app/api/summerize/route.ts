// app/api/summarize/route.ts
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { transcript, prompt } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Pass plain text input (not role/parts format)
    const result = await model.generateContent(
      `Transcript:\n${transcript}\n\nInstruction: ${prompt}`
    );

    const output = result.response.text();
    console.log("Gemini API Key:", process.env.GEMINI_API_KEY);

    return NextResponse.json({ summary: output });
  } catch (error) {
    console.error(error);
    console.log("Gemini API Key:", process.env.GEMINI_API_KEY);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
