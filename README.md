# Neil Alexi Terrible — Portfolio

Résumé-style portfolio (Vite + React + TypeScript) with a small built-in CMS.

- **Site:** `/` reads `content.json` from the public Supabase Storage bucket `site` (falls back to `src/content.default.json`).
- **CMS:** `/admin` — sign in with the Supabase Auth editor account, edit every section, upload photo / screenshots / résumé PDF, then **Publish**.
- **API (Vercel functions):** `api/content.ts` saves content, `api/upload-url.ts` issues signed upload URLs. Both verify the user's session and the `ADMIN_EMAILS` allowlist.

## Vercel environment variables
| Name | Value |
| --- | --- |
| `SUPABASE_SECRET_KEY` | Supabase secret / service_role key (server only — never commit) |
| `ADMIN_EMAILS` | optional, comma-separated editor emails (default `neilalexivergara@gmail.com`) |

## Local dev
`npm install && npm run dev` (the CMS save/upload endpoints need `vercel dev`).
