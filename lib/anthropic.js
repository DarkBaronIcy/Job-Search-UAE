export async function callClaude({ system, prompt, maxTokens = 5000 }) {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is not configured');
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: prompt }]
    }),
    cache: 'no-store'
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Claude request failed (${response.status}): ${detail.slice(0, 300)}`);
  }
  const data = await response.json();
  return (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
}

export function parseJson(text) {
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  const match = cleaned.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
  return JSON.parse(match ? match[0] : cleaned);
}
