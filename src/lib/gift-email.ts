// On-brand gift-voucher emails: a visual voucher block for the recipient, plus
// a plain receipt for the buyer. Both slot into the shared broadcast shell.

import { formatGBP } from '@/lib/gift/vouchers'

const GOLD = '#A8895E'
const CHARCOAL = '#1F1B1A'
const INK_SOFT = '#5C4F44'
const STONE = '#8A807D'
const FONT_DISPLAY = "'Cormorant Garamond', Georgia, 'Times New Roman', serif"
const FONT_BODY = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** A centred, gold-framed gift voucher with the value, code and who it's from. */
export function giftFeatureHtml({
  amountPence,
  code,
  fromName,
  message,
}: {
  amountPence: number
  code: string
  fromName?: string | null
  message?: string | null
}): string {
  const value = esc(formatGBP(amountPence))
  const safeCode = esc(code.trim().toUpperCase())
  const fromLine = fromName
    ? `<div style="font-family:${FONT_BODY};font-size:13px;color:${INK_SOFT};margin-top:4px;">A gift from ${esc(fromName)}</div>`
    : ''
  const messageBlock = message
    ? `<tr><td style="padding:16px 0 0;"><div style="border-left:3px solid ${GOLD};padding:6px 18px;color:${INK_SOFT};font-style:italic;font-family:${FONT_DISPLAY};font-size:18px;line-height:1.55;">${esc(message)}</div></td></tr>`
    : ''
  return `<tr><td style="padding:14px 0 6px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td align="center" style="border:1px solid ${GOLD};background:#FBF8F4;padding:36px 24px;">
        <div style="font-family:${FONT_BODY};font-size:11px;letter-spacing:0.30em;text-transform:uppercase;color:${STONE};margin-bottom:10px;">Gift voucher</div>
        <div style="font-family:${FONT_DISPLAY};font-style:italic;font-weight:300;color:${CHARCOAL};font-size:52px;line-height:1;">${value}</div>
        <div style="font-family:${FONT_BODY};font-size:14px;color:${INK_SOFT};margin-top:6px;">to spend at Visage Aesthetics</div>
        ${fromLine}
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:24px auto 0;">
          <tr><td align="center" style="border:1px dashed ${GOLD};background:#ffffff;padding:15px 32px;">
            <div style="font-family:${FONT_BODY};font-size:10px;letter-spacing:0.26em;text-transform:uppercase;color:${STONE};margin-bottom:6px;">Voucher code</div>
            <div style="font-family:${FONT_BODY};font-size:23px;font-weight:600;letter-spacing:0.24em;color:${CHARCOAL};">${safeCode}</div>
          </td></tr>
        </table>
      </td></tr>
      ${messageBlock}
    </table>
  </td></tr>`
}

export function giftRecipientBody(recipientName: string | null, fromName: string | null): string {
  const hi = recipientName ? `Hi ${recipientName.split(/\s+/)[0]},` : 'Hello,'
  const from = fromName ? `**${fromName}** has treated you to` : 'You have been treated to'
  return `${hi}

${from} a gift voucher for Visage Aesthetics — to spend on any treatment with us.

To use it, just quote your voucher code when you book, online or in clinic, and we'll apply it for you. It can be used over more than one visit until the balance runs out, and it's valid for 12 months.

We can't wait to welcome you.`
}

export function giftBuyerReceiptBody(buyerName: string | null, recipientName: string | null, amountPence: number, code: string): string {
  const hi = buyerName ? `Hi ${buyerName.split(/\s+/)[0]},` : 'Hello,'
  const to = recipientName ? ` to ${recipientName}` : ''
  return `${hi}

Thank you — your ${formatGBP(amountPence)} Visage Aesthetics gift voucher has been sent${to}.

The voucher code is **${code}**, valid for 12 months and usable over more than one visit. If you'd like us to resend it or have any questions, just reply to this email.`
}
