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

  // Flow implicite : le token est dans le hash (#), invisible côté serveur.
  // On retourne une page HTML qui lit le hash et redirige vers le dashboard.
  return new Response(
    `<!DOCTYPE html><html><head><meta charset="utf-8">
    <script>
      var h = window.location.hash;
      window.location.replace(h ? '/dashboard' + h : '/connexion');
    </script>
    </head><body></body></html>`,
    { headers: { 'content-type': 'text/html; charset=utf-8' } }
  )
}
