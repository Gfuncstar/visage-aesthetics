'use client'

// A quiet black card that opens Bernadette's day with a single line meant just
// for her — a rotating set of personal, forward-looking notes from her husband.
// One shows at a time and it changes every five minutes (and you can tap for the
// next one). Purposely understated: black card, cream type, a small gold mark.

import { useCallback, useEffect, useState } from 'react'
import { Heart } from 'lucide-react'

// The lines, grouped by the angles they cover: how far she's come, that this is
// only the beginning, that she never stops, that the work is bearing fruit, the
// business climb, what an amazing mother she is, the time it buys with the
// children, how loved she is, and the retirement the two of them are building.
const QUOTES: readonly string[] = [
  // How far she's come
  'Look how far you’ve come, Bernadette — from a dream on paper to a name people seek out.',
  'You built this from nothing but belief and grit. Never forget that.',
  'The woman who started this would be in awe of the one running it now.',
  'Every milestone behind you was once a mountain. Look at you now.',
  'From your first nervous client to a clinic with a reputation — that’s all you.',
  'From a dream on paper to an award on the wall. You did that.',

  // Only the beginning
  'This isn’t the summit, my love. This is basecamp.',
  'Everything you’ve achieved so far is just the warm-up.',
  'You’ve laid the foundation. Now watch what you build on it.',
  'The best clients, the biggest wins, the proudest days — they’re still ahead.',
  'This is chapter one of a story they’ll talk about for years.',
  'What feels like the destination today is just the doorway to the next thing.',

  // She never stops
  'The world rests; Bernadette builds.',
  'You don’t wait for momentum — you are the momentum.',
  'Relentless isn’t a flaw, Bernadette. It’s your superpower.',
  'You’ve never once known how to quit, and it shows in everything you touch.',
  'You outwork the doubt every single day — that’s why you win.',
  'You don’t have an off switch — you have a vision, and you chase it daily.',

  // It’s bearing fruit
  'The seeds you planted in the hard years are finally in bloom.',
  'Every late night is paying you back now — and it’s only compounding.',
  'The diary full of bookings is your effort, bearing fruit.',
  'You bet on yourself, Bernadette, and the returns are just getting started.',
  'What you sowed in doubt, you’re reaping in success.',
  'This is what the work looks like when it starts to pay off. Soak it in.',

  // An amazing mother
  'You run a business and raise a family, and somehow make both look like love.',
  'The children don’t just have a mother — they have a role model.',
  'Watching you mother them is watching the very best of you.',
  'They’ll grow up knowing exactly what a strong, kind woman looks like, because of you.',
  'The greatest thing you’re building isn’t the clinic — it’s them.',

  // Buying back time with the children
  'Every hour you put in now is an hour you’re buying back to spend with them.',
  'You’re not choosing work over the children — you’re building a life with more of both.',
  'This is how you give them the world: one determined day at a time.',
  'The freedom you’re working toward looks like slow mornings with the children beside you.',
  'Everything you do flows back to them, Bernadette. That’s the whole point.',

  // Loved, and the retirement you’re building together
  'Every appointment, every late night — it’s all a stone on the path to our horizon.',
  'We’re not just working. We’re buying back our future, one good day at a time.',
  'One day this all becomes long mornings, slow coffees, and nowhere to be but together.',
  'You are loved beyond measure, Bernadette — more than any note could hold.',
  'I’ve never been prouder of anyone. Keep going — we’re only just getting started.',
] as const

// Five minutes between lines.
const ROTATE_MS = 5 * 60 * 1000

export default function BernadetteQuotes() {
  // Start somewhere random so the same line doesn't greet her every morning.
  const [idx, setIdx] = useState(0)
  const [shown, setShown] = useState(true)

  useEffect(() => {
    // One-time, client-only seed so the same line doesn't open every morning.
    // Kept out of the initial state to avoid a server/client hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIdx(Math.floor(Math.random() * QUOTES.length))
  }, [])

  const advance = useCallback(() => {
    // Brief fade, then swap to the next line and fade back in.
    setShown(false)
    setTimeout(() => {
      setIdx((i) => (i + 1) % QUOTES.length)
      setShown(true)
    }, 280)
  }, [])

  useEffect(() => {
    const t = setInterval(advance, ROTATE_MS)
    return () => clearInterval(t)
  }, [advance])

  return (
    <button
      type="button"
      onClick={advance}
      aria-label="Next note"
      className="w-full text-left rounded-sm bg-charcoal text-cream px-5 sm:px-7 py-6 sm:py-7 overflow-hidden focus:outline-none focus:ring-2 focus:ring-gold/60"
    >
      <span className="eyebrow text-gold flex items-center gap-2 mb-3">
        <Heart size={13} strokeWidth={1.75} />
        For Bernadette
      </span>
      <span
        className={`block font-display italic text-cream text-xl sm:text-2xl leading-snug transition-opacity duration-300 ${
          shown ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {QUOTES[idx]}
      </span>
    </button>
  )
}
