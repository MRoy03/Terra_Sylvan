'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Camera, Loader2, Save } from 'lucide-react'
import { forestToast } from '@/lib/forest-toast'
import { clsx } from 'clsx'
import { useAuth } from '@/lib/auth-context'
import { updateUserProfile } from '@/lib/firestore'
import { uploadMedia, isCloudinaryConfigured } from '@/lib/cloudinary'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { TreeType, BiomeType, TREE_CONFIGS, BIOME_CONFIGS, TREE_BIOME_MAP } from '@/types'
import { AnimalType } from '@/components/3d/AnimalCompanion'
import { useTheme } from '@/hooks/useTheme'

const ANIMAL_OPTIONS: { type: AnimalType; emoji: string; label: string }[] = [
  { type: 'none',   emoji: '🚫', label: 'None'   },
  { type: 'fox',    emoji: '🦊', label: 'Fox'    },
  { type: 'owl',    emoji: '🦉', label: 'Owl'    },
  { type: 'deer',   emoji: '🦌', label: 'Deer'   },
  { type: 'rabbit', emoji: '🐇', label: 'Rabbit' },
]

const BIOME_TREE_GROUPS: { biome: BiomeType; trees: TreeType[] }[] = [
  { biome: 'temperate',     trees: ['oak','maple','cherry','willow','birch','beech','elm','linden'] },
  { biome: 'mountain',      trees: ['pine','alpine_pine','engelmann_spruce','mountain_hemlock','bristlecone_pine','subalpine_fir'] },
  { biome: 'tropical',      trees: ['bamboo','coconut_palm','banana_tree','rubber_tree','teak','strangler_fig'] },
  { biome: 'arid',          trees: ['saguaro','joshua_tree','acacia','date_palm','palo_verde','desert_willow'] },
  { biome: 'mediterranean', trees: ['olive_tree','cork_oak','cypress','carob','stone_pine','aleppo_pine'] },
  { biome: 'tundra',        trees: ['arctic_willow','dwarf_birch','black_spruce','tamarack','crowberry','cloudberry'] },
  { biome: 'mangrove',      trees: ['red_mangrove','black_mangrove','white_mangrove','seagrape','buttonwood','sea_hibiscus'] },
]

export default function SettingsPage() {
  const { profile, refreshProfile } = useAuth()
  const router = useRouter()

  const [displayName,  setDisplayName]  = useState(profile?.displayName ?? '')
  const [bio,          setBio]          = useState(profile?.bio ?? '')
  const [status,       setStatus]       = useState(profile?.status ?? '')
  const [treeType,     setTreeType]     = useState<TreeType>(profile?.treeType ?? 'oak')
  const [animal,       setAnimal]       = useState<AnimalType>(((profile as any)?.animal as AnimalType) ?? 'none')
  const [photoURL,     setPhotoURL]     = useState(profile?.photoURL ?? null)
  const [saving,       setSaving]       = useState(false)
  const [uploading,    setUploading]    = useState(false)
  const [uploadPct,    setUploadPct]    = useState(0)
  const [errors,       setErrors]       = useState<Record<string, string>>({})
  const fileRef = useRef<HTMLInputElement>(null)

  const biome = profile?.treeType ? TREE_BIOME_MAP[profile.treeType] as BiomeType : undefined
  const { theme, setTheme, themes } = useTheme(biome)
  const [selectedThemeId, setSelectedThemeId] = useState<string>(theme.id)
  const t = theme.tokens

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--th-bg',           t.bg)
    root.style.setProperty('--th-bg-card',      t.bgCard)
    root.style.setProperty('--th-border',       t.border)
    root.style.setProperty('--th-accent',       t.accent)
    root.style.setProperty('--th-accent-muted', t.accentMuted)
    root.style.setProperty('--th-glow',         t.glow)
    return () => {
      ;['--th-bg','--th-bg-card','--th-border','--th-accent','--th-accent-muted','--th-glow'].forEach(v =>
        root.style.removeProperty(v))
    }
  }, [t])

  if (!profile) return null

  const validate = () => {
    const e: Record<string, string> = {}
    if (!displayName.trim())             e.displayName = 'Display name is required'
    else if (displayName.length > 40)    e.displayName = 'Max 40 characters'
    if (bio.length > 160)                e.bio         = 'Max 160 characters'
    if (status.length > 80)             e.status      = 'Max 80 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    if (!isCloudinaryConfigured()) {
      forestToast.error('Cloudinary not configured', 'Add credentials to .env.local')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      forestToast.error('Photo must be under 5 MB.')
      return
    }

    setUploading(true)
    try {
      const result = await uploadMedia(file, setUploadPct)
      setPhotoURL(result.url)
    } catch {
      forestToast.error('Photo upload failed.')
    } finally {
      setUploading(false)
      setUploadPct(0)
    }
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      await updateUserProfile(profile.uid, {
        displayName: displayName.trim(),
        bio:         bio.trim(),
        status:      status.trim(),
        treeType,
        photoURL,
        animal,
      })
      await refreshProfile()
      forestToast.growth('Profile updated!')
      router.push('/dashboard')
    } catch {
      forestToast.error('Save failed. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${t.bgCard} 0%, ${t.bg} 40%, ${t.bg} 100%)` }}>
      {/* Themed accent top strip */}
      <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, transparent, ${t.glow}70, transparent)` }} />
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-xl border-b" style={{ background: t.headerBg, borderColor: `${t.border}80` }}>
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1.5 rounded-lg text-forest-500 hover:text-forest-300 hover:bg-forest-800/50 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white leading-none">Settings</h1>
            <p className="text-xs text-forest-500 mt-0.5">Edit your profile</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-6">
        {/* Photo */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <Avatar photoURL={photoURL} displayName={displayName || profile.displayName} size="xl" />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-forest-600 hover:bg-forest-500 border-2 border-forest-950 flex items-center justify-center transition-colors"
              title="Change photo"
            >
              {uploading
                ? <Loader2 size={14} className="animate-spin text-white" />
                : <Camera size={14} className="text-white" />
              }
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          {uploading && (
            <div className="w-32 h-1 bg-forest-800 rounded-full overflow-hidden">
              <div className="h-full bg-forest-500 transition-all" style={{ width: `${uploadPct}%` }} />
            </div>
          )}
          <p className="text-xs text-forest-600">@{profile.username}</p>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-4">
          <Input
            label="Display Name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            error={errors.displayName}
            hint={`${displayName.length}/40`}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-forest-300">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the forest about yourself…"
              rows={3}
              className={clsx(
                'bg-forest-900/60 border rounded-2xl px-4 py-3 text-sm text-forest-100 placeholder-forest-600 resize-none focus:outline-none focus:ring-2 focus:ring-forest-600',
                errors.bio ? 'border-red-500/60' : 'border-forest-800/50',
              )}
            />
            {errors.bio && <p className="text-xs text-red-400">{errors.bio}</p>}
            <p className="text-xs text-forest-600 text-right">{bio.length}/160</p>
          </div>

          <Input
            label="Status"
            type="text"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            error={errors.status}
            placeholder="What's on your mind?"
            hint={`${status.length}/80`}
          />
        </div>

        {/* Tree type — grouped by biome */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-forest-300">Your Tree</label>
          <div className="flex flex-col gap-4">
            {BIOME_TREE_GROUPS.map(({ biome, trees }) => {
              const biomeCfg = BIOME_CONFIGS[biome]
              return (
                <div key={biome} className="flex flex-col gap-1.5">
                  <p className="text-xs text-forest-500 font-medium flex items-center gap-1">
                    <span>{biomeCfg.emoji}</span>
                    <span>{biomeCfg.label}</span>
                  </p>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                    {trees.map((t) => {
                      const cfg = TREE_CONFIGS[t]
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTreeType(t)}
                          className={clsx(
                            'flex flex-col items-center gap-0.5 p-1.5 rounded-xl border-2 transition-all duration-200',
                            treeType === t
                              ? 'border-forest-400 bg-forest-800/60 scale-105'
                              : 'border-forest-800/40 bg-forest-950/40 hover:border-forest-700',
                          )}
                          title={cfg.description}
                        >
                          <span className="text-xl">{cfg.emoji}</span>
                          <span className="text-[9px] text-forest-400 font-medium text-center leading-tight">{cfg.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-forest-500 text-center italic">{TREE_CONFIGS[treeType]?.description}</p>
        </div>

        {/* Animal companion */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-forest-300">Animal Companion</label>
          <div className="grid grid-cols-5 gap-2">
            {ANIMAL_OPTIONS.map(opt => (
              <button
                key={opt.type}
                type="button"
                onClick={() => setAnimal(opt.type)}
                className={clsx(
                  'flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all',
                  animal === opt.type
                    ? 'border-forest-400 bg-forest-800/60 scale-105'
                    : 'border-forest-800/40 bg-forest-950/40 hover:border-forest-700',
                )}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <span className="text-[9px] text-forest-400 font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-forest-600 text-center italic">Your companion appears beside your tree in the 3D scene.</p>
        </div>

        {/* App Theme */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium" style={{ color: t.text }}>App Theme</label>
          <div className="grid grid-cols-4 gap-2">
            {themes.map(th => (
              <button
                key={th.id}
                type="button"
                onClick={() => {
                  setSelectedThemeId(th.id)
                  setTheme(th.id)
                }}
                className="flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all"
                style={{
                  background:   selectedThemeId === th.id ? `${th.tokens.bgCard}` : `${th.tokens.bg}cc`,
                  borderColor:  selectedThemeId === th.id ? th.tokens.accent : `${th.tokens.border}80`,
                  transform:    selectedThemeId === th.id ? 'scale(1.05)' : 'scale(1)',
                  boxShadow:    selectedThemeId === th.id ? `0 0 12px ${th.tokens.glow}40` : 'none',
                }}
              >
                <span className="text-xl">{th.emoji}</span>
                <span className="text-[9px] font-medium text-center leading-tight" style={{ color: th.tokens.textMuted }}>{th.label}</span>
                {/* Color preview bar */}
                <div className="w-full h-1 rounded-full mt-0.5" style={{ background: `linear-gradient(90deg, ${th.tokens.accent}, ${th.tokens.glow})` }} />
              </button>
            ))}
          </div>
          <p className="text-xs text-center italic" style={{ color: t.textMuted }}>
            {themes.find(th => th.id === selectedThemeId)?.label ?? 'Forest Dark'} theme — affects Chat &amp; Settings pages.
          </p>
          <p className="text-[10px] text-center" style={{ color: `${t.textMuted}80` }}>
            Auto-theme from your biome is used if no selection is saved.
          </p>
        </div>

        <Button size="lg" fullWidth onClick={handleSave} loading={saving}>
          <Save size={16} className="mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  )
}
