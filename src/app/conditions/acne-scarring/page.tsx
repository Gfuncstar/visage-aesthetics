import ConditionTemplate from '@/components/sections/ConditionTemplate'
import { getCondition } from '@/lib/conditions'
import { buildMetadata } from '@/lib/metadata'

const condition = getCondition('acne-scarring')!

export const metadata = buildMetadata({
  title: condition.metaTitle,
  description: condition.metaDescription,
  path: condition.href,
  ogTitle: condition.h1,
  eyebrow: 'Condition',
})

export default function Page() {
  return <ConditionTemplate condition={condition} />
}
