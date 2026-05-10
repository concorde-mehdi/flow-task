import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      `${origin}/connexion?erreur=${encodeURIComponent(error)}`
    )
  }

  if (code) {
    return NextResponse.redirect(`${origin}/dashboard?code=${code}`)
  }

  return NextResponse.redirect(`${origin}/connexion`)
}
