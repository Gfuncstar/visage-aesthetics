'use client'

import { useEffect, useRef, useState } from 'react'
import { Mic } from 'lucide-react'

// A small "Dictate" mic that uses the browser's speech recognition and calls
// onText with each spoken chunk. Renders nothing where speech isn't supported.
export default function DictateButton({ onText }: { onText: (chunk: string) => void }) {
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
    rec.continuous = true
    rec.interimResults = false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      let said = ''
      for (let i = e.resultIndex; i < e.results.length; i++) said += e.results[i][0].transcript
      if (said.trim()) onText(said.trim())
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
      className={`inline-flex items-center gap-1.5 text-xs rounded-full border px-2.5 py-1 transition-colors ${
        listening ? 'border-clay bg-clay/10 text-clay' : 'border-gold/50 text-gold-deep hover:bg-gold/10'
      }`}
    >
      <Mic size={13} strokeWidth={1.75} className={listening ? 'animate-pulse' : ''} />
      {listening ? 'Listening…' : 'Dictate'}
    </button>
  )
}
