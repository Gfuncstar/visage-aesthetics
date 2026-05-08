export type Review = {
  name: string
  rating: number
  text: string
  treatment: string
  /** Approximate review date, used to derive the relative-time label shown on the card */
  date: string
}

export const reviews: Review[] = [
  { name: 'Rosie S.', rating: 5, text: "I've had various “tweak-ments” at Visage and have been super happy with all of the results. Bernadette's knowledge, kindness and patience puts your mind at rest. I would recommend her services in a heart beat.", treatment: 'Aesthetic treatment', date: '2026-03-08' },
  { name: 'Rachael C.', rating: 5, text: "I always look forward to my appointments with Bernadette, not only because I know my results will be natural and enhance my features, and give me confidence, but also trust her expertise and honesty in the right treatments to suit my skin. I can't recommend Visage Aesthetics enough!", treatment: 'Aesthetic consultation', date: '2026-02-08' },
  { name: 'Katherine L.', rating: 5, text: "I had an excellent experience with Bernadette. She truly listens to your needs and ensures you achieve the best possible results. Her medical expertise was especially reassuring for me, as safety during the procedure was a top priority. Bernadette made me feel informed, confident, and completely at ease throughout the process.", treatment: 'Anti-Wrinkle Injections', date: '2025-11-08' },
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
