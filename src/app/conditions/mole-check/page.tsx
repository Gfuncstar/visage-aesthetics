import type { Metadata } from 'next'
import ConditionTemplate from '@/components/sections/ConditionTemplate'
import { getCondition } from '@/lib/conditions'

const condition = getCondition('mole-check')!

export const metadata: Metadata = {
  alternates: { canonical: condition.href },
  title: condition.metaTitle,
  description: condition.metaDescription,
}

export default function Page() {
  return <ConditionTemplate condition={condition} />
}
