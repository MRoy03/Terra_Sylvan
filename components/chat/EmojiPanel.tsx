'use client'

import { useState } from 'react'

const CATEGORIES: Record<string, string[]> = {
  '😊 Smileys': ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','😉','😊','😇','🥰','😍','🤩','😘','😋','😜','🤪','😎','🥳','😏','😒','🙄','😬','😔','😭','🥺','😤','😡','🤬','😈'],
  '🌿 Forest':  ['🌱','🌿','🍃','🌲','🌳','🌴','🎋','🌾','🍀','🌺','🌸','🌼','🌻','🌷','🍁','🍂','🍄','🌰','🌵','🌊','🏔️','⭐','🌙','☀️','🌈','❄️','🔥','💧','🌬️','🍃'],
  '👍 People':  ['👍','👎','👋','✋','🤝','💪','🙏','👏','🤗','💏','💑','👤','💃','🕺','🤲','🫂','❤️','🧡','💛','💚','💙','💜','🖤','💔','💕','💯','✨','🔥','💫','🌟'],
  '🎉 Fun':     ['🎉','🎊','🎈','🎁','🥳','🏆','🥇','🎯','🎮','🎲','🎭','🎨','🎵','🎶','🎤','🎧','🎸','🥁','🎺','🎻','🎬','🍕','🍔','🍟','🍩','🎂','🍰','🧁','🍫','🥂'],
  '🐾 Animals': ['🐝','🦋','🐛','🐞','🦊','🐿️','🦔','🦅','🦜','🐢','🦎','🐸','🦉','🦇','🐺','🦌','🐗','🦝','🐇','🦃','🐈','🐕','🐘','🦒','🦓','🐻','🐼','🐨','🦁','🐯'],
}

const STICKERS: Record<string, string[]> = {
  '🌱 Forest':     ['🌱','🌿','🍃','🌲','🌳','🌴','🎋','🌺','🌸','🌻','🍀','🍁','🍂','🍄','🌰'],
  '😄 Moods':      ['😊','😂','❤️','🥺','😎','🤗','😴','🤔','💪','🙌','😭','🥳','😤','💯','🫂'],
  '✨ Magic':       ['✨','⭐','🌟','💫','🔥','🌈','☀️','🌙','⚡','❄️','🌊','💎','🎯','🌺','🦋'],
  '🎉 Celebrate':  ['🎉','🎊','🎈','🎁','🥳','🏆','🥇','🎯','🌟','💯','🔥','✨','💃','🕺','🫡'],
}

type Tab = 'emoji' | 'sticker'

interface EmojiPanelProps {
  onEmojiSelect:   (emoji: string) => void
  onStickerSelect: (sticker: string) => void
}

export function EmojiPanel({ onEmojiSelect, onStickerSelect }: EmojiPanelProps) {
  const [tab,      setTab]      = useState<Tab>('emoji')
  const [category, setCategory] = useState(Object.keys(CATEGORIES)[0])
  const [stickerCat, setStickerCat] = useState(Object.keys(STICKERS)[0])

  return (
    <div className="w-full bg-forest-950/95 border border-forest-800/50 rounded-2xl overflow-hidden shadow-2xl">
      {/* Tab bar */}
      <div className="flex border-b border-forest-800/50">
        {(['emoji', 'sticker'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-sm font-semibold capitalize transition-colors
              ${tab === t ? 'text-forest-300 border-b-2 border-forest-500' : 'text-forest-600 hover:text-forest-400'}`}
          >
            {t === 'emoji' ? '😊 Emoji' : '🌟 Stickers'}
          </button>
        ))}
      </div>

      {tab === 'emoji' ? (
        <>
          {/* Category tabs */}
          <div className="flex gap-1 px-2 py-1.5 overflow-x-auto scrollbar-hide border-b border-forest-800/30">
            {Object.keys(CATEGORIES).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors
                  ${category === cat ? 'bg-forest-700 text-white' : 'text-forest-500 hover:text-forest-300'}`}
              >
                {cat.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Emoji grid */}
          <div className="grid grid-cols-8 gap-0.5 p-2 max-h-48 overflow-y-auto">
            {(CATEGORIES[category] ?? []).map((emoji) => (
              <button
                key={emoji}
                onClick={() => onEmojiSelect(emoji)}
                className="text-xl p-1.5 rounded-lg hover:bg-forest-800/60 transition-colors text-center"
              >
                {emoji}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Sticker category tabs */}
          <div className="flex gap-1 px-2 py-1.5 overflow-x-auto border-b border-forest-800/30">
            {Object.keys(STICKERS).map((cat) => (
              <button
                key={cat}
                onClick={() => setStickerCat(cat)}
                className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors
                  ${stickerCat === cat ? 'bg-forest-700 text-white' : 'text-forest-500 hover:text-forest-300'}`}
              >
                {cat.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Sticker grid — large emojis */}
          <div className="grid grid-cols-5 gap-1 p-2 max-h-48 overflow-y-auto">
            {(STICKERS[stickerCat] ?? []).map((sticker) => (
              <button
                key={sticker}
                onClick={() => onStickerSelect(sticker)}
                className="text-4xl p-2 rounded-xl hover:bg-forest-800/60 transition-colors text-center"
              >
                {sticker}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
