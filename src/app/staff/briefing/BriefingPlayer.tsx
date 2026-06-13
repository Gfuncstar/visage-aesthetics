'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, ArrowLeft, Eye, Pause, Play, SkipBack, SkipForward, Sparkles } from 'lucide-react'
import type { Briefing, BriefingTab } from '@/lib/assistant/briefing'

// The briefing is read aloud with the browser's Web Speech API — no audio file
// to host or regenerate. Each tab is a list of short segments; play walks
// through them, the waveform moves while it speaks, and the transcript shows
// the line being read. A voice "persona" just maps to one of the device's
// installed voices, so it sounds the same each time on a given device.

type Voice = SpeechSynthesisVoice

// Persona names, each preferring a different installed en-GB / en voice. We
// match by name fragments and fall back gracefully to whatever's available.
const PERSONAS: { name: string; match: RegExp }[] = [
  { name: 'Tessa', match: /tessa|female|libby|sonia|hazel|google uk english female/i },
  { name: 'George', match: /george|daniel|male|ryan|google uk english male/i },
  { name: 'Aria', match: /aria|samantha|martha|emily/i },
]

export default function BriefingPlayer({ briefing }: { briefing: Briefing }) {
  const [tabId, setTabId] = useState(briefing.tabs[0]?.id)
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [supported, setSupported] = useState(true)
  const [voices, setVoices] = useState<Voice[]>([])
  const [persona, setPersona] = useState(PERSONAS[0].name)

  const tab: BriefingTab | undefined = useMemo(
    () => briefing.tabs.find((t) => t.id === tabId) ?? briefing.tabs[0],
    [briefing.tabs, tabId],
  )
  const segments = useMemo(() => tab?.segments ?? [], [tab])
  const total = segments.length

  // Keep the latest index in a ref so the speech "onend" handler (set up once
  // per utterance) always advances using the current value.
  const indexRef = useRef(index)
  useEffect(() => {
    indexRef.current = index
  }, [index])

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSupported(false)
      return
    }
    const load = () => setVoices(window.speechSynthesis.getVoices())
    load()
    window.speechSynthesis.onvoiceschanged = load
    return () => {
      window.speechSynthesis.onvoiceschanged = null
      window.speechSynthesis.cancel()
    }
  }, [])

  const chosenVoice = useMemo(() => {
    if (!voices.length) return null
    const p = PERSONAS.find((x) => x.name === persona) ?? PERSONAS[0]
    const en = voices.filter((v) => /^en(-|_|$)/i.test(v.lang))
    const pool = en.length ? en : voices
    return pool.find((v) => p.match.test(v.name)) ?? pool.find((v) => /en-GB/i.test(v.lang)) ?? pool[0]
  }, [voices, persona])

  // Hold the latest speak fn so an utterance's onend can chain to the next
  // segment without speak having to reference itself during declaration.
  const speakRef = useRef<(i: number) => void>(() => {})

  const speak = useCallback(
    (i: number) => {
      if (!supported || !segments[i]) return
      const synth = window.speechSynthesis
      synth.cancel()
      const u = new SpeechSynthesisUtterance(segments[i])
      if (chosenVoice) u.voice = chosenVoice
      u.lang = chosenVoice?.lang || 'en-GB'
      u.rate = 0.98
      u.pitch = 1
      u.onend = () => {
        const next = indexRef.current + 1
        if (next < total) {
          setIndex(next)
          speakRef.current(next)
        } else {
          setPlaying(false)
        }
      }
      u.onerror = () => setPlaying(false)
      synth.speak(u)
    },
    [supported, segments, chosenVoice, total],
  )

  useEffect(() => {
    speakRef.current = speak
  }, [speak])

  const stop = useCallback(() => {
    if (supported) window.speechSynthesis.cancel()
    setPlaying(false)
  }, [supported])

  function toggle() {
    if (playing) {
      stop()
      return
    }
    setPlaying(true)
    speak(index)
  }

  const go = useCallback(
    (i: number) => {
      const clamped = Math.max(0, Math.min(total - 1, i))
      setIndex(clamped)
      if (playing) speak(clamped)
    },
    [playing, speak, total],
  )

  function switchTab(id: BriefingTab['id']) {
    stop()
    setIndex(0)
    setTabId(id)
  }

  // Stop talking if the tab is switched while playing.
  useEffect(() => {
    return () => {
      if (supported) window.speechSynthesis.cancel()
    }
  }, [tabId, supported])

  const personaList = PERSONAS.map((p) => p.name)

  return (
    <section className="bg-cream text-charcoal min-h-screen">
      <div className="max-w-2xl mx-auto px-5 md:px-8 pt-12 md:pt-16 pb-24">
        <Link
          href="/staff"
          className="eyebrow text-stone hover:text-gold-deep transition-colors inline-flex items-center gap-2 mb-4"
        >
          <ArrowLeft size={14} strokeWidth={1.75} />
          Staff
        </Link>

        <div className="eyebrow text-gold mb-2">Clinic staff &nbsp;·&nbsp; The briefing</div>
        <h1 className="font-display italic text-charcoal text-3xl md:text-5xl leading-tight">A quiet word, before the day.</h1>

        {!briefing.configured && (
          <div className="mt-6 border border-gold/40 bg-gold/10 text-charcoal text-sm rounded-sm px-4 py-3 leading-relaxed">
            The clinic database isn’t connected, so this is a preview. Add <code>SUPABASE_URL</code> and{' '}
            <code>SUPABASE_SERVICE_ROLE_KEY</code> in Vercel to fill it with the day’s real numbers.
          </div>
        )}

        {/* One thing worth your eye */}
        <div className="mt-7 border border-gold/40 bg-gold/5 rounded-sm p-5">
          <div className="flex items-center gap-2 eyebrow text-gold-deep mb-2">
            <Eye size={14} strokeWidth={1.75} /> One thing worth your eye
          </div>
          <p className="font-display italic text-xl md:text-2xl text-charcoal leading-snug">{briefing.headline}</p>
          <p className="text-sm text-ink-soft mt-2 leading-relaxed">{briefing.headlineDetail}</p>
        </div>

        {/* Angle tabs */}
        <div className="mt-7 flex items-center gap-2">
          {briefing.tabs.map((t) => {
            const active = t.id === tabId
            return (
              <button
                key={t.id}
                onClick={() => switchTab(t.id)}
                aria-pressed={active}
                className={`rounded-full px-4 py-2 text-sm transition-colors border ${
                  active
                    ? 'bg-charcoal text-cream border-charcoal'
                    : 'bg-cream-soft text-ink-soft border-line/40 hover:border-gold'
                }`}
              >
                {t.label}
              </button>
            )
          })}
        </div>

        {/* Player */}
        <div className="mt-4 border border-line/40 bg-cream-soft rounded-md p-5 md:p-6">
          <p className="text-xs text-ink-soft mb-4">{tab?.intro}</p>

          <div className="flex items-start gap-3 mb-5">
            <Waveform playing={playing} />
            <p className="text-sm text-charcoal leading-relaxed flex-1 min-h-[3.5rem]">{segments[index]}</p>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-1.5 bg-line/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-gold rounded-full transition-[width] duration-300"
                style={{ width: `${total ? ((index + 1) / total) * 100 : 0}%` }}
              />
            </div>
            <span className="text-xs text-ink-soft tabular-nums shrink-0">
              {Math.min(index + 1, total)} / {total}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => go(index - 1)}
              disabled={index === 0}
              className="text-charcoal disabled:opacity-30 hover:text-gold-deep transition-colors"
              aria-label="Previous"
            >
              <SkipBack size={22} strokeWidth={1.75} />
            </button>
            <button
              onClick={toggle}
              disabled={!supported || total === 0}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold text-charcoal shadow-md hover:bg-gold-deep hover:text-cream transition-colors disabled:opacity-40"
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {playing ? <Pause size={26} strokeWidth={2} /> : <Play size={26} strokeWidth={2} className="ml-0.5" />}
            </button>
            <button
              onClick={() => go(index + 1)}
              disabled={index >= total - 1}
              className="text-charcoal disabled:opacity-30 hover:text-gold-deep transition-colors"
              aria-label="Next"
            >
              <SkipForward size={22} strokeWidth={1.75} />
            </button>
          </div>

          {/* Voice persona */}
          <div className="flex items-center justify-center gap-2 mt-5">
            <span className="eyebrow text-stone">Read by</span>
            {personaList.map((name) => {
              const active = name === persona
              return (
                <button
                  key={name}
                  onClick={() => {
                    setPersona(name)
                    if (playing) speak(index)
                  }}
                  aria-pressed={active}
                  className={`rounded-full px-3 py-1 text-xs border transition-colors ${
                    active ? 'border-gold bg-gold/10 text-gold-deep' : 'border-line/40 text-ink-soft hover:border-gold'
                  }`}
                >
                  {name}
                </button>
              )
            })}
          </div>

          {!supported && (
            <p className="text-xs text-clay mt-4 inline-flex items-center gap-1.5 justify-center w-full">
              <AlertCircle size={13} strokeWidth={1.75} />
              This browser can’t read the briefing aloud — the text is all here to read.
            </p>
          )}
        </div>

        {/* Only you can finish these */}
        {briefing.tasks.length > 0 && (
          <div className="mt-9">
            <div className="eyebrow text-gold mb-1 inline-flex items-center gap-2">
              <Sparkles size={14} strokeWidth={1.75} /> Only you can finish these
            </div>
            <p className="text-xs text-ink-soft mb-3 leading-relaxed">
              The few things that genuinely need your hand. Everything else is in motion.
            </p>
            <ul className="border border-line/40 rounded-sm divide-y divide-line/30 bg-cream-soft">
              {briefing.tasks.map((t, i) => (
                <li key={i} className="px-4 py-3 text-sm text-charcoal leading-relaxed">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}

// A simple animated bar meter that moves while the briefing is being read and
// settles flat when paused. Pure CSS so it costs nothing.
function Waveform({ playing }: { playing: boolean }) {
  const bars = 7
  return (
    <div className="flex items-end gap-0.5 h-12 w-12 shrink-0" aria-hidden="true">
      <style>{`@keyframes briefing-bar{0%,100%{transform:scaleY(0.25)}50%{transform:scaleY(1)}}`}</style>
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className="flex-1 bg-gold rounded-full origin-bottom"
          style={{
            height: '100%',
            transform: playing ? undefined : 'scaleY(0.22)',
            animation: playing ? `briefing-bar ${0.7 + (i % 3) * 0.18}s ease-in-out ${i * 0.08}s infinite` : 'none',
          }}
        />
      ))}
    </div>
  )
}
