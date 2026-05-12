import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isPast, parseISO, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import nodemailer from 'nodemailer'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (token !== process.env.RESUME_EMAIL_SECRET?.trim()) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const userId = process.env.RESUME_USER_ID
  if (!userId) {
    return NextResponse.json({ error: 'RESUME_USER_ID manquant' }, { status: 500 })
  }

  // Client admin Supabase (contourne RLS)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const maintenant = new Date()

  const { data: tachesData } = await supabase
    .from('taches')
    .select('*')
    .eq('user_id', userId)
    .eq('statut', false)
    .order('deadline', { ascending: true, nullsFirst: false })

  const taches = tachesData ?? []

  const { data: chargesData } = await supabase
    .from('charges')
    .select('*')
    .eq('user_id', userId)
    .eq('statut', 'en_attente')
    .order('date_echeance', { ascending: true, nullsFirst: false })

  const charges = chargesData ?? []

  const { data: liensData } = await supabase
    .from('liens')
    .select('*')
    .eq('user_id', userId)
    .eq('consulte', false)
    .order('created_at', { ascending: false })

  const liensNonConsultes = liensData ?? []

  // Catégoriser les tâches
  const urgentes = taches.filter(t => {
    if (!t.deadline) return false
    const diffMs = parseISO(t.deadline).getTime() - maintenant.getTime()
    return diffMs > 0 && diffMs < 24 * 60 * 60 * 1000
  })

  const enRetard = taches.filter(t =>
    t.deadline && isPast(parseISO(t.deadline))
  )

  const quotidiennes = taches.filter(t => t.is_quotidienne)

  const aFaire = taches.filter(t =>
    !urgentes.some(u => u.id === t.id) &&
    !enRetard.some(r => r.id === t.id)
  ).slice(0, 8)

  const dateFormatee = format(maintenant, "EEEE d MMMM yyyy", { locale: fr })

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    body{font-family:-apple-system,Arial,sans-serif;background:#f8fafc;margin:0;padding:20px}
    .container{max-width:600px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)}
    .header{background:#3B82F6;color:white;padding:24px 28px}
    .header h1{margin:0;font-size:20px;font-weight:700}
    .header p{margin:4px 0 0;opacity:.85;font-size:13px;text-transform:capitalize}
    .body{padding:24px 28px}
    .section{margin-bottom:24px}
    .section-title{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#6B7280;margin-bottom:10px}
    .item{padding:10px 14px;border-radius:8px;margin-bottom:6px;font-size:14px}
    .item-urgent{background:#FEF2F2;border-left:3px solid #EF4444}
    .item-retard{background:#FFF7ED;border-left:3px solid #F97316}
    .item-normal{background:#F8FAFC;border-left:3px solid #E2E8F0}
    .item-charge{background:#F0FDF4;border-left:3px solid #22C55E}
    .item-title{font-weight:600;color:#111827}
    .item-meta{font-size:12px;color:#6B7280;margin-top:2px}
    .badge{display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:600;margin-left:6px}
    .badge-urgent{background:#FEE2E2;color:#DC2626}
    .badge-retard{background:#FED7AA;color:#C2410C}
    .empty{color:#9CA3AF;font-size:14px;font-style:italic;padding:8px 0}
    .stats{display:flex;gap:12px;margin-bottom:24px}
    .stat{flex:1;background:#F8FAFC;border-radius:8px;padding:12px;text-align:center}
    .stat-num{font-size:22px;font-weight:800;color:#111827}
    .stat-label{font-size:11px;color:#6B7280;margin-top:2px}
    .footer{background:#F8FAFC;padding:16px 28px;text-align:center;font-size:12px;color:#9CA3AF;border-top:1px solid #E5E7EB}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>FlowTask — Résumé du jour</h1>
      <p>${dateFormatee}</p>
    </div>
    <div class="body">
      <div class="stats">
        <div class="stat"><div class="stat-num" style="color:#EF4444">${urgentes.length}</div><div class="stat-label">Urgentes</div></div>
        <div class="stat"><div class="stat-num" style="color:#F97316">${enRetard.length}</div><div class="stat-label">En retard</div></div>
        <div class="stat"><div class="stat-num" style="color:#3B82F6">${taches.length}</div><div class="stat-label">À faire</div></div>
        <div class="stat"><div class="stat-num" style="color:#F59E0B">${charges.length}</div><div class="stat-label">Charges dues</div></div>
        <div class="stat"><div class="stat-num" style="color:#8B5CF6">${liensNonConsultes.length}</div><div class="stat-label">Liens à voir</div></div>
      </div>

      <div class="section">
        <div class="section-title">Urgentes (&lt; 24h)</div>
        ${urgentes.length === 0
          ? '<p class="empty">Aucune tâche urgente</p>'
          : urgentes.map(t => `<div class="item item-urgent"><div class="item-title">${t.titre}<span class="badge badge-urgent">${t.priorite}</span></div>${t.deadline ? `<div class="item-meta">Deadline : ${format(parseISO(t.deadline), "HH'h'mm, d MMM", { locale: fr })}</div>` : ''}</div>`).join('')}
      </div>

      ${enRetard.length > 0 ? `
      <div class="section">
        <div class="section-title">En retard</div>
        ${enRetard.map(t => `<div class="item item-retard"><div class="item-title">${t.titre}<span class="badge badge-retard">Retard</span></div>${t.deadline ? `<div class="item-meta">Prévu le ${format(parseISO(t.deadline), "d MMM yyyy", { locale: fr })}</div>` : ''}</div>`).join('')}
      </div>` : ''}

      ${quotidiennes.length > 0 ? `
      <div class="section">
        <div class="section-title">Quotidiennes</div>
        ${quotidiennes.map(t => `<div class="item item-normal"><div class="item-title">${t.titre}</div></div>`).join('')}
      </div>` : ''}

      <div class="section">
        <div class="section-title">À faire</div>
        ${aFaire.length === 0
          ? '<p class="empty">Aucune autre tâche en attente</p>'
          : aFaire.map(t => `<div class="item item-normal"><div class="item-title">${t.titre}</div>${t.deadline ? `<div class="item-meta">Deadline : ${format(parseISO(t.deadline), "d MMM yyyy", { locale: fr })}</div>` : ''}</div>`).join('')}
      </div>

      ${charges.length > 0 ? `
      <div class="section">
        <div class="section-title">Charges en attente</div>
        ${charges.slice(0, 5).map(c => `<div class="item item-charge"><div class="item-title">${c.titre}</div><div class="item-meta">${Number(c.montant).toLocaleString('fr-TN', { minimumFractionDigits: 3 })} DT${c.date_echeance ? ` — Échéance : ${format(parseISO(c.date_echeance), 'd MMM yyyy', { locale: fr })}` : ''}</div></div>`).join('')}
      </div>` : ''}

      ${liensNonConsultes.length > 0 ? `
      <div class="section">
        <div class="section-title">Liens à consulter (${liensNonConsultes.length})</div>
        ${liensNonConsultes.slice(0, 5).map(l => `<div class="item" style="background:#F5F3FF;border-left:3px solid #8B5CF6"><div class="item-title"><a href="${l.url}" style="color:#7C3AED;text-decoration:none">${l.titre}</a></div><div class="item-meta">${l.categorie}${l.notes ? ` — ${l.notes}` : ''}</div></div>`).join('')}
      </div>` : ''}
    </div>
    <div class="footer">FlowTask — ${format(maintenant, "d MMMM yyyy 'à' HH'h'mm", { locale: fr })}</div>
  </div>
</body>
</html>`

  // Envoi via Gmail SMTP
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })

  await transporter.sendMail({
    from: `"FlowTask" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_TO ?? process.env.GMAIL_USER,
    subject: `FlowTask — Résumé du ${dateFormatee}`,
    html,
  })

  return NextResponse.json({
    ok: true,
    message: 'Email envoyé',
    stats: {
      taches: taches.length,
      urgentes: urgentes.length,
      enRetard: enRetard.length,
      charges: charges.length,
      liensNonConsultes: liensNonConsultes.length,
    }
  })
}
