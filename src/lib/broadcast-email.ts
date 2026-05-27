const SITE_URL = 'https://www.vaclinic.co.uk'
const CLINIC_NAME = 'Visage Aesthetics'
const CLINIC_TAGLINE = 'Best Non-Surgical Aesthetics Clinic 2026, Essex'
const CLINIC_ADDRESS = 'Braintree, Essex'
const CLINIC_EMAIL = 'info@vaclinic.co.uk'
const SIGNOFF_IMAGE_URL = 'https://vaclinic.co.uk/email/bernadette-signoff.png'

const COLOR_CREAM = '#F5F0EC'
const COLOR_CREAM_SOFT = '#EFE8E0'
const COLOR_CHARCOAL = '#1F1B1A'
const COLOR_INK_SOFT = '#5C4F44'
const COLOR_STONE = '#8A807D'
const COLOR_GOLD = '#A8895E'
const COLOR_LINE = '#D9CDBE'

const FONT_DISPLAY = "'Cormorant Garamond', Georgia, 'Times New Roman', serif"
const FONT_BODY = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"

export type CtaKind = 'book' | 'contact' | 'none'

const CTA_PRESETS: Record<Exclude<CtaKind, 'none'>, { label: string; url: string }> = {
  book: { label: 'Book a consultation', url: `${SITE_URL}/book` },
  contact: { label: 'Contact me', url: `${SITE_URL}/contact` },
}

export function ctaPreset(kind: CtaKind): { label: string; url: string } | null {
  if (kind === 'none') return null
  return CTA_PRESETS[kind] ?? null
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function escapeAttr(s: string): string {
  return escapeHtml(s)
}

function isSafeHref(url: string): boolean {
  const trimmed = url.trim().toLowerCase()
  return (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('tel:')
  )
}

function renderInline(text: string): string {
  let out = escapeHtml(text)
  out = out.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    (_match, label: string, href: string) => {
      const safe = isSafeHref(href) ? href : '#'
      return `<a href="${escapeAttr(safe)}" style="color:${COLOR_GOLD};text-decoration:underline;">${label}</a>`
    },
  )
  out = out.replace(/\*\*([^*]+)\*\*/g, `<strong style="font-weight:600;color:${COLOR_CHARCOAL};">$1</strong>`)
  out = out.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>')
  out = out.replace(/\n/g, '<br />')
  return out
}

export function bodyToHtml(body: string): string {
  const blocks = body
    .replace(/\r\n/g, '\n')
    .trim()
    .split(/\n{2,}/)

  return blocks
    .map((raw) => {
      const block = raw.trim()
      if (!block) return ''

      if (block === '---') {
        return `<tr><td style="padding:8px 0;"><div style="height:1px;background:${COLOR_LINE};width:48px;"></div></td></tr>`
      }

      if (block.startsWith('> ')) {
        const quote = block.replace(/^>\s?/gm, '')
        return `<tr><td style="padding:12px 0;"><div style="border-left:3px solid ${COLOR_GOLD};padding:6px 18px;color:${COLOR_INK_SOFT};font-style:italic;font-family:${FONT_DISPLAY};font-size:18px;line-height:1.55;">${renderInline(quote)}</div></td></tr>`
      }

      return `<tr><td style="padding:10px 0;"><p style="margin:0;font-family:${FONT_BODY};color:${COLOR_INK_SOFT};font-size:15px;line-height:1.65;">${renderInline(block)}</p></td></tr>`
    })
    .join('')
}

export function bodyToText(body: string): string {
  return body
    .replace(/\r\n/g, '\n')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '$1 ($2)')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1$2')
    .replace(/^>\s?/gm, '')
    .trim()
}

export type BuildEmailInput = {
  preheader?: string
  imageUrl?: string
  imageAlt?: string
  headline?: string
  body: string
  cta?: CtaKind
  recipientEmail?: string
}

export function buildBroadcastHtml({
  preheader,
  imageUrl,
  imageAlt,
  headline,
  body,
  cta = 'none',
  recipientEmail,
}: BuildEmailInput): string {
  const ctaInfo = ctaPreset(cta)
  const ctaBlock = ctaInfo
    ? `
      <tr><td style="padding:32px 0 8px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr><td style="background:${COLOR_GOLD};">
            <a href="${escapeAttr(ctaInfo.url)}" style="display:inline-block;padding:18px 32px;font-family:${FONT_BODY};font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:${COLOR_CREAM};text-decoration:none;font-weight:500;">${escapeHtml(ctaInfo.label)}</a>
          </td></tr>
        </table>
      </td></tr>`
    : ''

  const heroImage =
    imageUrl && isSafeHref(imageUrl)
      ? `
      <tr><td style="padding:0;">
        <img src="${escapeAttr(imageUrl)}" alt="${escapeAttr(imageAlt || '')}" width="560" style="display:block;width:100%;max-width:560px;height:auto;border:0;outline:none;text-decoration:none;" />
      </td></tr>`
      : ''

  const headlineBlock = headline
    ? `
      <tr><td style="padding:0 40px 8px;">
        <h1 style="margin:0;font-family:${FONT_DISPLAY};font-style:italic;font-weight:300;color:${COLOR_CHARCOAL};font-size:38px;line-height:1.05;letter-spacing:-0.015em;">${escapeHtml(headline)}</h1>
      </td></tr>`
    : ''

  const preheaderHtml = preheader
    ? `<div style="display:none;font-size:1px;color:${COLOR_CREAM};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(preheader)}</div>`
    : ''

  const unsubscribeHref = `mailto:${CLINIC_EMAIL}?subject=${encodeURIComponent('Unsubscribe')}${recipientEmail ? `&body=${encodeURIComponent(`Please remove ${recipientEmail} from your mailing list.`)}` : ''}`

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<title>${escapeHtml(CLINIC_NAME)}</title>
<style>
  @media (max-width: 600px) {
    .container { width: 100% !important; }
    .px-pad { padding-left: 24px !important; padding-right: 24px !important; }
    .hl { font-size: 30px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${COLOR_CREAM};">
${preheaderHtml}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLOR_CREAM};">
  <tr><td align="center" style="padding:40px 16px;">
    <table role="presentation" class="container" width="560" cellpadding="0" cellspacing="0" border="0" style="width:560px;max-width:560px;background:${COLOR_CREAM_SOFT};">
      <tr><td class="px-pad" style="padding:32px 40px 24px;text-align:center;border-bottom:1px solid ${COLOR_LINE};">
        <div style="font-family:${FONT_BODY};font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:${COLOR_STONE};margin-bottom:6px;">${escapeHtml(CLINIC_NAME)}</div>
        <div style="font-family:${FONT_DISPLAY};font-style:italic;font-size:13px;color:${COLOR_GOLD};letter-spacing:0.02em;">${escapeHtml(CLINIC_TAGLINE)}</div>
      </td></tr>
      ${heroImage}
      <tr><td class="px-pad" style="padding:${imageUrl ? '36px' : '32px'} 40px 36px;">
        ${headline ? `<h1 class="hl" style="margin:0 0 20px;font-family:${FONT_DISPLAY};font-style:italic;font-weight:300;color:${COLOR_CHARCOAL};font-size:38px;line-height:1.05;letter-spacing:-0.015em;">${escapeHtml(headline)}</h1>` : ''}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          ${bodyToHtml(body)}
          ${ctaBlock}
        </table>
      </td></tr>
      <tr><td style="padding:8px 0 32px;">
        <img src="${SIGNOFF_IMAGE_URL}" alt="A note from Bernadette. Looking forward to seeing you in clinic. Bernadette, Founder, RGN, MSc." width="560" style="display:block;width:100%;max-width:560px;height:auto;border:0;outline:none;text-decoration:none;" />
      </td></tr>
      <tr><td class="px-pad" style="padding:24px 40px 32px;border-top:1px solid ${COLOR_LINE};">
        <p style="margin:0 0 6px;font-family:${FONT_BODY};font-size:12px;color:${COLOR_STONE};line-height:1.6;text-align:center;">
          ${escapeHtml(CLINIC_NAME)} &middot; ${escapeHtml(CLINIC_ADDRESS)}
        </p>
        <p style="margin:0;font-family:${FONT_BODY};font-size:11px;color:${COLOR_STONE};line-height:1.6;text-align:center;">
          <a href="${SITE_URL}" style="color:${COLOR_STONE};text-decoration:underline;">vaclinic.co.uk</a>
          &nbsp;&middot;&nbsp;
          <a href="${escapeAttr(unsubscribeHref)}" style="color:${COLOR_STONE};text-decoration:underline;">Unsubscribe</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`
}

export function buildBroadcastText({
  imageUrl,
  headline,
  body,
  cta = 'none',
  recipientEmail,
}: BuildEmailInput): string {
  const ctaInfo = ctaPreset(cta)
  const lines = [
    CLINIC_NAME,
    CLINIC_TAGLINE,
    '',
    '---',
    '',
  ]
  if (headline) lines.push(headline, '')
  lines.push(bodyToText(body))
  if (ctaInfo) lines.push('', `${ctaInfo.label}: ${ctaInfo.url}`)
  if (imageUrl) lines.push('', `(Image: ${imageUrl})`)
  lines.push(
    '',
    'Looking forward to seeing you in clinic.',
    'Bernadette',
    'Founder · RGN, MSc',
    '',
    '---',
    '',
    `${CLINIC_NAME} · ${CLINIC_ADDRESS}`,
    SITE_URL,
    '',
    `To unsubscribe, reply to this email or write to ${CLINIC_EMAIL}${recipientEmail ? ` asking to remove ${recipientEmail}.` : '.'}`,
  )
  return lines.join('\n')
}
