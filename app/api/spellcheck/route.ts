import { NextRequest, NextResponse } from 'next/server';

const LT_API = 'https://api.languagetool.org/v2/check';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json() as { text: string };
    if (!text || text.trim().length < 2) return NextResponse.json({ matches: [] });

    const body = new URLSearchParams({
      text,
      language:    'fr-FR',
      enabledOnly: 'false',
      level:       'picky',
    });

    const res = await fetch(LT_API, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
      body,
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return NextResponse.json({ matches: [] });
    const data = await res.json();
    return NextResponse.json({ matches: data.matches ?? [] });
  } catch {
    return NextResponse.json({ matches: [] });
  }
}
