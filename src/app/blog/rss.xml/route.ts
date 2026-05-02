import { blogPostsByDate } from '@/lib/blog-posts'

export const dynamic = 'force-static'
export const revalidate = 3600

const SITE = 'https://www.vaclinic.co.uk'

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const lastBuild = blogPostsByDate[0]?.dateModified ?? blogPostsByDate[0]?.datePublished ?? new Date().toISOString()

  const items = blogPostsByDate
    .map((p) => {
      const url = `${SITE}/blog/${p.slug}`
      return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(p.datePublished).toUTCString()}</pubDate>
      <description>${escapeXml(p.excerpt)}</description>
      <category>${escapeXml(p.category)}</category>
      <author>info@vaclinic.co.uk (Bernadette Tobin RGN, MSc)</author>
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Visage Aesthetics, Insights &amp; Advice</title>
    <link>${SITE}/blog</link>
    <description>Plain-English notes on aesthetic treatments from Bernadette Tobin RGN, MSc, registered nurse, NMC PIN 05G1755E. Best Non-Surgical Aesthetics Clinic 2026, Essex. New articles every two days.</description>
    <language>en-GB</language>
    <lastBuildDate>${new Date(lastBuild).toUTCString()}</lastBuildDate>
    <atom:link href="${SITE}/blog/rss.xml" rel="self" type="application/rss+xml" />
    <generator>Next.js</generator>
    <copyright>© ${new Date().getFullYear()} Visage Aesthetics</copyright>
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
