import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: threadId } = await params
  const formData = await request.formData()
  const content = formData.get('content') as string
  const files = formData.getAll('files') as File[]

  if (files.length === 0) {
    return NextResponse.json({ error: 'ファイルが必要です' }, { status: 400 })
  }

  const post = await prisma.post.create({
    data: {
      threadId,
      content: content || null,
    },
  })

  const uploadPromises = files.map(async (file) => {
    const blob = await put(file.name, file, { access: 'public' })
    return prisma.image.create({
      data: {
        postId: post.id,
        url: blob.url,
        filename: file.name,
      },
    })
  })

  await Promise.all(uploadPromises)

  await prisma.thread.update({
    where: { id: threadId },
    data: { updatedAt: new Date() },
  })

  const updatedPost = await prisma.post.findUnique({
    where: { id: post.id },
    include: { images: true },
  })

  return NextResponse.json(updatedPost)
}
