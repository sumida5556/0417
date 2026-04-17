type Image = {
  id: string
  url: string
  filename: string
  createdAt: string
}

export default function ImageGrid({ images }: { images: Image[] }) {
  if (images.length === 0) {
    return <p className="text-gray-500">画像がまだありません</p>
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((image) => (
        <div key={image.id} className="border rounded overflow-hidden">
          <img
            src={image.url}
            alt={image.filename}
            className="w-full h-48 object-cover"
          />
          <p className="text-sm p-2 text-gray-600 truncate">{image.filename}</p>
        </div>
      ))}
    </div>
  )
}