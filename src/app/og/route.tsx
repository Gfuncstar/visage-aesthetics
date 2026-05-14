import { ImageResponse } from 'next/og'
import { AWARD } from '@/lib/award'

/**
 * Dynamic Open Graph image route.
 *
 *   /og?title=Botox+in+Braintree&eyebrow=Geo+Page
 *
 * Renders a 1200×630 branded image at request time. Cached at the edge for
 * 12h. Used by every high-value page (award detail, compare pages, geo
 * pages) to surface a unique, award-branded preview when shared on Slack,
 * WhatsApp, LinkedIn, Pinterest, etc.
 */

// Dynamic so the handler can read query params at request time.
// CDN caching is controlled by the Cache-Control header below.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const CREAM = '#F5F0EC'
const CHARCOAL = '#1F1B1A'
const GOLD = '#A8895E'
const STONE = 'rgba(31, 27, 26, 0.55)'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const title = url.searchParams.get('title')?.slice(0, 90) || 'Visage Aesthetics'
  const eyebrow = url.searchParams.get('eyebrow')?.slice(0, 40) || 'Visage Aesthetics, Braintree'
  const showAward = url.searchParams.get('award') !== 'off'

  const headers: HeadersInit = {
    'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: CREAM,
          color: CHARCOAL,
          padding: '64px 80px',
          position: 'relative',
        }}
      >
        {/* Top row: brand mark + clinic location */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, fontSize: 22, letterSpacing: '0.04em' }}>
          <span style={{ fontFamily: 'serif', fontStyle: 'italic', fontSize: 32, color: CHARCOAL }}>
            Visage Aesthetics
          </span>
          <span style={{ color: STONE, fontSize: 16, letterSpacing: '0.22em', textTransform: 'uppercase' }}>
            · Friars Lane, Braintree
          </span>
        </div>

        {/* Eyebrow */}
        <div
          style={{
            marginTop: 'auto',
            color: GOLD,
            fontSize: 18,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            fontWeight: 500,
          }}
        >
          {eyebrow}
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            marginTop: 18,
            fontFamily: 'serif',
            fontStyle: 'italic',
            fontSize: title.length > 50 ? 64 : 80,
            lineHeight: 1.05,
            fontWeight: 400,
            color: CHARCOAL,
            maxWidth: 980,
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </div>

        {/* Award strip — bottom */}
        {showAward && (
          <div
            style={{
              marginTop: 40,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '14px 22px',
              border: `1px solid ${GOLD}`,
              borderRadius: 4,
              alignSelf: 'flex-start',
              background: 'rgba(168, 137, 94, 0.06)',
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                background: GOLD,
                borderRadius: '50%',
              }}
            />
            <span
              style={{
                color: CHARCOAL,
                fontSize: 18,
                letterSpacing: '0.06em',
              }}
            >
              Officially Awarded · {AWARD.fullName}
            </span>
          </div>
        )}

        {/* Corner mark */}
        <div
          style={{
            position: 'absolute',
            right: 80,
            top: 64,
            color: STONE,
            fontSize: 14,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
          }}
        >
          vaclinic.co.uk
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers,
    }
  )
}
