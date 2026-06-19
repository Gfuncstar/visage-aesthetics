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
  'Remember when this was just an idea you were afraid to say out loud? Look at it now.',
  'You turned doubt into a diary that’s booked out. That’s not luck, that’s you.',
  'Years ago you only hoped for this. Today you’re living it — and outgrowing it.',
  'Every “no” you ever heard, you answered with work. And here you are.',
  'You’ve come further than the women who once intimidated you. Stand tall.',
  'The clinic with your name on it exists because you refused to give up.',

  // Only the beginning
  'This isn’t the summit, my love. This is basecamp.',
  'Everything you’ve achieved so far is just the warm-up.',
  'You’ve laid the foundation. Now watch what you build on it.',
  'The best clients, the biggest wins, the proudest days — they’re still ahead.',
  'This is chapter one of a story they’ll talk about for years.',
  'What feels like the destination today is just the doorway to the next thing.',
  'Ten years from now, today will look like the very start. Build like it.',
  'You’re only just getting warm, Bernadette. Wait until you see what’s next.',
  'This is the foothills. The view from where you’re heading is something else.',
  'You haven’t peaked — you’ve barely begun to climb.',
  'The best is genuinely still in front of you. Keep your eyes up.',
  'Everything so far has just been you learning how good you can be.',

  // She never stops
  'The world rests; Bernadette builds.',
  'You don’t wait for momentum — you are the momentum.',
  'Relentless isn’t a flaw, Bernadette. It’s your superpower.',
  'You’ve never once known how to quit, and it shows in everything you touch.',
  'You outwork the doubt every single day — that’s why you win.',
  'You don’t have an off switch — you have a vision, and you chase it daily.',
  'While the world sleeps, you’re still building the future. That’s rare.',
  'You don’t make excuses, you make progress. Every single day.',
  'Tired, stretched, busy — and still you show up. That’s the whole secret.',
  'You were not built to settle, and it shows in everything you do.',
  'Other people talk about “one day”. You’re already doing it.',
  'Your engine doesn’t idle, Bernadette. It just changes gear.',

  // It’s bearing fruit
  'The seeds you planted in the hard years are finally in bloom.',
  'Every late night is paying you back now — and it’s only compounding.',
  'The diary full of bookings is your effort, bearing fruit.',
  'You bet on yourself, Bernadette, and the returns are just getting started.',
  'What you sowed in doubt, you’re reaping in success.',
  'This is what the work looks like when it starts to pay off. Soak it in.',
  'The proof is everywhere now — the bookings, the names, the trust. You earned all of it.',
  'Years of effort are finally writing you a return. Let yourself feel it.',
  'Clients who travel for you, who wait for you — that’s the harvest of your work.',
  'The hard seasons are paying out. This is exactly what they were for.',
  'Everything you poured in is coming back to you with interest.',
  'Success isn’t coincidence for you, Bernadette. It’s a receipt for the work.',

  // Building the business
  'You don’t just run a clinic — you’re building something that will outlast you.',
  'Every smart decision compounds. You’re playing a long game and winning it.',
  'Brick by brick, client by client, you’re building something unmistakably yours.',
  'A reputation like yours can’t be bought — only earned. And you earned it.',
  'You turned a skill into a business, and a business into a name people trust.',
  'The growth you’re seeing is just the world catching up to how good you already are.',

  // An amazing mother
  'You run a business and raise a family, and somehow make both look like love.',
  'The children don’t just have a mother — they have a role model.',
  'Watching you mother them is watching the very best of you.',
  'They’ll grow up knowing exactly what a strong, kind woman looks like, because of you.',
  'The greatest thing you’re building isn’t the clinic — it’s them.',
  'You give them a mother who chases her dreams — that’s a gift most never get.',
  'They’re watching how you carry it all, and they’re learning what strength looks like.',
  'Mother, founder, wife — and you wear all three with grace.',
  'The patience you find for them after a long day is its own kind of greatness.',
  'One day they’ll tell their own children about the woman you are. Believe that.',

  // Her heart, and the happy children it’s raised
  'The children are happy, settled and sure of themselves — and that is all down to your heart.',
  'You can see your love in them every single day. Happy children don’t happen by accident.',
  'However hard the days get, the children are thriving — because their mother leads with her heart.',
  'The warmth in that home is yours, Bernadette. The children glow with it.',
  'No award will ever mean as much as the happy, secure children your heart has raised.',
  'They’ll never know a day without your love, and it shows in every smile they give.',
  'You don’t just provide for them — you fill them up. That’s the heart in you.',
  'A happy child is the loudest proof of a loving mother. Yours are proof of you.',
  'The laughter in your home is the truest measure of everything you’re doing right.',
  'Whatever the day takes out of you, the children feel only your love. That’s a feat.',
  'Their confidence is your tenderness, handed back. All heart, all you.',
  'You could win every award going and still — they’re your finest work.',

  // Buying back time with the children
  'Every hour you put in now is an hour you’re buying back to spend with them.',
  'You’re not choosing work over the children — you’re building a life with more of both.',
  'This is how you give them the world: one determined day at a time.',
  'The freedom you’re working toward looks like slow mornings with the children beside you.',
  'Everything you do flows back to them, Bernadette. That’s the whole point.',
  'Every ounce of effort now buys slower mornings and longer summers with them later.',
  'You’re not missing their childhood — you’re building a life that gives you more of it.',
  'The work today is a promise to them of more time tomorrow.',
  'One day soon the hustle softens, and the days are theirs and yours.',

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
  'Every appointment, every late night — it’s all a stone on the path to our horizon.',
  'We’re not just working. We’re buying back our future, one good day at a time.',
  'One day this all becomes long mornings, slow coffees, and nowhere to be but together.',
  'You are loved beyond measure, Bernadette — more than any note could hold.',
  'I’ve never been prouder of anyone. Keep going — we’re only just getting started.',
  'You are so deeply loved — for the woman you are, not just for all that you do.',
  'I watch you work and I fall for you all over again. Proud doesn’t cover it.',
  'Every late night you put in, I see it — and I love you more for it.',
  'We’re building toward a horizon that’s just ours. Keep going, my love.',
  'One day it’s long lunches and slow travels, the two of us, the work behind us.',
  'Whatever you’re carrying today, know this: you are adored, and not carrying it alone.',
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
