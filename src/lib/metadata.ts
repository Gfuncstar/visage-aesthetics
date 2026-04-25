import type { Metadata } from 'next'

export function generatePageMetadata({
  title,
  description,
  keywords = [],
}: {
  title: string
  description: string
  keywords?: string[]
}): Metadata {
  return {
    title,
    description,
    keywords: [...keywords, 'aesthetics braintree', 'nurse aesthetics essex'],
    openGraph: {
      title: `${title} | Visage Aesthetics Braintree`,
      description,
      type: 'website',
      locale: 'en_GB',
      siteName: 'Visage Aesthetics',
    },
  }
}
