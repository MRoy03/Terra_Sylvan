import {
  collection, addDoc, query, where, orderBy,
  getDocs, updateDoc, doc, serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import type { TreeType } from '@/types'

export interface Story {
  id:              string
  uid:             string
  displayName:     string
  photoURL:        string | null
  treeType:        TreeType
  content:         string          // text overlay
  mediaURL?:       string
  mediaType?:      'image' | 'video'
  backgroundColor: string
  createdAt:       Timestamp
  expiresAt:       Timestamp
  viewedBy:        string[]
}

const BG_COLORS = [
  '#052e16','#0c1a40','#1a0a2e','#2a1200','#0a1a1a',
  '#1a1a0a','#2e0a0a','#0a2e0a','#0a0a2e','#1a0a1a',
]

export async function createStory(
  uid: string,
  displayName: string,
  photoURL: string | null,
  treeType: TreeType,
  content: string,
  mediaURL?: string,
  mediaType?: 'image' | 'video',
): Promise<string> {
  const now       = Timestamp.now()
  const expiresAt = Timestamp.fromMillis(now.toMillis() + 24 * 60 * 60 * 1000)
  const bg        = BG_COLORS[Math.floor(Math.random() * BG_COLORS.length)]

  const ref = await addDoc(collection(db, 'stories'), {
    uid, displayName, photoURL, treeType,
    content, mediaURL: mediaURL ?? null, mediaType: mediaType ?? null,
    backgroundColor: bg,
    createdAt: serverTimestamp(),
    expiresAt,
    viewedBy: [],
  })
  return ref.id
}

export async function getStoriesForUsers(uids: string[]): Promise<Story[]> {
  if (uids.length === 0) return []
  const now    = Timestamp.now()
  const chunks = chunkArray(uids, 10)  // Firestore 'in' limit is 10
  const all: Story[] = []

  for (const chunk of chunks) {
    const q = query(
      collection(db, 'stories'),
      where('uid', 'in', chunk),
      where('expiresAt', '>', now),
      orderBy('expiresAt'),
      orderBy('createdAt', 'desc'),
    )
    const snap = await getDocs(q)
    snap.forEach(d => all.push({ id: d.id, ...d.data() } as Story))
  }
  return all
}

export async function getMyStories(uid: string): Promise<Story[]> {
  const now = Timestamp.now()
  const q   = query(
    collection(db, 'stories'),
    where('uid', '==', uid),
    where('expiresAt', '>', now),
    orderBy('expiresAt'),
    orderBy('createdAt', 'desc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Story))
}

export async function markStoryViewed(storyId: string, viewerUid: string) {
  try {
    const ref = doc(db, 'stories', storyId)
    // Use arrayUnion via raw update
    const snap = await getDocs(query(collection(db, 'stories'), where('__name__', '==', storyId)))
    if (snap.empty) return
    const data = snap.docs[0].data() as Story
    if (!data.viewedBy.includes(viewerUid)) {
      await updateDoc(ref, { viewedBy: [...data.viewedBy, viewerUid] })
    }
  } catch { /* ignore */ }
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size))
  return chunks
}
