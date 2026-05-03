#!/usr/bin/env node
// Voice / brand-rule linter for the Visage Aesthetics site.
//
// Em-dash and AI-tell checks run against AST-extracted user-facing text only:
//   - JSX text content (between tags)
//   - String / template literals in JSX attributes whose name is in COPY_JSX_ATTRS
//   - String / template literals in object properties whose key is in COPY_OBJECT_KEYS
//
// This avoids false positives on identifiers (e.g. a function named `unlock`),
// import paths, className strings, CSS values, hrefs, IDs, etc.
//
// Third-person voice is still checked per-line with the historical
// ALLOWED_LINE_PATTERNS exemptions (metadata, schema, bylines, nav labels).
//
// Usage:
//   node scripts/check-voice.mjs              # scan all tracked src/ files
//   node scripts/check-voice.mjs <files...>   # scan given files (lint-staged mode)
//
// Exits 0 if clean, 1 if violations found.
// Rules documented in /CLAUDE.md.

import { readFileSync, existsSync } from 'node:fs'
import { argv, exit, cwd } from 'node:process'
import { relative, resolve } from 'node:path'
import { execSync } from 'node:child_process'
import ts from 'typescript'

const ROOT = cwd()

// Files where ALL checks are skipped. Self-exempt the linter itself
// (its banned-word list would otherwise trigger AI-tell matches).
const EXEMPT_FILES = new Set([
  'scripts/check-voice.mjs',
  'src/app/author/bernadette-tobin/page.tsx',
  'src/lib/reviews.ts',
  'src/lib/blog-jsonld.ts',
  'src/lib/blog-posts.ts',
  'src/lib/search-index.ts',
  'src/components/layout/Footer.tsx',
  'src/app/blog/rss.xml/route.ts',
  'src/app/layout.tsx',
  'src/app/privacy/page.tsx',
  'src/app/contact/ContactForm.tsx',
])

// JSX attribute names whose string values are user-facing copy.
const COPY_JSX_ATTRS = new Set([
  'alt',
  'placeholder',
  'aria-label',
  'aria-description',
  'aria-roledescription',
  'title',
  'label',
])

// Object property keys whose string values are user-facing copy.
// Covers Next metadata, treatment data, FAQ items, and JSON-LD descriptive
// fields. `name` is included for things like treatment names; the third-person
// check has its own pattern allowlist for the JSON-LD `name: 'Bernadette Tobin'`
// case, so this does not conflict.
const COPY_OBJECT_KEYS = new Set([
  'title',
  'description',
  'excerpt',
  'tagline',
  'subtitle',
  'caption',
  'summary',
  'headline',
  'body',
  'children',
  'question',
  'answer',
  'name',
  'alt',
  'label',
])

// If a line containing "Bernadette" / "she" / "her" matches any of these
// patterns, the third-person reference is allowed (it's metadata, a label,
// a byline, a heading credit, a self-introduction, etc).
const ALLOWED_LINE_PATTERNS = [
  // Page metadata fields
  /^\s*description:\s*["'`]/,
  /^\s*title:\s*["'`]/,
  /^\s*authors:\s*\[/,
  /^\s*excerpt:\s*["'`]/,
  /openGraph|twitter:/,
  /\balt=["'`]/,

  // JSON-LD schema fields
  /\bname:\s*['"]Bernadette Tobin['"]/,
  /\bgivenName:\s*['"]Bernadette['"]/,
  /\bfamilyName:\s*['"]Tobin['"]/,

  // Self-introductions in blog posts (already first-person)
  /\bI am Bernadette,/,

  // Credential bylines / billing patterns (literal · or &middot; separator,
  // RN or RGN credentials)
  /Bernadette Tobin\s+R(?:GN|N),\s*MSc/,
  /Bernadette Tobin\s*(?:·|&middot;)\s*R(?:GN|N),\s*MSc/,
  /Bernadette Tobin, Founder/,
  /[Bb]y Bernadette Tobin/,
  /from Bernadette Tobin/,
  /run by Bernadette Tobin/,

  // Navigation labels and CTA buttons (handles both inline `>About Bernadette<`
  // and multi-line JSX where the label sits alone on a line)
  />About Bernadette</,
  />Email Bernadette</,
  /^\s*About Bernadette\s*$/,
  /^\s*Email Bernadette\s*$/,
  /Bernadette(?:'s|&apos;s|’s) qualifications/,
  /Articles by Bernadette/,
  /A note from Bernadette/,

  // Section headings that name the practitioner with credentials
  // (inline `>Bernadette Tobin<` and standalone `  Bernadette Tobin` line)
  />Bernadette Tobin\.?</,
  /^\s*Bernadette Tobin\.?\s*$/,

  // ContactForm submission signature (e.g. <p ...>Bernadette</p>)
  /text-eyebrow.*>Bernadette</,

  // RSS author elements
  /<author>.*Bernadette/,
  /<dc:creator>.*Bernadette/,
]

const AI_TELL_WORDS = [
  'delve',
  'tapestry',
  'leverage',
  'moreover',
  'furthermore',
  'navigate',
  'unlock',
  'robust',
  'comprehensive',
  'foster',
  'cultivate',
  'embark',
  'journey',
  'realm',
  'landscape',
  'ecosystem',
]

const EM_DASH_RE = /[–—]/

function getStagedSrcFiles() {
  try {
    const out = execSync('git diff --cached --name-only --diff-filter=ACMR', { encoding: 'utf8' })
    return out.split('\n').filter((f) => f && /\.(tsx?|mjs)$/.test(f) && f.startsWith('src/'))
  } catch {
    return []
  }
}

function getAllSrcFiles() {
  try {
    const out = execSync('git ls-files src/', { encoding: 'utf8' })
    return out.split('\n').filter((f) => f && /\.(tsx?)$/.test(f))
  } catch {
    return []
  }
}

// Determine if a string-like AST node is in a user-facing context.
// Returns { kind, key } when copy, null otherwise.
function classifyStringContext(node) {
  const parent = node.parent
  if (!parent) return null

  // Direct attribute value: <tag attrName="value" />
  if (ts.isJsxAttribute(parent)) {
    const name = parent.name.getText()
    return COPY_JSX_ATTRS.has(name) ? { kind: 'attr', key: name } : null
  }

  // Attribute via JSX expression: <tag attrName={"value"} />
  if (ts.isJsxExpression(parent) && parent.parent && ts.isJsxAttribute(parent.parent)) {
    const name = parent.parent.name.getText()
    return COPY_JSX_ATTRS.has(name) ? { kind: 'attr', key: name } : null
  }

  // Object literal property: { key: "value" }
  if (ts.isPropertyAssignment(parent) && parent.initializer === node) {
    const keyNode = parent.name
    let key = null
    if (ts.isIdentifier(keyNode)) key = keyNode.text
    else if (ts.isStringLiteral(keyNode)) key = keyNode.text
    if (key && COPY_OBJECT_KEYS.has(key)) return { kind: 'prop', key }
    return null
  }

  return null
}

// Walk a TS/TSX source file and return user-facing text spans.
function extractTextSpans(sourceFile) {
  const spans = []

  function pushSpan(node, kind, key, text) {
    const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
    spans.push({ kind, key, text, line: line + 1 })
  }

  function visit(node) {
    // Imports never carry copy.
    if (ts.isImportDeclaration(node) || ts.isImportEqualsDeclaration(node)) return

    if (ts.isJsxText(node)) {
      const text = node.text
      if (text.trim()) pushSpan(node, 'jsxText', null, text)
      return
    }

    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      const ctx = classifyStringContext(node)
      if (ctx) pushSpan(node, ctx.kind, ctx.key, node.text)
      return
    }

    if (ts.isTemplateExpression(node)) {
      const ctx = classifyStringContext(node)
      if (ctx) {
        const parts = [node.head.text, ...node.templateSpans.map((s) => s.literal.text)]
        pushSpan(node, ctx.kind, ctx.key, parts.join(' '))
      }
      // Continue walking — template substitutions (expressions) may contain
      // their own JSX or nested copy.
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return spans
}

function checkFile(file) {
  const violations = []
  if (!existsSync(file)) return violations

  const text = readFileSync(file, 'utf8')
  const lines = text.split('\n')
  const isExempt = EXEMPT_FILES.has(file)

  // 1 + 2. Em-dash and AI-tell: AST-driven on .ts / .tsx only.
  if (!isExempt && /\.tsx?$/.test(file)) {
    const sourceFile = ts.createSourceFile(
      file,
      text,
      ts.ScriptTarget.Latest,
      /* setParentNodes */ true,
      /\.tsx$/.test(file) ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    )
    const spans = extractTextSpans(sourceFile)
    for (const span of spans) {
      if (EM_DASH_RE.test(span.text)) {
        violations.push({
          file,
          line: span.line,
          type: 'em-dash',
          text: span.text.trim(),
        })
      }
      for (const word of AI_TELL_WORDS) {
        const re = new RegExp(`\\b${word}\\b`, 'i')
        if (re.test(span.text)) {
          violations.push({
            file,
            line: span.line,
            type: 'ai-tell',
            word,
            text: span.text.trim(),
          })
        }
      }
    }
  }

  // 3. Third-person Bernadette / she / her — per-line with pattern allowlist.
  // Kept line-based because the exemptions are about narrative phrases
  // (bylines, nav labels, headings) that are easier to recognise on the line.
  if (!isExempt) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const lineNo = i + 1
      const hasBern = /\bBernadette\b/.test(line)
      const hasShe = /\bShe\b|\bshe\b/.test(line)
      const hasHer = /\bHer\b|\bher\b/.test(line)
      if (hasBern || hasShe || hasHer) {
        const allowed = ALLOWED_LINE_PATTERNS.some((re) => re.test(line))
        if (!allowed) {
          violations.push({ file, line: lineNo, type: 'third-person', text: line.trim() })
        }
      }
    }
  }

  return violations
}

function main() {
  let files
  if (argv.length > 2) {
    // CLI args (lint-staged passes absolute paths)
    files = argv.slice(2).map((f) => relative(ROOT, resolve(f)))
  } else {
    // Standalone: prefer staged files, fall back to all tracked src/ files
    files = getStagedSrcFiles()
    if (files.length === 0) files = getAllSrcFiles()
  }

  files = files.filter((f) => /\.(tsx?|mjs)$/.test(f))

  const all = []
  for (const f of files) {
    try {
      all.push(...checkFile(f))
    } catch (e) {
      console.error(`  ! could not read ${f}: ${e.message}`)
    }
  }

  if (all.length === 0) {
    console.log(`OK  voice check passed (${files.length} file(s) scanned)`)
    exit(0)
  }

  const byType = { 'em-dash': 0, 'ai-tell': 0, 'third-person': 0 }
  for (const v of all) byType[v.type]++

  console.error('')
  console.error(`FAIL  voice check found ${all.length} violation(s):`)
  console.error(`      em-dash=${byType['em-dash']}  ai-tell=${byType['ai-tell']}  third-person=${byType['third-person']}`)
  console.error('')
  for (const v of all) {
    const tag =
      v.type === 'em-dash'
        ? 'EM-DASH'
        : v.type === 'ai-tell'
          ? `AI-TELL "${v.word}"`
          : 'THIRD-PERSON'
    console.error(`  ${v.file}:${v.line}  ${tag}`)
    const snippet = v.text.length > 200 ? v.text.slice(0, 200) + '...' : v.text
    console.error(`    ${snippet}`)
  }
  console.error('')
  console.error('See /CLAUDE.md for the rules. Fix violations and re-stage.')
  exit(1)
}

main()
