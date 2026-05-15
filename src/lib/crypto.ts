const SENTINEL_VALUE = 'FLOWTASK_V1'

function bufToB64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
}

function b64ToBuf(b64: string): ArrayBuffer {
  const bin = atob(b64)
  const arr = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
  return arr.buffer as ArrayBuffer
}

async function deriveKey(pin: string, salt: ArrayBuffer): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(pin), 'PBKDF2', false, ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export async function chiffrer(texte: string, pin: string): Promise<{ chiffre: string; iv: string; sel: string }> {
  const selBytes = crypto.getRandomValues(new Uint8Array(16))
  const ivBytes = crypto.getRandomValues(new Uint8Array(12))
  const sel = selBytes.buffer as ArrayBuffer
  const iv = ivBytes.buffer as ArrayBuffer
  const key = await deriveKey(pin, sel)
  const enc = new TextEncoder()
  const chiffreBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(texte))
  return {
    chiffre: bufToB64(chiffreBuf),
    iv: bufToB64(iv),
    sel: bufToB64(sel),
  }
}

export async function dechiffrer(chiffre: string, iv: string, sel: string, pin: string): Promise<string> {
  const key = await deriveKey(pin, b64ToBuf(sel))
  const dec = new TextDecoder()
  const plainBuf = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: b64ToBuf(iv) },
    key,
    b64ToBuf(chiffre)
  )
  return dec.decode(plainBuf)
}

export async function creerSentinel(pin: string) {
  return chiffrer(SENTINEL_VALUE, pin)
}

export async function verifierPin(pin: string, sentinel: { chiffre: string; iv: string; sel: string }): Promise<boolean> {
  try {
    const val = await dechiffrer(sentinel.chiffre, sentinel.iv, sentinel.sel, pin)
    return val === SENTINEL_VALUE
  } catch {
    return false
  }
}
