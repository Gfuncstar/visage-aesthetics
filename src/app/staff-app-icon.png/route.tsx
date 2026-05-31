import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'
export const contentType = 'image/png'

// 512x512 home-screen / PWA icon for the staff Assistant: brand "V" mark.
export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#1F1B1A',
          color: '#A8895E',
          fontSize: 360,
          fontWeight: 500,
          fontFamily: '"Times New Roman", Georgia, serif',
          fontStyle: 'italic',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          letterSpacing: '-0.02em',
        }}
      >
        V
      </div>
    ),
    { width: 512, height: 512 },
  )
}
