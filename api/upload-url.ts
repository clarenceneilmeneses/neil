import { BUCKET, checkAdmin, serviceClient } from './_admin.js'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const denied = await checkAdmin(req.headers.authorization)
    if (denied) return res.status(401).json({ error: denied })

    const name = String(req.body?.filename ?? 'file')
    const ext = (name.match(/\.([a-z0-9]{1,8})$/i)?.[1] ?? 'bin').toLowerCase()
    const base = name.replace(/\.[^.]*$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'file'
    const path = `files/${Date.now()}-${base}.${ext}`

    const { data, error } = await serviceClient().storage.from(BUCKET).createSignedUploadUrl(path)
    if (error) throw error
    return res.status(200).json({ path, token: data.token })
  } catch (e: any) {
    return res.status(500).json({ error: e?.message ?? 'Server error' })
  }
}
