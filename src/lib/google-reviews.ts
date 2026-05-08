import { reviews as fallbackReviews, toRelativeTime } from './reviews'

export type GoogleReview = {
  author: string
  rating: number
  text: string
  relativeTime: string
  profilePhoto?: string
}

export type GoogleReviewsResult = {
  rating: number
  total: number
  reviews: GoogleReview[]
  live: boolean
  lastSynced: string
  mapsUrl: string
}

const PLACE_ID = process.env.GOOGLE_PLACE_ID
const API_KEY = process.env.GOOGLE_PLACES_API_KEY
const REVALIDATE_SECONDS = 60 * 60 * 6 // 6 hours

const MAPS_URL = 'https://www.google.com/search?si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOZUkfYTnOK0lVRldiWlmxsHsE5-Mku8g2mXUEMi-L7oaPpk2f8Q87z_1fhbFYidX4jcSnVByacdhL7xVWnRVfHVY5K5MOMJcXXQ5oarbEB3PM0e5bA%3D%3D&q=Visage+Aesthetics+Reviews'

export async function getGoogleReviews(): Promise<GoogleReviewsResult> {
  if (PLACE_ID && API_KEY) {
    try {
      const res = await fetch(
        `https://places.googleapis.com/v1/places/${PLACE_ID}?fields=rating,userRatingCount,reviews,googleMapsUri`,
        {
          headers: {
            'X-Goog-Api-Key': API_KEY,
            'X-Goog-FieldMask': 'rating,userRatingCount,reviews,googleMapsUri',
          },
          next: { revalidate: REVALIDATE_SECONDS },
        }
      )
      if (res.ok) {
        const data = await res.json()
        return {
          rating: data.rating ?? 5.0,
          total: data.userRatingCount ?? 0,
          mapsUrl: data.googleMapsUri ?? MAPS_URL,
          live: true,
          lastSynced: new Date().toISOString(),
          reviews: (data.reviews ?? []).slice(0, 6).map((r: {
            authorAttribution?: { displayName?: string; photoUri?: string }
            rating?: number
            text?: { text?: string }
            relativePublishTimeDescription?: string
          }) => ({
            author: r.authorAttribution?.displayName ?? 'Anonymous',
            rating: r.rating ?? 5,
            text: r.text?.text ?? '',
            relativeTime: r.relativePublishTimeDescription ?? '',
            profilePhoto: r.authorAttribution?.photoUri,
          })),
        }
      }
    } catch {
      // fall through to local fallback
    }
  }

  return {
    rating: 5.0,
    total: 62,
    mapsUrl: MAPS_URL,
    live: false,
    lastSynced: new Date().toISOString(),
    reviews: fallbackReviews.map((r) => ({
      author: r.name,
      rating: r.rating,
      text: r.text,
      relativeTime: toRelativeTime(r.date),
    })),
  }
}
