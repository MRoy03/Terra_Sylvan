import { ref, set, onValue, onDisconnect } from 'firebase/database'
import { rtdb } from './firebase'

export function initPresence(uid: string): () => void {
  const presenceRef  = ref(rtdb, `presence/${uid}`)
  const connectedRef = ref(rtdb, '.info/connected')

  const unsub = onValue(connectedRef, (snap) => {
    if (!snap.val()) return
    onDisconnect(presenceRef).set({ online: false, lastSeen: Date.now() })
    set(presenceRef, { online: true, lastSeen: Date.now() })
  })

  return () => {
    unsub()
    set(presenceRef, { online: false, lastSeen: Date.now() })
  }
}

export function subscribePresence(
  uid: string,
  cb: (online: boolean, lastSeen: number) => void,
): () => void {
  const presenceRef = ref(rtdb, `presence/${uid}`)
  return onValue(presenceRef, (snap) => {
    const d = snap.val()
    cb(d?.online ?? false, d?.lastSeen ?? 0)
  })
}

export function setTyping(chatId: string, uid: string, isTyping: boolean): void {
  set(ref(rtdb, `typing/${chatId}/${uid}`), isTyping)
}

export function subscribeTyping(
  chatId: string,
  myUid: string,
  cb: (typers: string[]) => void,
): () => void {
  return onValue(ref(rtdb, `typing/${chatId}`), (snap) => {
    const data = snap.val() ?? {}
    const typers = Object.entries(data)
      .filter(([uid, v]) => uid !== myUid && Boolean(v))
      .map(([uid]) => uid)
    cb(typers)
  })
}
