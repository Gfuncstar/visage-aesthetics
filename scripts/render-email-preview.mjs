import { createJiti } from 'jiti'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const jiti = createJiti(import.meta.url, { interopDefault: true })
const { buildBroadcastHtml } = await jiti.import(resolve(root, 'src/lib/broadcast-email.ts'))

const html = buildBroadcastHtml({
  preheader: 'A small note from the clinic this week.',
  headline: 'A quieter month ahead',
  body: `It has been a busy spring at the clinic. As we move into June I am holding a few mornings back for follow-up reviews and consultations for anyone considering a first treatment.

If you have been thinking about Profhilo or a light filler refresh before summer, the next two weeks are a good window. I will be back to full diary from the 17th.

A short reminder: I never push extra treatments. If a review shows you do not need anything yet, that is what I will tell you.`,
  cta: 'book',
  recipientEmail: 'preview@example.com',
})

const out = resolve(root, 'public/email/preview.html')
writeFileSync(out, html)
console.log('wrote', out, html.length, 'bytes')
