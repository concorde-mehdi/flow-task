import { createClient } from '@/lib/supabase/client'

export async function logActivite(type: string, description: string) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('activite').insert({ user_id: user.id, type, description })
  } catch {
    // silencieux — le log ne doit jamais bloquer l'action principale
  }
}
