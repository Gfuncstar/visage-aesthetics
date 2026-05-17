/**
 * Pool of clinic footage clips used across the edge-to-edge VideoBandUSP
 * placements. Hero footage (walkthrough.mp4) is intentionally NOT in this
 * pool — the hero stays exclusive.
 */
export const USP_VIDEOS = [
  '/video/usp/8e38c8ca-9fb2-4237-8914-74acf375acd4.mp4',
  '/video/usp/imagine-29b3b9cf.mp4',
  '/video/usp/imagine-5f4eaa01.mp4',
  '/video/usp/imagine-71ed1d19.mp4',
  '/video/usp/imagine-84131880.mp4',
  '/video/usp/imagine-a0f5e9f5.mp4',
  '/video/usp/imagine-a3e532c9.mp4',
  '/video/usp/imagine-cf93c115.mp4',
  '/video/usp/imagine-d5ded6f3.mp4',
  '/video/usp/imagine-d74dac63.mp4',
  '/video/usp/imagine-f16e4fcd.mp4',
  '/video/usp/imagine-f8fd119c.mp4',
] as const

/**
 * Deterministic pick from the pool based on a seed string (typically a
 * page slug). Same seed always yields the same clip, so /braintree-botox
 * always plays the same video build to build.
 */
export function pickUspVideo(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) | 0
  }
  return USP_VIDEOS[Math.abs(h) % USP_VIDEOS.length]
}
