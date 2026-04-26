export type Treatment = {
  name: string
  slug: string
  tagline: string
  description: string
  price: string
  href: string
  image: string
}

export const treatments: Treatment[] = [
  { name: 'Anti-Wrinkle Injections', slug: 'anti-wrinkle-injections', tagline: 'Smooth fine lines naturally', description: "Precisely placed botulinum toxin to soften forehead lines, frown lines and crow's feet. No frozen look.", price: 'From £120', href: '/treatments/anti-wrinkle-injections', image: '/images/anti-wrinkle.jpg' },
  { name: 'Dermal Filler', slug: 'dermal-filler', tagline: 'Restore volume and contour', description: 'Hyaluronic acid filler to restore lost volume, define lips, enhance cheeks or reshape the nose. Immediate, reversible.', price: 'From £110', href: '/treatments/dermal-filler', image: '/images/dermal-filler.jpg' },
  { name: 'Profhilo', slug: 'profhilo', tagline: 'Deep skin bio-remodelling', description: 'High-concentration hyaluronic acid that bio-remodels skin from within. Improves hydration, texture and laxity.', price: 'From £180', href: '/treatments/profhilo', image: '/images/profhilo.jpg' },
  { name: 'HarmonyCa', slug: 'harmonyca', tagline: 'Lift, contour and biostimulate', description: 'A hybrid injectable combining immediate lifting with long-term collagen biostimulation.', price: 'From £500', href: '/treatments/harmonyca', image: '/images/treatment-2.jpg' },
  { name: 'Micro-Needling', slug: 'micro-needling', tagline: 'Rejuvenate from within', description: "Controlled micro-channels stimulate the skin's natural healing response, boosting collagen for smoother, firmer skin.", price: 'From £80', href: '/treatments/micro-needling', image: '/images/micro-needling.jpg' },
  { name: 'AQUALYX', slug: 'aqualyx', tagline: 'Non-surgical fat dissolving', description: 'Injectable treatment for stubborn localised fat. No surgery, no general anaesthetic, no recovery time.', price: 'From £250 per area', href: '/treatments/aqualyx', image: '/images/aqualyx.jpg' },
  { name: 'CryoPen', slug: 'cryopen', tagline: 'Precise skin lesion removal', description: 'Targeted cryotherapy for benign skin lesions including warts, skin tags, milia and age spots.', price: 'From £80', href: '/treatments/cryopen', image: '/images/treatment-3.jpg' },
  { name: 'Hyperhidrosis & Migraines', slug: 'hyperhidrosis-migraines', tagline: 'Medical-grade relief', description: 'Botulinum toxin for excessive sweating and chronic migraine prevention. Life-changing for the right candidates.', price: 'From £350', href: '/treatments/hyperhidrosis-migraines', image: '/images/hyperhidrosis.jpg' },
  { name: 'Vitamin B12', slug: 'vitamin-b12', tagline: 'Energy and wellbeing support', description: 'Intramuscular B12 injections for rapid absorption. Energy, mood and clarity where oral supplements fall short.', price: 'From £35', href: '/treatments/vitamin-b12', image: '/images/treatment-4.jpg' },
  { name: "Men's Aesthetics", slug: 'mens-aesthetics', tagline: 'Treatments designed for men', description: 'Anti-wrinkle, filler, Profhilo and AQUALYX, all tailored to male facial anatomy. Subtle, effective, clinical.', price: 'From £150', href: '/treatments/mens-aesthetics', image: '/images/mens-aesthetics.jpg' },
]

export const getTreatment = (slug: string) => treatments.find((t) => t.slug === slug)
