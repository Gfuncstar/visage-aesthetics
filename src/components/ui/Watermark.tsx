/**
 * Subtle photo watermark used across the before/after gallery so the
 * provenance is visible if images are scraped or reshared. Aims to be
 * deterrent without dominating the image — small, semi-transparent,
 * with a soft shadow for legibility across light or dark backdrops.
 */
type Position = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'

const positionClass: Record<Position, string> = {
  'bottom-right': 'bottom-2 right-2',
  'bottom-left': 'bottom-2 left-2',
  'top-right': 'top-2 right-2',
  'top-left': 'top-2 left-2',
}

export default function Watermark({
  position = 'bottom-right',
  label = 'vaclinic.co.uk',
}: {
  position?: Position
  label?: string
}) {
  return (
    <span
      aria-hidden
      className={`absolute ${positionClass[position]} pointer-events-none select-none`}
      style={{
        fontSize: 9.5,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        fontWeight: 500,
        color: 'rgba(245, 240, 236, 0.7)',
        textShadow: '0 1px 4px rgba(31, 27, 26, 0.55), 0 0 1px rgba(31, 27, 26, 0.4)',
        padding: '4px 7px',
        background: 'rgba(31, 27, 26, 0.18)',
        backdropFilter: 'blur(1.5px)',
        WebkitBackdropFilter: 'blur(1.5px)',
        borderRadius: 2,
      }}
    >
      {label}
    </span>
  )
}
