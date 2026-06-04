import { cookies } from 'next/headers'
import { SIMPLE_VIEW_COOKIE } from './staff-view'

export { SIMPLE_VIEW_COOKIE }

// The staff back end can run in a pared-back "Simple view" that hides the
// in-depth tools and numbers — profit, background agents, press, stat tiles —
// so the everyday clinical handful is all that shows. It defaults ON: the
// gentlest first impression, and full view is always one tap away.
export async function isSimpleView(): Promise<boolean> {
  const store = await cookies()
  return store.get(SIMPLE_VIEW_COOKIE)?.value !== '0'
}
