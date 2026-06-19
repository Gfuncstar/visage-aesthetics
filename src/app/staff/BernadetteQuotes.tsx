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
  'Look how far you’ve come — from an idea to a name people seek out.',
  'You built this from nothing but belief and grit.',
  'You turned doubt into a diary that’s booked out. That’s not luck — that’s you.',
  'From your first nervous client to a clinic with a reputation. All you.',

  // Only the beginning
  'This isn’t the summit, my love. This is basecamp.',
  'The best clients, the biggest wins, the proudest days — still ahead.',
  'You haven’t peaked. You’ve barely begun to climb.',
  'The best is still in front of you. Eyes up.',

  // She never stops
  'The world rests; Bernadette builds.',
  'Relentless isn’t a flaw. It’s your superpower.',
  'You outwork the doubt every single day. That’s why you win.',
  'No off switch — just a vision, and you chase it daily.',

  // It’s bearing fruit
  'The seeds you planted in the hard years are in bloom.',
  'Clients travel for you and wait for you. That’s the harvest.',
  'You bet on yourself, and the returns are just starting.',
  'This is the work paying off. Soak it in.',

  // Building the business
  'You don’t just run a clinic — you’ve built a name people trust.',
  'A reputation like yours can’t be bought, only earned. And you earned it.',

  // An amazing mother
  'You run a business and raise a family, and make both look like love.',
  'The children don’t just have a mother — they have a role model.',
  'Mother, founder, wife — you wear all three with grace.',

  // Her heart, and the happy children it’s raised
  'The children are happy, settled and sure of themselves. That’s your heart.',
  'The warmth in that home is yours. They glow with it.',
  'Win every award going, and still — they’re your finest work.',

  // Buying back time with the children
  'Every hour you put in now buys back time with them later.',
  'You’re not missing their childhood — you’re building more of it.',

  // Health, fitness and finally pain-free
  'You lived with pain for years and came through it. Every pain-free day is a win.',
  'Free of the pain you carried — look what this strong body can do now.',
  'The pain doesn’t run your days anymore. You do.',
  'Healthy, strong, pain-free — and full of energy for what’s next.',
  'Everything moves easier now: stronger body, clearer mind, lighter heart.',
  'You fought back to health, and nothing’s holding your body back. Enjoy it.',
  'Fit, well and pain-free — this is the you that gets to do it all.',

  // The family, by name — Callum, Brandon, Erin & Giles
  'Callum — nineteen, learning to drive, chasing his first job. Out in the world because you showed him how.',
  'Every job Callum applies for, he carries the work ethic he learned from you.',
  'Callum’s finding his feet, and that quiet confidence started with you.',
  'Brandon — nearly eighteen, eyeing university and his driving test. He got that ambition from his mum.',
  'When Brandon heads to university, he takes a piece of your drive with him.',
  'Brandon reaches higher because you taught him there’s always more to reach for.',
  'Erin starts big school soon, brave and ready — because you make her feel she can do anything.',
  'Eleven and stepping into a whole new world. Erin’s ready — that’s your doing.',
  'Erin will walk into big school head high. That courage is yours.',
  'Callum, Brandon and Erin — three good souls finding their way. Every one of them proof of you.',
  'Three children, three new chapters at once — and you hold it together with grace.',
  'Callum driving, Brandon off to uni, Erin starting big school. Your world is growing up well, because you raised it well.',
  'You’ve given Callum, Brandon and Erin the best start, and me the best life. — Giles',
  'From the man lucky enough to have married you: I’m so proud of you. — Giles',
  'You’re the heart of this family. We’re who we are because of you. — Giles',
  'Even Bailey and Coco know it — you make this house a home.',
  'However long the day, Bailey and Coco are always waiting. That love you’ve earned.',
  'Room for everyone in the home you’ve built — Callum, Brandon, Erin, Bailey and Coco.',
  'Slow mornings, coffee, the dogs at your feet — that’s the life this work is buying.',

  // Loved, and the life you’re building together
  'Long mornings and slow coffees together — that’s where all this is heading.',
  'You are loved beyond measure — more than any note could hold.',
  'I’ve never been prouder of anyone. Keep going — we’re just getting started.',
  'I watch you work and fall for you all over again. Proud doesn’t cover it. — Giles',
  'Whatever you’re carrying today: you’re adored, and not carrying it alone. — Giles',
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
