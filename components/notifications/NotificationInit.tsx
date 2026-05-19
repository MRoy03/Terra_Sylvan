'use client'

import { useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { requestNotificationPermission, onForegroundMessage } from '@/lib/fcm'
import { saveFcmToken } from '@/lib/firestore'
import { forestToast } from '@/lib/forest-toast'
import { useRouter } from 'next/navigation'

export function NotificationInit() {
  const { user } = useAuth()
  const router   = useRouter()

  useEffect(() => {
    if (!user?.uid || typeof window === 'undefined') return
    if (!('serviceWorker' in navigator) || !('Notification' in window)) return

    const init = async () => {
      const token = await requestNotificationPermission()
      if (token) await saveFcmToken(user.uid, token).catch(() => {})
    }

    // Ask after 4 seconds so it doesn't feel intrusive on load
    const t = setTimeout(init, 4000)
    return () => clearTimeout(t)
  }, [user?.uid])

  // Show foreground notifications as themed toasts
  useEffect(() => {
    if (!user?.uid) return
    return onForegroundMessage((payload) => {
      const { title, body } = payload.notification ?? {}
      const chatUrl = payload.data?.chatUrl
      if (!body) return
      const label = `${title ?? '🌿 Terra Sylvan'}: ${body}`
      forestToast.info(label, { duration: 5000 })
      if (chatUrl) setTimeout(() => router.push(chatUrl), 100)
    })
  }, [user?.uid, router])

  return null
}
