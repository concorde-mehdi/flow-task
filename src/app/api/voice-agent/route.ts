import { NextResponse } from 'next/server'

// L'agent vocal utilise un parser local (src/lib/voice-parser.ts) — pas d'API externe
export async function POST() {
  return NextResponse.json({ error: 'Utiliser le parser local' }, { status: 410 })
}
