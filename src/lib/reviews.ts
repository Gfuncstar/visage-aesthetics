export type Review = {
  name: string
  rating: number
  text: string
  treatment: string
  /** Approximate review date, used to derive the relative-time label shown on the card */
  date: string
}

// Curated from live Google reviews, newest-first. Names initialled for
// patient privacy (matching the prior pattern). Refreshed 2026-05-18.
// To update: visit the Google reviews page, sort by "Newest", and pick
// 6–8 substantive ones that show diverse angles.
export const reviews: Review[] = [
  { name: 'Patricia M.', rating: 5, text: "Bernadette is the most talented aesthetic professional person I have ever been to. I have been going for assorted aesthetic treatments and every treatment has been 100%. I will not be going anywhere else.", treatment: 'Aesthetic treatment', date: '2026-05-15' },
  { name: 'Tiffany T.', rating: 5, text: "Amazing skin booster treatment. Beautiful clinic and a wonderful experience again with the lovely Bernadette! Always leave her feeling like a goddess. Only person I would trust with my face. Thank you again for working your magic.", treatment: 'Profhilo', date: '2026-05-11' },
  { name: 'Maxine L.', rating: 5, text: "Bernadette as always provides a wonderful service. She is totally professional and with a warmth and kindliness that is very appreciated. Always takes time to explain all aspects of the treatment and encourages me to get in touch if any problems.", treatment: 'Aesthetic treatment', date: '2026-05-11' },
  { name: 'D Wallace', rating: 5, text: "Such a thorough and informative consultation for my procedure. Bernadette was really lovely and knowledgeable, which made me feel so at ease, and everything was explained fully before the treatment was decided on for my particular concern. I would highly recommend.", treatment: 'Consultation', date: '2026-05-04' },
  { name: 'Taylor', rating: 5, text: "Bernadette is the loveliest lady, so knowledgeable, and her treatments are long lasting. I went in asking for extra treatments and was told I do not need them yet, which is very rare. Would recommend to anyone.", treatment: 'Aesthetic treatment', date: '2026-05-04' },
  { name: 'Abigail S.', rating: 5, text: "I couldn't be happier with both the results and the service from the lovely Bernadette. As someone who is very nervous and needle phobic, I always feel completely at ease in her care. She is incredibly reassuring, kind, and never judgmental — taking all the time I need to feel comfortable throughout the process. Her gentle and understanding approach has genuinely helped me face my fear of needles and finally have treatments I've always wanted.", treatment: 'Aesthetic treatment', date: '2026-04-27' },
  { name: 'Anna-Maria H.', rating: 5, text: "I would absolutely only ever come to Bernadette. You will feel in safe hands from the moment you meet her. Bern is medically trained with a nursing background, highly qualified and empathetic. Her treatments are excellent with new options as they become available. Thank you Bernadette for a professional friendly experience every time.", treatment: 'Aesthetic treatment', date: '2026-03-18' },
  { name: 'Rachael C.', rating: 5, text: "I always look forward to my appointments with Bernadette, not only because I know my results will be natural and enhance my features, and give me confidence, but also trust her expertise and honesty in the right treatments to suit my skin. I can't recommend Visage Aesthetics enough!", treatment: 'Aesthetic consultation', date: '2026-02-18' },
]

/** Convert an ISO date to a Google-style relative time label ("3 weeks ago"). */
export function toRelativeTime(iso: string, now: Date = new Date()): string {
  const then = new Date(iso)
  const diffDays = Math.max(0, Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24)))
  if (diffDays < 1) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) {
    const weeks = Math.round(diffDays / 7)
    return weeks === 1 ? 'a week ago' : `${weeks} weeks ago`
  }
  if (diffDays < 365) {
    const months = Math.round(diffDays / 30)
    return months === 1 ? 'a month ago' : `${months} months ago`
  }
  const years = Math.round(diffDays / 365)
  return years === 1 ? 'a year ago' : `${years} years ago`
}
