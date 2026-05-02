'use client'

import { useState } from 'react'
import { Sprout, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { giftSeeds, SEED_GIFT_AMOUNT } from '@/lib/seeds'
import { useAuth } from '@/lib/auth-context'

interface SeedGiftButtonProps {
  toUid:       string
  toName:      string
  compact?:    boolean
}

export function SeedGiftButton({ toUid, toName, compact }: SeedGiftButtonProps) {
  const { user } = useAuth()
  const [gifting, setGifting] = useState(false)

  if (!user || user.uid === toUid) return null

  const handleGift = async () => {
    setGifting(true)
    try {
      await giftSeeds(user.uid, toUid)
      toast.success(`🌱 Sent ${SEED_GIFT_AMOUNT} seeds to ${toName}!`, { duration: 3000 })
    } catch (err: any) {
      toast.error(err?.message ?? 'Could not gift seeds. Try again.')
    } finally {
      setGifting(false)
    }
  }

  if (compact) {
    return (
      <button
        onClick={handleGift}
        disabled={gifting}
        title={`Gift seeds to ${toName}`}
        className="p-1.5 rounded-lg text-forest-500 hover:text-green-400 hover:bg-forest-800/50 transition-colors disabled:opacity-50"
      >
        {gifting ? <Loader2 size={14} className="animate-spin" /> : <Sprout size={14} />}
      </button>
    )
  }

  return (
    <button
      onClick={handleGift}
      disabled={gifting}
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-forest-800/60 hover:bg-forest-700/60
                 border border-forest-700/40 text-forest-300 text-xs font-medium transition-colors disabled:opacity-50"
    >
      {gifting
        ? <Loader2 size={13} className="animate-spin" />
        : <Sprout size={13} className="text-green-400" />}
      Gift Seeds
    </button>
  )
}
