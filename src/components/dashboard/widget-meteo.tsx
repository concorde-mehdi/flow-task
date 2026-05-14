'use client'

import { useEffect, useState } from 'react'
import { Wind, MapPin, Droplets, Sun } from 'lucide-react'

const WMO_EMOJI: Record<number, string> = {
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
  45: '🌫️', 48: '🌫️',
  51: '🌦️', 53: '🌦️', 55: '🌧️',
  61: '🌧️', 63: '🌧️', 65: '🌧️',
  71: '❄️', 73: '❄️', 75: '❄️',
  80: '🌦️', 81: '🌧️', 82: '⛈️',
  95: '⛈️', 96: '⛈️', 99: '⛈️',
}

const WMO_LABEL: Record<number, string> = {
  0: 'Ciel dégagé', 1: 'Peu nuageux', 2: 'Partiellement nuageux', 3: 'Couvert',
  45: 'Brouillard', 48: 'Brouillard givrant',
  51: 'Bruine légère', 53: 'Bruine', 55: 'Bruine dense',
  61: 'Pluie légère', 63: 'Pluie', 65: 'Pluie forte',
  71: 'Neige légère', 73: 'Neige', 75: 'Neige forte',
  80: 'Averses légères', 81: 'Averses', 82: 'Averses violentes',
  95: 'Orage', 96: 'Orage avec grêle', 99: 'Orage violent',
}

interface Meteo {
  temperature: number
  weathercode: number
  windspeed: number
  humidity: number
  uv: number
}

const BG_URL = 'https://images.unsplash.com/photo-1590059913771-df18b64c6c76?auto=format&fit=crop&w=800&q=70'

export function WidgetMeteo() {
  const [meteo, setMeteo] = useState<Meteo | null>(null)
  const [loading, setLoading] = useState(true)
  const [imgErr, setImgErr] = useState(false)

  async function charger() {
    try {
      const res = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=35.8245&longitude=10.6346&current=temperature_2m,weathercode,windspeed_10m,relativehumidity_2m,uv_index&timezone=Africa%2FTunis'
      )
      const json = await res.json()
      setMeteo({
        temperature: Math.round(json.current.temperature_2m),
        weathercode: json.current.weathercode,
        windspeed: Math.round(json.current.windspeed_10m),
        humidity: Math.round(json.current.relativehumidity_2m ?? 0),
        uv: Math.round(json.current.uv_index ?? 0),
      })
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    charger()
    const interval = setInterval(charger, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative overflow-hidden rounded-2xl h-full min-h-[220px]">
      {/* Photo de fond */}
      {!imgErr ? (
        <img
          src={BG_URL}
          alt="Sousse"
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setImgErr(true)}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-600" />
      )}
      {/* Overlay dégradé */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

      {/* Contenu */}
      <div className="relative h-full flex flex-col justify-between p-5">
        {/* Localisation */}
        <div className="flex items-center gap-1.5 text-white/90 text-sm font-medium">
          <MapPin className="w-3.5 h-3.5" />
          Sousse, Tunisie
        </div>

        {loading ? (
          <div className="space-y-2">
            <div className="h-12 bg-white/20 rounded-xl animate-pulse w-2/3" />
            <div className="h-4 bg-white/20 rounded animate-pulse w-1/2" />
          </div>
        ) : meteo ? (
          <div>
            <div className="flex items-end gap-2 mb-1">
              <span className="text-5xl leading-none">{WMO_EMOJI[meteo.weathercode] ?? '🌡️'}</span>
              <span className="text-4xl font-bold text-white leading-none">{meteo.temperature}°C</span>
            </div>
            <p className="text-sm text-white/80 mb-4">{WMO_LABEL[meteo.weathercode] ?? 'Conditions météo'}</p>

            {/* Stats météo */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 text-center">
                <Wind className="w-3.5 h-3.5 text-white/80 mx-auto mb-1" />
                <p className="text-white font-semibold text-xs">{meteo.windspeed} km/h</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 text-center">
                <Droplets className="w-3.5 h-3.5 text-white/80 mx-auto mb-1" />
                <p className="text-white font-semibold text-xs">{meteo.humidity}%</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 text-center">
                <Sun className="w-3.5 h-3.5 text-white/80 mx-auto mb-1" />
                <p className="text-white font-semibold text-xs">UV {meteo.uv}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-white/70">Données indisponibles</p>
        )}
      </div>
    </div>
  )
}
