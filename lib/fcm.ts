import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import app from './firebase'

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? ''

let _messaging: ReturnType<typeof getMessaging> | null = null

function getMsg() {
  if (typeof window === 'undefined') return null
  if (!_messaging) _messaging = getMessaging(app)
  return _messaging
}

export async function requestNotificationPermission(): Promise<string | null> {
  if (typeof window === 'undefined' || !('Notification' in window)) return null
  if (Notification.permission === 'denied') return null

  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return null

    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
    const swUrl    = `${basePath}/firebase-messaging-sw.js`
    const reg      = await navigator.serviceWorker.register(swUrl, { scope: `${basePath}/` })
    await navigator.serviceWorker.ready

    const messaging = getMsg()
    if (!messaging) return null

    const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: reg })
    return token || null
  } catch {
    return null
  }
}

export function onForegroundMessage(cb: (payload: any) => void) {
  const messaging = getMsg()
  if (!messaging) return () => {}
  return onMessage(messaging, cb)
}
