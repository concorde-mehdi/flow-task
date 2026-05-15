"""
FlowTask — Agent de ping réseau local
Lance ce script via le Planificateur de tâches Windows toutes les 5-15 min.
Nécessite : pip install requests
"""

import subprocess
import requests
import sys
import json
from datetime import datetime

# ── Configuration ──────────────────────────────────────────────────────────
SUPABASE_URL  = "https://ojmlrcoufbjusrbulumg.supabase.co"
SERVICE_KEY   = "COLLE_ICI_TA_SERVICE_ROLE_KEY"   # Supabase → Settings → API → service_role
PING_TIMEOUT  = 1000   # ms par tentative
PING_COUNT    = 1      # nombre de pings par IP
# ───────────────────────────────────────────────────────────────────────────

HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal",
}

def ping(ip: str) -> bool:
    """Retourne True si l'IP répond au ping ICMP."""
    try:
        result = subprocess.run(
            ["ping", "-n", str(PING_COUNT), "-w", str(PING_TIMEOUT), ip],
            capture_output=True,
            text=True,
            timeout=5,
        )
        return result.returncode == 0
    except Exception:
        return False

def get_connexions():
    resp = requests.get(
        f"{SUPABASE_URL}/rest/v1/connexions_pc?select=id,nom,ip",
        headers=HEADERS,
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()

def update_statut(id: str, statut: str):
    resp = requests.patch(
        f"{SUPABASE_URL}/rest/v1/connexions_pc?id=eq.{id}",
        headers=HEADERS,
        json={"statut": statut},
        timeout=10,
    )
    resp.raise_for_status()

def main():
    print(f"\n[{datetime.now().strftime('%H:%M:%S')}] Scan réseau FlowTask")
    print("─" * 40)

    try:
        connexions = get_connexions()
    except Exception as e:
        print(f"Erreur Supabase : {e}")
        sys.exit(1)

    if not connexions:
        print("Aucune connexion configurée dans FlowTask.")
        return

    for c in connexions:
        en_ligne = ping(c["ip"])
        statut   = "en_ligne" if en_ligne else "hors_ligne"
        symbole  = "✓" if en_ligne else "✗"
        print(f"  {symbole}  {c['nom']:<25} {c['ip']:<18} → {statut}")
        try:
            update_statut(c["id"], statut)
        except Exception as e:
            print(f"     Erreur mise à jour : {e}")

    print("─" * 40)
    print(f"Scan terminé — {len(connexions)} équipement(s)\n")

if __name__ == "__main__":
    main()
