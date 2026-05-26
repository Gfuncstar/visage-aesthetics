import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { isStaffAuthed } from '@/lib/staff-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

const MAX_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

export async function POST(req: Request) {
  if (!(await isStaffAuthed())) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          'Image hosting is not configured. Enable Vercel Blob on this project and add BLOB_READ_WRITE_TOKEN to your env vars.',
      },
      { status: 500 },
    )
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid upload payload.' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
  }

  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: 'Please upload a JPG, PNG, WEBP, or GIF image.' },
      { status: 400 },
    )
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `Image is too large (${Math.round(file.size / 1024 / 1024)} MB). Max is 5 MB.` },
      { status: 400 },
    )
  }

  const ext = file.type.split('/')[1] || 'jpg'
  const filename = `broadcasts/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  try {
    const blob = await put(filename, file, {
      access: 'public',
      contentType: file.type,
      addRandomSuffix: false,
    })
    return NextResponse.json({ ok: true, url: blob.url })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown upload error'
    console.error('[broadcasts/upload-image] put failed', msg)
    return NextResponse.json({ error: `Upload failed: ${msg}` }, { status: 502 })
  }
}
