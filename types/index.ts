export type TreeFamily =
  | 'deciduous' | 'conical' | 'cypress' | 'bristlecone' | 'willow'
  | 'bamboo' | 'birch' | 'palm' | 'banana' | 'cactus' | 'joshua'
  | 'acacia' | 'mangrove' | 'shrub'

export type TreeType =
  // Temperate (8)
  | 'oak' | 'maple' | 'cherry' | 'willow' | 'birch' | 'beech' | 'elm' | 'linden'
  // Mountain (6)
  | 'pine' | 'alpine_pine' | 'engelmann_spruce' | 'mountain_hemlock' | 'bristlecone_pine' | 'subalpine_fir'
  // Tropical (6)
  | 'bamboo' | 'coconut_palm' | 'banana_tree' | 'rubber_tree' | 'teak' | 'strangler_fig'
  // Arid (6)
  | 'saguaro' | 'joshua_tree' | 'acacia' | 'date_palm' | 'palo_verde' | 'desert_willow'
  // Mediterranean (6)
  | 'olive_tree' | 'cork_oak' | 'cypress' | 'carob' | 'stone_pine' | 'aleppo_pine'
  // Tundra (6)
  | 'arctic_willow' | 'dwarf_birch' | 'black_spruce' | 'tamarack' | 'crowberry' | 'cloudberry'
  // Mangrove (6)
  | 'red_mangrove' | 'black_mangrove' | 'white_mangrove' | 'seagrape' | 'buttonwood' | 'sea_hibiscus'

export type BiomeType =
  | 'tropical'
  | 'arid'
  | 'mediterranean'
  | 'tundra'
  | 'mangrove'
  | 'mountain'
  | 'temperate'

export type MessageType = 'text' | 'image' | 'video' | 'sticker' | 'voice' | 'emoji'

export type ConnectionStatus = 'pending' | 'accepted' | 'blocked'

export type UserRole = 'admin' | 'moderator' | 'member'

// ─── User ────────────────────────────────────────────────────────────────────
export interface UserProfile {
  uid: string
  email: string
  username: string
  displayName: string
  photoURL: string | null
  bio: string
  status: string
  treeType: TreeType
  createdAt: number
  updatedAt: number
  connectionCount: number
  messageCount: number
  imageCount: number
  videoCount: number
  isOnline?: boolean
  lastSeen?: number
}

// ─── Tree Visual Stats ────────────────────────────────────────────────────────
export interface TreeStats {
  ageInDays: number
  scale: number
  leafCount: number
  fruitCount: number
  flowerCount: number
  rootCount: number
  stage: 'seedling' | 'sapling' | 'young' | 'mature' | 'ancient'
}

// ─── Messaging ───────────────────────────────────────────────────────────────
export interface Message {
  id: string
  senderId: string
  content: string
  type: MessageType
  mediaURL?: string
  timestamp: number
  status: 'sent' | 'delivered' | 'read'
  reactions?: Record<string, string[]>
}

export interface Chat {
  id: string
  participants: string[]
  lastMessage: string
  lastMessageAt: number
  lastMessageSenderId?: string
  unreadCount: number
}

// ─── Community ───────────────────────────────────────────────────────────────
export interface Community {
  id: string
  name: string
  description: string
  biomeType: BiomeType
  creatorId: string
  createdAt: number
  memberCount: number
  coverImage: string | null
  isPrivate: boolean
}

export interface CommunityMember {
  uid: string
  role: UserRole
  joinedAt: number
}

// ─── Connection ──────────────────────────────────────────────────────────────
export interface Connection {
  uid: string
  status: ConnectionStatus
  connectedAt: number
}

// ─── Voice Call ──────────────────────────────────────────────────────────────
export interface CallSession {
  id: string
  caller: string
  callee: string
  status: 'ringing' | 'active' | 'ended' | 'declined'
  startedAt?: number
  endedAt?: number
}

// ─── Biome Config ────────────────────────────────────────────────────────────
export interface BiomeConfig {
  label: string
  emoji: string
  groundColor: string
  fogColor: string
  skyTint: string
  waterColor?: string
  description: string
}

export const BIOME_CONFIGS: Record<BiomeType, BiomeConfig> = {
  tropical:      { label: 'Tropical',      emoji: '🌴', groundColor: '#2d5a1b', fogColor: '#a8d5a2', skyTint: '#87CEEB', description: 'Dense, lush rainforest' },
  arid:          { label: 'Arid',          emoji: '🏜️', groundColor: '#c4a35a', fogColor: '#e8d5a3', skyTint: '#f0c060', description: 'Dry desert landscape' },
  mediterranean: { label: 'Mediterranean', emoji: '🫒', groundColor: '#8b7355', fogColor: '#d4c5a9', skyTint: '#b0d4f1', description: 'Warm, sunny hillside' },
  tundra:        { label: 'Tundra',        emoji: '❄️', groundColor: '#d0e8f0', fogColor: '#e8f4f8', skyTint: '#c8dce8', description: 'Frozen, sparse plains' },
  mangrove:      { label: 'Mangrove',      emoji: '🌊', groundColor: '#3d6b4f', fogColor: '#a0c8b0', skyTint: '#78a8b8', waterColor: '#1a6080', description: 'Coastal wetland forest' },
  mountain:      { label: 'Mountain',      emoji: '⛰️', groundColor: '#6b7c6b', fogColor: '#c8d4c8', skyTint: '#98b8d0', description: 'High-altitude alpine' },
  temperate:     { label: 'Temperate',     emoji: '🍁', groundColor: '#4a7c4a', fogColor: '#b8d4b8', skyTint: '#90c0e0', description: 'Balanced four-season forest' },
}

// ─── Tree Type Config ─────────────────────────────────────────────────────────
export interface TreeConfig {
  label: string
  emoji: string
  description: string
  canopyColors: [string, string, string]
  trunkColor: string
  biome: BiomeType
  family: TreeFamily
}

export const TREE_CONFIGS: Record<TreeType, TreeConfig> = {
  // ── Temperate ──────────────────────────────────────────────────────────────
  oak:    { label: 'Oak',    emoji: '🌳', description: 'Sturdy and broad — classic strength',     canopyColors: ['#2D6A4F','#40916C','#1B4332'], trunkColor: '#8B5E3C', biome: 'temperate', family: 'deciduous' },
  maple:  { label: 'Maple',  emoji: '🍁', description: 'Vivid seasonal colour — creative spirit', canopyColors: ['#C8440A','#E05A20','#A33008'], trunkColor: '#7A5030', biome: 'temperate', family: 'deciduous' },
  cherry: { label: 'Cherry', emoji: '🌸', description: 'Blossoming and vibrant — full of life',   canopyColors: ['#F4A7B9','#E8849A','#D4607A'], trunkColor: '#7A4020', biome: 'temperate', family: 'deciduous' },
  willow: { label: 'Willow', emoji: '🌿', description: 'Graceful and flowing — deep empathy',     canopyColors: ['#74C476','#98D894','#5BA05D'], trunkColor: '#8B7355', biome: 'temperate', family: 'willow' },
  birch:  { label: 'Birch',  emoji: '🪵', description: 'Slender and elegant — quiet resilience',  canopyColors: ['#B8D8A8','#C8E8B8','#A0C890'], trunkColor: '#E8E0D0', biome: 'temperate', family: 'birch' },
  beech:  { label: 'Beech',  emoji: '🌲', description: 'Smooth and vast — deep roots of wisdom',  canopyColors: ['#4A7A30','#5A8A40','#3A6A20'], trunkColor: '#B0A090', biome: 'temperate', family: 'deciduous' },
  elm:    { label: 'Elm',    emoji: '🌳', description: 'Arching and graceful — community shade',  canopyColors: ['#3A6A20','#4A7A30','#2A5A10'], trunkColor: '#8A7860', biome: 'temperate', family: 'deciduous' },
  linden: { label: 'Linden', emoji: '🌼', description: 'Heart-shaped leaves — gentle warmth',     canopyColors: ['#60A840','#70B850','#50984A'], trunkColor: '#9A8060', biome: 'temperate', family: 'deciduous' },

  // ── Mountain ───────────────────────────────────────────────────────────────
  pine:             { label: 'Pine',             emoji: '🌲', description: 'Tall and pointed — ever-green focus',    canopyColors: ['#1A5C2A','#2D7A3F','#0F3D1A'], trunkColor: '#5C3317', biome: 'mountain', family: 'conical' },
  alpine_pine:      { label: 'Alpine Pine',      emoji: '🌲', description: 'Hardy against wind and cold',             canopyColors: ['#145020','#204A1A','#0A3010'], trunkColor: '#704020', biome: 'mountain', family: 'conical' },
  engelmann_spruce: { label: 'Engelmann Spruce', emoji: '🌲', description: 'Blue-green beauty of high altitudes',    canopyColors: ['#3A6888','#4A7898','#2A5878'], trunkColor: '#6A5848', biome: 'mountain', family: 'conical' },
  mountain_hemlock: { label: 'Mountain Hemlock', emoji: '🌲', description: 'Drooping tips in mountain mist',          canopyColors: ['#2A5040','#3A6050','#1A4030'], trunkColor: '#5A4838', biome: 'mountain', family: 'conical' },
  bristlecone_pine: { label: 'Bristlecone Pine', emoji: '🌲', description: 'Ancient twisted survivor of time',        canopyColors: ['#486028','#586838','#384818'], trunkColor: '#C0A880', biome: 'mountain', family: 'bristlecone' },
  subalpine_fir:    { label: 'Subalpine Fir',    emoji: '🌲', description: 'Spire-like form touching the sky',        canopyColors: ['#205830','#306840','#104820'], trunkColor: '#687860', biome: 'mountain', family: 'conical' },

  // ── Tropical ───────────────────────────────────────────────────────────────
  bamboo:       { label: 'Bamboo',       emoji: '🎋', description: 'Resilient and fast-growing — adaptable',  canopyColors: ['#3D8B37','#5AA854','#2A6124'], trunkColor: '#6B8E23', biome: 'tropical', family: 'bamboo' },
  coconut_palm: { label: 'Coconut Palm', emoji: '🌴', description: 'Swaying in the tropical breeze',           canopyColors: ['#40A840','#50B850','#308830'], trunkColor: '#D0A060', biome: 'tropical', family: 'palm' },
  banana_tree:  { label: 'Banana Tree',  emoji: '🍌', description: 'Big bold leaves — abundant nourishment',   canopyColors: ['#50B840','#60C850','#409830'], trunkColor: '#60A040', biome: 'tropical', family: 'banana' },
  rubber_tree:  { label: 'Rubber Tree',  emoji: '🌳', description: 'Glossy leaves — steady productivity',      canopyColors: ['#1A4820','#2A5830','#0A3810'], trunkColor: '#404840', biome: 'tropical', family: 'deciduous' },
  teak:         { label: 'Teak',         emoji: '🌳', description: 'Prized and strong — enduring legacy',      canopyColors: ['#508020','#608830','#407010'], trunkColor: '#804820', biome: 'tropical', family: 'deciduous' },
  strangler_fig:{ label: 'Strangler Fig',emoji: '🌳', description: 'Embraces and grows — unstoppable life',    canopyColors: ['#3A6830','#4A7840','#2A5820'], trunkColor: '#C8C0A0', biome: 'tropical', family: 'deciduous' },

  // ── Arid ───────────────────────────────────────────────────────────────────
  saguaro:      { label: 'Saguaro',       emoji: '🌵', description: 'Iconic desert sentinel — patient strength', canopyColors: ['#507850','#608858','#406848'], trunkColor: '#507850', biome: 'arid', family: 'cactus' },
  joshua_tree:  { label: 'Joshua Tree',   emoji: '🌵', description: 'Spiky survivor — fierce independence',       canopyColors: ['#588060','#688870','#486850'], trunkColor: '#806848', biome: 'arid', family: 'joshua' },
  acacia:       { label: 'Acacia',        emoji: '🌳', description: 'Flat-topped and resilient — social shelter', canopyColors: ['#A0B840','#B0C850','#909830'], trunkColor: '#8A7040', biome: 'arid', family: 'acacia' },
  date_palm:    { label: 'Date Palm',     emoji: '🌴', description: 'Ancient gift of the desert — generosity',    canopyColors: ['#508040','#608850','#406030'], trunkColor: '#C09048', biome: 'arid', family: 'palm' },
  palo_verde:   { label: 'Palo Verde',    emoji: '🌿', description: 'Green bark stores life — creative survival', canopyColors: ['#70B830','#80C840','#60A820'], trunkColor: '#70A830', biome: 'arid', family: 'acacia' },
  desert_willow:{ label: 'Desert Willow', emoji: '🌸', description: 'Pink blooms defy the heat — hope',          canopyColors: ['#E080C0','#F090D0','#D070B0'], trunkColor: '#A09060', biome: 'arid', family: 'willow' },

  // ── Mediterranean ──────────────────────────────────────────────────────────
  olive_tree: { label: 'Olive Tree',  emoji: '🫒', description: 'Gnarled silver leaves — timeless wisdom',   canopyColors: ['#8A9860','#9AA870','#7A8850'], trunkColor: '#A09070', biome: 'mediterranean', family: 'deciduous' },
  cork_oak:   { label: 'Cork Oak',    emoji: '🌳', description: 'Thick bark protects — emotional armour',     canopyColors: ['#3A6020','#4A7030','#2A5010'], trunkColor: '#B87840', biome: 'mediterranean', family: 'deciduous' },
  cypress:    { label: 'Cypress',     emoji: '🌲', description: 'Slender spire — focused aspiration',          canopyColors: ['#1A4820','#2A5830','#0A3810'], trunkColor: '#706050', biome: 'mediterranean', family: 'cypress' },
  carob:      { label: 'Carob',       emoji: '🌳', description: 'Sweet pods and dark canopy — nurturing',      canopyColors: ['#2A5818','#3A6828','#1A4808'], trunkColor: '#806040', biome: 'mediterranean', family: 'deciduous' },
  stone_pine: { label: 'Stone Pine',  emoji: '🌲', description: 'Flat-topped parasol — calm perspective',      canopyColors: ['#205828','#306838','#104818'], trunkColor: '#C07840', biome: 'mediterranean', family: 'conical' },
  aleppo_pine:{ label: 'Aleppo Pine', emoji: '🌲', description: 'Asymmetric and windswept — free spirit',      canopyColors: ['#308040','#408850','#206030'], trunkColor: '#C07030', biome: 'mediterranean', family: 'conical' },

  // ── Tundra ─────────────────────────────────────────────────────────────────
  arctic_willow: { label: 'Arctic Willow', emoji: '🌿', description: 'Hugs the ground against the cold — humble', canopyColors: ['#809078','#909888','#708068'], trunkColor: '#806858', biome: 'tundra', family: 'willow' },
  dwarf_birch:   { label: 'Dwarf Birch',   emoji: '🪵', description: 'Tiny but tenacious — quiet persistence',    canopyColors: ['#A09858','#B0A868','#908848'], trunkColor: '#E8D8B8', biome: 'tundra', family: 'birch' },
  black_spruce:  { label: 'Black Spruce',  emoji: '🌲', description: 'Dark spire in the bog — solitary strength',  canopyColors: ['#1A3820','#243028','#102018'], trunkColor: '#484840', biome: 'tundra', family: 'conical' },
  tamarack:      { label: 'Tamarack',      emoji: '🌲', description: 'Deciduous conifer — adaptable paradox',       canopyColors: ['#D0A840','#E0B850','#C09830'], trunkColor: '#907048', biome: 'tundra', family: 'conical' },
  crowberry:     { label: 'Crowberry',     emoji: '🫐', description: 'Berry-bearing mat — collective sustenance',   canopyColors: ['#2A4820','#3A5830','#1A3810'], trunkColor: '#4A4030', biome: 'tundra', family: 'shrub' },
  cloudberry:    { label: 'Cloudberry',    emoji: '🫐', description: 'Arctic gold — rare and precious joy',         canopyColors: ['#C0E080','#D0F090','#B0D070'], trunkColor: '#808848', biome: 'tundra', family: 'shrub' },

  // ── Mangrove ───────────────────────────────────────────────────────────────
  red_mangrove:   { label: 'Red Mangrove',   emoji: '🌳', description: 'Arching roots in the sea — bold exploration', canopyColors: ['#2A6820','#3A7830','#1A5810'], trunkColor: '#A06840', biome: 'mangrove', family: 'mangrove' },
  black_mangrove: { label: 'Black Mangrove', emoji: '🌳', description: 'Breathing roots — finding air in hardship',   canopyColors: ['#1A4810','#2A5820','#0A3800'], trunkColor: '#504830', biome: 'mangrove', family: 'mangrove' },
  white_mangrove: { label: 'White Mangrove', emoji: '🌳', description: 'Pale and salt-tolerant — pure resilience',    canopyColors: ['#589048','#689858','#488038'], trunkColor: '#C0A880', biome: 'mangrove', family: 'mangrove' },
  seagrape:       { label: 'Seagrape',       emoji: '🍇', description: 'Coastal shade seeker — laid-back abundance',  canopyColors: ['#408840','#509850','#308030'], trunkColor: '#906848', biome: 'mangrove', family: 'deciduous' },
  buttonwood:     { label: 'Buttonwood',     emoji: '🌳', description: 'Salt-spray hardy — practical perseverance',   canopyColors: ['#708058','#808868','#607048'], trunkColor: '#786850', biome: 'mangrove', family: 'deciduous' },
  sea_hibiscus:   { label: 'Sea Hibiscus',   emoji: '🌺', description: 'Tropical flowers by the sea — vivid joy',     canopyColors: ['#209848','#30A858','#108838'], trunkColor: '#806040', biome: 'mangrove', family: 'deciduous' },
}

export const TREE_BIOME_MAP: Record<TreeType, BiomeType> = Object.fromEntries(
  Object.entries(TREE_CONFIGS).map(([k, v]) => [k, v.biome])
) as Record<TreeType, BiomeType>
