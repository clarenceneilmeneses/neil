import { useEffect, useRef, type ReactNode } from 'react'
import type { Content } from './lib/content'

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add('is-in')
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <section id={id} ref={ref} className="section">
      <h2 className="section-title">{title}</h2>
      <div className="section-body">{children}</div>
    </section>
  )
}

const range = (a: string, b: string) => [a, b].filter(Boolean).join(' — ')

export default function Resume({ c }: { c: Content }) {
  const p = c.profile
  const initials = p.name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .filter((_, i, a) => i === 0 || i === a.length - 1)
    .join('')

  return (
    <div className="page">
      <nav className="toolbar" aria-label="Page">
        <span className="toolbar-mark">{initials}</span>
        <div className="toolbar-links">
          <a href="#experience">Experience</a>
          <a href="#projects">Projects</a>
          <a href="#skills">Skills</a>
          <a href={`mailto:${p.email}`}>Contact</a>
          {p.resumeUrl && (
            <a className="toolbar-cta" href={p.resumeUrl} target="_blank" rel="noreferrer">
              Résumé PDF
            </a>
          )}
        </div>
      </nav>

      <main className="sheet">
        <header className="masthead">
          <div className="masthead-text">
            <p className="eyebrow">{p.title}</p>
            <h1 className="name">{p.name}</h1>
            {p.tagline && <p className="tagline">{p.tagline}</p>}
            <ul className="contact">
              {p.email && <li><a href={`mailto:${p.email}`}>{p.email}</a></li>}
              {p.phone && <li><a href={`tel:${p.phone.replace(/[^+\d]/g, '')}`}>{p.phone}</a></li>}
              {p.location && <li>{p.location}</li>}
              {p.linkedin && (
                <li><a href={p.linkedin} target="_blank" rel="noreferrer">LinkedIn</a></li>
              )}
              {p.github && (
                <li><a href={p.github} target="_blank" rel="noreferrer">GitHub</a></li>
              )}
            </ul>
          </div>
          {p.photo && <img className="portrait" src={p.photo} alt={p.name} />}
        </header>

        {p.availability && (
          <p className="availability">
            <span className="dot" aria-hidden /> {p.availability}
          </p>
        )}

        {c.summary && (
          <Section id="summary" title="Summary">
            <p className="lede">{c.summary}</p>
          </Section>
        )}

        {c.experience.length > 0 && (
          <Section id="experience" title="Experience">
            {c.experience.map((x, i) => (
              <article className="entry" key={i}>
                <div className="entry-head">
                  <h3>{x.role}</h3>
                  <span className="when">{range(x.start, x.end)}</span>
                </div>
                <div className="entry-sub">
                  <span>
                    {x.link ? (
                      <a href={x.link} target="_blank" rel="noreferrer">{x.org}</a>
                    ) : (
                      x.org
                    )}
                    {x.orgDetail && <span className="muted"> · {x.orgDetail}</span>}
                  </span>
                  {x.location && <span className="where">{x.location}</span>}
                </div>
                <ul className="bullets">
                  {x.bullets.filter(Boolean).map((b, j) => <li key={j}>{b}</li>)}
                </ul>
              </article>
            ))}
          </Section>
        )}

        {c.projects.length > 0 && (
          <Section id="projects" title="Projects">
            {c.projects.map((pr, i) => (
              <article className="entry project" key={i}>
                <div className="entry-head">
                  <h3>{pr.title}</h3>
                  <span className="when links">
                    {pr.link && <a href={pr.link} target="_blank" rel="noreferrer">Live ↗</a>}
                    {pr.repo && <a href={pr.repo} target="_blank" rel="noreferrer">Code ↗</a>}
                  </span>
                </div>
                {pr.subtitle && <p className="project-sub">{pr.subtitle}</p>}
                {pr.context && <p className="muted small">{pr.context}</p>}
                {pr.image && <img className="project-img" src={pr.image} alt={pr.title} loading="lazy" />}
                <ul className="bullets">
                  {pr.bullets.filter(Boolean).map((b, j) => <li key={j}>{b}</li>)}
                </ul>
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
                {pr.details && (
                  <details className="more">
                    <summary>How it works</summary>
                    <p>{pr.details}</p>
                  </details>
                )}
                {pr.stack && (
                  <p className="stack">
                    <span className="label">Stack</span> {pr.stack}
                  </p>
                )}
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
                  <dd>{s.items}</dd>
                </div>
              ))}
            </dl>
          </Section>
        )}

        {c.certifications.length > 0 && (
          <Section id="certifications" title="Certifications">
            <ul className="ledger">
              {c.certifications.map((x, i) => (
                <li key={i}>
                  <span>
                    <strong>{x.title}</strong>
                    {x.issuer && <span className="muted"> · {x.issuer}</span>}
                  </span>
                  <span className="when">{x.date}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {c.education.length > 0 && (
          <Section id="education" title="Education">
            {c.education.map((e, i) => (
              <article className="entry" key={i}>
                <div className="entry-head">
                  <h3>{e.school}</h3>
                  <span className="when">{range(e.start, e.end)}</span>
                </div>
                <p className="entry-sub">{e.degree}</p>
              </article>
            ))}
          </Section>
        )}

        {c.reference && (
          <Section id="reference" title="Reference">
            <p>{c.reference}</p>
          </Section>
        )}

        <footer className="colophon">
          <span>© {new Date().getFullYear()} {p.name}</span>
          <a href={`mailto:${p.email}`}>Get in touch →</a>
        </footer>
      </main>
    </div>
  )
}
