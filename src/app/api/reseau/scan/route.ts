import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Route appelée par le bouton "Scanner" du widget réseau
// Lance un ping HTTP côté serveur — fonctionne uniquement si les IPs sont accessibles depuis Vercel
// Pour les IPs internes, utiliser ping_reseau.py à la place
export async function POST() {
  return NextResponse.json(
    { info: 'Utiliser le script ping_reseau.py pour les IPs locales' },
    { status: 200 }
  )
}

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data } = await supabase.from('connexions_pc').select('id, nom, ip, statut')
  return NextResponse.json(data ?? [])
}
