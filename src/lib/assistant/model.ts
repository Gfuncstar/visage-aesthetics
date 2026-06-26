/**
 * Single source of truth for which Claude model the scheduled agents use.
 *
 * The agent routes previously hard-coded the model id inline, which is how the
 * fleet drifted — most sat on the previous-generation `claude-opus-4-7` while a
 * newer one shipped. `claude-opus-4-8` is the current Opus at the same price
 * ($5 / $25 per MTok) and is a drop-in replacement, so keeping it here means the
 * whole fleet moves forward in one edit and can't silently fall behind again.
 *
 * If you ever want to tier an agent down for a cheap, low-stakes task, import a
 * lighter constant here rather than re-introducing an inline string.
 */

/** Reasoning model for the scheduled AI agents (financial, clinical, seo, etc.). */
export const AGENT_MODEL = 'claude-opus-4-8'

/** Cheaper tiers, available for low-stakes drafting/classification if desired. */
export const SONNET_MODEL = 'claude-sonnet-4-6'
export const HAIKU_MODEL = 'claude-haiku-4-5'
