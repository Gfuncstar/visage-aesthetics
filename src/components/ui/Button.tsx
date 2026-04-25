import Link from 'next/link'
import { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'ghost-dark' | 'ghost-light'

type BaseProps = {
  variant?: Variant
  className?: string
  children: ReactNode
  block?: boolean
}

type AsButton = BaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined }
type AsLink = BaseProps & { href: string; target?: string; rel?: string }
type ButtonProps = AsButton | AsLink

const variantClass: Record<Variant, string> = {
  primary: 'btn-primary',
  'ghost-dark': 'btn-ghost-dark',
  'ghost-light': 'btn-ghost-light',
}

export default function Button({ variant = 'primary', className = '', children, block, ...props }: ButtonProps) {
  const cls = `btn ${variantClass[variant]} ${block ? 'btn-block' : ''} ${className}`.trim()
  if ('href' in props && props.href !== undefined) {
    const { href, target, rel } = props as AsLink
    return (
      <Link href={href} target={target} rel={rel} className={cls}>
        {children}
      </Link>
    )
  }
  const { ...rest } = props as AsButton
  return (
    <button className={cls} {...rest}>{children}</button>
  )
}
