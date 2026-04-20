'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewThread() {
  const [title, setTitle] = useState('')
  const [type, setType] = useState<'board' | 'submission'>('board')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const res = await fetch('/api/threads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, type }),
    })

    const thread = await res.json()
    router.push(`/threads/${thread.id}`)
  }

  return (
    <main className="max-w-5xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">新規スレッド作成</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">タイプ</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="board"
                checked={type === 'board'}
                onChange={(e) => setType('board')}
                className="mr-2"
              />
              掲示板（通常）
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="submission"
                checked={type === 'submission'}
                onChange={(e) => setType('submission')}
                className="mr-2"
              />
              写真提出表
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            タイトル
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border rounded p-2"
            placeholder={
              type === 'board' 
                ? '例: 今日撮った写真' 
                : '例: 〇〇工事 写真提出表'
            }
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            作成
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="border px-4 py-2 rounded hover:bg-gray-100"
          >
            キャンセル
          </button>
        </div>
      </form>
    </main>
  )
}
