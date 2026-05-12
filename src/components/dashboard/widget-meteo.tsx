'use client'

import { useEffect, useState } from 'react'
import { Wind, MapPin } from 'lucide-react'

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
}

export function WidgetMeteo() {
  const [meteo, setMeteo] = useState<Meteo | null>(null)
  const [loading, setLoading] = useState(true)

  async function charger() {
    try {
      const res = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=35.8245&longitude=10.6346&current=temperature_2m,weathercode,windspeed_10m&timezone=Africa%2FTunis'
      )
      const json = await res.json()
      setMeteo({
        temperature: Math.round(json.current.temperature_2m),
        weathercode: json.current.weathercode,
        windspeed: Math.round(json.current.windspeed_10m),
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
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/50 flex items-center justify-center">
          <span className="text-base">🌤️</span>
        </div>
        <div className="flex items-center gap-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
          <MapPin className="w-3.5 h-3.5 text-gray-400" />
          Sousse
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-1/2" />
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-2/3" />
        </div>
      ) : meteo ? (
        <div>
          <div className="flex items-end gap-3 mb-2">
            <span className="text-4xl">{WMO_EMOJI[meteo.weathercode] ?? '🌡️'}</span>
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{meteo.temperature}°C</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{WMO_LABEL[meteo.weathercode] ?? 'Conditions météo'}</p>
          <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 mt-1.5">
            <Wind className="w-3 h-3" />
            <span>{meteo.windspeed} km/h</span>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-400">Données indisponibles</p>
      )}
    </div>
  )
}
