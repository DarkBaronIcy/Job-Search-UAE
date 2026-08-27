'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import mammoth from 'mammoth';
import { Search, MapPin, Briefcase, ExternalLink, Loader2, AlertCircle, Compass, Bookmark, BookmarkCheck, FileText, X, Copy, Download, Trash2, UploadCloud, Check, Sparkles, Building2, Target, ChevronDown } from 'lucide-react';

const EMIRATES = ['Any Emirate','Dubai','Abu Dhabi','Sharjah','Ajman','Ras Al Khaimah','Fujairah','Umm Al Quwain'];
const LEVELS = ['Any Level','Entry-level','Mid-level','Senior','Executive'];
const SAVED_KEY = 'uae-jobs-saved-v2';
const CV_KEY = 'uae-jobs-cv-v2';

function jobKey(job) { return job.url || `${job.title}__${job.company}`; }

function Score({ value }) {
  if (value == null) return null;
  return <span className={`score score-${value >= 80 ? 'high' : value >= 60 ? 'mid' : 'low'}`}><Target size={12}/>{value}% match</span>;
}

function JobCard({ job, saved, onSave, onCover, hasCv }) {
  const [expanded, setExpanded] = useState(false);
  return <article className="job-card">
    <div className="job-head">
      <div className="job-title-wrap">
        <div className="eyebrow"><span>{job.source || 'Web'}</span><Score value={job.fitScore}/></div>
        <h3>{job.title}</h3>
        <p className="company"><Building2 size={14}/>{job.company || 'Employer not identified'}</p>
      </div>
      <button className={`icon-btn ${saved ? 'saved' : ''}`} onClick={() => onSave(job)} aria-label={saved ? 'Remove saved job' : 'Save job'}>{saved ? <BookmarkCheck size={17}/> : <Bookmark size={17}/>}</button>
    </div>
    <div className="meta">
      {job.location && <span><MapPin size={14}/>{job.location}</span>}
      {job.salary && <span><Briefcase size={14}/>{job.salary}</span>}
      {job.posted && <span>{job.posted}</span>}
    </div>
    {job.summary && <p className="summary">{job.summary}</p>}
    {job.fitReason && job.fitScore != null && <div className="fit-box"><strong>Why this matches</strong><span>{job.fitReason}</span></div>}
    <div className="actions">
      {job.applicationUrl ? <a className="primary-btn" href={job.applicationUrl} target="_blank" rel="noreferrer">Apply directly <ExternalLink size={14}/></a> : job.url ? <a className="primary-btn" href={job.url} target="_blank" rel="noreferrer">View listing <ExternalLink size={14}/></a> : null}
      {job.companyWebsite && <a className="secondary-btn" href={job.companyWebsite} target="_blank" rel="noreferrer">Company <Building2 size={14}/></a>}
      <button className="secondary-btn" onClick={() => onCover(job)}><Sparkles size={14}/>{hasCv ? 'Cover letter' : 'Add CV'}</button>
      <button className="expand-btn" onClick={() => setExpanded(!expanded)}>{expanded ? 'Less' : 'Details'} <ChevronDown size={14} className={expanded ? 'rotated' : ''}/></button>
    </div>
    {expanded && <div className="details">
      {job.applicationMethod && <div><b>Application route</b><p>{job.applicationMethod}</p></div>}
      {job.requirements?.length > 0 && <div><b>Requirements</b><ul>{job.requirements.map((x,i)=><li key={i}>{x}</li>)}</ul></div>}
      {job.responsibilities?.length > 0 && <div><b>Responsibilities</b><ul>{job.responsibilities.map((x,i)=><li key={i}>{x}</li>)}</ul></div>}
      {job.missingRequirements?.length > 0 && <div className="warning"><b>Potential gaps</b><ul>{job.missingRequirements.map((x,i)=><li key={i}>{x}</li>)}</ul></div>}
      <div className="verify-note">Verify the vacancy and application destination on the source site before submitting personal information.</div>
    </div>}
  </article>;
}

function CoverModal({ state, onClose, onRegenerate }) {
  const [copied, setCopied] = useState(false);
  if (!state) return null;
  const copy = async () => { await navigator.clipboard?.writeText(state.text); setCopied(true); setTimeout(()=>setCopied(false),1500); };
  const download = () => { const blob = new Blob([state.text], {type:'text/plain'}); const u=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=u; a.download=`Cover Letter - ${state.job.company || 'Application'}.txt`; a.click(); URL.revokeObjectURL(u); };
  return <div className="modal-backdrop" onClick={onClose}><div className="modal" onClick={e=>e.stopPropagation()}>
    <div className="modal-head"><div><span className="eyebrow">AI application assistant</span><h3>Cover letter</h3><p>{state.job.title} · {state.job.company}</p></div><button className="icon-btn" onClick={onClose}><X size={18}/></button></div>
    <div className="modal-body">{state.loading ? <div className="loading"><Loader2 className="spin"/><p>Tailoring the letter to the role…</p></div> : state.error ? <div className="error"><AlertCircle size={17}/>{state.error}</div> : <pre>{state.text}</pre>}</div>
    {!state.loading && state.text && <div className="modal-actions"><button className="primary-btn" onClick={copy}>{copied ? <Check size={14}/> : <Copy size={14}/>} {copied ? 'Copied' : 'Copy'}</button><button className="secondary-btn" onClick={download}><Download size={14}/> Download</button><button className="text-btn" onClick={()=>onRegenerate(state.job)}>Regenerate</button></div>}
  </div></div>;
}

function CVPanel({ cv, setCv }) {
  const input = useRef(); const [name,setName]=useState(''); const [error,setError]=useState('');
  const readFile = async e => { const f=e.target.files?.[0]; if(!f)return; setName(f.name); setError(''); try { if(f.name.toLowerCase().endsWith('.docx')) { const buf=await f.arrayBuffer(); const result=await mammoth.extractRawText({arrayBuffer:buf}); setCv(result.value.trim()); } else if(/\.(txt|md)$/i.test(f.name)) setCv((await f.text()).trim()); else setError('Use .docx, .txt or .md.'); } catch { setError('Could not read the file. Paste the CV text instead.'); } };
  return <section className="cv-panel"><div className="section-title"><span className="eyebrow">Candidate profile</span><h2>Your CV</h2><p>Your CV is kept in this browser for the MVP. It is sent to the server only when generating a match or cover letter.</p></div>
    <div className="dropzone" onClick={()=>input.current?.click()}><UploadCloud/><span>{name || 'Upload .docx, .txt or .md'}</span><input ref={input} type="file" accept=".docx,.txt,.md" hidden onChange={readFile}/></div>
    {error && <div className="error"><AlertCircle size={16}/>{error}</div>}
    <textarea value={cv} onChange={e=>setCv(e.target.value)} placeholder="Paste your CV / resume text here…" rows={18}/>
    <div className="cv-footer"><span>{cv ? `${cv.length.toLocaleString()} characters` : 'No CV loaded'}</span>{cv && <button className="text-btn" onClick={()=>setCv('')}><Trash2 size={13}/> Clear</button>}</div>
  </section>;
}

export default function JobApp() {
  const [tab,setTab]=useState('search'); const [query,setQuery]=useState(''); const [emirate,setEmirate]=useState('Any Emirate'); const [level,setLevel]=useState('Any Level');
  const [jobs,setJobs]=useState([]); const [saved,setSaved]=useState([]); const [cv,setCv]=useState(''); const [loading,setLoading]=useState(false); const [error,setError]=useState(''); const [searched,setSearched]=useState(false); const [cover,setCover]=useState(null);
  useEffect(()=>{ try { setSaved(JSON.parse(localStorage.getItem(SAVED_KEY)||'[]')); setCv(localStorage.getItem(CV_KEY)||''); } catch {} },[]);
  useEffect(()=>{ localStorage.setItem(SAVED_KEY,JSON.stringify(saved)); },[saved]);
  useEffect(()=>{ localStorage.setItem(CV_KEY,cv); },[cv]);
  const savedSet=useMemo(()=>new Set(saved.map(jobKey)),[saved]);
  const toggleSave=job=>setSaved(prev=>prev.some(x=>jobKey(x)===jobKey(job))?prev.filter(x=>jobKey(x)!==jobKey(job)):[{...job,savedAt:new Date().toISOString()},...prev]);
  async function runSearch(){ setLoading(true);setError('');setSearched(true);setJobs([]); try { const r=await fetch('/api/search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query,emirate,level,cv})}); const data=await r.json(); if(!r.ok)throw new Error(data.error||'Search failed'); setJobs(data.jobs||[]); if(!(data.jobs||[]).length)setError('No strong matches were found. Try a broader role or emirate.'); } catch(e){setError(e.message||'Search failed.');} finally{setLoading(false);} }
  async function generateCover(job){ if(!cv.trim()){setTab('cv');return;} setCover({job,text:'',loading:true,error:''}); try { const r=await fetch('/api/cover-letter',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cv,job})}); const data=await r.json(); if(!r.ok)throw new Error(data.error||'Generation failed'); setCover({job,text:data.text,loading:false,error:''}); } catch(e){setCover({job,text:'',loading:false,error:e.message});} }
  const displayed=tab==='saved'?saved:jobs;
  return <main className="app-shell">
    <header className="hero"><div className="hero-pattern"/><div className="hero-inner"><div className="eyebrow"><Compass size={14}/> Live UAE job intelligence</div><h1>Find the jobs worth applying to.</h1><p>Search current UAE vacancies, identify the real application route, and see how strongly each role fits your CV.</p></div>
      <nav className="tabs"><button className={tab==='search'?'active':''} onClick={()=>setTab('search')}>Search</button><button className={tab==='saved'?'active':''} onClick={()=>setTab('saved')}>Saved {saved.length ? `(${saved.length})`:''}</button><button className={tab==='cv'?'active':''} onClick={()=>setTab('cv')}><FileText size={14}/> Your CV</button></nav>
    </header>
    {tab==='cv' ? <CVPanel cv={cv} setCv={setCv}/> : <>
      {tab==='search' && <section className="search-panel"><div className="search-row"><Search size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&runSearch()} placeholder="Job title or keywords — e.g. digital marketing manager"/></div><div className="filters"><select value={emirate} onChange={e=>setEmirate(e.target.value)}>{EMIRATES.map(x=><option key={x}>{x}</option>)}</select><select value={level} onChange={e=>setLevel(e.target.value)}>{LEVELS.map(x=><option key={x}>{x}</option>)}</select><button className="search-btn" onClick={runSearch} disabled={loading}>{loading?<Loader2 className="spin"/>:<Search size={16}/>} {loading?'Searching…':'Search live jobs'}</button></div></section>}
      <section className="results"><div className="results-head"><div><span className="eyebrow">{tab==='saved'?'Your shortlist':'Live results'}</span><h2>{tab==='saved'?'Saved jobs':searched?(jobs.length ? `${jobs.length} roles found`:'Search results'):'Start with a role'}</h2></div>{tab==='search' && cv && <span className="cv-ready"><Check size={13}/> CV loaded · match scoring enabled</span>}</div>
        {loading && <div className="loading page-load"><Loader2 className="spin"/><p>Searching the live web, extracting vacancies and checking fit…</p></div>}
        {error && !loading && <div className="error"><AlertCircle size={17}/>{error}</div>}
        {!loading && !error && displayed.length===0 && <div className="empty"><Search size={26}/><p>{tab==='saved'?'Save promising roles and they will appear here.':'Search a role above. The app will retrieve live pages, extract genuine vacancies and rank them against your CV if one is loaded.'}</p></div>}
        {!loading && displayed.length>0 && <div className="job-list">{displayed.map(job=><JobCard key={jobKey(job)} job={job} saved={savedSet.has(jobKey(job))} onSave={toggleSave} onCover={generateCover} hasCv={!!cv.trim()}/>)}</div>}
      </section>
    </>}
    <footer>Source data can change. Verify the vacancy, employer and application destination before applying.</footer>
    <CoverModal state={cover} onClose={()=>setCover(null)} onRegenerate={generateCover}/>
  </main>;
}
