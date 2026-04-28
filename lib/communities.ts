import {
  doc, setDoc, getDoc, updateDoc, deleteDoc,
  collection, query, orderBy, limit,
  onSnapshot, addDoc, increment, getDocs,
} from 'firebase/firestore'
import { db } from './firebase'
import { Community, BiomeType, UserRole, MessageType } from '@/types'

// ─── Community CRUD ───────────────────────────────────────────────────────────
export async function createCommunity(
  creatorId:   string,
  name:        string,
  description: string,
  biomeType:   BiomeType,
  isPrivate:   boolean,
): Promise<string> {
  const ref = await addDoc(collection(db, 'communities'), {
    name, description, biomeType, creatorId, isPrivate,
    createdAt:   Date.now(),
    memberCount: 1,
    coverImage:  null,
  })
  await setDoc(doc(db, 'communities', ref.id, 'members', creatorId), {
    role: 'admin', joinedAt: Date.now(),
  })
  // Denormalise: store communityId in user's list
  await updateDoc(doc(db, 'users', creatorId), {
    communityIds: arrayUnionPolyfill(ref.id),
  })
  return ref.id
}

export async function joinCommunity(communityId: string, uid: string): Promise<void> {
  await setDoc(doc(db, 'communities', communityId, 'members', uid), {
    role: 'member', joinedAt: Date.now(),
  })
  await updateDoc(doc(db, 'communities', communityId), { memberCount: increment(1) })
  await updateDoc(doc(db, 'users', uid), {
    communityIds: arrayUnionPolyfill(communityId),
  })
}

export async function leaveCommunity(communityId: string, uid: string): Promise<void> {
  await deleteDoc(doc(db, 'communities', communityId, 'members', uid))
  await updateDoc(doc(db, 'communities', communityId), { memberCount: increment(-1) })
}

export async function isMember(communityId: string, uid: string): Promise<boolean> {
  const snap = await getDoc(doc(db, 'communities', communityId, 'members', uid))
  return snap.exists()
}

export async function getMemberRole(communityId: string, uid: string): Promise<UserRole | null> {
  const snap = await getDoc(doc(db, 'communities', communityId, 'members', uid))
  return snap.exists() ? (snap.data().role as UserRole) : null
}

export async function getCommunity(communityId: string): Promise<Community | null> {
  const snap = await getDoc(doc(db, 'communities', communityId))
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Community) : null
}

// ─── Subscriptions ────────────────────────────────────────────────────────────
export function subscribeAllCommunities(
  cb: (communities: Community[]) => void,
): () => void {
  const q = query(collection(db, 'communities'), orderBy('memberCount', 'desc'), limit(50))
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Community))
  })
}

export function subscribeCommunity(
  communityId: string,
  cb: (community: Community | null) => void,
): () => void {
  return onSnapshot(doc(db, 'communities', communityId), (snap) => {
    cb(snap.exists() ? ({ id: snap.id, ...snap.data() } as Community) : null)
  })
}

export async function getCommunityMembers(communityId: string) {
  const snap = await getDocs(collection(db, 'communities', communityId, 'members'))
  return snap.docs.map((d) => ({ uid: d.id, ...(d.data() as { role: UserRole; joinedAt: number }) }))
}

// ─── Group Chat ───────────────────────────────────────────────────────────────
export async function sendGroupMessage(
  communityId: string,
  senderId:    string,
  content:     string,
  type:        MessageType = 'text',
  mediaURL?:   string,
): Promise<void> {
  await addDoc(collection(db, 'communities', communityId, 'messages'), {
    senderId, content, type,
    mediaURL:  mediaURL ?? null,
    timestamp: Date.now(),
    status:    'sent',
  })
}

export function subscribeGroupMessages(
  communityId: string,
  cb: (messages: any[]) => void,
): () => void {
  const q = query(
    collection(db, 'communities', communityId, 'messages'),
    orderBy('timestamp', 'asc'),
    limit(200),
  )
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}

// ─── Firestore arrayUnion polyfill (avoids extra import) ─────────────────────
import { arrayUnion } from 'firebase/firestore'
function arrayUnionPolyfill(value: string) {
  return arrayUnion(value)
}
