import { UserProfile } from '@/types'

export interface Badge {
  id:          string
  emoji:       string
  label:       string
  description: string
  rarity:      'common' | 'rare' | 'legendary'
}

export const ALL_BADGES: Badge[] = [
  { id: 'seedling',        emoji: '🌱', label: 'Seedling',         rarity: 'common',    description: 'Just sprouted — welcome to the forest!'                  },
  { id: 'sapling',         emoji: '🌿', label: 'Sapling',          rarity: 'common',    description: 'Your tree is growing — keep chatting!'                   },
  { id: 'ancient_oak',     emoji: '🌳', label: 'Ancient Oak',      rarity: 'legendary', description: 'Account age over 90 days — you are a legend of the forest'},
  { id: 'night_owl',       emoji: '🦉', label: 'Night Owl',        rarity: 'rare',      description: 'Active between 10 PM – 4 AM — the forest never sleeps'   },
  { id: 'early_bloom',     emoji: '🌅', label: 'Early Bloom',      rarity: 'common',    description: 'Active between 5 AM – 9 AM — first light of the forest'  },
  { id: 'community_gardener', emoji: '🪴', label: 'Community Gardener', rarity: 'rare', description: 'Joined 3 or more forest communities'                      },
  { id: 'root_weaver',     emoji: '🌿', label: 'Root Weaver',      rarity: 'rare',      description: 'Connected with 10 or more forest friends'                },
  { id: 'leaf_storm',      emoji: '🍃', label: 'Leaf Storm',       rarity: 'common',    description: 'Sent over 50 messages — your branches are full'          },
  { id: 'image_bloomer',   emoji: '🌸', label: 'Image Bloomer',    rarity: 'common',    description: 'Shared over 10 images — painted the forest with colour'  },
  { id: 'fruit_bearer',    emoji: '🍎', label: 'Fruit Bearer',     rarity: 'rare',      description: 'Shared over 5 videos — your tree bears rich fruit'       },
  { id: 'seed_collector',  emoji: '🌰', label: 'Seed Collector',   rarity: 'rare',      description: 'Collected 50 or more seeds from fellow forest dwellers'  },
  { id: 'winter_survivor', emoji: '❄️', label: 'Winter Survivor',  rarity: 'legendary', description: 'Active in winter season — enduring through the cold'     },
  { id: 'spring_herald',   emoji: '🌸', label: 'Spring Herald',    rarity: 'rare',      description: 'Active in spring season — first to blossom'              },
  { id: 'summer_flourish', emoji: '☀️', label: 'Summer Flourish',  rarity: 'common',    description: 'Active in summer season — growing in full sun'           },
  { id: 'autumn_keeper',   emoji: '🍂', label: 'Autumn Keeper',    rarity: 'rare',      description: 'Active in autumn season — keeper of the falling leaves'  },
  { id: 'fire_starter',    emoji: '🔥', label: 'Fire Starter',     rarity: 'legendary', description: 'Sent 200+ messages — ignited the whole forest'           },
]

export function computeBadges(profile: UserProfile, currentHour?: number): string[] {
  const earned: string[] = []
  const hour = currentHour ?? new Date().getHours()
  const ageInDays = (Date.now() - profile.createdAt) / 86_400_000

  // Stage-based
  if (ageInDays >= 0)  earned.push('seedling')
  if (profile.messageCount >= 5) earned.push('sapling')
  if (ageInDays >= 90) earned.push('ancient_oak')

  // Time-based
  if (hour >= 22 || hour < 4)  earned.push('night_owl')
  if (hour >= 5  && hour < 9)  earned.push('early_bloom')

  // Activity-based
  if ((profile as any).communityCount >= 3)    earned.push('community_gardener')
  if (profile.connectionCount >= 10)           earned.push('root_weaver')
  if (profile.messageCount >= 50)              earned.push('leaf_storm')
  if (profile.imageCount   >= 10)              earned.push('image_bloomer')
  if (profile.videoCount   >= 5)               earned.push('fruit_bearer')
  if (((profile as any).seeds ?? 0) >= 50)     earned.push('seed_collector')
  if (profile.messageCount >= 200)             earned.push('fire_starter')

  // Season-based (current season)
  const month = new Date().getMonth()
  if (month >= 2 && month <= 4)  earned.push('spring_herald')
  if (month >= 5 && month <= 7)  earned.push('summer_flourish')
  if (month >= 8 && month <= 10) earned.push('autumn_keeper')
  if (month === 11 || month <= 1) earned.push('winter_survivor')

  return earned
}

export function getBadge(id: string): Badge | undefined {
  return ALL_BADGES.find(b => b.id === id)
}
