import { NextResponse } from 'next/server';
import { callClaude } from '../../../lib/anthropic';
export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const { cv = '', job } = await request.json();
    if (!cv.trim() || !job?.title) return NextResponse.json({ error: 'CV and job details are required.' }, { status: 400 });
    const prompt = `Write a tailored professional cover letter for this UAE role. Ground every claim strictly in the CV. Do not invent employers, achievements, skills, certifications, visa status, or experience. 280-380 words. Name the role and company in the opening. Reference 2-3 concrete CV points that align with the job. Output only the letter.\n\nCV:\n${cv.slice(0, 8000)}\n\nJOB:\n${JSON.stringify(job)}`;
    const text = await callClaude({ system: 'You are a precise career writer. Never fabricate candidate facts.', prompt, maxTokens: 1200 });
    return NextResponse.json({ text });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Cover letter generation failed.' }, { status: 500 });
  }
}
