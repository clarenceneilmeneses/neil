import { BUCKET, checkAdmin, serviceClient } from './_admin.js'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const denied = await checkAdmin(req.headers.authorization)
    if (denied) return res.status(401).json({ error: denied })

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    if (!body || typeof body !== 'object' || !body.profile || !Array.isArray(body.projects)) {
      return res.status(400).json({ error: 'Invalid content' })
    }
    const json = JSON.stringify(body, null, 2)
    if (json.length > 500_000) return res.status(413).json({ error: 'Content too large' })

    const { error } = await serviceClient()
      .storage.from(BUCKET)
      .upload('content.json', new Blob([json], { type: 'application/json' }), {
        upsert: true,
        cacheControl: '0',
        contentType: 'application/json',
      })
    if (error) throw error
    return res.status(200).json({ ok: true })
  } catch (e: any) {
    return res.status(500).json({ error: e?.message ?? 'Server error' })
  }
}
