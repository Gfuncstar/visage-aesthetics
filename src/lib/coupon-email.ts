// On-brand "voucher" block + copy for the coupon email. The voucher is a
// pre-built table-row, dropped into the shared broadcast shell via `featureHtml`
// so it inherits the brand header, Bernadette sign-off and footer.

const GOLD = '#A8895E'
const CHARCOAL = '#1F1B1A'
const INK_SOFT = '#5C4F44'
const STONE = '#8A807D'
const FONT_DISPLAY = "'Cormorant Garamond', Georgia, 'Times New Roman', serif"
const FONT_BODY = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"

export type CouponKind = '£' | '%'

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** "£20 off" or "20% off". */
export function couponAmountLabel(amount: number, kind: CouponKind): string {
  return kind === '%' ? `${amount}% off` : `£${amount} off`
}

/** A centred, gold-framed voucher with the amount and a dashed code chip. */
export function couponFeatureHtml({ amount, kind, code }: { amount: number; kind: CouponKind; code: string }): string {
  const label = esc(couponAmountLabel(amount, kind))
  const safeCode = esc(code.trim().toUpperCase())
  return `<tr><td style="padding:14px 0 6px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td align="center" style="border:1px solid ${GOLD};background:#FBF8F4;padding:36px 24px;">
        <div style="font-family:${FONT_BODY};font-size:11px;letter-spacing:0.30em;text-transform:uppercase;color:${STONE};margin-bottom:10px;">A gift for you</div>
        <div style="font-family:${FONT_DISPLAY};font-style:italic;font-weight:300;color:${CHARCOAL};font-size:48px;line-height:1;margin-bottom:6px;">${label}</div>
        <div style="font-family:${FONT_BODY};font-size:14px;color:${INK_SOFT};margin-bottom:26px;">your next treatment at Visage Aesthetics</div>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
          <tr><td align="center" style="border:1px dashed ${GOLD};background:#ffffff;padding:15px 32px;">
            <div style="font-family:${FONT_BODY};font-size:10px;letter-spacing:0.26em;text-transform:uppercase;color:${STONE};margin-bottom:6px;">Your code</div>
            <div style="font-family:${FONT_BODY};font-size:23px;font-weight:600;letter-spacing:0.24em;color:${CHARCOAL};">${safeCode}</div>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </td></tr>`
}

/** Warm covering note shown under the voucher. */
export function couponEmailBody(firstName: string, amount: number, kind: CouponKind): string {
  const label = couponAmountLabel(amount, kind)
  return `Hi ${firstName},

A little thank you from us — here is **${label}** your next treatment at Visage Aesthetics.

Just quote your code when you book, in clinic or by replying to this email, and we will take care of the rest. We look forward to seeing you.`
}
