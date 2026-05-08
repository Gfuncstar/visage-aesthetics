import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#1F1B1A',
          color: '#A8895E',
          fontSize: 140,
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
    size,
  )
}
