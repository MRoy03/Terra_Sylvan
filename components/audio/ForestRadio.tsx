'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Music, X, Volume2, VolumeX, Play, Pause } from 'lucide-react'

interface Station {
  id:    string
  name:  string
  icon:  string
  color: string
}

const STATIONS: Station[] = [
  { id: 'rainforest',  name: 'Rain Forest',       icon: '🌧️', color: '#2d6a4f' },
  { id: 'crickets',    name: 'Midnight Crickets',  icon: '🌙', color: '#1a1a4e' },
  { id: 'wind',        name: 'Mountain Wind',      icon: '🌬️', color: '#4a6080' },
  { id: 'fire',        name: 'Campfire',           icon: '🔥', color: '#7a2a00' },
  { id: 'ocean',       name: 'Tidal Mangrove',     icon: '🌊', color: '#1a4060' },
]

type AudioNodes = {
  ctx:      AudioContext
  nodes:    AudioNode[]
  gainNode: GainNode
}

function createRainForest(ctx: AudioContext, gain: GainNode) {
  // Brown noise (rain)
  const bufferSize = ctx.sampleRate * 4
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  let last = 0
  for (let i = 0; i < bufferSize; i++) {
    const w = Math.random() * 2 - 1
    data[i] = (last + 0.02 * w) / 1.02
    last = data[i]
    data[i] *= 3.5
  }
  const src = ctx.createBufferSource()
  src.buffer = buffer
  src.loop = true

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 800

  src.connect(filter)
  filter.connect(gain)
  src.start()

  // Occasional distant thunder
  const lfo = ctx.createOscillator()
  const lfoGain = ctx.createGain()
  lfo.frequency.value = 0.05
  lfoGain.gain.value = 0.15
  lfo.connect(lfoGain)
  lfoGain.connect(gain.gain as unknown as AudioNode)
  lfo.start()

  return [src, filter, lfo, lfoGain]
}

function createCrickets(ctx: AudioContext, gain: GainNode) {
  const nodes: AudioNode[] = []
  // Multiple cricket oscillators at slightly different frequencies
  const baseFreqs = [4200, 4400, 4600, 4800, 5000]
  for (const freq of baseFreqs) {
    const osc = ctx.createOscillator()
    const oscGain = ctx.createGain()
    const lfo = ctx.createOscillator()
    const lfoGain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.value = freq
    oscGain.gain.value = 0.02

    lfo.frequency.value = 18 + Math.random() * 4
    lfoGain.gain.value = 0.02

    lfo.connect(lfoGain)
    lfoGain.connect(oscGain.gain as unknown as AudioNode)
    osc.connect(oscGain)
    oscGain.connect(gain)
    lfo.start()
    osc.start()

    nodes.push(osc, oscGain, lfo, lfoGain)
  }

  // Low-frequency ambience
  const amb = ctx.createOscillator()
  const ambGain = ctx.createGain()
  amb.type = 'sine'
  amb.frequency.value = 60
  ambGain.gain.value = 0.015
  amb.connect(ambGain)
  ambGain.connect(gain)
  amb.start()
  nodes.push(amb, ambGain)

  return nodes
}

function createWind(ctx: AudioContext, gain: GainNode) {
  const bufferSize = ctx.sampleRate * 4
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1

  const src = ctx.createBufferSource()
  src.buffer = buffer
  src.loop = true

  const hipass = ctx.createBiquadFilter()
  hipass.type = 'highpass'
  hipass.frequency.value = 400

  const lopass = ctx.createBiquadFilter()
  lopass.type = 'lowpass'
  lopass.frequency.value = 1800

  const tremolo = ctx.createOscillator()
  const tremoloGain = ctx.createGain()
  tremolo.frequency.value = 0.08
  tremoloGain.gain.value = 0.3

  src.connect(hipass)
  hipass.connect(lopass)
  lopass.connect(gain)
  tremolo.connect(tremoloGain)
  tremoloGain.connect(gain.gain as unknown as AudioNode)
  src.start()
  tremolo.start()

  return [src, hipass, lopass, tremolo, tremoloGain]
}

function createCampfire(ctx: AudioContext, gain: GainNode) {
  // Crackling = white noise with random bursts
  const bufferSize = ctx.sampleRate * 4
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() < 0.003 ? Math.random() * 0.8 : 0) + Math.random() * 0.02
  }
  const src = ctx.createBufferSource()
  src.buffer = buffer
  src.loop = true

  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 1200
  filter.Q.value = 0.5

  // Low roar
  const osc = ctx.createOscillator()
  const oscGain = ctx.createGain()
  osc.type = 'sawtooth'
  osc.frequency.value = 40
  oscGain.gain.value = 0.03
  const lfilt = ctx.createBiquadFilter()
  lfilt.type = 'lowpass'
  lfilt.frequency.value = 80

  src.connect(filter)
  filter.connect(gain)
  osc.connect(lfilt)
  lfilt.connect(oscGain)
  oscGain.connect(gain)
  src.start()
  osc.start()

  return [src, filter, osc, oscGain, lfilt]
}

function createOcean(ctx: AudioContext, gain: GainNode) {
  const bufferSize = ctx.sampleRate * 8
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  let last = 0
  for (let i = 0; i < bufferSize; i++) {
    const w = Math.random() * 2 - 1
    data[i] = (last + 0.015 * w) / 1.015
    last = data[i]
    data[i] *= 2.5
  }
  const src = ctx.createBufferSource()
  src.buffer = buffer
  src.loop = true

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 600

  const lfo = ctx.createOscillator()
  const lfoGain = ctx.createGain()
  lfo.frequency.value = 0.12
  lfoGain.gain.value = 0.4

  src.connect(filter)
  filter.connect(gain)
  lfo.connect(lfoGain)
  lfoGain.connect(filter.frequency as unknown as AudioNode)
  src.start()
  lfo.start()

  return [src, filter, lfo, lfoGain]
}

const STATION_BUILDERS: Record<string, (ctx: AudioContext, gain: GainNode) => AudioNode[]> = {
  rainforest: createRainForest,
  crickets:   createCrickets,
  wind:       createWind,
  fire:       createCampfire,
  ocean:      createOcean,
}

export function ForestRadio() {
  const [open,      setOpen]      = useState(false)
  const [playing,   setPlaying]   = useState(false)
  const [station,   setStation]   = useState<string>('rainforest')
  const [volume,    setVolume]    = useState(0.4)
  const [muted,     setMuted]     = useState(false)
  const audioRef = useRef<AudioNodes | null>(null)

  const stopAll = useCallback(() => {
    if (!audioRef.current) return
    try {
      audioRef.current.gainNode.gain.setTargetAtTime(0, audioRef.current.ctx.currentTime, 0.3)
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.nodes.forEach(n => { try { (n as AudioBufferSourceNode).stop?.() } catch {} })
          audioRef.current.ctx.close()
          audioRef.current = null
        }
      }, 500)
    } catch {}
  }, [])

  const startStation = useCallback((id: string, vol: number) => {
    stopAll()
    setTimeout(() => {
      try {
        const ctx   = new AudioContext()
        const gainN = ctx.createGain()
        gainN.gain.value = vol
        gainN.connect(ctx.destination)
        const nodes = STATION_BUILDERS[id]?.(ctx, gainN) ?? []
        audioRef.current = { ctx, nodes, gainNode: gainN }
      } catch {}
    }, 600)
  }, [stopAll])

  useEffect(() => {
    if (playing) startStation(station, muted ? 0 : volume)
    else stopAll()
    return stopAll
  }, [playing, station]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.gainNode.gain.setTargetAtTime(muted ? 0 : volume, audioRef.current.ctx.currentTime, 0.1)
    }
  }, [volume, muted])

  const currentStation = STATIONS.find(s => s.id === station)!

  return (
    <div className="fixed bottom-20 right-3 z-50 flex flex-col items-end gap-2">
      {open && (
        <div className="w-64 rounded-2xl border border-forest-700/50 bg-forest-950/95 backdrop-blur-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-forest-800/50"
               style={{ background: `${currentStation.color}40` }}>
            <div className="flex items-center gap-2">
              <span className="text-xl">{currentStation.icon}</span>
              <div>
                <p className="text-white text-xs font-bold leading-tight">{currentStation.name}</p>
                <p className="text-forest-500 text-[10px]">Forest Radio</p>
              </div>
            </div>
            <button onClick={() => setPlaying(v => !v)}
              className="w-8 h-8 rounded-full bg-forest-800/80 hover:bg-forest-700 flex items-center justify-center text-white transition-colors">
              {playing ? <Pause size={14} /> : <Play size={14} />}
            </button>
          </div>

          {/* Stations */}
          <div className="p-2 space-y-1">
            {STATIONS.map(s => (
              <button
                key={s.id}
                onClick={() => { setStation(s.id); if (!playing) setPlaying(true) }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors
                  ${station === s.id ? 'bg-forest-700/60 text-white' : 'text-forest-400 hover:bg-forest-800/60 hover:text-forest-200'}`}
              >
                <span className={`text-lg ${station === s.id && playing ? 'animate-pulse' : ''}`}>{s.icon}</span>
                <span className="text-xs font-medium">{s.name}</span>
                {station === s.id && playing && (
                  <span className="ml-auto flex gap-0.5">
                    {[1,2,3].map(i => (
                      <span key={i} className="w-0.5 bg-forest-400 rounded-full animate-bounce"
                        style={{ height: `${6 + i * 3}px`, animationDelay: `${i * 0.1}s` }} />
                    ))}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-t border-forest-800/50">
            <button onClick={() => setMuted(v => !v)} className="text-forest-500 hover:text-forest-300 transition-colors">
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume}
              onChange={e => { setVolume(Number(e.target.value)); setMuted(false) }}
              className="flex-1 h-1 accent-forest-500 cursor-pointer" />
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(v => !v)}
        className={`w-12 h-12 rounded-full shadow-2xl flex items-center justify-center transition-all
          ${playing
            ? 'bg-forest-600 hover:bg-forest-500 text-white ring-2 ring-forest-400/50 ring-offset-1 ring-offset-transparent'
            : 'bg-forest-950/90 border border-forest-700/50 text-forest-500 hover:text-forest-300'
          }`}
        title="Forest Radio"
      >
        <Music size={20} className={playing ? 'animate-pulse' : ''} />
      </button>
    </div>
  )
}
