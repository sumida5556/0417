import { put, del } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const formData = await request.formData()
  const label = formData.get('label') as string | null
  const sampleImage = formData.get('sampleImage') as File | null
  const attachedImage = formData.get('attachedImage') as File | null

  const frame = await prisma.photoFrame.findUnique({ where: { id } })
  if (!frame) {
    return NextResponse.json({ error: '枠が見つかりません' }, { status: 404 })
  }

  const updateData: any = {}

  if (label) updateData.label = label

  if (sampleImage) {
    if (frame.sampleImageUrl) await del(frame.sampleImageUrl)
    const blob = await put(sampleImage.name, sampleImage, { access: 'public' })
    updateData.sampleImageUrl = blob.url
  }

  if (attachedImage) {
    if (frame.attachedImageUrl) await del(frame.attachedImageUrl)
    const blob = await put(attachedImage.name, attachedImage, { access: 'public' })
    updateData.attachedImageUrl = blob.url
  }

  const updated = await prisma.photoFrame.update({
    where: { id },
    data: updateData,
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const frame = await prisma.photoFrame.findUnique({ where: { id } })
  if (!frame) {
    return NextResponse.json({ error: '枠が見つかりません' }, { status: 404 })
  }

  if (frame.sampleImageUrl) await del(frame.sampleImageUrl)
  if (frame.attachedImageUrl) await del(frame.attachedImageUrl)

  await prisma.photoFrame.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
