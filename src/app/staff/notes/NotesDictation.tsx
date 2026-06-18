'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Loader2, Mic, Sparkles, Square } from 'lucide-react'

// Minimal typings for the Web Speech API, which is not in the standard DOM lib.
type SpeechRecognitionAlternative = { transcript: string }
type SpeechRecognitionResult = { 0: SpeechRecognitionAlternative; isFinal: boolean; length: number }
type SpeechRecognitionResultList = { length: number; [index: number]: SpeechRecognitionResult }
type SpeechRecognitionEventLike = { resultIndex: number; results: SpeechRecognitionResultList }
type SpeechRecognitionErrorEventLike = { error: string }
interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((e: SpeechRecognitionEventLike) => void) | null
  onerror: ((e: SpeechRecognitionErrorEventLike) => void) | null
  onend: (() => void) | null
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

type Status = 'idle' | 'recording' | 'writing' | 'error'

export default function NotesDictation({
  getContext,
  onWriteup,
}: {
  getContext: () => { treatment: string; specificArea: string; existing: string }
  onWriteup: (notes: string) => void
}) {
  // Client-only capability check, kept out of an effect to avoid a hydration
  // mismatch (the server has no Web Speech API).
  const supported = useSyncExternalStore(
    () => () => {},
    () => getRecognitionCtor() !== null,
    () => false,
  )
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [interim, setInterim] = useState('')

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  // Speech recognition can auto-stop mid-dictation; this flag lets us keep it
  // listening until the user taps stop.
  const wantRecordingRef = useRef(false)
  const transcriptRef = useRef('')

  const writeUp = useCallback(async () => {
    const transcript = transcriptRef.current.trim()
    if (!transcript) {
      setStatus('idle')
      return
    }
    setStatus('writing')
    setError(null)
    const { treatment, specificArea, existing } = getContext()
    try {
      const res = await fetch('/api/staff/assistant/notes-writeup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, treatment, specificArea, existing }),
      })
      const data = (await res.json().catch(() => ({}))) as { notes?: string; error?: string }
      if (!res.ok || !data.notes) {
        setError(data.error || 'Could not write up the note.')
        setStatus('error')
        return
      }
      onWriteup(data.notes)
      transcriptRef.current = ''
      setInterim('')
      setStatus('idle')
    } catch {
      setError('Network error while writing up.')
      setStatus('error')
    }
  }, [getContext, onWriteup])

  const stop = useCallback(() => {
    wantRecordingRef.current = false
    try {
      recognitionRef.current?.stop()
    } catch {
      // already stopped
    }
  }, [])

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor()
    if (!Ctor) return
    setError(null)
    setInterim('')
    transcriptRef.current = ''

    const recognition = new Ctor()
    recognition.lang = 'en-GB'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (e) => {
      let live = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i]
        const text = result[0]?.transcript ?? ''
        if (result.isFinal) {
          transcriptRef.current = `${transcriptRef.current} ${text}`.trim()
        } else {
          live += text
        }
      }
      setInterim(live)
    }

    recognition.onerror = (e) => {
      if (e.error === 'no-speech' || e.error === 'aborted') return
      wantRecordingRef.current = false
      setError(
        e.error === 'not-allowed'
          ? 'Microphone access was blocked. Allow it in your browser settings and try again.'
          : 'Could not hear anything. Please try again.',
      )
      setStatus('error')
    }

    recognition.onend = () => {
      // Keep listening if the engine cut out on its own; otherwise write up.
      if (wantRecordingRef.current) {
        try {
          recognition.start()
        } catch {
          wantRecordingRef.current = false
        }
        return
      }
      setInterim('')
      void writeUp()
    }

    recognitionRef.current = recognition
    wantRecordingRef.current = true
    try {
      recognition.start()
      setStatus('recording')
    } catch {
      wantRecordingRef.current = false
      setError('Could not start recording. Please try again.')
      setStatus('error')
    }
  }, [writeUp])

  useEffect(() => {
    return () => {
      wantRecordingRef.current = false
      try {
        recognitionRef.current?.abort()
      } catch {
        // ignore
      }
    }
  }, [])

  if (!supported) return null

  return (
    <div className="mt-2">
      <div className="flex flex-wrap items-center gap-3">
        {status === 'recording' ? (
          <button
            type="button"
            onClick={stop}
            className="inline-flex items-center gap-2 rounded-sm border border-gold bg-gold/10 px-3 py-2 text-sm text-charcoal min-h-[40px]"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gold-deep" />
            </span>
            <Square size={14} strokeWidth={1.75} />
            Stop and write up
          </button>
        ) : status === 'writing' ? (
          <span className="inline-flex items-center gap-2 rounded-sm border border-line/40 px-3 py-2 text-sm text-ink-soft min-h-[40px]">
            <Loader2 size={14} strokeWidth={1.75} className="animate-spin" />
            Writing up the note…
          </span>
        ) : (
          <button
            type="button"
            onClick={start}
            className="inline-flex items-center gap-2 rounded-sm border border-line/40 px-3 py-2 text-sm text-charcoal hover:border-gold transition-colors min-h-[40px]"
          >
            <Mic size={14} strokeWidth={1.75} />
            Dictate notes
          </button>
        )}
        <span className="inline-flex items-center gap-1.5 text-xs text-stone">
          <Sparkles size={12} strokeWidth={1.75} />
          Speak the notes and they are written up professionally
        </span>
      </div>

      {status === 'recording' && (
        <p className="mt-2 text-sm text-ink-soft italic min-h-[1.25rem]">
          {interim || 'Listening…'}
        </p>
      )}
      {error && <p className="mt-2 text-xs text-gold">{error}</p>}
    </div>
  )
}
