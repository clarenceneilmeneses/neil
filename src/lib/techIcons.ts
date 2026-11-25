import {
  siBootstrap, siCisco, siCloudinary, siCplusplus, siCss, siExpress, siFigma, siFirebase, siGit, siGithub,
  siGooglegemini, siHtml5, siJavascript, siMongodb, siMysql, siNodedotjs, siOpenjdk, siPostgresql, siPostman,
  siPython, siReact, siSupabase, siTypescript, siVercel, siVite, siXendit,
  type SimpleIcon,
} from 'simple-icons'

// Matched by "contains" on a normalised name; longer keys are tried first so
// "javascript" wins over "java" and "github" over "git".
const MAP: Record<string, SimpleIcon> = {
  javascript: siJavascript,
  typescript: siTypescript,
  python: siPython,
  java: siOpenjdk,
  cplusplus: siCplusplus,
  html: siHtml5,
  css: siCss,
  react: siReact,
  vite: siVite,
  bootstrap: siBootstrap,
  figma: siFigma,
  node: siNodedotjs,
  express: siExpress,
  gemini: siGooglegemini,
  xendit: siXendit,
  postgres: siPostgresql,
  supabase: siSupabase,
  mongodb: siMongodb,
  firebase: siFirebase,
  mysql: siMysql,
  github: siGithub,
  git: siGit,
  vercel: siVercel,
  cloudinary: siCloudinary,
  postman: siPostman,
  cisco: siCisco,
}
const KEYS = Object.keys(MAP).sort((a, b) => b.length - a.length)

const norm = (s: string) => s.toLowerCase().replace(/\+/g, 'plus').replace(/[^a-z0-9]/g, '')

export function techIcon(name: string): SimpleIcon | undefined {
  const n = norm(name)
  const k = KEYS.find((key) => n.includes(key))
  return k ? MAP[k] : undefined
}

/** Split "A, B (x, y), C" on top-level commas only. */
export function splitList(s: string): string[] {
  const out: string[] = []
  let depth = 0
  let cur = ''
  for (const ch of s) {
    if (ch === '(') depth++
    if (ch === ')') depth = Math.max(0, depth - 1)
    if (ch === ',' && depth === 0) {
      out.push(cur)
      cur = ''
    } else cur += ch
  }
  out.push(cur)
  return out.map((x) => x.trim()).filter(Boolean)
}
