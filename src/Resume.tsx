import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Content } from './lib/content'

/* ---------- icons ---------- */
const Icon = {
  mail: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 6.5 8.5 6 8.5-6" />
    </svg>
  ),
  doc: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h6" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56l-.02-1.96c-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.14l-.01 3.17c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  ),
}

/* ---------- helpers ---------- */
const range = (a: string, b: string) => [a, b].filter(Boolean).join(' — ')
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const orgKey = (s: string) => slug(s).split('-').slice(0, 2).join('-')

function monogram(name: string) {
  const clean = name.replace(/\b(inc|corp|corporation|co|ltd|the|of)\b\.?/gi, '').trim()
  if (/^[A-Z]{2,5}$/.test(clean.split(/\s/)[0])) return clean.split(/\s/)[0]
  return clean.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

function Logo({ src, name, size = 'md' }: { src: string; name: string; size?: 'sm' | 'md' }) {
  return (
    <span className={`logo logo-${size}`} title={name}>
      {src ? <img src={src} alt={`${name} logo`} loading="lazy" /> : <span className="mono">{monogram(name)}</span>}
    </span>
  )
}

const NAV = [
  { id: 'overview', label: 'Overview' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'credentials', label: 'Credentials' },
]

function useScrollSpy(ids: string[]) {
  const [active, setActive] = useState(ids[0])
  useEffect(() => {
    const onScroll = () => {
      const line = window.innerHeight * 0.3
      let current = ids[0]
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= line) current = id
      }
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) current = ids[ids.length - 1]
      setActive(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [ids])
  return active
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="section">
      <h2 className="section-title">{title}</h2>
      <div className="section-body">{children}</div>
    </section>
  )
}

export default function Resume({ c }: { c: Content }) {
  const p = c.profile
  const ids = useMemo(() => NAV.map((n) => n.id), [])
  const active = useScrollSpy(ids)
  const navRef = useRef<HTMLDivElement>(null)

  // Keep the active chip visible on narrow screens.
  useEffect(() => {
    const el = navRef.current?.querySelector<HTMLElement>(`[data-id="${active}"]`)
    const bar = navRef.current
    if (el && bar && bar.scrollWidth > bar.clientWidth) {
      bar.scrollTo({ left: el.offsetLeft - bar.clientWidth / 2 + el.clientWidth / 2, behavior: 'smooth' })
    }
  }, [active])

  // Every organisation mentioned, de-duplicated, each linking to where it appears.
  const orgs = useMemo(() => {
    const seen = new Map<string, { name: string; logo: string; href: string }>()
    const add = (name: string, logo: string, href: string) => {
      if (!name) return
      const k = orgKey(name)
      const prev = seen.get(k)
      if (!prev) seen.set(k, { name, logo, href })
      else if (!prev.logo && logo) prev.logo = logo
    }
    c.experience.forEach((x, i) => add(x.org, x.logo, `#exp-${i}`))
    c.projects.forEach((x, i) => add(x.client, x.logo, `#proj-${i}`))
    c.education.forEach((x, i) => add(x.school.split(/[—,]/)[0].trim(), x.logo, `#edu-${i}`))
    c.certifications.forEach((x) => x.issuer && add(x.issuer, x.logo, '#credentials'))
    return [...seen.values()]
  }, [c])

  const first = p.name.split(' ')[0]

  return (
    <div className="page">
      <nav className="topbar" aria-label="Sections">
        <div className="topbar-inner">
          <a href="#overview" className="topbar-name">
            {p.photo && <img src={p.photo} alt="" />}
            <span>{p.name.split(' ').filter((_, i, a) => i === 0 || i === a.length - 1).join(' ')}</span>
          </a>
          <div className="topbar-nav" ref={navRef}>
            {NAV.map((n) => (
              <a key={n.id} data-id={n.id} href={`#${n.id}`} className={active === n.id ? 'active' : ''}>
                {n.label}
              </a>
            ))}
          </div>
          {p.resumeUrl && (
            <a className="topbar-cta" href={p.resumeUrl} target="_blank" rel="noreferrer">
              {Icon.doc}<span>Résumé</span>
            </a>
          )}
        </div>
      </nav>

      <main className="sheet">
        <header id="overview" className="masthead">
          {p.photo && (
            <div className="portrait">
              <img src={p.photo} alt={p.name} />
            </div>
          )}
          <div className="masthead-text">
            <p className="eyebrow">{p.title}</p>
            <h1 className="name">{p.name}</h1>
            {p.tagline && <p className="tagline">{p.tagline}</p>}
            <div className="actions">
              {p.email && <a className="btn-primary" href={`mailto:${p.email}`}>{Icon.mail} Email {first}</a>}
              {p.linkedin && <a className="btn-quiet" href={p.linkedin} target="_blank" rel="noreferrer">{Icon.linkedin} LinkedIn</a>}
              {p.github && <a className="btn-quiet" href={p.github} target="_blank" rel="noreferrer">{Icon.github} GitHub</a>}
              {p.resumeUrl && <a className="btn-quiet pdf" href={p.resumeUrl} target="_blank" rel="noreferrer">{Icon.doc} PDF</a>}
            </div>
            <p className="meta">
              {p.location && <span>{p.location}</span>}
              {p.phone && <a href={`tel:${p.phone.replace(/[^+\d]/g, '')}`}>{p.phone}</a>}
              {p.email && <a href={`mailto:${p.email}`}>{p.email}</a>}
            </p>
          </div>
        </header>

        {(c.glance?.length > 0 || c.summary) && (
          <div className="glance">
            {c.summary && <p className="summary">{c.summary}</p>}
            {c.glance?.length > 0 && (
              <dl className="glance-grid">
                {c.glance.map((g, i) => (
                  <div key={i}>
                    <dt>{g.label}</dt>
                    <dd>{g.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        )}

        {orgs.length > 0 && (
          <div className="orgs" aria-label="Organisations">
            <p className="orgs-label">Worked with &amp; credentialed by</p>
            <ul>
              {orgs.map((o) => (
                <li key={o.name}>
                  <a href={o.href} title={o.name}>
                    {o.logo ? <img src={o.logo} alt={o.name} loading="lazy" /> : <span className="orgs-text">{o.name}</span>}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {c.experience.length > 0 && (
          <Section id="experience" title="Experience">
            {c.experience.map((x, i) => (
              <article className="entry" id={`exp-${i}`} key={i}>
                <Logo src={x.logo} name={x.org} />
                <div>
                  <div className="entry-head">
                    <h3>{x.role}</h3>
                    <span className="when">{range(x.start, x.end)}</span>
                  </div>
                  <div className="entry-sub">
                    <span>
                      {x.link ? <a href={x.link} target="_blank" rel="noreferrer">{x.org}</a> : x.org}
                      {x.orgDetail && <span className="muted"> · {x.orgDetail}</span>}
                    </span>
                    {x.location && <span className="where">{x.location}</span>}
                  </div>
                  <ul className="bullets">
                    {x.bullets.filter(Boolean).map((b, j) => <li key={j}>{b}</li>)}
                  </ul>
                </div>
              </article>
            ))}
          </Section>
        )}

        {c.projects.length > 0 && (
          <Section id="projects" title="Projects">
            {c.projects.map((pr, i) => (
              <article className="entry project" id={`proj-${i}`} key={i}>
                <Logo src={pr.logo} name={pr.client || pr.title} />
                <div>
                  <div className="entry-head">
                    <h3>{pr.title}</h3>
                    <span className="when links">
                      {pr.link && <a href={pr.link} target="_blank" rel="noreferrer">Live ↗</a>}
                      {pr.repo && <a href={pr.repo} target="_blank" rel="noreferrer">Code ↗</a>}
                    </span>
                  </div>
                  {pr.subtitle && <p className="project-sub">{pr.subtitle}</p>}
                  {pr.context && <p className="muted small">{pr.context}</p>}
                  {pr.metrics?.length > 0 && (
                    <dl className="metrics">
                      {pr.metrics.map((m, j) => (
                        <div key={j}>
                          <dt>{m.value}</dt>
                          <dd>{m.label}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  {pr.image && <img className="project-img" src={pr.image} alt={pr.title} loading="lazy" />}
                  <ul className="bullets">
                    {pr.bullets.filter(Boolean).map((b, j) => <li key={j}>{b}</li>)}
                  </ul>
                  {pr.details && (
                    <details className="more">
                      <summary>How it works</summary>
                      <p>{pr.details}</p>
                    </details>
                  )}
                  {pr.stack && (
                    <ul className="chips small-chips" aria-label="Tech stack">
                      {pr.stack.split(',').map((s) => s.trim()).filter(Boolean).map((s) => <li key={s}>{s}</li>)}
                    </ul>
                  )}
                </div>
              </article>
            ))}
          </Section>
        )}

        {c.skills.length > 0 && (
          <Section id="skills" title="Skills">
            <dl className="skills">
              {c.skills.map((s, i) => (
                <div key={i}>
                  <dt>{s.label}</dt>
                  <dd>
                    <ul className="chips">
                      {s.items.split(',').map((t) => t.trim()).filter(Boolean).map((t) => <li key={t}>{t}</li>)}
                    </ul>
                  </dd>
                </div>
              ))}
            </dl>
          </Section>
        )}

        <Section id="credentials" title="Credentials">
          {c.education.map((e, i) => (
            <article className="entry" id={`edu-${i}`} key={i}>
              <Logo src={e.logo} name={e.school} />
              <div>
                <div className="entry-head">
                  <h3>{e.degree}</h3>
                  <span className="when">{range(e.start, e.end)}</span>
                </div>
                <p className="entry-sub">{e.school}</p>
              </div>
            </article>
          ))}
          {c.certifications.length > 0 && (
            <>
              <h4 className="subhead">Certifications</h4>
              <ul className="ledger">
                {c.certifications.map((x, i) => (
                  <li key={i}>
                    <Logo src={x.logo} name={x.issuer || x.title} size="sm" />
                    <span className="ledger-text">
                      <strong>{x.title}</strong>
                      {x.issuer && <span className="muted"> · {x.issuer}</span>}
                    </span>
                    <span className="when">{x.date}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          {c.reference && <p className="reference"><span className="label">References</span> {c.reference}</p>}
        </Section>

        <footer className="colophon">
          <span>© {new Date().getFullYear()} {p.name}</span>
          <a href={`mailto:${p.email}`}>Get in touch →</a>
        </footer>
      </main>

      {/* Mobile quick-contact dock */}
      <div className="dock" aria-label="Quick contact">
        {p.email && <a href={`mailto:${p.email}`}>{Icon.mail}<span>Email</span></a>}
        {p.phone && <a href={`tel:${p.phone.replace(/[^+\d]/g, '')}`}>{Icon.phone}<span>Call</span></a>}
        {p.linkedin && <a href={p.linkedin} target="_blank" rel="noreferrer">{Icon.linkedin}<span>LinkedIn</span></a>}
        {p.github && <a href={p.github} target="_blank" rel="noreferrer">{Icon.github}<span>GitHub</span></a>}
        {p.resumeUrl && <a href={p.resumeUrl} target="_blank" rel="noreferrer">{Icon.doc}<span>PDF</span></a>}
      </div>
    </div>
  )
}
