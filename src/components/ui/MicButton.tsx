'use client'

import { useEffect, useRef, useState } from 'react'
import { Mic } from 'lucide-react'

// A small, reusable voice-dictation button. Drop it next to any input or
// textarea: tap to talk, and the transcript is handed to onText (which appends
// to the field). Renders nothing on browsers without speech recognition.
export default function MicButton({
  onText,
  className = '',
  size = 16,
}: {
  onText: (text: string) => void
  className?: string
  size?: number
}) {
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recRef = useRef<any>(null)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setSupported(Boolean(SR))
  }, [])

  function toggle() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    if (listening) {
      recRef.current?.stop()
      return
    }
    const rec = new SR()
    rec.lang = 'en-GB'
    rec.interimResults = false
    rec.continuous = false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      let said = ''
      for (let i = e.resultIndex; i < e.results.length; i++) said += e.results[i][0].transcript
      const t = said.trim()
      if (t) onText(t)
    }
    rec.onend = () => setListening(false)
    rec.onerror = () => setListening(false)
    recRef.current = rec
    rec.start()
    setListening(true)
  }

  if (!supported) return null
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={listening ? 'Stop dictation' : 'Dictate'}
      title="Tap to talk"
      className={`inline-flex items-center justify-center transition-colors ${listening ? 'text-clay' : 'text-gold-deep hover:text-gold'} ${className}`}
    >
      <Mic size={size} strokeWidth={1.75} className={listening ? 'animate-pulse' : ''} />
    </button>
  )
}

/** Append dictated text to an existing value with a space when needed. */
export function appendText(prev: string, said: string): string {
  return prev ? `${prev} ${said}`.trim() : said
}
