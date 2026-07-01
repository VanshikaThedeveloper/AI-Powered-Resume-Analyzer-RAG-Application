import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120; // 2 minutes (RAG pipeline + LLM processing might take some time)

export async function POST(request: NextRequest) {
  try {
    // 1. Extract the multipart/form-data from the incoming request
    const formData = await request.formData();
    
    // 2. Determine target backend URL
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/analyze`;

    // 3. Forward the FormData and headers to the FastAPI backend
    const sessionId = request.headers.get("x-session-id");
    const headers: Record<string, string> = {};
    if (sessionId) {
      headers["X-Session-ID"] = sessionId;
    }

    const response = await fetch(backendUrl, {
      method: "POST",
      body: formData,
      headers: headers,
    });

    // 4. Handle non-2xx backend errors
    if (!response.ok) {
      let errorDetail = "Backend error";
      try {
        const errorData = await response.json();
        errorDetail = errorData.detail || errorData.message || JSON.stringify(errorData);
      } catch {
        const text = await response.text();
        errorDetail = text || errorDetail;
      }
      return NextResponse.json(
        { detail: errorDetail },
        { status: response.status }
      );
    }

    // 5. Parse and return the JSON response from FastAPI
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Proxy error in API Route Handler:", error);
    return NextResponse.json(
      { detail: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
