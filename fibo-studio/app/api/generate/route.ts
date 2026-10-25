import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const allowedSizes = new Set(["1024x1024", "1024x1536", "1536x1024"]);

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Image generation is not configured yet. Add OPENAI_API_KEY to your Vercel environment variables." }, { status: 503 });
    const body = await request.json();
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    const style = typeof body.style === "string" ? body.style.slice(0, 60) : "Dreamlike";
    const size = allowedSizes.has(body.size) ? body.size : "1024x1024";
    if (!prompt) return NextResponse.json({ error: "Please enter an image description." }, { status: 400 });
    if (prompt.length > 1800) return NextResponse.json({ error: "Your prompt is too long. Keep it under 1,800 characters." }, { status: 400 });

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-image-1", prompt: `Art direction: ${style}. Create a polished, visually compelling image. User's idea: ${prompt}`, size, n: 1 }),
      signal: AbortSignal.timeout(55000),
    });
    const result = await response.json();
    if (!response.ok) {
      const message = typeof result?.error?.message === "string" ? result.error.message : "The image provider could not complete this request.";
      return NextResponse.json({ error: message }, { status: response.status === 401 ? 502 : response.status });
    }
    const encoded = result?.data?.[0]?.b64_json;
    if (typeof encoded !== "string") return NextResponse.json({ error: "The image provider returned no image. Please try again." }, { status: 502 });
    return NextResponse.json({ image: `data:image/png;base64,${encoded}` });
  } catch (error) {
    const message = error instanceof Error && error.name === "TimeoutError" ? "Image generation timed out. Please try again." : "Could not generate an image. Check your connection and try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
