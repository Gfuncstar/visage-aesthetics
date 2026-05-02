import { Star } from 'lucide-react'
import GoogleG from '@/components/ui/GoogleG'
import GoogleReviewCard from '@/components/ui/GoogleReviewCard'
import { getGoogleReviews } from '@/lib/google-reviews'

export const revalidate = 21600 // 6 hours

export default async function GoogleReviews() {
  const data = await getGoogleReviews()

  return (
    <section className="reveal relative overflow-hidden" style={{ background: '#EFE8E0', padding: 'var(--section-y) var(--pad-x)' }}>
      <div className="max-w-[1280px] mx-auto relative">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-end mb-12 md:mb-16">
          <div className="md:col-span-7">
            <div className="section-num mb-8">01 &nbsp; Reviews</div>
            <h2 className="text-h1 text-charcoal max-w-2xl">
              Quietly trusted, in our clients&apos; own words.
            </h2>
          </div>
          <div className="md:col-span-5 md:text-right">
            <a
              href={data.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 group"
            >
              <GoogleG size={28} />
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="font-display italic text-charcoal" style={{ fontSize: 28, fontWeight: 400, lineHeight: 1, letterSpacing: '-0.01em' }}>
                    {data.rating.toFixed(1)}
                  </span>
                  <span className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={13} className="fill-gold text-gold" />
                    ))}
                  </span>
                </div>
                <div className="eyebrow mt-1 text-stone group-hover:text-gold-deep transition-colors">
                  {data.live ? `${data.total} Google reviews` : `${data.total}+ Google reviews`} &nbsp;→
                </div>
              </div>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px reveal-stagger" style={{ background: '#D9CDBE', border: '1px solid #D9CDBE' }}>
          {data.reviews.slice(0, 3).map((r, i) => (
            <GoogleReviewCard
              key={i}
              author={r.author}
              profilePhoto={r.profilePhoto}
              relativeTime={r.relativeTime}
              rating={r.rating}
              text={r.text}
            />
          ))}
        </div>

        <p className="mt-8 text-stone text-[11px] tracking-[0.18em] uppercase">
          {data.live ? (
            <>Live from Google &nbsp;·&nbsp; Synced {new Date(data.lastSynced).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</>
          ) : (
            <>From verified Google reviews &nbsp;·&nbsp;
              <a href={data.mapsUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-gold/40 hover:decoration-gold-deep">
                Read all on Google
              </a>
            </>
          )}
        </p>
      </div>
    </section>
  )
}
