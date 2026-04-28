'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { VoiceCallProvider } from '@/context/VoiceCallContext'
import { IncomingCallAlert } from '@/components/voice/IncomingCallAlert'
import { CallModal } from '@/components/voice/CallModal'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen forest-bg flex flex-col items-center justify-center gap-4">
        <div className="text-6xl animate-float">🌱</div>
        <p className="text-forest-400 text-lg font-medium animate-pulse">Growing your forest…</p>
      </div>
    )
  }

  if (!user) return null

  return (
    <VoiceCallProvider>
      {children}
      <IncomingCallAlert />
      <CallModal />
    </VoiceCallProvider>
  )
}
