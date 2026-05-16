import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  const { url } = await req.json()

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'URL manquante' }, { status: 400 })
  }

  const debut = Date.now()

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
    })

    clearTimeout(timeoutId)
    const ms = Date.now() - debut

    return NextResponse.json({
      up: response.ok || response.status < 400,
      statusCode: response.status,
      ms,
    })
  } catch (err: unknown) {
    const ms = Date.now() - debut
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    const timedOut = message.includes('abort') || message.includes('timeout')

    return NextResponse.json({
      up: false,
      statusCode: null,
      ms,
      error: timedOut ? 'Timeout (8s)' : 'Inaccessible',
    })
  }
}
