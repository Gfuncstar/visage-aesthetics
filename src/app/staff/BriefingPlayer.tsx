'use client'

// The clinic's audio briefing — a small "voice note" that opens the staff day.
// Three angles (Today / Looking ahead / Blue sky), each a short run of spoken
// segments. It reads them aloud with the browser's own speech engine and shows
// the words on screen, so there's no audio file to host and no voice key to pay
// for. If the device has no speech engine it stays a perfectly good read-on-
// screen briefing, with the controls hidden.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AudioLines, ChevronDown, Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import type { Briefing, BriefingTabKey } from '@/lib/assistant/briefing'

// The voice's name on screen — a consistent persona across the briefing.
const VOICE_LABEL = 'Tessa'

// Pick the most natural British voice the device offers, falling back sensibly.
function chooseVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices.length) return null
  const gb = voices.filter((v) => /en[-_]GB/i.test(v.lang))
  const named = gb.find((v) => /tessa|serena|kate|stephanie|female|libby|sonia/i.test(v.name))
  return named || gb[0] || voices.find((v) => /^en/i.test(v.lang)) || voices[0]
}

export default function BriefingPlayer({ briefing }: { briefing: Briefing }) {
  const [activeKey, setActiveKey] = useState<BriefingTabKey>(briefing.tabs[0]?.key ?? 'today')
  const [idx, setIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [supported, setSupported] = useState(false)
  // Collapsed by default — the headline alone is enough at a glance, and the full
  // player takes up a lot of room. Tap the header to open it.
  const [open, setOpen] = useState(false)

  const voiceRef = useRef<SpeechSynthesisVoice | null>(null)
  // Refs so the utterance callbacks always see the live state, not a stale closure.
  const playingRef = useRef(false)
  const idxRef = useRef(0)
  const startedRef = useRef(false)
  // Holds the latest speak fn, so the auto-advance can recurse without the
  // callback referencing itself before it's declared.
  const speakRef = useRef<(i: number) => void>(() => {})

  const tab = useMemo(
    () => briefing.tabs.find((t) => t.key === activeKey) ?? briefing.tabs[0],
    [briefing.tabs, activeKey],
  )
  const segments = useMemo(() => tab?.segments ?? [], [tab])
  const total = segments.length

  // The spoken/shown line — the warm greeting rides along on the very first one.
  const lineFor = useCallback(
    (i: number) => (i === 0 ? `${briefing.greeting} ${segments[i] ?? ''}`.trim() : segments[i] ?? ''),
    [briefing.greeting, segments],
  )

  // Detect speech support and load voices (they arrive asynchronously).
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    setSupported(true)
    const load = () => {
      voiceRef.current = chooseVoice(window.speechSynthesis.getVoices())
    }
    load()
    window.speechSynthesis.addEventListener('voiceschanged', load)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', load)
      window.speechSynthesis.cancel()
    }
  }, [])

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
      if (voiceRef.current) u.voice = voiceRef.current
      u.lang = voiceRef.current?.lang || 'en-GB'
      u.rate = 1
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

  // Collapsing should also silence any playback — the controls would be hidden.
  const toggleOpen = useCallback(() => {
    setOpen((o) => {
      if (o) stop()
      return !o
    })
  }, [stop])

  const pct = total > 1 ? ((idx + progress) / total) * 100 : progress * 100

  return (
    <div className="border border-gold/40 bg-cream-soft rounded-sm overflow-hidden">
      {/* Header — the one thing worth your eye, doubling as the expand toggle. */}
      <button
        type="button"
        onClick={toggleOpen}
        aria-expanded={open}
        className="w-full text-left px-4 sm:px-5 py-4 flex items-start justify-between gap-3"
      >
        <span className="min-w-0">
          <span className="eyebrow text-gold-deep mb-1.5 flex items-center gap-2">
            <AudioLines size={14} strokeWidth={1.75} className={playing ? 'animate-pulse' : ''} />
            Clinic briefing
          </span>
          <span className="block font-display italic text-charcoal text-lg sm:text-xl leading-snug">
            {briefing.headline}
          </span>
        </span>
        <ChevronDown
          size={18}
          strokeWidth={1.75}
          className={`mt-1 shrink-0 text-gold-deep transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <>
      {/* Angle pills. */}
      <div className="px-4 sm:px-5 flex flex-wrap gap-2">
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

      {/* Voice / source footer. */}
      <div className="px-4 sm:px-5 py-2.5 border-t border-line/40 bg-cream flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-[11px] text-ink-soft">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold-deep" />
          {VOICE_LABEL}
        </span>
        <span className="text-[11px] text-ink-soft">
          {supported ? tab?.lead : 'Read on screen — this device has no voice.'}
        </span>
      </div>
        </>
      )}
    </div>
  )
}
