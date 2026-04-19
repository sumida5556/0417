'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'

type Image = {
  id: string
  url: string
  filename: string
}

type Post = {
  id: string
  content: string | null
  createdAt: string
  images: Image[]
}

type Thread = {
  id: string
  title: string
  posts: Post[]
}

export default function ThreadDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [thread, setThread] = useState<Thread | null>(null)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [files, setFiles] = useState<FileList | null>(null)
  const [content, setContent] = useState('')
  const [uploading, setUploading] = useState(false)
  const router = useRouter()

  const fetchThread = async () => {
    const res = await fetch(`/api/threads/${id}`)
    const data = await res.json()
    setThread(data)
    setNewTitle(data.title)
  }

  useEffect(() => {
    fetchThread()
  }, [id])

  async function handleTitleUpdate() {
    await fetch(`/api/threads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle }),
    })
    setIsEditingTitle(false)
    fetchThread()
  }

  async function handlePostSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!files || files.length === 0) return

    setUploading(true)
    const formData = new FormData()
    formData.append('content', content)
    Array.from(files).forEach((file) => formData.append('files', file))

    await fetch(`/api/threads/${id}/posts`, {
      method: 'POST',
      body: formData,
    })

    setContent('')
    setFiles(null)
    setUploading(false)
    ;(document.getElementById('fileInput') as HTMLInputElement).value = ''
    fetchThread()
  }

  async function handleDeletePost(postId: string) {
    if (!confirm('この投稿を削除しますか？')) return
    await fetch(`/api/posts/${postId}`, { method: 'DELETE' })
    fetchThread()
  }

  async function handleDeleteImage(imageId: string) {
    if (!confirm('この画像を削除しますか？')) return
    await fetch(`/api/images/${imageId}`, { method: 'DELETE' })
    fetchThread()
  }

  async function handleReplaceImage(imageId: string, file: File) {
    const formData = new FormData()
    formData.append('file', file)
    await fetch(`/api/images/${imageId}`, {
      method: 'PATCH',
      body: formData,
    })
    fetchThread()
  }

  if (!thread) return <div className="p-8">読み込み中...</div>

  return (
    <main className="max-w-5xl mx-auto p-8">
      <div className="mb-6">
        {isEditingTitle ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="flex-1 border rounded p-2 text-xl font-bold"
            />
            <button
              onClick={handleTitleUpdate}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              保存
            </button>
            <button
              onClick={() => setIsEditingTitle(false)}
              className="border px-4 py-2 rounded"
            >
              キャンセル
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">{thread.title}</h1>
            <button
              onClick={() => setIsEditingTitle(true)}
              className="text-sm text-blue-500 hover:underline"
            >
              編集
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handlePostSubmit} className="mb-8 border rounded p-4">
        <h2 className="font-bold mb-4">新規投稿</h2>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="コメント（任意）"
          className="w-full border rounded p-2 mb-4"
          rows={3}
        />
        <input
          id="fileInput"
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setFiles(e.target.files)}
          required
          className="mb-4"
        />
        <button
          type="submit"
          disabled={uploading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {uploading ? '投稿中...' : '投稿'}
        </button>
      </form>

      <div className="space-y-6">
        {thread.posts.map((post) => (
          <div key={post.id} className="border rounded p-4">
            {post.content && <p className="mb-4">{post.content}</p>}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {post.images.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.url}
                    alt={image.filename}
                    className="w-full h-48 object-cover rounded"
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-2">
                    <label className="bg-blue-500 text-white px-2 py-1 rounded text-xs cursor-pointer">
                      変更
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleReplaceImage(image.id, file)
                        }}
                      />
                    </label>
                    <button
                      onClick={() => handleDeleteImage(image.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>{new Date(post.createdAt).toLocaleString()}</span>
              <button
                onClick={() => handleDeletePost(post.id)}
                className="text-red-500 hover:underline"
              >
                投稿を削除
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
