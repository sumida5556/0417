import { del } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const post = await prisma.post.findUnique({
    where: { id },
    include: { images: true },
  })

  if (!post) {
    return NextResponse.json({ error: '投稿が見つかりません' }, { status: 404 })
  }

  await Promise.all(post.images.map((image) => del(image.url)))

  await prisma.post.delete({
    where: { id },
  })

  return NextResponse.json({ success: true })
}
