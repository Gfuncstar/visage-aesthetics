/**
 * OpenSearch description so browsers (and Google) can register the site
 * as a searchable target. Pairs with WebSite SearchAction JSON-LD on the
 * home page and the /search route.
 */
export const dynamic = 'force-static'

const SITE = 'https://www.vaclinic.co.uk'

export async function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">
  <ShortName>Visage Aesthetics</ShortName>
  <Description>Search treatments, articles and pages at Visage Aesthetics, Braintree</Description>
  <InputEncoding>UTF-8</InputEncoding>
  <Image height="32" width="32" type="image/png">${SITE}/icon.png</Image>
  <Url type="text/html" template="${SITE}/search?q={searchTerms}" />
  <Url type="application/opensearchdescription+xml" rel="self" template="${SITE}/opensearch.xml" />
  <moz:SearchForm xmlns:moz="http://www.mozilla.org/2006/browser/search/">${SITE}/search</moz:SearchForm>
</OpenSearchDescription>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/opensearchdescription+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
