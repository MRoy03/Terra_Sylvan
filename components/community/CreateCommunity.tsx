'use client'

import { useState } from 'react'
import { X, Trees, Lock, Globe } from 'lucide-react'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'
import { useAuth } from '@/lib/auth-context'
import { createCommunity } from '@/lib/communities'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { BiomeType, BIOME_CONFIGS } from '@/types'

const BIOMES: BiomeType[] = ['tropical', 'arid', 'mediterranean', 'tundra', 'mangrove', 'mountain', 'temperate']

interface CreateCommunityProps {
  onClose:   () => void
  onCreate?: (communityId: string) => void
}

export function CreateCommunity({ onClose, onCreate }: CreateCommunityProps) {
  const { user } = useAuth()
  const [name,        setName]        = useState('')
  const [description, setDescription] = useState('')
  const [biomeType,   setBiomeType]   = useState<BiomeType>('temperate')
  const [isPrivate,   setIsPrivate]   = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [errors,      setErrors]      = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!name.trim())               e.name        = 'Community name is required'
    else if (name.trim().length < 3) e.name       = 'At least 3 characters'
    else if (name.trim().length > 40) e.name      = 'Max 40 characters'
    if (!description.trim())        e.description = 'Description is required'
    else if (description.length > 200) e.description = 'Max 200 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate() || !user) return
    setLoading(true)
    try {
      const id = await createCommunity(user.uid, name.trim(), description.trim(), biomeType, isPrivate)
      toast.success(`${BIOME_CONFIGS[biomeType].emoji} ${name} forest planted!`)
      onCreate?.(id)
      onClose()
    } catch {
      toast.error('Failed to create community. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg backdrop-blur-xl bg-forest-950/90 border border-forest-800/50 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Trees size={20} className="text-forest-400" />
              Plant a New Forest
            </h2>
            <p className="text-forest-500 text-sm mt-0.5">Create a community for others to join</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-forest-500 hover:text-forest-300 hover:bg-forest-800/50 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Community Name"
            type="text"
            placeholder="The Whispering Oaks"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            hint={`${name.length}/40`}
          />

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-forest-300">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this forest about?"
              rows={3}
              className={clsx(
                'bg-forest-900/60 border rounded-2xl px-4 py-3 text-sm text-forest-100 placeholder-forest-600 resize-none focus:outline-none focus:ring-2 focus:ring-forest-600 transition-all',
                errors.description ? 'border-red-500/60' : 'border-forest-800/50',
              )}
            />
            {errors.description && <p className="text-xs text-red-400">{errors.description}</p>}
            <p className="text-xs text-forest-600 text-right">{description.length}/200</p>
          </div>

          {/* Biome Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-forest-300">Choose Biome</label>
            <div className="grid grid-cols-4 gap-2">
              {BIOMES.map((b) => {
                const cfg = BIOME_CONFIGS[b]
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBiomeType(b)}
                    className={clsx(
                      'flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all duration-200 cursor-pointer',
                      biomeType === b
                        ? 'border-forest-400 bg-forest-800/60 scale-105'
                        : 'border-forest-800/50 bg-forest-950/40 hover:border-forest-700',
                    )}
                    title={cfg.description}
                  >
                    <span className="text-xl">{cfg.emoji}</span>
                    <span className="text-[9px] text-forest-400 font-medium leading-tight text-center">{cfg.label}</span>
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-forest-500 text-center">{BIOME_CONFIGS[biomeType].description}</p>
          </div>

          {/* Privacy Toggle */}
          <button
            type="button"
            onClick={() => setIsPrivate((v) => !v)}
            className={clsx(
              'flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left',
              isPrivate
                ? 'border-forest-500 bg-forest-800/40'
                : 'border-forest-800/50 bg-forest-950/40 hover:border-forest-700',
            )}
          >
            <div className={clsx(
              'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
              isPrivate ? 'bg-forest-600' : 'bg-forest-800',
            )}>
              {isPrivate ? <Lock size={16} className="text-white" /> : <Globe size={16} className="text-forest-400" />}
            </div>
            <div>
              <p className="text-sm font-medium text-forest-200">{isPrivate ? 'Private Forest' : 'Public Forest'}</p>
              <p className="text-xs text-forest-500">
                {isPrivate ? 'Only invited members can join' : 'Anyone can discover and join'}
              </p>
            </div>
          </button>

          <div className="flex gap-3 mt-1">
            <Button variant="secondary" size="lg" onClick={onClose} className="flex-1" type="button">
              Cancel
            </Button>
            <Button type="submit" size="lg" loading={loading} className="flex-1">
              {BIOME_CONFIGS[biomeType].emoji} Plant Forest
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
