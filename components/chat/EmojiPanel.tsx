'use client'

import { useState } from 'react'
import { STICKER_PACKS } from '@/lib/stickers'

const CATEGORIES: Record<string, string[]> = {
  '😊 Smileys': ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','😉','😊','😇','🥰','😍','🤩','😘','😋','😜','🤪','😎','🥳','😏','😒','🙄','😬','😔','😭','🥺','😤','😡','🤬','😈'],
  '🌿 Forest':  ['🌱','🌿','🍃','🌲','🌳','🌴','🎋','🌾','🍀','🌺','🌸','🌼','🌻','🌷','🍁','🍂','🍄','🌰','🌵','🌊','🏔️','⭐','🌙','☀️','🌈','❄️','🔥','💧','🌬️','🍃'],
  '👍 People':  ['👍','👎','👋','✋','🤝','💪','🙏','👏','🤗','💏','💑','👤','💃','🕺','🤲','🫂','❤️','🧡','💛','💚','💙','💜','🖤','💔','💕','💯','✨','🔥','💫','🌟'],
  '🎉 Fun':     ['🎉','🎊','🎈','🎁','🥳','🏆','🥇','🎯','🎮','🎲','🎭','🎨','🎵','🎶','🎤','🎧','🎸','🥁','🎺','🎻','🎬','🍕','🍔','🍟','🍩','🎂','🍰','🧁','🍫','🥂'],
  '🐾 Animals': ['🐝','🦋','🐛','🐞','🦊','🐿️','🦔','🦅','🦜','🐢','🦎','🐸','🦉','🦇','🐺','🦌','🐗','🦝','🐇','🦃','🐈','🐕','🐘','🦒','🦓','🐻','🐼','🐨','🦁','🐯'],
}

type Tab = 'emoji' | 'sticker'

interface EmojiPanelProps {
  onEmojiSelect:   (emoji: string) => void
  onStickerSelect: (sticker: string) => void
}

export function EmojiPanel({ onEmojiSelect, onStickerSelect }: EmojiPanelProps) {
  const [tab,        setTab]        = useState<Tab>('sticker')
  const [category,   setCategory]   = useState(Object.keys(CATEGORIES)[0])
  const [packIndex,  setPackIndex]  = useState(0)

  const currentPack = STICKER_PACKS[packIndex]

  return (
    <div className="w-full bg-forest-950/98 border border-forest-800/50 rounded-2xl overflow-hidden shadow-2xl">
      {/* Tab bar */}
      <div className="flex border-b border-forest-800/50">
        {(['sticker', 'emoji'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-sm font-semibold capitalize transition-colors
              ${tab === t ? 'text-forest-300 border-b-2 border-forest-500 bg-forest-900/30' : 'text-forest-600 hover:text-forest-400'}`}
          >
            {t === 'emoji' ? '😊 Emoji' : '🦊 Sticker Packs'}
          </button>
        ))}
      </div>

      {tab === 'sticker' ? (
        <>
          {/* Pack selector (horizontal scroll of pack icons) */}
          <div className="flex gap-1 px-2 py-2 overflow-x-auto scrollbar-hide border-b border-forest-800/30 bg-forest-950/50">
            {STICKER_PACKS.map((pack, i) => (
              <button
                key={pack.id}
                onClick={() => setPackIndex(i)}
                title={pack.name}
                className={`flex-shrink-0 w-9 h-9 rounded-xl text-xl flex items-center justify-center transition-all
                  ${packIndex === i
                    ? 'bg-forest-700 scale-110 shadow-lg'
                    : 'hover:bg-forest-800/60'}`}
              >
                {pack.icon}
              </button>
            ))}
          </div>

          {/* Pack name */}
          <div className="px-3 py-1.5 text-[11px] text-forest-500 font-semibold tracking-wide uppercase border-b border-forest-800/20">
            {currentPack.name}
          </div>

          {/* Sticker grid */}
          <div className="grid grid-cols-5 gap-1 p-2 max-h-48 overflow-y-auto">
            {currentPack.stickers.map(s => (
              <button
                key={s.emoji}
                onClick={() => onStickerSelect(s.emoji)}
                title={s.label}
                className="flex flex-col items-center gap-0.5 p-1.5 rounded-xl hover:bg-forest-800/60 transition-all hover:scale-110 group"
              >
                <span className={`text-3xl leading-none select-none ${s.animation}`}>{s.emoji}</span>
                <span className="text-[8px] text-forest-600 group-hover:text-forest-400 truncate w-full text-center leading-tight">
                  {s.label}
                </span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Category tabs */}
          <div className="flex gap-1 px-2 py-1.5 overflow-x-auto scrollbar-hide border-b border-forest-800/30">
            {Object.keys(CATEGORIES).map(cat => (
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
          <div className="grid grid-cols-8 gap-0.5 p-2 max-h-48 overflow-y-auto">
            {(CATEGORIES[category] ?? []).map(emoji => (
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
      )}
    </div>
  )
}
