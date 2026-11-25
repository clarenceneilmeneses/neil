import { useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import {
  BUCKET,
  loadContent,
  publicUrl,
  type Content,
  type Experience,
  type Project,
} from './lib/content'
import { supabase } from './lib/supabase'

type Tab = 'profile' | 'experience' | 'projects' | 'skills' | 'certifications' | 'education'
const TABS: Tab[] = ['profile', 'experience', 'projects', 'skills', 'certifications', 'education']

/* ---------- small field helpers ---------- */

function Text({ label, value, onChange, area, hint }: {
  label: string; value: string; onChange: (v: string) => void; area?: boolean; hint?: string
}) {
  return (
    <label className="f">
      <span className="f-label">{label}</span>
      {area ? (
        <textarea value={value} rows={4} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} />
      )}
      {hint && <span className="f-hint">{hint}</span>}
    </label>
  )
}

const lines = (arr: string[]) => arr.join('\n')
const unlines = (s: string) => s.split('\n')

function Upload({ label, value, onChange, accept, token }: {
  label: string; value: string; onChange: (v: string) => void; accept: string; token: string
}) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  async function pick(file: File) {
    setBusy(true)
    setErr('')
    try {
      const res = await fetch('/api/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ filename: file.name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Upload failed')
      const { error } = await supabase.storage
        .from(BUCKET)
        .uploadToSignedUrl(data.path, data.token, file, { contentType: file.type })
      if (error) throw error
      onChange(publicUrl(data.path))
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="f">
      <span className="f-label">{label}</span>
      <div className="upload">
        <input value={value} placeholder="https://…" onChange={(e) => onChange(e.target.value)} />
        <label className="btn ghost">
          {busy ? 'Uploading…' : 'Upload'}
          <input type="file" accept={accept} hidden onChange={(e) => e.target.files?.[0] && pick(e.target.files[0])} />
        </label>
        {value && <button className="btn ghost" onClick={() => onChange('')}>Clear</button>}
      </div>
      {err && <span className="f-hint err">{err}</span>}
    </div>
  )
}

function List<T>({ items, onChange, make, title, render }: {
  items: T[]
  onChange: (v: T[]) => void
  make: () => T
  title: (item: T) => string
  render: (item: T, set: (patch: Partial<T>) => void) => ReactNode
}) {
  const [open, setOpen] = useState<number | null>(0)
  const move = (i: number, d: number) => {
    const j = i + d
    if (j < 0 || j >= items.length) return
    const next = [...items]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
    setOpen(j)
  }
  return (
    <div className="list">
      {items.map((it, i) => (
        <div className={`card ${open === i ? 'open' : ''}`} key={i}>
          <div className="card-head" onClick={() => setOpen(open === i ? null : i)}>
            <span className="card-title">{title(it) || 'Untitled'}</span>
            <span className="card-actions" onClick={(e) => e.stopPropagation()}>
              <button className="icon" title="Move up" onClick={() => move(i, -1)}>↑</button>
              <button className="icon" title="Move down" onClick={() => move(i, 1)}>↓</button>
              <button
                className="icon danger"
                title="Delete"
                onClick={() => onChange(items.filter((_, k) => k !== i))}
              >×</button>
            </span>
          </div>
          {open === i && (
            <div className="card-body">
              {render(it, (patch) => onChange(items.map((x, k) => (k === i ? { ...x, ...patch } : x))))}
            </div>
          )}
        </div>
      ))}
      <button
        className="btn ghost add"
        onClick={() => {
          onChange([...items, make()])
          setOpen(items.length)
        }}
      >+ Add</button>
    </div>
  )
}

/* ---------- login ---------- */

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  return (
    <div className="admin-login">
      <form
        className="login-card"
        onSubmit={async (e) => {
          e.preventDefault()
          setBusy(true)
          setErr('')
          const { error } = await supabase.auth.signInWithPassword({ email, password })
          if (error) setErr(error.message)
          setBusy(false)
        }}
      >
        <p className="eyebrow">Content Studio</p>
        <h1>Sign in</h1>
        <Text label="Email" value={email} onChange={setEmail} />
        <label className="f">
          <span className="f-label">Password</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {err && <p className="f-hint err">{err}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <a className="back" href="/">← Back to site</a>
      </form>
    </div>
  )
}

/* ---------- editor ---------- */

const blankExp = (): Experience => ({ role: '', org: '', orgDetail: '', location: '', link: '', start: '', end: '', bullets: [] })
const blankProject = (): Project => ({
  title: '', subtitle: '', context: '', stack: '', link: '', repo: '', image: '', bullets: [], details: '', metrics: [],
})

function Editor({ session }: { session: Session }) {
  const [c, setC] = useState<Content | null>(null)
  const [saved, setSaved] = useState('')
  const [tab, setTab] = useState<Tab>('profile')
  const [status, setStatus] = useState<{ kind: 'ok' | 'err' | 'busy'; msg: string } | null>(null)
  const token = session.access_token

  useEffect(() => {
    loadContent().then((x) => {
      setC(x)
      setSaved(JSON.stringify(x))
    })
  }, [])

  const dirty = c !== null && JSON.stringify(c) !== saved

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault()
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  if (!c) return <div className="admin-loading">Loading content…</div>

  const set = <K extends keyof Content>(k: K, v: Content[K]) => setC({ ...c, [k]: v })
  const setProfile = (patch: Partial<Content['profile']>) => set('profile', { ...c.profile, ...patch })

  async function save() {
    if (!c) return
    setStatus({ kind: 'busy', msg: 'Saving…' })
    // Drop empty bullet lines before publishing.
    const clean: Content = {
      ...c,
      experience: c.experience.map((x) => ({ ...x, bullets: x.bullets.map((b) => b.trim()).filter(Boolean) })),
      projects: c.projects.map((x) => ({
        ...x,
        bullets: x.bullets.map((b) => b.trim()).filter(Boolean),
        metrics: x.metrics.filter((m) => m.value || m.label),
      })),
    }
    const res = await fetch('/api/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(clean),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return setStatus({ kind: 'err', msg: data.error ?? `Save failed (${res.status})` })
    setC(clean)
    setSaved(JSON.stringify(clean))
    setStatus({ kind: 'ok', msg: 'Published. Changes are live.' })
  }

  const p = c.profile

  return (
    <div className="admin">
      <header className="admin-bar">
        <div>
          <p className="eyebrow">Content Studio</p>
          <strong>{p.name}</strong>
        </div>
        <div className="admin-bar-actions">
          {status && <span className={`status ${status.kind}`}>{status.msg}</span>}
          {dirty && status?.kind !== 'busy' && <span className="status">Unsaved changes</span>}
          <a className="btn ghost" href="/" target="_blank" rel="noreferrer">View site ↗</a>
          <button className="btn ghost" onClick={() => supabase.auth.signOut()}>Sign out</button>
          <button className="btn" disabled={!dirty || status?.kind === 'busy'} onClick={save}>Publish</button>
        </div>
      </header>

      <div className="admin-main">
        <nav className="admin-tabs">
          {TABS.map((t) => (
            <button key={t} className={t === tab ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>
          ))}
        </nav>

        <div className="admin-panel">
          {tab === 'profile' && (
            <>
              <div className="grid2">
                <Text label="Full name" value={p.name} onChange={(v) => setProfile({ name: v })} />
                <Text label="Title" value={p.title} onChange={(v) => setProfile({ title: v })} />
              </div>
              <Text label="Tagline" value={p.tagline} onChange={(v) => setProfile({ tagline: v })} />
              <Text label="Availability line" value={p.availability} onChange={(v) => setProfile({ availability: v })} hint="Leave empty to hide." />
              <div className="grid2">
                <Text label="Email" value={p.email} onChange={(v) => setProfile({ email: v })} />
                <Text label="Phone" value={p.phone} onChange={(v) => setProfile({ phone: v })} />
                <Text label="Location" value={p.location} onChange={(v) => setProfile({ location: v })} />
                <Text label="LinkedIn URL" value={p.linkedin} onChange={(v) => setProfile({ linkedin: v })} />
                <Text label="GitHub URL" value={p.github} onChange={(v) => setProfile({ github: v })} />
              </div>
              <Upload label="Portrait photo" accept="image/*" token={token} value={p.photo} onChange={(v) => setProfile({ photo: v })} />
              <Upload label="Résumé PDF" accept="application/pdf" token={token} value={p.resumeUrl} onChange={(v) => setProfile({ resumeUrl: v })} />
              <Text label="Summary" area value={c.summary} onChange={(v) => set('summary', v)} />
              <Text label="Reference" value={c.reference} onChange={(v) => set('reference', v)} />
            </>
          )}

          {tab === 'experience' && (
            <List
              items={c.experience}
              onChange={(v) => set('experience', v)}
              make={blankExp}
              title={(x) => `${x.role}${x.org ? ' — ' + x.org : ''}`}
              render={(x, s) => (
                <>
                  <div className="grid2">
                    <Text label="Role" value={x.role} onChange={(v) => s({ role: v })} />
                    <Text label="Organization" value={x.org} onChange={(v) => s({ org: v })} />
                    <Text label="Organization detail" value={x.orgDetail} onChange={(v) => s({ orgDetail: v })} />
                    <Text label="Location" value={x.location} onChange={(v) => s({ location: v })} />
                    <Text label="Start" value={x.start} onChange={(v) => s({ start: v })} />
                    <Text label="End" value={x.end} onChange={(v) => s({ end: v })} />
                  </div>
                  <Text label="Link" value={x.link} onChange={(v) => s({ link: v })} />
                  <Text label="Bullets" area hint="One bullet per line." value={lines(x.bullets)} onChange={(v) => s({ bullets: unlines(v) })} />
                </>
              )}
            />
          )}

          {tab === 'projects' && (
            <List
              items={c.projects}
              onChange={(v) => set('projects', v)}
              make={blankProject}
              title={(x) => x.title}
              render={(x, s) => (
                <>
                  <div className="grid2">
                    <Text label="Title" value={x.title} onChange={(v) => s({ title: v })} />
                    <Text label="Context" value={x.context} onChange={(v) => s({ context: v })} hint="e.g. Capstone · 2025" />
                  </div>
                  <Text label="Subtitle" value={x.subtitle} onChange={(v) => s({ subtitle: v })} />
                  <Text label="Tech stack" value={x.stack} onChange={(v) => s({ stack: v })} />
                  <div className="grid2">
                    <Text label="Live URL" value={x.link} onChange={(v) => s({ link: v })} />
                    <Text label="Repository URL" value={x.repo} onChange={(v) => s({ repo: v })} />
                  </div>
                  <Upload label="Screenshot" accept="image/*" token={token} value={x.image} onChange={(v) => s({ image: v })} />
                  <Text label="Bullets" area hint="One bullet per line." value={lines(x.bullets)} onChange={(v) => s({ bullets: unlines(v) })} />
                  <Text label="How it works (expandable)" area value={x.details} onChange={(v) => s({ details: v })} />
                  <Text
                    label="Metrics"
                    area
                    hint="One per line as: value | label"
                    value={x.metrics.map((m) => `${m.value} | ${m.label}`).join('\n')}
                    onChange={(v) =>
                      s({
                        metrics: unlines(v).map((l) => {
                          const [value = '', ...rest] = l.split('|')
                          return { value: value.trim(), label: rest.join('|').trim() }
                        }),
                      })
                    }
                  />
                </>
              )}
            />
          )}

          {tab === 'skills' && (
            <List
              items={c.skills}
              onChange={(v) => set('skills', v)}
              make={() => ({ label: '', items: '' })}
              title={(x) => x.label}
              render={(x, s) => (
                <>
                  <Text label="Group" value={x.label} onChange={(v) => s({ label: v })} />
                  <Text label="Skills" area hint="Comma-separated." value={x.items} onChange={(v) => s({ items: v })} />
                </>
              )}
            />
          )}

          {tab === 'certifications' && (
            <List
              items={c.certifications}
              onChange={(v) => set('certifications', v)}
              make={() => ({ title: '', issuer: '', date: '' })}
              title={(x) => x.title}
              render={(x, s) => (
                <>
                  <Text label="Title" value={x.title} onChange={(v) => s({ title: v })} />
                  <div className="grid2">
                    <Text label="Issuer" value={x.issuer} onChange={(v) => s({ issuer: v })} />
                    <Text label="Date" value={x.date} onChange={(v) => s({ date: v })} />
                  </div>
                </>
              )}
            />
          )}

          {tab === 'education' && (
            <List
              items={c.education}
              onChange={(v) => set('education', v)}
              make={() => ({ school: '', degree: '', start: '', end: '' })}
              title={(x) => x.school}
              render={(x, s) => (
                <>
                  <Text label="School" value={x.school} onChange={(v) => s({ school: v })} />
                  <Text label="Degree" value={x.degree} onChange={(v) => s({ degree: v })} />
                  <div className="grid2">
                    <Text label="Start" value={x.start} onChange={(v) => s({ start: v })} />
                    <Text label="End" value={x.end} onChange={(v) => s({ end: v })} />
                  </div>
                </>
              )}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default function Admin() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])
  if (session === undefined) return <div className="admin-loading">Loading…</div>
  return session ? <Editor session={session} /> : <Login />
}
