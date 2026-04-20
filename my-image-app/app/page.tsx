'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Thread = {
  id: string
  title: string
  type: string
  createdAt: string
  updatedAt: string
  posts: Array<{
    images: Array<{ url: string }>
  }>
  _count?: {
    photoFrames: number
  }
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
        <h1 className="text-2xl font-bold">画像管理システム</h1>
        <Link
          href="/threads/new"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          新規作成
        </Link>
      </div>

      <div className="space-y-4">
        {threads.map((thread) => (
          <Link
            key={thread.id}
            href={
              thread.type === 'submission' 
                ? `/threads/${thread.id}/submission` 
                : `/threads/${thread.id}`
            }
            className="block border rounded p-4 hover:bg-gray-50"
          >
            <div className="flex items-center gap-2 mb-2">
              <h2 className="font-bold text-lg">{thread.title}</h2>
              <span className={`text-xs px-2 py-1 rounded ${
                thread.type === 'submission' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {thread.type === 'submission' ? '写真提出表' : '掲示板'}
              </span>
            </div>
            <div className="text-sm text-gray-600 flex gap-4">
              {thread.type === 'submission' ? (
                <span>枠: {thread._count?.photoFrames || 0}個</span>
              ) : (
                <>
                  <span>投稿: {thread.posts.length}件</span>
                  <span>画像: {imageCount(thread)}枚</span>
                </>
              )}
              <span>更新: {new Date(thread.updatedAt).toLocaleString()}</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
