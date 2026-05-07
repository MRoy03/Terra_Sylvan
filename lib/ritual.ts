export interface RitualEntry {
  date:        string
  prompt:      string
  answer:      string
  completedAt: number
}

const PROMPTS: string[] = [
  'What seed of intention are you planting today?',
  'Name one thing in your life that is quietly growing.',
  'What would you like to let go of, like autumn leaves?',
  'What small act of kindness can you offer the forest today?',
  'What are you most grateful to be rooted in right now?',
  'Describe the weather inside you today in one sentence.',
  'What is one thing you want to nurture this week?',
  'Which relationship in your life needs more sunlight?',
  'What fear can you name, so it loses some of its shadow?',
  'What would your tree say if it could speak to you?',
  'What are you in the middle of becoming?',
  'Name one thing that felt effortless yesterday.',
  'What would rest look like for you today?',
  'What part of yourself have you been ignoring?',
  'Who in your forest deserves a leaf letter today?',
  'What does your ideal day look like right now?',
  'Describe one beauty you noticed in the last 24 hours.',
  'What is something you know but have been afraid to act on?',
  'What would you do today if you trusted yourself completely?',
  'What old story about yourself is ready to compost?',
  'What does your body need today?',
  'Name one thing you are building, even if slowly.',
  'What brings you back to yourself when you feel lost?',
  'What question are you living with right now?',
  'What is something you have outgrown that still feels familiar?',
  'Name a moment this week when you felt most alive.',
  'What boundary are you learning to protect?',
  'What is something small that brings you genuine joy?',
  'What are you quietly proud of?',
  'What would you tell the version of yourself from one year ago?',
]

export function getDailyPrompt(): string {
  const dayIndex = Math.floor(Date.now() / 86_400_000)
  return PROMPTS[dayIndex % PROMPTS.length]
}

export function getTodayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
