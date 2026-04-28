'use client'

import { useState } from 'react'
import { X, Image, Video, ExternalLink } from 'lucide-react'
import { Message } from '@/types'

interface MediaGalleryProps {
  messages: Message[]
  onClose:  () => void
}

type MediaFilter = 'all' | 'images' | 'videos'

export function MediaGallery({ messages, onClose }: MediaGalleryProps) {
  const [filter, setFilter] = useState<MediaFilter>('all')

  const media = messages.filter((m) => {
    if (m.type === 'image') return filter !== 'videos'
    if (m.type === 'video') return filter !== 'images'
    return false
  })

  const images = messages.filter((m) => m.type === 'image').length
  const videos = messages.filter((m) => m.type === 'video').length

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/80 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-forest-950/90 border-b border-forest-800/50">
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-forest-500 hover:text-white hover:bg-forest-800/50 transition-colors"
        >
          <X size={20} />
        </button>
        <div className="flex-1">
          <h2 className="text-base font-semibold text-white">Shared Media</h2>
          <p className="text-xs text-forest-500">{images} images · {videos} videos</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-forest-900/60 rounded-xl p-1">
          {(['all', 'images', 'videos'] as MediaFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                filter === f ? 'bg-forest-600 text-white' : 'text-forest-500 hover:text-forest-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        {media.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <span className="text-5xl">🌿</span>
            <p className="text-forest-500 text-sm">No {filter === 'all' ? 'media' : filter} shared yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1.5">
            {media.map((msg) => (
              <MediaTile key={msg.id} message={msg} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function MediaTile({ message }: { message: Message }) {
  const isVideo = message.type === 'video'
  const url     = message.mediaURL ?? ''

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="relative aspect-square rounded-xl overflow-hidden bg-forest-900 border border-forest-800/50 group block"
    >
      {isVideo ? (
        <>
          <video src={url} className="w-full h-full object-cover" muted />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
            <Video size={28} className="text-white drop-shadow" />
          </div>
        </>
      ) : (
        <>
          <img src={url} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-all">
            <ExternalLink size={20} className="text-white" />
          </div>
        </>
      )}

      {/* Type badge */}
      <span className="absolute top-1.5 left-1.5 bg-black/50 rounded-md p-0.5">
        {isVideo
          ? <Video size={10} className="text-white" />
          : <Image size={10} className="text-white" />
        }
      </span>
    </a>
  )
}
