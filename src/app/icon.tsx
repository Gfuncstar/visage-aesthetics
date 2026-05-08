import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#1F1B1A',
          color: '#A8895E',
          fontSize: 26,
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
