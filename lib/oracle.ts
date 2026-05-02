export interface OracleFortune {
  text:    string
  emoji:   string
  season?: 'spring' | 'summer' | 'autumn' | 'winter'
}

const FORTUNES: OracleFortune[] = [
  { emoji: '🌱', text: 'A seed planted in silence grows into the mightiest tree. Your patience today is tomorrow\'s canopy.' },
  { emoji: '🌿', text: 'The forest does not hurry, yet everything is accomplished. Trust your roots.' },
  { emoji: '🦊', text: 'The fox who listens to the forest hears what others miss. Pay attention to the quiet signs.' },
  { emoji: '🍃', text: 'Even leaves that fall become the soil for new beginnings. Release what no longer serves you.' },
  { emoji: '🌲', text: 'Ancient trees have weathered a thousand storms. Your strength is deeper than you know.' },
  { emoji: '🌙', text: 'In the moonlit forest, every shadow holds a secret. What truth are you ready to discover?' },
  { emoji: '🦋', text: 'The butterfly does not remember being a caterpillar. Your transformation is already underway.' },
  { emoji: '🌊', text: 'Water finds its way around every stone. Flexibility is not weakness — it is wisdom.' },
  { emoji: '🌺', text: 'The most fragrant flowers bloom where no one expects them. Your gift will surprise you.' },
  { emoji: '🍄', text: 'Beneath the forest floor, mycelium connects everything. You are never as alone as you feel.' },
  { emoji: '🦉', text: 'The owl sees in darkness what daylight conceals. Seek the hidden truth in what troubles you.' },
  { emoji: '🌅', text: 'Each dawn is a forest waking from dream. What will you grow in the hours ahead?' },
  { emoji: '⭐', text: 'Even the tallest tree began as a story told by starlight. Dream without limit tonight.' },
  { emoji: '🌨️', text: 'Snow covers all things equally. Rest, for the spring you cannot yet see is already decided.' },
  { emoji: '🌈', text: 'The rainbow needs both rain and light. Your struggles are painting something beautiful.' },
  { emoji: '🐸', text: 'The frog knows every secret of the pond. Stillness is a kind of knowing.' },
  { emoji: '🌬️', text: 'The wind shapes the tree without touching it twice the same way. Change is your sculptor.' },
  { emoji: '🍀', text: 'Lucky is not the one who finds the four-leaf clover. Lucky is the one who stops to look.' },
  { emoji: '🦌', text: 'The deer follows ancient trails worn into the earth by thousands before. You walk a storied path.' },
  { emoji: '🔥', text: 'Forest fires clear the way for new growth. What must burn away to make room for your next chapter?' },
  { emoji: '🌙', text: 'The forest remembers every moon that has risen over it. What are you worth remembering for?' },
  { emoji: '🦔', text: 'The hedgehog rolls into a perfect circle — complete within itself. You already have what you need.' },
  { emoji: '🌸', text: 'Cherry blossoms fall at the peak of their beauty. Know when your moment has fully bloomed.' },
  { emoji: '🐺', text: 'The wolf howls not from loneliness but from belonging. Speak your truth; others will answer.' },
  { emoji: '🌲', text: 'Two oaks cannot share the same sunbeam, yet they stand side by side for centuries. Find the balance.' },
  { emoji: '💧', text: 'A single raindrop carries the memory of the cloud, the river, and the sea. You are more than this moment.' },
  { emoji: '🐇', text: 'The rabbit who knows every burrow never fears the hawk. Prepare your refuge before you need it.' },
  { emoji: '🌿', text: 'Moss grows where water gathers unseen. Seek the nourishment that flows beneath the surface.' },
  { emoji: '🦅', text: 'The eagle does not fight the storm — it rides it. Rise above what weighs you down.' },
  { emoji: '🍂', text: 'Autumn teaches the most important lesson: letting go is how we make room for beauty.' },
  { emoji: '✨', text: 'In every forest clearing, starlight touches the ground. Seek the open space within yourself.' },
  { emoji: '🌱', text: 'The seed does not ask if the soil is worthy. Plant yourself boldly and see what grows.' },
  { emoji: '🌊', text: 'Tidal forests survive by bending. Rigidity before the storm is the only true fragility.' },
  { emoji: '🍁', text: 'The maple does not mourn its own colour. Whatever you are becoming — lean into it.' },
  { emoji: '🌙', text: 'Night-blooming flowers know that beauty does not require an audience. Bloom anyway.' },
]

// Returns a daily fortune that changes every 24h but is consistent within a day
export function getDailyFortune(): OracleFortune {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000
  )
  return FORTUNES[dayOfYear % FORTUNES.length]
}

// Returns a random fortune for in-chat oracle requests
export function getRandomFortune(): OracleFortune {
  return FORTUNES[Math.floor(Math.random() * FORTUNES.length)]
}
