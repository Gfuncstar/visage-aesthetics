import type { Metadata } from 'next'

const SITE = 'https://www.vaclinic.co.uk'
const DEFAULT_EYEBROW = 'Visage Aesthetics, Braintree'

/**
 * Build a complete public-page Metadata block: title, description, a
 * self-referential canonical, and OpenGraph + Twitter cards backed by the
 * dynamic OG image route (`src/app/og/route.tsx`).
 *
 * Use this on every standalone public page so that (a) shared links unfurl
 * with a branded 1200×630 card, and (b) the canonical never falls through to
 * the layout default of `/` — see SEO_PLAYBOOK.md §1.2 ("Don't rely on layout
 * fall-through").
 *
 *   export const metadata = buildMetadata({
 *     title: 'Profhilo Braintree | Visage Aesthetics',
 *     description: '…',
 *     path: '/treatments/profhilo',
 *     ogTitle: 'Profhilo in Braintree',
 *     eyebrow: 'Nurse-led treatment',
 *   })
 */
export function buildMetadata({
  title,
  description,
  path,
  ogTitle,
  eyebrow,
}: {
  /** Full <title> (include the " | Visage Aesthetics" suffix). */
  title: string
  description: string
  /** Absolute path from the site root, e.g. '/treatments/profhilo'. */
  path: string
  /** Short headline rendered on the OG image. Defaults to `title`. */
  ogTitle?: string
  /** Eyebrow line on the OG image. */
  eyebrow?: string
}): Metadata {
  const ogHeadline = ogTitle ?? title
  const ogImage = `/og?title=${encodeURIComponent(ogHeadline)}&eyebrow=${encodeURIComponent(eyebrow ?? DEFAULT_EYEBROW)}`
  const url = `${SITE}${path}`

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      locale: 'en_GB',
      siteName: 'Visage Aesthetics',
      title: ogHeadline,
      description,
      url,
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${ogHeadline}, Visage Aesthetics` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogHeadline,
      description,
      images: [ogImage],
    },
  }
}
