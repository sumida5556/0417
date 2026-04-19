'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Thread = {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  posts: Array<{
    images: Array<{ url: string }>
  }>
}

export default function Home() {
  const [threads, setThreads] = useState<Thread[]>([])

  useEffect(() => {
    fetch('/api/threads')
      .then((res) => res.json())
      .then(setThreads)
  }, [])

  const imageCount = (thread: Thread) => {
    return thread.posts.reduce((sum, post) => sum + post.images.length, 0)
  }

  return (
    <main className="max-w-5xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">画像スレッド掲示板</h1>
        <Link
          href="/threads/new"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          新規スレッド作成
        </Link>
      </div>

      <div className="space-y-4">
        {threads.map((thread) => (
          <Link
            key={thread.id}
            href={`/threads/${thread.id}`}
            className="block border rounded p-4 hover:bg-gray-50"
          >
            <h2 className="font-bold text-lg mb-2">{thread.title}</h2>
            <div className="text-sm text-gray-600 flex gap-4">
              <span>投稿: {thread.posts.length}件</span>
              <span>画像: {imageCount(thread)}枚</span>
              <span>更新: {new Date(thread.updatedAt).toLocaleString()}</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
