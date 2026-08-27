import { NextResponse } from 'next/server';
import { exaSearch, normalizeExaResults } from '../../../lib/search';
import { callClaude, parseJson } from '../../../lib/anthropic';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const { query = '', emirate = 'Any Emirate', level = 'Any Level', cv = '' } = await request.json();
    if (!query.trim()) return NextResponse.json({ error: 'Enter a job title or keyword.' }, { status: 400 });

    const raw = normalizeExaResults(await exaSearch({ query, emirate, level }));
    if (!raw.length) return NextResponse.json({ jobs: [] });

    const source = raw.map((r, i) => `SOURCE ${i + 1}\nURL: ${r.url}\nTITLE: ${r.title}\nPUBLISHED: ${r.publishedDate}\nTEXT:\n${r.text.slice(0, 6500)}`).join('\n\n---\n\n');
    const candidate = cv.trim() ? `\nCANDIDATE CV:\n${cv.slice(0, 7000)}` : '';
    const prompt = `You are a strict job-data extraction and candidate matching engine. Convert the supplied web pages into genuine UAE job records. Never invent fields. If a page is clearly not a job vacancy, omit it. Prefer direct job/application URLs. Deduplicate the same vacancy across sources.\n\nSearch constraints: role=${query}; emirate=${emirate}; level=${level}.\n${candidate}\n\nReturn ONLY a JSON array. Each object must contain exactly: title, company, location, salary, summary, url, source, posted, applicationUrl, companyWebsite, applicationMethod, requirements, responsibilities, fitScore, matchedSkills, missingRequirements, fitReason.\n\nRules: fitScore is 0-100. If no CV is supplied, use null for fitScore and empty arrays for match fields. applicationUrl should be the direct application destination only when supported by evidence; otherwise ''. companyWebsite should be the official employer site only when supported by evidence; otherwise ''. requirements and responsibilities are arrays of concise strings. fitReason must be <=240 characters. Do not hallucinate salary, employer details, application links, or match evidence.\n\nWEB SOURCES:\n${source}`;

    const text = await callClaude({
      system: 'You produce conservative, source-grounded structured data. Accuracy is more important than filling every field.',
      prompt,
      maxTokens: 7000
    });
    const jobs = parseJson(text).filter(Boolean).slice(0, 12);
    return NextResponse.json({ jobs, searched: raw.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Search failed.' }, { status: 500 });
  }
}
