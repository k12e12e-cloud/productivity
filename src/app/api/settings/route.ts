import { NextRequest, NextResponse } from "next/server";
import { getSetting, setSetting } from "@/db/queries/settings";

function maskKey(key: string): string {
  if (key.length <= 8) return "••••••••";
  return "••••••••" + key.slice(-4);
}

export async function GET() {
  try {
    const apiKey = getSetting("openrouter_api_key");
    return NextResponse.json({
      openrouterApiKey: apiKey ? maskKey(apiKey) : null,
      hasKey: !!apiKey,
    });
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.openrouterApiKey !== undefined) {
      const key = body.openrouterApiKey?.trim();
      if (!key) {
        return NextResponse.json({ error: "API key is required" }, { status: 400 });
      }
      setSetting("openrouter_api_key", key);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/settings error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
