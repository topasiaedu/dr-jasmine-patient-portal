import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { resolvePatientFromRequest } from "@/lib/auth/resolve-patient-request";

const VISION_PROMPT = `This is a patient health logbook. Extract the most recent row of readings.
Return ONLY a JSON object with these exact keys (use null if a value is not visible or not present):
{
  "fastingBloodSugar": number | null,
  "postDinnerBloodSugar": number | null,
  "bloodPressureSystolic": number | null,
  "bloodPressureDiastolic": number | null,
  "pulseRate": number | null,
  "weightKg": number | null,
  "waistlineCm": number | null
}
All blood sugar values are in mmol/L. Blood pressure in mmHg. Weight in kg. Waistline in cm.
Do not include any explanation text — only the JSON object.`;

interface ExtractedReadings {
  fastingBloodSugar: number | null;
  postDinnerBloodSugar: number | null;
  bloodPressureSystolic: number | null;
  bloodPressureDiastolic: number | null;
  pulseRate: number | null;
  weightKg: number | null;
  waistlineCm: number | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function optionalNumber(value: unknown): number | null {
  if (value === null) {
    return null;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  return null;
}

function parseExtractedFromUnknown(parsed: unknown): ExtractedReadings | null {
  if (!isRecord(parsed)) {
    return null;
  }
  return {
    fastingBloodSugar: optionalNumber(parsed.fastingBloodSugar),
    postDinnerBloodSugar: optionalNumber(parsed.postDinnerBloodSugar),
    bloodPressureSystolic: optionalNumber(parsed.bloodPressureSystolic),
    bloodPressureDiastolic: optionalNumber(parsed.bloodPressureDiastolic),
    pulseRate: optionalNumber(parsed.pulseRate),
    weightKg: optionalNumber(parsed.weightKg),
    waistlineCm: optionalNumber(parsed.waistlineCm),
  };
}

function stripJsonFence(text: string): string {
  const trimmed = text.trim();
  const fence = /^```(?:json)?\s*([\s\S]*?)```$/m.exec(trimmed);
  if (fence && typeof fence[1] === "string") {
    return fence[1].trim();
  }
  return trimmed;
}

/**
 * Accepts a multipart image, returns vision-extracted reading fields for the authenticated patient.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!(await resolvePatientFromRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const imageEntry = formData.get("image");
  if (!(imageEntry instanceof Blob)) {
    return NextResponse.json({ error: "Missing image" }, { status: 400 });
  }

  const arrayBuffer = await imageEntry.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const mimeType = imageEntry.type.length > 0 ? imageEntry.type : "image/jpeg";
  const dataUrl = `data:${mimeType};base64,${base64}`;

  const client = new OpenAI();

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: VISION_PROMPT },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
      max_tokens: 500,
    });

    const rawText = completion.choices[0]?.message?.content;
    if (typeof rawText !== "string" || rawText.length === 0) {
      return NextResponse.json(
        { error: "Could not extract readings from image" },
        { status: 422 }
      );
    }

    const cleaned = stripJsonFence(rawText);
    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "Could not extract readings from image" },
        { status: 422 }
      );
    }

    const extracted = parseExtractedFromUnknown(parsed);
    if (!extracted) {
      return NextResponse.json(
        { error: "Could not extract readings from image" },
        { status: 422 }
      );
    }

    return NextResponse.json({ extracted });
  } catch {
    return NextResponse.json({ error: "Image processing failed" }, { status: 500 });
  }
}
