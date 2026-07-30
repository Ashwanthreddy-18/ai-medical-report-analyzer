import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink, access } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";
import { LlamaParseReader } from "llamaindex";
import { processMedicalReport } from "@/lib/groq-service";

// Supported MIME types and extensions
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/jpg",
  "image/png",
]);

const ALLOWED_EXTENSIONS = new Set([".pdf", ".docx", ".jpg", ".jpeg", ".png"]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  return lastDot !== -1 ? filename.slice(lastDot).toLowerCase() : "";
}

async function deleteFileIfExists(filepath: string): Promise<void> {
  try {
    await access(filepath);
    await unlink(filepath);
  } catch {
    // File doesn't exist or already deleted — ignore
  }
}

/** Return a user-friendly error response for Groq API errors */
function getGroqErrorResponse(error: unknown): { message: string; status: number } {
  if (
    error &&
    typeof error === "object" &&
    "status" in error &&
    error.status === 401
  ) {
    return {
      message:
        "Invalid Groq API key. Please update your GROQ_API_KEY in the .env.local file. " +
        "Get a new key at https://console.groq.com",
      status: 401,
    };
  }
  return {
    message:
      "Failed to analyze the medical report. The AI service is temporarily unavailable. Please try again later.",
    status: 503,
  };
}

export async function POST(req: NextRequest) {
  // Validate required environment variables
  if (!process.env.LLAMA_CLOUD_API_KEY) {
    console.error("Missing required environment variable: LLAMA_CLOUD_API_KEY");
    return NextResponse.json(
      { error: "Server configuration error. Please contact support." },
      { status: 503 }
    );
  }

  if (!process.env.GROQ_API_KEY) {
    console.error("Missing required environment variable: GROQ_API_KEY");
    return NextResponse.json(
      { error: "Server configuration error. Please contact support." },
      { status: 503 }
    );
  }

  let formData: FormData;
  let rawText: string | null = null;
  let file: File | null = null;

  try {
    formData = await req.formData();

    // Check for direct text input first
    const textInput = formData.get("text");
    if (textInput && typeof textInput === "string" && textInput.trim()) {
      rawText = textInput.trim();
    }

    // Check for file upload
    const uploadedFile = formData.get("file");
    if (uploadedFile && uploadedFile instanceof File) {
      file = uploadedFile;
    }

    if (!rawText && !file) {
      return NextResponse.json(
        { error: "No file uploaded or text provided. Please select a file or paste report text." },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid form data. Please try again." },
      { status: 400 }
    );
  }

  // ── Direct text input path ──
  if (rawText) {
    const documents = [{ text: rawText }];
    let processedReport: { originalDocument: string; analysis: string };
    try {
      processedReport = await processMedicalReport(documents);
    } catch (groqError) {
      console.error("Groq analysis error:", groqError);
      const { message, status } = getGroqErrorResponse(groqError);
      return NextResponse.json({ error: message }, { status });
    }
    return NextResponse.json(
      { success: true, report: processedReport },
      { status: 200 }
    );
  }

  // ── File upload validation ──
  if (!file) {
    return NextResponse.json(
      { error: "No file uploaded. Please select a file." },
      { status: 400 }
    );
  }

  if (file.size === 0) {
    return NextResponse.json(
      { error: "The uploaded file is empty. Please upload a valid file." },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      {
        error: `File size exceeds the 10 MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(1)} MB.`,
      },
      { status: 413 }
    );
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json(
      {
        error:
          "Unsupported file type. Please upload a PDF, DOCX, JPG, JPEG, or PNG file.",
      },
      { status: 415 }
    );
  }

  const extension = getFileExtension(file.name);
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    return NextResponse.json(
      {
        error:
          "Unsupported file extension. Please upload a PDF, DOCX, JPG, JPEG, or PNG file.",
      },
      { status: 415 }
    );
  }

  // ── File processing with LlamaParse ──
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const uniqueFilename = `${randomUUID()}-${sanitizedName}`;
  const filepath = join(tmpdir(), uniqueFilename);

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    let documents: Array<{ text: string }>;
    let parseFailed = false;
    try {
      const reader = new LlamaParseReader({ resultType: "markdown" });
      documents = await reader.loadData(filepath);
    } catch (parseError) {
      console.error("LlamaParse error:", parseError);
      parseFailed = true;
      documents = [{ text: "" }];
    }

    // If LlamaParse returned no content, try Groq with the raw file info if it's an image
    const hasContent = documents &&
      documents.length > 0 &&
      documents[0]?.text &&
      documents[0].text !== "NO_CONTENT_HERE" &&
      documents[0].text.trim().length > 0;

    if (!hasContent && !parseFailed) {
      // LlamaParse processed but returned nothing — send a descriptive message to Groq
      documents = [{
        text: `[Medical Report Analysis]\nFile: ${file.name} (${(file.size / 1024).toFixed(0)} KB, ${file.type})\n\nThe text content could not be automatically extracted from this medical report file. Based on the file name and type provided above, please explain what this type of medical test/report typically contains, what patients should look for, and how they can understand their health results.`,
      }];
    }

    let processedReport: { originalDocument: string; analysis: string };
    try {
      processedReport = await processMedicalReport(documents);
    } catch (groqError) {
      console.error("Groq analysis error:", groqError);
      const { message, status } = getGroqErrorResponse(groqError);
      return NextResponse.json({ error: message }, { status });
    }

    return NextResponse.json(
      { success: true, report: processedReport },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error processing file:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  } finally {
    await deleteFileIfExists(filepath);
  }
}
