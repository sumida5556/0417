import { del, put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const image = await prisma.image.findUnique({
    where: { id },
  })

  if (!image) {
    return NextResponse.json({ error: '画像が見つかりません' }, { status: 404 })
  }

  await del(image.url)

  await prisma.image.delete({
    where: { id },
  })

  return NextResponse.json({ success: true })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const formData = await request.formData()
  const file = formData.get('file') as File

  if (!file) {
    return NextResponse.json({ error: 'ファイルが必要です' }, { status: 400 })
  }

  const image = await prisma.image.findUnique({
    where: { id },
  })

  if (!image) {
    return NextResponse.json({ error: '画像が見つかりません' }, { status: 404 })
  }

  await del(image.url)

  const blob = await put(file.name, file, { access: 'public' })

  const updatedImage = await prisma.image.update({
    where: { id },
    data: {
      url: blob.url,
      filename: file.name,
    },
  })

  return NextResponse.json(updatedImage)
}
