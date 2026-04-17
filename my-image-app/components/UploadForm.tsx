'use client'

import { useState } from 'react'

export default function UploadForm({ onUploaded }: { onUploaded: () => void }) {
  const [uploading, setUploading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const file = (form.elements.namedItem('file') as HTMLInputElement).files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    await fetch('/api/upload', { method: 'POST', body: formData })
    form.reset()
    setUploading(false)
    onUploaded()
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-4 items-center mb-8">
      <input
        type="file"
        name="file"
        accept="image/*"
        required
        className="border rounded p-2"
      />
      <button
        type="submit"
        disabled={uploading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {uploading ? 'アップロード中...' : 'アップロード'}
      </button>
    </form>
  )
}