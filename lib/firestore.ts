import {
  doc, getDoc, setDoc, updateDoc, addDoc,
  collection, query, where, getDocs,
  increment, onSnapshot, orderBy, limit,
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

export function subscribeConnections(
  uid: string,
  cb: (conns: Connection[]) => void,
): () => void {
  return onSnapshot(collection(db, 'connections', uid, 'list'), (snap) => {
    cb(snap.docs.map((d) => ({ uid: d.id, ...d.data() }) as Connection))
  })
}
