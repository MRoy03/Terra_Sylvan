// Shared AudioContext — created once, reused to avoid browser limits
let _ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!_ctx || _ctx.state === 'closed') {
    _ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  return _ctx
}

function chime(
  freq: number,
  freqEnd: number,
  duration: number,
  gainPeak: number,
  type: OscillatorType = 'sine',
  delaySec = 0,
) {
  try {
    const c = getCtx()
    if (!c) return
    if (c.state === 'suspended') c.resume().catch(() => {})
    const osc = c.createOscillator()
    const env = c.createGain()
    osc.connect(env)
    env.connect(c.destination)
    osc.type = type
    const t0 = c.currentTime + delaySec
    osc.frequency.setValueAtTime(freq, t0)
    osc.frequency.exponentialRampToValueAtTime(freqEnd, t0 + duration * 0.6)
    env.gain.setValueAtTime(0, t0)
    env.gain.linearRampToValueAtTime(gainPeak, t0 + 0.008)
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
    osc.start(t0)
    osc.stop(t0 + duration + 0.01)
  } catch (_) {}
}

// ─── Public sound effects ────────────────────────────────────────────────────

/** Leaf rustle + ascending note — regular send */
export function playSend() {
  chime(480, 720, 0.14, 0.07)
  chime(480 * 1.5, 720 * 1.5, 0.10, 0.025, 'sine', 0.06)
}

/** Soft lower bell — incoming message */
export function playReceive() {
  chime(380, 440, 0.20, 0.050)
}

/** Airy high tone — whisper mode */
export function playWhisper() {
  chime(900, 1100, 0.22, 0.038, 'sine')
}

/** Soft woody pluck — leaf mode */
export function playLeaf() {
  chime(280, 210, 0.28, 0.065, 'triangle')
  chime(560, 420, 0.18, 0.025, 'triangle', 0.02)
}

/** Warm rising note — voice message sent */
export function playVoiceSend() {
  chime(380, 560, 0.22, 0.07)
}

/** Double-click confirm — reaction toggled */
export function playReact() {
  chime(660, 880, 0.09, 0.045)
  chime(880, 1100, 0.07, 0.025, 'sine', 0.08)
}

// ─── Haptic ──────────────────────────────────────────────────────────────────

/** Short vibration pulse — works on Android Chrome */
export function haptic(pattern: number | number[] = 8) {
  if (typeof navigator === 'undefined') return
  try {
    if ('vibrate' in navigator) navigator.vibrate(pattern)
  } catch (_) {}
}
