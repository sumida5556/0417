import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File

  if (!file) {
    return NextResponse.json({ error: 'ファイルがありません' }, { status: 400 })
  }

  const blob = await put(file.name, file, { access: 'public' })

  const image = await prisma.image.create({
    data: {
      url: blob.url,
      filename: file.name,
    },
  })

  return NextResponse.json(image)
}