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
  'You turned doubt into a diary that’s booked out. That’s not luck, that’s you.',
  'From your first nervous client to a clinic with a reputation — that’s all you.',

  // Only the beginning
  'This isn’t the summit, my love. This is basecamp.',
  'The best clients, the biggest wins, the proudest days — they’re still ahead.',
  'You haven’t peaked — you’ve barely begun to climb.',
  'The best is genuinely still in front of you. Keep your eyes up.',

  // She never stops
  'The world rests; Bernadette builds.',
  'Relentless isn’t a flaw, Bernadette. It’s your superpower.',
  'You outwork the doubt every single day — that’s why you win.',
  'You don’t have an off switch — you have a vision, and you chase it daily.',

  // It’s bearing fruit
  'The seeds you planted in the hard years are finally in bloom.',
  'Clients who travel for you, who wait for you — that’s the harvest of your work.',
  'You bet on yourself, Bernadette, and the returns are just getting started.',
  'This is what the work looks like when it starts to pay off. Soak it in.',

  // Building the business
  'You don’t just run a clinic — you’re building something that will outlast you.',
  'A reputation like yours can’t be bought — only earned. And you earned it.',

  // An amazing mother
  'You run a business and raise a family, and somehow make both look like love.',
  'The children don’t just have a mother — they have a role model.',
  'Mother, founder, wife — and you wear all three with grace.',

  // Her heart, and the happy children it’s raised
  'The children are happy, settled and sure of themselves — and that is all down to your heart.',
  'The warmth in that home is yours, Bernadette. The children glow with it.',
  'You could win every award going and still — they’re your finest work.',

  // Buying back time with the children
  'Every hour you put in now is an hour you’re buying back to spend with them.',
  'You’re not missing their childhood — you’re building a life that gives you more of it.',

  // Health, fitness and finally pain-free
  'You lived with pain for so long — and you came through it. Every pain-free day now is a victory.',
  'Free of the pain you carried for years, and look what this strong, healthy body can do now.',
  'The pain doesn’t run your days anymore, Bernadette. You do. That freedom is everything.',
  'Healthy, strong and pain-free — you’ve earned the energy to chase everything you want.',
  'Look how much easier life moves now: stronger body, clearer mind, lighter heart.',
  'You fought your way back to health, and nothing’s holding your body back now. Go and enjoy it.',
  'Fit, well and free of pain — this is the version of you that gets to do it all.',

  // The family, by name — Callum, Brandon, Erin & Giles
  'Look at Callum — nineteen, learning to drive, chasing his first real job. He’s stepping into the world because you showed him how.',
  'Every job Callum applies for, he carries the work ethic he learned watching you. That’s your fingerprint on his future.',
  'Callum finding his feet and his independence — that quiet confidence started with you, Bernadette.',
  'Brandon, nearly eighteen, eyeing university and his driving test — a young man full of ambition, and he got it from his mum.',
  'When Brandon heads off to university, he’ll take a piece of your drive with him. You gave him that.',
  'Brandon’s reaching higher because you taught him there’s always more to reach for.',
  'Erin’s about to start big school, brave and ready — because her mum made her feel like she can do anything.',
  'Eleven years old and stepping into a whole new world. Erin’s ready, Bernadette, and that readiness is your doing.',
  'Watch Erin walk into big school with her head held high. That courage is yours, passed straight down.',
  'Callum, Brandon and Erin — three good souls finding their way, and every one of them is proof of the mother you are.',
  'Three children, three brand-new chapters all at once, and you’re holding it together with grace. Not many could.',
  'Callum driving, Brandon off to university, Erin starting big school — your whole world is growing up well, because you raised it well.',
  'You’ve given Callum, Brandon and Erin the best possible start, and you’ve given me the best life. — Giles',
  'From the man lucky enough to have married you: I am so proud of you, Bernadette. — Giles',
  'You’re the heart of this family, Bernadette. Callum, Brandon, Erin and I are who we are because of you. — Giles',
  'Even Bailey and Coco know it — you’re the one who makes this house a home.',
  'However long the day, Bailey and Coco are always waiting for you. That kind of love you’ve earned.',
  'The home you’ve built has room for everyone in it — Callum, Brandon, Erin, Bailey and Coco. That’s your warmth.',
  'Slow mornings with a coffee and the dogs at your feet — that’s part of the life all this hard work is buying.',

  // Loved, and the retirement you’re building together
  'One day this all becomes long mornings, slow coffees, and nowhere to be but together.',
  'You are loved beyond measure, Bernadette — more than any note could hold.',
  'I’ve never been prouder of anyone. Keep going — we’re only just getting started.',
  'I watch you work and I fall for you all over again. Proud doesn’t cover it. — Giles',
  'Whatever you’re carrying today, know this: you are adored, and not carrying it alone. — Giles',
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
