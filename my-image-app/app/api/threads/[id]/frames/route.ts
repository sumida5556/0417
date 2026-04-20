import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const frames = await prisma.photoFrame.findMany({
    where: { threadId: id },
    orderBy: { order: 'asc' },
  })
  return NextResponse.json(frames)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: threadId } = await params
  const formData = await request.formData()
  const label = formData.get('label') as string
  const sampleImage = formData.get('sampleImage') as File | null

  const maxOrder = await prisma.photoFrame.findFirst({
    where: { threadId },
    orderBy: { order: 'desc' },
    select: { order: true },
  })

  let sampleImageUrl = null
  if (sampleImage) {
    const blob = await put(sampleImage.name, sampleImage, { access: 'public' })
    sampleImageUrl = blob.url
  }

  const frame = await prisma.photoFrame.create({
    data: {
      threadId,
      label,
      sampleImageUrl,
      order: (maxOrder?.order ?? -1) + 1,
    },
  })

  return NextResponse.json(frame)
}
