export interface Sticker {
  emoji:     string
  label:     string
  animation: string
}

export interface StickerPack {
  id:       string
  name:     string
  icon:     string
  stickers: Sticker[]
}

export const STICKER_PACKS: StickerPack[] = [
  {
    id: 'creatures', name: 'Forest Creatures', icon: '🦊',
    stickers: [
      { emoji: '🦊', label: 'Fox',         animation: 'sticker-bounce'   },
      { emoji: '🦉', label: 'Owl',         animation: 'sticker-float'    },
      { emoji: '🦌', label: 'Deer',        animation: 'sticker-sway'     },
      { emoji: '🐸', label: 'Frog',        animation: 'sticker-bounce'   },
      { emoji: '🍄', label: 'Mushroom',    animation: 'sticker-pulse'    },
      { emoji: '🐇', label: 'Bunny',       animation: 'sticker-hop'      },
      { emoji: '🐻', label: 'Bear',        animation: 'sticker-sway'     },
      { emoji: '🐿️', label: 'Squirrel',   animation: 'sticker-bounce'   },
      { emoji: '🦋', label: 'Butterfly',   animation: 'sticker-flutter'  },
      { emoji: '🦔', label: 'Hedgehog',    animation: 'sticker-wiggle'   },
      { emoji: '🦅', label: 'Eagle',       animation: 'sticker-float'    },
      { emoji: '🦊🌿', label: 'Forest Fox', animation: 'sticker-bounce'  },
      { emoji: '🦝', label: 'Raccoon',     animation: 'sticker-wiggle'   },
      { emoji: '🦜', label: 'Parrot',      animation: 'sticker-sway'     },
      { emoji: '🦎', label: 'Lizard',      animation: 'sticker-wiggle'   },
    ],
  },
  {
    id: 'weather', name: 'Weather & Nature', icon: '🌈',
    stickers: [
      { emoji: '🌧️', label: 'Rain',        animation: 'sticker-fall'     },
      { emoji: '⛈️',  label: 'Thunder',    animation: 'sticker-shake'    },
      { emoji: '🌈',  label: 'Rainbow',    animation: 'sticker-glow'     },
      { emoji: '🍂',  label: 'Leaves',     animation: 'sticker-spiral'   },
      { emoji: '⚡',  label: 'Lightning',   animation: 'sticker-flash'    },
      { emoji: '❄️',  label: 'Snow',       animation: 'sticker-spin-slow'},
      { emoji: '🌊',  label: 'Wave',       animation: 'sticker-sway'     },
      { emoji: '🌪️', label: 'Tornado',    animation: 'sticker-spin'     },
      { emoji: '☀️',  label: 'Sun',        animation: 'sticker-pulse'    },
      { emoji: '🌙',  label: 'Moon',       animation: 'sticker-glow'     },
      { emoji: '🌟',  label: 'Star',       animation: 'sticker-twinkle'  },
      { emoji: '🌬️', label: 'Wind',       animation: 'sticker-float'    },
      { emoji: '🌸',  label: 'Blossom',    animation: 'sticker-spiral'   },
      { emoji: '🌺',  label: 'Flower',     animation: 'sticker-pulse'    },
      { emoji: '🌊✨', label: 'Shimmer',   animation: 'sticker-glow'     },
    ],
  },
  {
    id: 'tree_moods', name: 'Tree Moods', icon: '🌳',
    stickers: [
      { emoji: '🌳😊', label: 'Happy Tree',     animation: 'sticker-bounce'  },
      { emoji: '🌳😴', label: 'Sleepy Tree',    animation: 'sticker-float'   },
      { emoji: '🌳😮', label: 'Surprised Tree', animation: 'sticker-pop'     },
      { emoji: '🌳😢', label: 'Sad Tree',       animation: 'sticker-sway'    },
      { emoji: '🌳💪', label: 'Strong Tree',    animation: 'sticker-pulse'   },
      { emoji: '🌳🥳', label: 'Party Tree',     animation: 'sticker-wiggle'  },
      { emoji: '🌳😡', label: 'Angry Tree',     animation: 'sticker-shake'   },
      { emoji: '🌳🤗', label: 'Hugging Tree',   animation: 'sticker-bounce'  },
      { emoji: '🌳🤔', label: 'Thinking Tree',  animation: 'sticker-sway'    },
      { emoji: '🌳❤️', label: 'Loving Tree',    animation: 'sticker-pulse'   },
      { emoji: '🌲🎉', label: 'Party Pine',     animation: 'sticker-bounce'  },
      { emoji: '🌴😎', label: 'Cool Palm',      animation: 'sticker-sway'    },
      { emoji: '🌿✨', label: 'Magical Leaf',   animation: 'sticker-twinkle' },
      { emoji: '🍀💚', label: 'Lucky Clover',   animation: 'sticker-spin-slow'},
      { emoji: '🎋🎵', label: 'Bamboo Vibes',   animation: 'sticker-float'   },
    ],
  },
  {
    id: 'tropical', name: 'Tropical Vibes', icon: '🌴',
    stickers: [
      { emoji: '🌴',  label: 'Palm',        animation: 'sticker-sway'    },
      { emoji: '🦜',  label: 'Parrot',      animation: 'sticker-bounce'  },
      { emoji: '🐠',  label: 'Fish',        animation: 'sticker-float'   },
      { emoji: '🌺',  label: 'Hibiscus',    animation: 'sticker-pulse'   },
      { emoji: '🍍',  label: 'Pineapple',   animation: 'sticker-bounce'  },
      { emoji: '🦋',  label: 'Butterfly',   animation: 'sticker-flutter' },
      { emoji: '🐊',  label: 'Croc',        animation: 'sticker-wiggle'  },
      { emoji: '🌊',  label: 'Ocean',       animation: 'sticker-sway'    },
      { emoji: '🦚',  label: 'Peacock',     animation: 'sticker-pop'     },
      { emoji: '🌈',  label: 'Rainbow',     animation: 'sticker-glow'    },
      { emoji: '🍌',  label: 'Banana',      animation: 'sticker-bounce'  },
      { emoji: '🐢',  label: 'Turtle',      animation: 'sticker-float'   },
      { emoji: '🌞',  label: 'Sunshine',    animation: 'sticker-pulse'   },
      { emoji: '🦩',  label: 'Flamingo',    animation: 'sticker-sway'    },
      { emoji: '🌿',  label: 'Leaf',        animation: 'sticker-spiral'  },
    ],
  },
  {
    id: 'arctic', name: 'Arctic & Tundra', icon: '❄️',
    stickers: [
      { emoji: '🐧',   label: 'Penguin',    animation: 'sticker-bounce'  },
      { emoji: '🐻‍❄️', label: 'Polar Bear', animation: 'sticker-sway'    },
      { emoji: '❄️',   label: 'Snowflake',  animation: 'sticker-spin-slow'},
      { emoji: '🌨️',  label: 'Snowfall',   animation: 'sticker-fall'    },
      { emoji: '🦭',   label: 'Seal',       animation: 'sticker-wiggle'  },
      { emoji: '🐺',   label: 'Wolf',       animation: 'sticker-howl'    },
      { emoji: '🌌',   label: 'Aurora',     animation: 'sticker-glow'    },
      { emoji: '🏔️',  label: 'Peak',       animation: 'sticker-pulse'   },
      { emoji: '🦅',   label: 'Eagle',      animation: 'sticker-float'   },
      { emoji: '⛄',   label: 'Snowman',    animation: 'sticker-bounce'  },
      { emoji: '🌟',   label: 'North Star', animation: 'sticker-twinkle' },
      { emoji: '🦌',   label: 'Reindeer',   animation: 'sticker-sway'    },
      { emoji: '🌬️',  label: 'Frost',      animation: 'sticker-float'   },
      { emoji: '🫐',   label: 'Cloudberry', animation: 'sticker-bounce'  },
      { emoji: '🌊❄️', label: 'Frozen Sea', animation: 'sticker-spin-slow'},
    ],
  },
  {
    id: 'mountain', name: 'Mountain & Peaks', icon: '⛰️',
    stickers: [
      { emoji: '🦅',  label: 'Eagle',       animation: 'sticker-float'   },
      { emoji: '🐐',  label: 'Mountain Goat',animation: 'sticker-bounce' },
      { emoji: '🦌',  label: 'Elk',         animation: 'sticker-sway'    },
      { emoji: '⛰️', label: 'Peak',        animation: 'sticker-pulse'   },
      { emoji: '🌲',  label: 'Alpine Pine', animation: 'sticker-sway'    },
      { emoji: '🦊',  label: 'Mountain Fox',animation: 'sticker-bounce'  },
      { emoji: '🐻',  label: 'Bear',        animation: 'sticker-sway'    },
      { emoji: '🦝',  label: 'Raccoon',     animation: 'sticker-wiggle'  },
      { emoji: '🌨️', label: 'Blizzard',    animation: 'sticker-spin'    },
      { emoji: '🏔️', label: 'Summit',      animation: 'sticker-glow'    },
      { emoji: '🌅',  label: 'Sunrise',     animation: 'sticker-pulse'   },
      { emoji: '⭐',  label: 'Star',        animation: 'sticker-twinkle' },
      { emoji: '🍀',  label: 'Alpine Clover',animation: 'sticker-spin-slow'},
      { emoji: '🌿',  label: 'Moss',        animation: 'sticker-float'   },
      { emoji: '🏕️', label: 'Campfire',    animation: 'sticker-pulse'   },
    ],
  },
  {
    id: 'mystic', name: 'Mystic Forest', icon: '✨',
    stickers: [
      { emoji: '🦄',  label: 'Unicorn',     animation: 'sticker-glow'    },
      { emoji: '✨',  label: 'Sparkle',     animation: 'sticker-twinkle' },
      { emoji: '🧚',  label: 'Fairy',       animation: 'sticker-flutter' },
      { emoji: '🍄✨',label: 'Magic Shroom', animation: 'sticker-pulse'  },
      { emoji: '🔮',  label: 'Crystal Ball',animation: 'sticker-glow'    },
      { emoji: '🌙✨',label: 'Moon Magic',  animation: 'sticker-float'   },
      { emoji: '🦋✨',label: 'Spirit Butterfly',animation: 'sticker-flutter'},
      { emoji: '🌌',  label: 'Cosmos',      animation: 'sticker-spin-slow'},
      { emoji: '🌿🔮',label: 'Forest Magic', animation: 'sticker-glow'   },
      { emoji: '🎋',  label: 'Bamboo Spirit',animation: 'sticker-sway'   },
      { emoji: '🐉',  label: 'Forest Dragon',animation: 'sticker-float'  },
      { emoji: '🌟💫',label: 'Stardust',    animation: 'sticker-twinkle' },
      { emoji: '🌱✨',label: 'Life Sprout', animation: 'sticker-pulse'   },
      { emoji: '🍃🌙',label: 'Night Leaf',  animation: 'sticker-spiral'  },
      { emoji: '🦊✨',label: 'Spirit Fox',  animation: 'sticker-glow'    },
    ],
  },
  {
    id: 'night', name: 'Night Forest', icon: '🌙',
    stickers: [
      { emoji: '🦇',  label: 'Bat',         animation: 'sticker-flutter' },
      { emoji: '🐺',  label: 'Wolf',        animation: 'sticker-howl'    },
      { emoji: '🌙',  label: 'Moon',        animation: 'sticker-glow'    },
      { emoji: '⭐',  label: 'Stars',       animation: 'sticker-twinkle' },
      { emoji: '🔥',  label: 'Fire',        animation: 'sticker-pulse'   },
      { emoji: '🦉',  label: 'Night Owl',   animation: 'sticker-float'   },
      { emoji: '🌌',  label: 'Milky Way',   animation: 'sticker-spin-slow'},
      { emoji: '🕷️', label: 'Spider',      animation: 'sticker-bounce'  },
      { emoji: '🌑',  label: 'Dark Moon',   animation: 'sticker-pulse'   },
      { emoji: '🦋',  label: 'Night Moth',  animation: 'sticker-flutter' },
      { emoji: '🌿🌙',label: 'Moonlit Fern',animation: 'sticker-float'  },
      { emoji: '🐛',  label: 'Glow Worm',   animation: 'sticker-glow'    },
      { emoji: '🌲🌙',label: 'Moonlit Pine',animation: 'sticker-sway'   },
      { emoji: '💀',  label: 'Skull Wood',  animation: 'sticker-wiggle'  },
      { emoji: '🦊🌙',label: 'Night Fox',   animation: 'sticker-bounce'  },
    ],
  },
  {
    id: 'ocean', name: 'Ocean & Mangrove', icon: '🌊',
    stickers: [
      { emoji: '🦀',  label: 'Crab',        animation: 'sticker-wiggle'  },
      { emoji: '🐠',  label: 'Clownfish',   animation: 'sticker-float'   },
      { emoji: '🌊',  label: 'Wave',        animation: 'sticker-sway'    },
      { emoji: '🦈',  label: 'Shark',       animation: 'sticker-float'   },
      { emoji: '🐙',  label: 'Octopus',     animation: 'sticker-wiggle'  },
      { emoji: '🦞',  label: 'Lobster',     animation: 'sticker-bounce'  },
      { emoji: '🐡',  label: 'Pufferfish',  animation: 'sticker-pulse'   },
      { emoji: '🐚',  label: 'Shell',       animation: 'sticker-spin-slow'},
      { emoji: '🦭',  label: 'Seal',        animation: 'sticker-sway'    },
      { emoji: '🌴',  label: 'Mangrove',    animation: 'sticker-sway'    },
      { emoji: '🐬',  label: 'Dolphin',     animation: 'sticker-bounce'  },
      { emoji: '🦑',  label: 'Squid',       animation: 'sticker-float'   },
      { emoji: '🌊🌙',label: 'Night Tide',  animation: 'sticker-glow'    },
      { emoji: '🐊',  label: 'Mangrove Croc',animation: 'sticker-sway'  },
      { emoji: '🌺',  label: 'Sea Hibiscus',animation: 'sticker-pulse'   },
    ],
  },
  {
    id: 'feelings', name: 'Forest Feelings', icon: '🌿',
    stickers: [
      { emoji: '🤗',  label: 'Huggy',       animation: 'sticker-bounce'  },
      { emoji: '😴',  label: 'Cozy Sleep',  animation: 'sticker-float'   },
      { emoji: '🥰',  label: 'In Love',     animation: 'sticker-pulse'   },
      { emoji: '💚',  label: 'Green Love',  animation: 'sticker-glow'    },
      { emoji: '😤',  label: 'Determined',  animation: 'sticker-shake'   },
      { emoji: '🌱💪',label: 'Growing Strong',animation: 'sticker-bounce'},
      { emoji: '🥺',  label: 'Pleading',    animation: 'sticker-wiggle'  },
      { emoji: '🎉',  label: 'Party!',      animation: 'sticker-bounce'  },
      { emoji: '🤔🌿',label: 'Deep Thought',animation: 'sticker-sway'   },
      { emoji: '😂',  label: 'Laughing',    animation: 'sticker-wiggle'  },
      { emoji: '🥳🌿',label: 'Forest Party',animation: 'sticker-wiggle' },
      { emoji: '🌿❤️',label: 'Forest Love', animation: 'sticker-pulse'  },
      { emoji: '😊✨',label: 'Happy Glow',  animation: 'sticker-glow'    },
      { emoji: '🌊😌',label: 'Calm',        animation: 'sticker-float'   },
      { emoji: '🎋🙏',label: 'Gratitude',   animation: 'sticker-sway'    },
    ],
  },
]

// Quick lookup: emoji string → animation class
export const STICKER_ANIMATION: Record<string, string> = {}
for (const pack of STICKER_PACKS) {
  for (const s of pack.stickers) {
    STICKER_ANIMATION[s.emoji] = s.animation
  }
}

// Deterministic fallback animation based on first code point
export function getStickerAnimation(emoji: string): string {
  if (STICKER_ANIMATION[emoji]) return STICKER_ANIMATION[emoji]
  const ANIMS = ['sticker-bounce','sticker-float','sticker-wiggle','sticker-pulse','sticker-sway']
  return ANIMS[(emoji.codePointAt(0) ?? 0) % ANIMS.length]
}
