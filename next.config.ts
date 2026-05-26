import type { NextConfig } from 'next'
import path from 'node:path'

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.squarespace-cdn.com', pathname: '/**' },
    ],
  },
  async redirects() {
    return [
      { source: '/dermal-filler', destination: '/treatments/dermal-filler', permanent: true },
      { source: '/botox', destination: '/treatments/anti-wrinkle-injections', permanent: true },
      { source: '/micro-needling', destination: '/treatments/micro-needling', permanent: true },
      { source: '/sweat-migraines', destination: '/treatments/hyperhidrosis-migraines', permanent: true },
      { source: '/b12', destination: '/treatments/vitamin-b12', permanent: true },
      { source: '/aqualyx', destination: '/treatments/aqualyx', permanent: true },
      { source: '/men', destination: '/treatments/mens-aesthetics', permanent: true },
      { source: '/profhilo', destination: '/treatments/profhilo', permanent: true },
      { source: '/cryopen', destination: '/treatments/cryopen', permanent: true },
      { source: '/botox-1', destination: '/treatments/harmonyca', permanent: true },
      { source: '/contact-us', destination: '/contact', permanent: true },
    ]
  },
}

export default nextConfig
