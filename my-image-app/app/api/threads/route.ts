import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const threads = await prisma.thread.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      posts: {
        include: {
          images: true,
        },
      },
      _count: {
        select: { photoFrames: true },
      },
    },
  })
  return NextResponse.json(threads)
}

export async function POST(request: Request) {
  const { title, type = 'board' } = await request.json()

  if (!title) {
    return NextResponse.json({ error: 'タイトルが必要です' }, { status: 400 })
  }

  const thread = await prisma.thread.create({
    data: { title, type },
  })

  return NextResponse.json(thread)
}
