'use client'

import { useState, useEffect, useCallback } from 'react'
import UploadForm from '@/components/UploadForm'
import ImageGrid from '@/components/ImageGrid'

type Image = {
  id: string
  url: string
  filename: string
  createdAt: string
}

export default function Home() {
  const [images, setImages] = useState<Image[]>([])

  const fetchImages = useCallback(async () => {
    const res = await fetch('/api/images')
    const data = await res.json()
    setImages(data)
  }, [])

  useEffect(() => {
    fetchImages()
  }, [fetchImages])

  return (
    <main className="max-w-5xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">画像アップローダー</h1>
      <UploadForm onUploaded={fetchImages} />
      <ImageGrid images={images} />
    </main>
  )
}