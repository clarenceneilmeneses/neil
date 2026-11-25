import { StrictMode, lazy, Suspense, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Resume from './Resume'
import { loadContent, type Content } from './lib/content'

const Admin = lazy(() => import('./Admin'))

function Site() {
  const [c, setC] = useState<Content | null>(null)
  useEffect(() => {
    loadContent().then((x) => {
      setC(x)
      document.title = `${x.profile.name} — ${x.profile.title}`
    })
  }, [])
  if (!c) return <div className="splash" aria-busy="true" />
  return <Resume c={c} />
}

const isAdmin = window.location.pathname.replace(/\/$/, '') === '/admin'
if (isAdmin) document.body.classList.add('is-admin')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isAdmin ? (
      <Suspense fallback={<div className="admin-loading">Loading…</div>}>
        <Admin />
      </Suspense>
    ) : (
      <Site />
    )}
  </StrictMode>,
)
