import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { message } = await request.json()

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message vide' }, { status: 400 })
  }

  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    return NextResponse.json({ error: 'Configuration Telegram manquante' }, { status: 500 })
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
  })

  if (!res.ok) {
    const err = await res.json()
    return NextResponse.json({ error: err.description ?? 'Erreur Telegram' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
