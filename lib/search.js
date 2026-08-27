const UAE_DOMAINS = [
  'bayt.com',
  'gulftalent.com',
  'naukrigulf.com',
  'indeed.ae',
  'linkedin.com',
  'careers.*'
];

export async function exaSearch({ query, emirate, level }) {
  if (!process.env.EXA_API_KEY) throw new Error('EXA_API_KEY is not configured');

  const location = emirate && emirate !== 'Any Emirate' ? emirate : 'United Arab Emirates';
  const seniority = level && level !== 'Any Level' ? level : '';
  const q = `${query || 'professional jobs'} ${location} UAE ${seniority} jobs current open vacancy apply`;

  const response = await fetch('https://api.exa.ai/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.EXA_API_KEY },
    body: JSON.stringify({
      query: q,
      type: 'fast',
      numResults: 18,
      contents: { text: { maxCharacters: 7000 } },
      excludeDomains: ['youtube.com', 'facebook.com', 'instagram.com', 'x.com']
    }),
    cache: 'no-store'
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Exa search failed (${response.status}): ${detail.slice(0, 300)}`);
  }
  return response.json();
}

export function normalizeExaResults(data) {
  return (data?.results || []).map((r) => ({
    title: r.title || '',
    url: r.url || '',
    publishedDate: r.publishedDate || '',
    author: r.author || '',
    text: r.text || '',
    highlights: r.highlights || []
  })).filter((r) => r.url);
}
