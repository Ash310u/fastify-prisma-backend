import { GoogleGenerativeAI, type Part } from "@google/generative-ai";

const SYSTEM_INSTRUCTION =
  "You are a waste detection AI. Always respond in valid JSON only.";

const ANALYSIS_PROMPT = [
  "Analyze the provided image and determine whether it contains garbage/waste.",
  "Return exactly one JSON object with this shape and no extra keys:",
  "{",
  '  "isGarbage": boolean,',
  '  "category": "plastic" | "dry" | "wet" | "construction" | "biomedical" | "hazardous" | "electronic" | "mixed" | "domestic",',
  '  "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",',
  '  "obejct": string,',
  '  "confidence": number,',
  '  "reason": string',
  "}",
  "Severity definitions:",
  "LOW - small isolated item",
  "MEDIUM - pile or accumulation",
  "HIGH - large dumping or drain blockage",
  "CRITICAL - hazardous, biomedical, or fire risk",
  "Set confidence to a number between 0 and 1.",
].join("\n");

const WASTE_CATEGORIES = [
  "plastic",
  "dry",
  "wet",
  "construction",
  "biomedical",
  "hazardous",
  "electronic",
  "mixed",
  "domestic",
] as const;

const WASTE_SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

export type WasteCategory = (typeof WASTE_CATEGORIES)[number];
export type WasteSeverity = (typeof WASTE_SEVERITIES)[number];

export type WasteAnalysisResult = {
  isGarbage: boolean;
  category: WasteCategory | null;
  severity: WasteSeverity | null;
  object?: string;
  confidence: number;
  reason: string;
};

const FALLBACK_RESULT: WasteAnalysisResult = {
  isGarbage: false,
  category: null,
  severity: null,
  confidence: 0,
  reason: "AI response is invalid or confidence is too low",
};

let testAnalyzerOverride:
  | ((imageUrl: string) => Promise<WasteAnalysisResult>)
  | null = null;

export function setGeminiAnalyzerForTests(
  analyzer: ((imageUrl: string) => Promise<WasteAnalysisResult>) | null,
) {
  testAnalyzerOverride = analyzer;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseJsonObject(responseText: string): unknown {
  const trimmed = responseText.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");

    if (firstBrace >= 0 && lastBrace > firstBrace) {
      return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
    }

    throw new Error("Gemini response did not contain valid JSON");
  }
}

function isWasteCategory(value: unknown): value is WasteCategory {
  return (
    typeof value === "string" &&
    (WASTE_CATEGORIES as readonly string[]).includes(value)
  );
}

function isWasteSeverity(value: unknown): value is WasteSeverity {
  return (
    typeof value === "string" &&
    (WASTE_SEVERITIES as readonly string[]).includes(value)
  );
}

async function buildInlineImagePart(imageUrl: string): Promise<Part> {
  const imageResponse = await fetch(imageUrl);

  if (!imageResponse.ok) {
    throw new Error("Failed to fetch image for Gemini analysis");
  }

  const mimeTypeHeader = imageResponse.headers.get("content-type") ?? "";
  const mimeType = mimeTypeHeader.split(";")[0]?.trim().toLowerCase() ?? "";

  if (!mimeType.startsWith("image/")) {
    throw new Error("Image URL did not return an image content type");
  }

  const bytes = await imageResponse.arrayBuffer();
  const base64Data = Buffer.from(bytes).toString("base64");

  return {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };
}

function validateAnalysisResult(raw: unknown): WasteAnalysisResult {
  if (!isRecord(raw)) {
    return FALLBACK_RESULT;
  }

  const reason =
    typeof raw.reason === "string" ? raw.reason : FALLBACK_RESULT.reason;
  const detectedObject =
    typeof raw.obejct === "string" && raw.obejct.trim().length > 0
      ? raw.obejct.trim()
        : "No specific object detected";
  const confidence =
    typeof raw.confidence === "number" ? raw.confidence : Number.NaN;

  if (
    raw.isGarbage !== true ||
    !isWasteCategory(raw.category) ||
    !isWasteSeverity(raw.severity) ||
    !Number.isFinite(confidence) ||
    confidence < 0 ||
    confidence > 1 ||
    confidence < 0.6
  ) {
    return {
      ...FALLBACK_RESULT,
      reason,
      object: detectedObject
    };
  }

  return {
    isGarbage: true,
    category: raw.category,
    severity: raw.severity,
    object: detectedObject,
    confidence,
    reason,
  };
}

export async function analyzeWasteImage(
  imageUrl: string,
): Promise<WasteAnalysisResult> {
  if (testAnalyzerOverride) {
    return testAnalyzerOverride(imageUrl);
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: SYSTEM_INSTRUCTION,
  });

  const imagePart = await buildInlineImagePart(imageUrl);

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            text: ANALYSIS_PROMPT,
          },
          imagePart,
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const responseText = result.response.text();
  console.log("response ------", responseText);
  try {
    const parsed = parseJsonObject(responseText);
    return validateAnalysisResult(parsed);
  } catch (error) {
    return FALLBACK_RESULT;
  }
}
