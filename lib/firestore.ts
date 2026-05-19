import {
  doc, getDoc, setDoc, updateDoc, addDoc, deleteDoc,
  collection, collectionGroup, query, where, getDocs,
  increment, onSnapshot, orderBy, limit, deleteField,
  QuerySnapshot, DocumentData,
} from 'firebase/firestore'
import { db } from './firebase'
import { UserProfile, Message, Chat, Connection, MessageType } from '@/types'
import { getChatId } from './utils'

// ─── Users ────────────────────────────────────────────────────────────────────
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? (snap.data() as UserProfile) : null
}

export async function updateUserProfile(
  uid: string,
  fields: Partial<Pick<UserProfile, 'displayName' | 'bio' | 'status' | 'treeType' | 'photoURL'>> & { animal?: string },
): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { ...fields, updatedAt: Date.now() })
}

export async function searchUsers(term: string, currentUid: string): Promise<UserProfile[]> {
  if (!term.trim()) return []
  const lower = term.toLowerCase()
  const q = query(
    collection(db, 'users'),
    where('username', '>=', lower),
    where('username', '<=', lower + ''),
    limit(20),
  )
  const snap = await getDocs(q)
  return snap.docs
    .map((d) => d.data() as UserProfile)
    .filter((u) => u.uid !== currentUid)
}

// ─── Chats ────────────────────────────────────────────────────────────────────
export async function getOrCreateChat(uid1: string, uid2: string): Promise<string> {
  const chatId  = getChatId(uid1, uid2)
  const chatRef = doc(db, 'chats', chatId)
  const snap    = await getDoc(chatRef)
  if (!snap.exists()) {
    await setDoc(chatRef, {
      participants:        [uid1, uid2],
      createdAt:           Date.now(),
      lastMessage:         '',
      lastMessageAt:       Date.now(),
      lastMessageSenderId: '',
    })
  }
  return chatId
}

export async function sendMessage(
  chatId:   string,
  senderId: string,
  content:  string,
  type:     MessageType = 'text',
  mediaURL?: string,
  extra?:   Record<string, unknown>,
): Promise<void> {
  const ts = Date.now()

  await addDoc(collection(db, 'chats', chatId, 'messages'), {
    senderId,
    content,
    type,
    mediaURL: mediaURL ?? null,
    timestamp: ts,
    status: 'sent',
    ...(extra ?? {}),
  })

  await updateDoc(doc(db, 'chats', chatId), {
    lastMessage:         type === 'text' ? content : `[${type}]`,
    lastMessageAt:       ts,
    lastMessageSenderId: senderId,
  })

  // Update tree stats
  const field =
    type === 'image' ? 'imageCount' :
    type === 'video' ? 'videoCount' : 'messageCount'
  await updateDoc(doc(db, 'users', senderId), { [field]: increment(1) })
}

export function subscribeMessages(
  chatId: string,
  cb: (msgs: Message[]) => void,
): () => void {
  const q = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('timestamp', 'asc'),
    limit(200),
  )
  return onSnapshot(q, (snap: QuerySnapshot<DocumentData>) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Message))
  })
}

export function subscribeChats(
  uid: string,
  cb: (chats: Chat[]) => void,
): () => void {
  const q = query(
    collection(db, 'chats'),
    where('participants', 'array-contains', uid),
  )
  return onSnapshot(q, (snap) => {
    const chats = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }) as Chat)
      .sort((a, b) => (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0))
    cb(chats)
  })
}

// ─── Connections ──────────────────────────────────────────────────────────────
export async function getConnectionStatus(
  myUid: string,
  otherUid: string,
): Promise<Connection['status'] | null> {
  const snap = await getDoc(doc(db, 'connections', myUid, 'list', otherUid))
  return snap.exists() ? (snap.data() as Connection).status : null
}

export async function sendFriendRequest(fromUid: string, toUid: string): Promise<void> {
  const ts = Date.now()
  await setDoc(doc(db, 'connections', fromUid, 'list', toUid), {
    uid: toUid, status: 'pending', connectedAt: ts, initiator: true,
  })
  await setDoc(doc(db, 'connections', toUid, 'list', fromUid), {
    uid: fromUid, status: 'pending', connectedAt: ts, initiator: false,
  })
}

export async function acceptFriendRequest(uid: string, friendUid: string): Promise<void> {
  await updateDoc(doc(db, 'connections', uid,       'list', friendUid), { status: 'accepted' })
  await updateDoc(doc(db, 'connections', friendUid, 'list', uid),       { status: 'accepted' })
  await updateDoc(doc(db, 'users', uid),       { connectionCount: increment(1) })
  await updateDoc(doc(db, 'users', friendUid), { connectionCount: increment(1) })
}

export async function rejectFriendRequest(uid: string, friendUid: string): Promise<void> {
  await updateDoc(doc(db, 'connections', uid,       'list', friendUid), { status: 'rejected' })
  await updateDoc(doc(db, 'connections', friendUid, 'list', uid),       { status: 'rejected' })
}

// ─── Message reactions ────────────────────────────────────────────────────────
export async function toggleReaction(
  chatId:    string,
  messageId: string,
  emoji:     string,
  uid:       string,
): Promise<void> {
  const ref  = doc(db, 'chats', chatId, 'messages', messageId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return
  const reactions: Record<string, string[]> = (snap.data().reactions as Record<string, string[]>) ?? {}
  const current = reactions[emoji] ?? []
  const next    = current.includes(uid)
    ? current.filter(u => u !== uid)  // remove
    : [...current, uid]               // add

  if (next.length === 0) {
    const updated = { ...reactions }
    delete updated[emoji]
    await updateDoc(ref, { reactions: updated })
  } else {
    await updateDoc(ref, { [`reactions.${emoji}`]: next })
  }
}

// ─── Daily Ritual ────────────────────────────────────────────────────────────
export async function saveRitual(uid: string, date: string, prompt: string, answer: string): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'rituals', date), {
    date, prompt, answer, completedAt: Date.now(),
  })
  await updateDoc(doc(db, 'users', uid), { lastRitual: date })
}

export async function getRitual(uid: string, date: string): Promise<string | null> {
  const snap = await getDoc(doc(db, 'users', uid, 'rituals', date))
  return snap.exists() ? (snap.data().answer as string) : null
}

// ─── Mood ─────────────────────────────────────────────────────────────────────
export async function saveMood(uid: string, mood: string): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { mood, moodSetAt: Date.now() })
}

export async function clearMood(uid: string): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { mood: deleteField(), moodSetAt: deleteField() })
}

export async function markMessageViewed(chatId: string, messageId: string, uid: string): Promise<void> {
  await updateDoc(doc(db, 'chats', chatId, 'messages', messageId), {
    [`viewedBy.${uid}`]: true,
    status: 'read',
  })
}

export async function markAsReplied(chatId: string, messageId: string): Promise<void> {
  await updateDoc(doc(db, 'chats', chatId, 'messages', messageId), { isReplied: true })
}

export async function getMediaByUser(
  uid:  string,
  type: 'image' | 'video',
): Promise<{ url: string; timestamp: number }[]> {
  try {
    const q = query(
      collectionGroup(db, 'messages'),
      where('senderId', '==', uid),
      limit(200),
    )
    const snap = await getDocs(q)
    return snap.docs
      .map(d => d.data())
      .filter(d => d.type === type && !!d.mediaURL)
      .map(d => ({ url: d.mediaURL as string, timestamp: d.timestamp as number }))
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 60)
  } catch (e: any) {
    // Firestore collection-group index not configured yet — return empty silently
    if (e?.code === 'failed-precondition' || e?.code === 'permission-denied') return []
    throw e
  }
}

export function subscribeConnections(
  uid: string,
  cb: (conns: Connection[]) => void,
): () => void {
  return onSnapshot(collection(db, 'connections', uid, 'list'), (snap) => {
    cb(snap.docs.map((d) => ({ uid: d.id, ...d.data() }) as Connection))
  })
}

// ─── Admin ────────────────────────────────────────────────────────────────────
export async function getAllUsers(): Promise<UserProfile[]> {
  const snap = await getDocs(collection(db, 'users'))
  return snap.docs
    .map((d) => d.data() as UserProfile)
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
}

export async function deleteUserProfile(uid: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid))
}

// ─── Admin Settings ───────────────────────────────────────────────────────────
export interface AdminSettings {
  panoramaTransitionMs: number
}

export async function getAdminSettings(): Promise<AdminSettings> {
  const snap = await getDoc(doc(db, 'adminSettings', 'siteConfig'))
  if (!snap.exists()) return { panoramaTransitionMs: 5000 }
  const data = snap.data() as Partial<AdminSettings>
  return { panoramaTransitionMs: data.panoramaTransitionMs ?? 5000 }
}

export async function saveAdminSettings(settings: AdminSettings): Promise<void> {
  await setDoc(doc(db, 'adminSettings', 'siteConfig'), settings)
}

// ─── Bond Streak ──────────────────────────────────────────────────────────────
function todayStr() { return new Date().toISOString().slice(0, 10) }
function yesterdayStr() { return new Date(Date.now() - 86_400_000).toISOString().slice(0, 10) }

export async function getChatStreak(chatId: string): Promise<number> {
  const snap = await getDoc(doc(db, 'chats', chatId))
  return snap.exists() ? (snap.data().streak ?? 0) : 0
}

export async function updateChatStreak(chatId: string): Promise<number> {
  const ref  = doc(db, 'chats', chatId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return 1
  const data       = snap.data()
  const lastDate   = data.streakLastDate ?? ''
  const curStreak  = data.streak ?? 0
  const today      = todayStr()
  const yesterday  = yesterdayStr()
  if (lastDate === today) return curStreak
  const newStreak = lastDate === yesterday ? curStreak + 1 : 1
  await updateDoc(ref, { streak: newStreak, streakLastDate: today })
  return newStreak
}

// ─── Tree Journal ─────────────────────────────────────────────────────────────
export interface JournalEntry {
  id?:       string
  type:      string
  emoji:     string
  message:   string
  timestamp: number
}

export async function addJournalEntry(uid: string, entry: Omit<JournalEntry, 'id'>): Promise<void> {
  await addDoc(collection(db, 'users', uid, 'journal'), entry)
}

export function subscribeJournal(uid: string, cb: (entries: JournalEntry[]) => void): () => void {
  const q = query(
    collection(db, 'users', uid, 'journal'),
    orderBy('timestamp', 'desc'),
    limit(40),
  )
  return onSnapshot(q, snap => {
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() }) as JournalEntry))
  })
}

// ─── FCM Tokens ───────────────────────────────────────────────────────────────
export async function saveFcmToken(uid: string, token: string): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { fcmToken: token, fcmUpdatedAt: Date.now() })
}
