import fallback from '../content.default.json'

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ?? 'https://arbqospfobibiiyivfhp.supabase.co'
// Publishable (anon) key: safe to ship to the browser.
export const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_maBYJA2L7hZ3-6ZKbGsaBw_xRiyYkGG'

export const BUCKET = 'site'


export interface Profile {
  name: string
  title: string
  tagline: string
  email: string
  phone: string
  location: string
  linkedin: string
  github: string
  photo: string
  resumeUrl: string
  availability: string
}
export interface SkillGroup { label: string; items: string }
export interface Experience {
  role: string
  org: string
  orgDetail: string
  location: string
  link: string
  start: string
  end: string
  logo: string
  bullets: string[]
}
export interface Metric { value: string; label: string }
export interface Project {
  title: string
  subtitle: string
  context: string
  client: string
  stack: string
  link: string
  repo: string
  image: string
  logo: string
  bullets: string[]
  details: string
  metrics: Metric[]
}
export interface Certification { title: string; issuer: string; date: string; logo: string }
export interface Education { school: string; degree: string; start: string; end: string; logo: string }
export interface Glance { label: string; value: string }

export interface Content {
  profile: Profile
  summary: string
  glance: Glance[]
  skills: SkillGroup[]
  experience: Experience[]
  projects: Project[]
  certifications: Certification[]
  education: Education[]
  reference: string
}

export const defaultContent = fallback as Content

export function publicUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`
}

/** Merge saved content over defaults so newly added fields never come back undefined. */
function normalize(raw: Partial<Content>): Content {
  return {
    ...defaultContent,
    ...raw,
    profile: { ...defaultContent.profile, ...(raw.profile ?? {}) },
  }
}

export async function loadContent(): Promise<Content> {
  try {
    const res = await fetch(`${publicUrl('content.json')}?v=${Date.now()}`, { cache: 'no-store' })
    if (!res.ok) throw new Error(String(res.status))
    return normalize(await res.json())
  } catch {
    return defaultContent
  }
}
