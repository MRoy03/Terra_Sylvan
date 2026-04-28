'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Camera, Loader2, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'
import { useAuth } from '@/lib/auth-context'
import { updateUserProfile } from '@/lib/firestore'
import { uploadMedia, isCloudinaryConfigured } from '@/lib/cloudinary'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { TreeType, BiomeType, TREE_CONFIGS, BIOME_CONFIGS } from '@/types'

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
  const [photoURL,     setPhotoURL]     = useState(profile?.photoURL ?? null)
  const [saving,       setSaving]       = useState(false)
  const [uploading,    setUploading]    = useState(false)
  const [uploadPct,    setUploadPct]    = useState(0)
  const [errors,       setErrors]       = useState<Record<string, string>>({})
  const fileRef = useRef<HTMLInputElement>(null)

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
      toast.error('Cloudinary not configured. Add credentials to .env.local')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Photo must be under 5 MB.')
      return
    }

    setUploading(true)
    try {
      const result = await uploadMedia(file, setUploadPct)
      setPhotoURL(result.url)
    } catch {
      toast.error('Photo upload failed.')
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
      })
      await refreshProfile()
      toast.success('Profile updated! 🌿')
      router.push('/dashboard')
    } catch {
      toast.error('Save failed. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-forest-950 via-forest-900 to-forest-950">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-forest-950/80 border-b border-forest-800/50">
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

        <Button size="lg" fullWidth onClick={handleSave} loading={saving}>
          <Save size={16} className="mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  )
}
