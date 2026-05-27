#!/usr/bin/env python3
"""Regenerate public/email/bernadette-signoff.png with footer-matching typography.

Preserves the portrait photo (left) and handwritten 'Bernadette' signature
glyph (right-middle) from the existing PNG. Re-renders the text portions
using Cormorant Garamond Italic + Inter Medium so the signoff visually
matches the email's dark footer block.
"""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'public' / 'email' / 'bernadette-signoff.png'
OUT = ROOT / 'public' / 'email' / 'bernadette-signoff.png'

BG = (243, 238, 233)
CHARCOAL = (31, 27, 26)
GOLD = (168, 137, 94)

CG_ITALIC = '/tmp/CormorantGaramond-Italic.ttf'
INTER_MEDIUM = '/tmp/Inter-Medium.ttf'

W, H = 588, 290

# Source regions to preserve from the original PNG
PORTRAIT_BOX = (0, 0, 258, H)         # full-height portrait column on the left
SIGNATURE_BOX = (256, 118, 480, 212)  # handwritten 'Bernadette' glyph


def draw_letterspaced(draw, xy, text, font, fill, tracking_px):
    """Render text with manual per-character tracking (PIL has no letter-spacing)."""
    x, y = xy
    for i, ch in enumerate(text):
        draw.text((x, y), ch, font=font, fill=fill)
        adv = font.getlength(ch)
        x += adv + tracking_px
    return x  # end x


def text_width_letterspaced(text, font, tracking_px):
    total = sum(font.getlength(c) for c in text)
    return total + tracking_px * max(0, len(text) - 1)


def main():
    src = Image.open(SRC).convert('RGB')
    if src.size != (W, H):
        raise SystemExit(f'unexpected source size: {src.size}')

    out = Image.new('RGB', (W, H), BG)

    # Preserve portrait + signature glyph
    out.paste(src.crop(PORTRAIT_BOX), PORTRAIT_BOX[:2])
    out.paste(src.crop(SIGNATURE_BOX), SIGNATURE_BOX[:2])

    draw = ImageDraw.Draw(out)

    # Footer-matching sizing: 10px Inter for uppercase tracked labels,
    # Cormorant Italic 20px for the focal sentence (slightly larger than
    # the footer's 15-16px to act as the visual focal point of the signoff).

    # --- Top caption row: gold dash + "A NOTE FROM BERNADETTE" -----------
    caption_y = 38
    dash_y = caption_y + 4
    draw.rectangle((258, dash_y, 258 + 26, dash_y + 1), fill=GOLD)
    cap_font = ImageFont.truetype(INTER_MEDIUM, 10)
    cap_text = 'A NOTE FROM BERNADETTE'
    cap_tracking = 2.6  # 0.26em at 10px (matches footer's 0.26em)
    draw_letterspaced(draw, (258 + 26 + 12, caption_y - 2), cap_text, cap_font, CHARCOAL, cap_tracking)

    # --- Sentence: "Looking forward to seeing you in clinic." -----------
    sentence_font = ImageFont.truetype(CG_ITALIC, 20)
    line1 = 'Looking forward to seeing you'
    line2 = 'in clinic.'
    draw.text((258, 64), line1, font=sentence_font, fill=CHARCOAL)
    draw.text((258, 88), line2, font=sentence_font, fill=CHARCOAL)

    # --- Bottom caption: "FOUNDER · RGN, MSc" --------------------------
    foot_font = ImageFont.truetype(INTER_MEDIUM, 10)
    foot_text = 'FOUNDER  ·  RGN, MSc'
    foot_tracking = 2.2  # 0.22em at 10px (matches footer's 0.22em)
    draw_letterspaced(draw, (258, 222), foot_text, foot_font, GOLD, foot_tracking)

    out.save(OUT, optimize=True)
    print(f'wrote {OUT} ({OUT.stat().st_size} bytes)')


if __name__ == '__main__':
    main()
