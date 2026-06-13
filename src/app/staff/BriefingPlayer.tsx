'use client'

// The clinic's audio briefing — a small "voice note" that opens the staff day.
// Three angles (Today / Looking ahead / Blue sky), each a short run of spoken
// segments. It reads them aloud with the browser's own speech engine and shows
// the words on screen, so there's no audio file to host and no voice key to pay
// for. If the device has no speech engine it stays a perfectly good read-on-
// screen briefing, with the controls hidden.
//
// The voice defaults to the most natural one the device offers (the downloaded
// "Enhanced"/"Premium" system voices sound far better than the basic fallback),
// and the listener can pick another voice and a reading speed — both remembered
// between visits.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AudioLines, Pause, Play, SkipBack, SkipForward, SlidersHorizontal } from 'lucide-react'
import type { Briefing, BriefingTabKey } from '@/lib/assistant/briefing'

const VOICE_KEY = 'visage.briefing.voiceURI'
const RATE_KEY = 'visage.briefing.rate'
const SPEEDS = [0.8, 0.9, 1.0, 1.1, 1.2, 1.3]

// Names the platforms give their higher-quality voices. Matching one is a
// strong signal the voice will sound natural rather than robotic.
const PREMIUM = /enhanced|premium|neural|natural|siri/i
// Pleasant British-English voices across platforms, as a softer tie-break.
const PREFERRED_NAMES = /tessa|serena|kate|sonia|libby|stephanie|martha|fiona|moira|female/i

/** Rough quality score so the best voice floats to the top and is chosen by default. */
function scoreVoice(v: SpeechSynthesisVoice): number {
  let s = 0
  if (PREMIUM.test(v.name)) s += 8
  if (/en[-_]GB/i.test(v.lang)) s += 4
  else if (/^en/i.test(v.lang)) s += 1
  if (PREFERRED_NAMES.test(v.name)) s += 2
  if (v.localService) s += 1 // downloaded voices tend to be the enhanced ones
  return s
}

/** English voices, best first — the list shown in the picker. */
function englishVoices(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  return voices
    .filter((v) => /^en/i.test(v.lang))
    .sort((a, b) => scoreVoice(b) - scoreVoice(a) || a.name.localeCompare(b.name))
}

/** Short, human label for a voice — flags the enhanced ones. */
function voiceLabel(v: SpeechSynthesisVoice): string {
  const region = /GB/i.test(v.lang) ? 'UK' : /US/i.test(v.lang) ? 'US' : v.lang.replace(/^en[-_]?/i, '') || 'EN'
  const name = v.name.replace(/\s*\((enhanced|premium)\)/i, '')
  const premium = PREMIUM.test(v.name) ? ' · Enhanced' : ''
  return `${name} (${region})${premium}`
}

export default function BriefingPlayer({ briefing }: { briefing: Briefing }) {
  const [activeKey, setActiveKey] = useState<BriefingTabKey>(briefing.tabs[0]?.key ?? 'today')
  const [idx, setIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [supported, setSupported] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [voiceURI, setVoiceURI] = useState<string>('')
  const [rate, setRate] = useState(1)

  // Refs so the utterance callbacks always see the live state, not a stale closure.
  const playingRef = useRef(false)
  const idxRef = useRef(0)
  const startedRef = useRef(false)
  const speakRef = useRef<(i: number) => void>(() => {})
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null)
  const rateRef = useRef(1)

  const tab = useMemo(
    () => briefing.tabs.find((t) => t.key === activeKey) ?? briefing.tabs[0],
    [briefing.tabs, activeKey],
  )
  const segments = useMemo(() => tab?.segments ?? [], [tab])
  const total = segments.length

  const picker = useMemo(() => englishVoices(voices), [voices])
  const selectedVoice = useMemo(
    () => voices.find((v) => v.voiceURI === voiceURI) ?? picker[0] ?? null,
    [voices, voiceURI, picker],
  )

  // The spoken/shown line — the warm greeting rides along on the very first one.
  const lineFor = useCallback(
    (i: number) => (i === 0 ? `${briefing.greeting} ${segments[i] ?? ''}`.trim() : segments[i] ?? ''),
    [briefing.greeting, segments],
  )

  // Detect speech support and load voices (they arrive asynchronously). The
  // listener's saved voice and speed are restored here too.
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    setSupported(true)
    const savedRate = Number(window.localStorage.getItem(RATE_KEY))
    if (savedRate >= 0.5 && savedRate <= 2) {
      setRate(savedRate)
      rateRef.current = savedRate
    }
    const savedVoice = window.localStorage.getItem(VOICE_KEY) || ''
    const load = () => {
      const all = window.speechSynthesis.getVoices()
      if (all.length) setVoices(all)
      // Default to the saved choice if it's still present, else the best voice.
      setVoiceURI((cur) => {
        if (cur) return cur
        if (savedVoice && all.some((v) => v.voiceURI === savedVoice)) return savedVoice
        return englishVoices(all)[0]?.voiceURI ?? ''
      })
    }
    load()
    window.speechSynthesis.addEventListener('voiceschanged', load)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', load)
      window.speechSynthesis.cancel()
    }
  }, [])

  // Keep the utterance refs in step with the chosen voice and speed.
  useEffect(() => {
    selectedVoiceRef.current = selectedVoice
  }, [selectedVoice])
  useEffect(() => {
    rateRef.current = rate
  }, [rate])

  const stop = useCallback(() => {
    if (supported) window.speechSynthesis.cancel()
    startedRef.current = false
    playingRef.current = false
    setPlaying(false)
    setProgress(0)
  }, [supported])

  // Speak segment `i`, then auto-advance while still playing.
  const speak = useCallback(
    (i: number) => {
      if (!supported) return
      const synth = window.speechSynthesis
      synth.cancel()
      const text = lineFor(i)
      if (!text) return
      const u = new SpeechSynthesisUtterance(text)
      if (selectedVoiceRef.current) u.voice = selectedVoiceRef.current
      u.lang = selectedVoiceRef.current?.lang || 'en-GB'
      u.rate = rateRef.current
      u.pitch = 1
      u.onboundary = (e) => {
        if (text.length) setProgress(Math.min(1, e.charIndex / text.length))
      }
      u.onend = () => {
        // Did we reach the natural end of this segment (vs. a manual cancel)?
        if (!playingRef.current) return
        const next = idxRef.current + 1
        if (next < total) {
          idxRef.current = next
          setIdx(next)
          setProgress(0)
          speakRef.current(next)
        } else {
          startedRef.current = false
          playingRef.current = false
          setPlaying(false)
          setProgress(1)
        }
      }
      startedRef.current = true
      playingRef.current = true
      setPlaying(true)
      setProgress(0)
      synth.speak(u)
    },
    [supported, lineFor, total],
  )
  // Keep the recursion handle pointing at the current speak fn.
  useEffect(() => {
    speakRef.current = speak
  }, [speak])

  const togglePlay = useCallback(() => {
    if (!supported) return
    const synth = window.speechSynthesis
    if (playing) {
      synth.pause()
      playingRef.current = false
      setPlaying(false)
      return
    }
    // Resume mid-segment if we paused; otherwise start the current segment fresh.
    if (startedRef.current && synth.paused) {
      synth.resume()
      playingRef.current = true
      setPlaying(true)
    } else {
      speak(idxRef.current)
    }
  }, [supported, playing, speak])

  const goTo = useCallback(
    (i: number) => {
      const clamped = Math.max(0, Math.min(total - 1, i))
      idxRef.current = clamped
      setIdx(clamped)
      setProgress(0)
      if (playingRef.current || (supported && startedRef.current)) speak(clamped)
    },
    [total, supported, speak],
  )

  // Switching tab resets the player to the top of the new run.
  const switchTab = useCallback(
    (key: BriefingTabKey) => {
      if (key === activeKey) return
      stop()
      idxRef.current = 0
      setIdx(0)
      setActiveKey(key)
    },
    [activeKey, stop],
  )

  // Picking a voice or speed saves it and, if we're mid-read, applies it now by
  // restarting the current line so the change is heard straight away.
  const onPickVoice = useCallback(
    (uri: string) => {
      setVoiceURI(uri)
      selectedVoiceRef.current = voices.find((v) => v.voiceURI === uri) ?? selectedVoiceRef.current
      try {
        window.localStorage.setItem(VOICE_KEY, uri)
      } catch {}
      if (playingRef.current) speak(idxRef.current)
    },
    [voices, speak],
  )
  const onPickRate = useCallback(
    (r: number) => {
      setRate(r)
      rateRef.current = r
      try {
        window.localStorage.setItem(RATE_KEY, String(r))
      } catch {}
      if (playingRef.current) speak(idxRef.current)
    },
    [speak],
  )

  const pct = total > 1 ? ((idx + progress) / total) * 100 : progress * 100
  const footerVoice = selectedVoice ? voiceLabel(selectedVoice) : 'Voice'

  return (
    <div className="border border-gold/40 bg-cream-soft rounded-sm overflow-hidden">
      {/* Headline — the one thing worth your eye. */}
      <div className="px-4 sm:px-5 pt-4">
        <div className="eyebrow text-gold-deep mb-1.5">Clinic briefing</div>
        <p className="font-display italic text-charcoal text-lg sm:text-xl leading-snug">
          {briefing.headline}
        </p>
      </div>

      {/* Angle pills. */}
      <div className="px-4 sm:px-5 mt-3 flex flex-wrap gap-2">
        {briefing.tabs.map((t) => {
          const on = t.key === activeKey
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => switchTab(t.key)}
              aria-pressed={on}
              className={`text-sm rounded-full px-3.5 py-1.5 border transition-colors ${
                on
                  ? 'bg-charcoal text-cream border-charcoal'
                  : 'bg-cream text-ink-soft border-line/60 hover:border-gold'
              }`}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {/* The current line — readable with or without audio. */}
      <div className="px-4 sm:px-5 mt-3">
        <div className="flex items-start gap-3">
          <AudioLines
            size={18}
            strokeWidth={1.75}
            className={`mt-0.5 shrink-0 text-gold-deep ${playing ? 'animate-pulse' : ''}`}
          />
          <p className="text-charcoal text-[15px] leading-relaxed min-h-[3.25rem]">
            {lineFor(idx)}
          </p>
        </div>
      </div>

      {/* Progress + position. */}
      <div className="px-4 sm:px-5 mt-3">
        <div className="h-1 rounded-full bg-line/50 overflow-hidden">
          <div className="h-full bg-gold-deep transition-[width] duration-150" style={{ width: `${pct}%` }} />
        </div>
        <div className="text-[11px] tracking-[0.08em] text-ink-soft mt-1.5 text-center tabular-nums">
          {idx + 1} / {total}
        </div>
      </div>

      {/* Transport. */}
      <div className="px-4 sm:px-5 pb-2 mt-1 flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => goTo(idx - 1)}
          disabled={idx === 0}
          aria-label="Previous"
          className="text-charcoal disabled:opacity-30 hover:text-gold-deep transition-colors"
        >
          <SkipBack size={20} strokeWidth={1.75} />
        </button>
        <button
          type="button"
          onClick={togglePlay}
          disabled={!supported}
          aria-label={playing ? 'Pause' : 'Play'}
          className="inline-flex w-14 h-14 rounded-full bg-gold-deep text-cream items-center justify-center hover:bg-charcoal transition-colors disabled:opacity-40 disabled:hover:bg-gold-deep"
        >
          {playing ? <Pause size={22} strokeWidth={2} /> : <Play size={22} strokeWidth={2} className="ml-0.5" />}
        </button>
        <button
          type="button"
          onClick={() => goTo(idx + 1)}
          disabled={idx >= total - 1}
          aria-label="Next"
          className="text-charcoal disabled:opacity-30 hover:text-gold-deep transition-colors"
        >
          <SkipForward size={20} strokeWidth={1.75} />
        </button>
      </div>

      {/* Voice settings — collapsed by default to keep the card calm. */}
      {supported && showSettings && (
        <div className="px-4 sm:px-5 pb-3 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="block text-[11px] tracking-[0.08em] uppercase text-ink-soft mb-1">Voice</span>
            <select
              value={selectedVoice?.voiceURI ?? ''}
              onChange={(e) => onPickVoice(e.target.value)}
              className="w-full bg-cream border border-line rounded-sm px-2.5 py-2 text-sm text-charcoal focus:outline-none focus:border-gold"
            >
              {picker.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {voiceLabel(v)}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-[11px] tracking-[0.08em] uppercase text-ink-soft mb-1">Speed</span>
            <select
              value={rate}
              onChange={(e) => onPickRate(Number(e.target.value))}
              className="w-full bg-cream border border-line rounded-sm px-2.5 py-2 text-sm text-charcoal focus:outline-none focus:border-gold"
            >
              {SPEEDS.map((s) => (
                <option key={s} value={s}>
                  {s.toFixed(1)}×{s === 1 ? ' (normal)' : ''}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {/* Voice / source footer. */}
      <div className="px-4 sm:px-5 py-2.5 border-t border-line/40 bg-cream flex items-center justify-between gap-3">
        {supported ? (
          <button
            type="button"
            onClick={() => setShowSettings((s) => !s)}
            aria-expanded={showSettings}
            className="inline-flex items-center gap-1.5 text-[11px] text-ink-soft hover:text-gold-deep transition-colors min-w-0"
          >
            <SlidersHorizontal size={12} strokeWidth={1.75} className="shrink-0" />
            <span className="truncate">{footerVoice}</span>
          </button>
        ) : (
          <span className="text-[11px] text-ink-soft">Read on screen — this device has no voice.</span>
        )}
        <span className="text-[11px] text-ink-soft text-right shrink-0">{tab?.lead}</span>
      </div>
    </div>
  )
}
