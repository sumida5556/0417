'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'

type PhotoFrame = {
  id: string
  label: string
  sampleImageUrl: string | null
  attachedImageUrl: string | null
  order: number
}

type Thread = {
  id: string
  title: string
  type: string
}

export default function SubmissionView({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [thread, setThread] = useState<Thread | null>(null)
  const [frames, setFrames] = useState<PhotoFrame[]>([])
  const [newLabel, setNewLabel] = useState('')
  const [sampleImage, setSampleImage] = useState<File | null>(null)
  const [editingFrameId, setEditingFrameId] = useState<string | null>(null)
  const [editingLabel, setEditingLabel] = useState('')
  const router = useRouter()

  const fetchData = async () => {
    const [threadRes, framesRes] = await Promise.all([
      fetch(`/api/threads/${id}`),
      fetch(`/api/threads/${id}/frames`),
    ])
    setThread(await threadRes.json())
    setFrames(await framesRes.json())
  }

  useEffect(() => {
    fetchData()
  }, [id])

  async function handleAddFrame(e: React.FormEvent) {
    e.preventDefault()
    const formData = new FormData()
    formData.append('label', newLabel)
    if (sampleImage) formData.append('sampleImage', sampleImage)

    await fetch(`/api/threads/${id}/frames`, {
      method: 'POST',
      body: formData,
    })

    setNewLabel('')
    setSampleImage(null)
    ;(document.getElementById('sampleImageInput') as HTMLInputElement).value = ''
    fetchData()
  }

  async function handleAttachImage(frameId: string, file: File) {
    const formData = new FormData()
    formData.append('attachedImage', file)

    await fetch(`/api/frames/${frameId}`, {
      method: 'PATCH',
      body: formData,
    })
    fetchData()
  }

  async function handleUpdateLabel(frameId: string) {
    const formData = new FormData()
    formData.append('label', editingLabel)

    await fetch(`/api/frames/${frameId}`, {
      method: 'PATCH',
      body: formData,
    })
    setEditingFrameId(null)
    fetchData()
  }

  async function handleDuplicateFrame(frameId: string) {
    await fetch(`/api/frames/${frameId}/duplicate`, { method: 'POST' })
    fetchData()
  }

  async function handleDeleteFrame(frameId: string) {
    if (!confirm('この枠を削除しますか？')) return
    await fetch(`/api/frames/${frameId}`, { method: 'DELETE' })
    fetchData()
  }

  async function handleExportPDF() {
    window.print()
  }

  if (!thread) return <div className="p-8">読み込み中...</div>

  return (
    <main className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h1 className="text-2xl font-bold">{thread.title}</h1>
        <div className="flex gap-2">
          <button
            onClick={handleExportPDF}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            PDF出力
          </button>
          <button
            onClick={() => router.push('/')}
            className="border px-4 py-2 rounded hover:bg-gray-100"
          >
            戻る
          </button>
        </div>
      </div>

      {/* 新規枠追加フォーム */}
      <form onSubmit={handleAddFrame} className="mb-8 border rounded p-4 print:hidden">
        <h2 className="font-bold mb-4">新規枠追加</h2>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">
              撮影必要場所
            </label>
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              required
              className="w-full border rounded p-2"
              placeholder="例: 完全竣工写真"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">
              見本写真（任意）
            </label>
            <input
              id="sampleImageInput"
              type="file"
              accept="image/*"
              onChange={(e) => setSampleImage(e.target.files?.[0] || null)}
              className="w-full"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            追加
          </button>
        </div>
      </form>

      {/* 写真枠一覧 */}
      <div className="space-y-6">
        {frames.map((frame) => (
          <div
            key={frame.id}
            className="border-4 border-green-600 rounded p-4 print:break-inside-avoid"
          >
            {/* ラベル編集 */}
            <div className="mb-4">
              {editingFrameId === frame.id ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingLabel}
                    onChange={(e) => setEditingLabel(e.target.value)}
                    className="flex-1 border rounded p-2 font-bold"
                  />
                  <button
                    onClick={() => handleUpdateLabel(frame.id)}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setEditingFrameId(null)}
                    className="border px-4 py-2 rounded"
                  >
                    キャンセル
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg bg-yellow-200 px-2 py-1 inline-block">
                    撮影必要場所: {frame.label}
                  </h3>
                  <div className="flex gap-2 print:hidden">
                    <button
                      onClick={() => {
                        setEditingFrameId(frame.id)
                        setEditingLabel(frame.label)
                      }}
                      className="text-blue-500 text-sm hover:underline"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDuplicateFrame(frame.id)}
                      className="text-green-500 text-sm hover:underline"
                    >
                      複製
                    </button>
                    <button
                      onClick={() => handleDeleteFrame(frame.id)}
                      className="text-red-500 text-sm hover:underline"
                    >
                      削除
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 見本写真と添付欄 */}
            <div className="grid grid-cols-2 gap-4">
              {/* 見本写真 */}
              <div>
                <p className="text-sm font-medium mb-2">見本の写真</p>
                {frame.sampleImageUrl ? (
                  <img
                    src={frame.sampleImageUrl}
                    alt="見本写真"
                    className="w-full h-64 object-contain border rounded"
                  />
                ) : (
                  <div className="w-full h-64 border rounded flex items-center justify-center text-gray-400">
                    見本写真なし
                  </div>
                )}
                
              </div>

              {/* 写真添付欄 */}
              <div>
                <p className="text-sm font-medium mb-2 bg-yellow-200 px-2 py-1 inline-block">
                  写真添付欄
                </p>
                {frame.attachedImageUrl ? (
                  <div className="relative group">
                    <img
                      src={frame.attachedImageUrl}
                      alt="添付写真"
                      className="w-full h-64 object-contain border rounded"
                    />
                    <label className="absolute top-2 right-2 bg-blue-500 text-white px-3 py-1 rounded cursor-pointer opacity-0 group-hover:opacity-100 print:hidden">
                      変更
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleAttachImage(frame.id, file)
                        }}
                      />
                    </label>
                  </div>
                ) : (
                  <label className="w-full h-64 border-2 border-dashed rounded flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 print:hidden">
                    <span className="text-4xl mb-2">📷</span>
                    <span className="text-gray-600">クリックして写真を選択</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleAttachImage(frame.id, file)
                      }}
                    />
                  </label>
                )}
                
              </div>
            </div>
          </div>
        ))}
      </div>

      {frames.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          枠を追加してください
        </div>
      )}

      {/* 印刷用スタイル */}
      <style jsx global>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </main>
  )
}
