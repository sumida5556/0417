import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const thread = await prisma.thread.findUnique({
    where: { id },
    include: {
      posts: {
        orderBy: { createdAt: 'asc' },
        include: {
          images: true,
        },
      },
    },
  })

  if (!thread) {
    return NextResponse.json({ error: 'スレッドが見つかりません' }, { status: 404 })
  }

  return NextResponse.json(thread)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { title } = await request.json()

  const thread = await prisma.thread.update({
    where: { id },
    data: { title },
  })

  return NextResponse.json(thread)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.thread.delete({
    where: { id },
  })

  return NextResponse.json({ success: true })
}
