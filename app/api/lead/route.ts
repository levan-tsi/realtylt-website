import { NextResponse } from "next/server";
import { parseLead, submitLead } from "@/lib/leads";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const source =
    typeof (body as Record<string, unknown>)?.source === "string"
      ? ((body as Record<string, unknown>).source as string)
      : "/";

  const parsed = parseLead(body, source);

  // Honeypot hits are dropped silently — bots see success.
  if (parsed.kind === "spam") return NextResponse.json({ ok: true });

  if (parsed.kind === "invalid") {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  }

  const result = await submitLead(parsed.lead);
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
