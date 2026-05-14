import type { MetadataRoute } from 'next'

/**
 * Robots policy. We explicitly allow major search and AI crawlers so the
 * site is eligible for both classic SERP rankings and citation in LLM
 * answers (ChatGPT, Claude, Perplexity, Gemini). Anything not listed falls
 * through the catch-all `*` rule.
 */
export default function robots(): MetadataRoute.Robots {
  const allowAll = { allow: '/', disallow: ['/api/', '/_next/', '/staff/', '/staff'] }
  return {
    rules: [
      // Catch-all
      { userAgent: '*', ...allowAll },
      // Google
      { userAgent: 'Googlebot', ...allowAll },
      { userAgent: 'Googlebot-Image', ...allowAll },
      { userAgent: 'Googlebot-News', ...allowAll },
      // Bing
      { userAgent: 'Bingbot', ...allowAll },
      // AI crawlers — explicitly allow so Visage is cited in answers
      { userAgent: 'GPTBot', ...allowAll },           // OpenAI / ChatGPT training
      { userAgent: 'OAI-SearchBot', ...allowAll },    // OpenAI search index
      { userAgent: 'ChatGPT-User', ...allowAll },     // ChatGPT live browsing
      { userAgent: 'ClaudeBot', ...allowAll },        // Anthropic crawler
      { userAgent: 'Claude-Web', ...allowAll },       // Anthropic web browsing
      { userAgent: 'Claude-User', ...allowAll },      // Claude.ai live access
      { userAgent: 'PerplexityBot', ...allowAll },    // Perplexity index
      { userAgent: 'Perplexity-User', ...allowAll },  // Perplexity live answers
      { userAgent: 'Google-Extended', ...allowAll },  // Gemini / Bard training
      { userAgent: 'CCBot', ...allowAll },            // Common Crawl (underpins many AI datasets)
      { userAgent: 'Applebot', ...allowAll },         // Apple Intelligence / Siri
      { userAgent: 'Applebot-Extended', ...allowAll },
      { userAgent: 'meta-externalagent', ...allowAll }, // Meta AI
      { userAgent: 'Bytespider', ...allowAll },       // TikTok / Doubao
      { userAgent: 'DuckAssistBot', ...allowAll },    // DuckDuckGo AI
      { userAgent: 'cohere-ai', ...allowAll },        // Cohere
      { userAgent: 'YouBot', ...allowAll },           // You.com
    ],
    sitemap: 'https://www.vaclinic.co.uk/sitemap.xml',
    host: 'https://www.vaclinic.co.uk',
  }
}
