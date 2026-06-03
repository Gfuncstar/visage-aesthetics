import type { Metadata } from 'next'
import { assistantConfigured } from '@/lib/assistant/db'
import { resolveConsent } from '@/lib/consent/resolve'
import ConsentFormClient from './ConsentFormClient'

export const metadata: Metadata = {
  title: 'Your consent form | Visage Aesthetics',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export const dynamic = 'force-dynamic'

const UUID_RE = /^[0-9a-f-]{36}$/i

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <section className="bg-cream text-charcoal min-h-screen">
      <div className="max-w-xl mx-auto px-5 md:px-8 py-24 text-center">
        <div className="eyebrow text-gold mb-2">Visage Aesthetics</div>
        <h1 className="font-display italic text-charcoal text-3xl md:text-4xl leading-tight">{title}</h1>
        <p className="text-ink-soft mt-4 leading-relaxed">{body}</p>
      </div>
    </section>
  )
}

export default async function ConsentPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  if (!assistantConfigured()) {
    return <Notice title="This link is not available." body="Please contact the clinic and we will help you complete your form." />
  }
  if (!UUID_RE.test(token)) {
    return <Notice title="This link is not valid." body="Please use the link we sent you, or contact the clinic." />
  }

  let resolved
  try {
    resolved = await resolveConsent(token)
  } catch {
    return <Notice title="Something went wrong." body="Please try again shortly, or contact the clinic." />
  }

  if (!resolved.context) {
    return <Notice title="We could not find that form." body="Please use the link we sent you, or contact the clinic." />
  }
  if (resolved.alreadyDone) {
    return (
      <Notice
        title="Thank you — your form is complete."
        body="We have your consent form on file. There is nothing more to do before your appointment."
      />
    )
  }

  const { context } = resolved
  return (
    <ConsentFormClient
      token={token}
      form={context.form}
      clientName={context.clientName}
      serviceName={context.serviceName ?? context.form.name}
    />
  )
}
