import { ReactNode } from 'react'

export default function Badge({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center text-eyebrow text-gold ${className}`}>
      <span className="w-6 h-px bg-gold mr-3" />
      {children}
    </span>
  )
}
