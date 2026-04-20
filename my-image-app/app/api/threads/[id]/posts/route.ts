import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Promiseとして受け取る
    const { id: threadId } = await params

    const formData = await request.formData()
    const content = formData.get('content') as string | null
    const files = formData.getAll('files') as File[]

    console.log('threadId:', threadId)
    console.log('files:', files)

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'ファイルが必要です' },
        { status: 400 }
      )
    }

    const validFiles = files.filter((file) => file instanceof File)
    if (validFiles.length === 0) {
      return NextResponse.json(
        { error: '有効なファイルがありません' },
        { status: 400 }
      )
    }

    const post = await prisma.post.create({
      data: {
        threadId,
        content: content || null,
      },
    })

    const uploadPromises = validFiles.map(async (file) => {
      const blob = await put(file.name, file, {
        access: 'public',
      })

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

  } catch (err) {
    console.error('🔥 ERROR:', err)

    return NextResponse.json(
      {
        error: 'サーバーエラー',
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    )
  }
}