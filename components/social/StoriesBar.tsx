'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useConnections } from '@/hooks/useConnections'
import { getUserProfile } from '@/lib/firestore'
import {
  createStory, getStoriesForUsers, getMyStories, markStoryViewed,
  type Story,
} from '@/lib/stories'
import { TREE_CONFIGS } from '@/types'
import toast from 'react-hot-toast'

// ─── Types ────────────────────────────────────────────────────────────────────
interface StoryGroup {
  uid:         string
  displayName: string
  photoURL:    string | null
  treeEmoji:   string
  stories:     Story[]
  hasUnseen:   boolean
}

// ─── Story viewer (full-screen) ───────────────────────────────────────────────
function StoryViewer({
  groups, startIdx, viewerUid, onClose,
}: {
  groups: StoryGroup[]; startIdx: number; viewerUid: string; onClose: () => void
}) {
  const [groupIdx,   setGroupIdx]   = useState(startIdx)
  const [storyIdx,   setStoryIdx]   = useState(0)
  const [paused,     setPaused]     = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const group = groups[groupIdx]
  const story = group?.stories[storyIdx]

  useEffect(() => {
    if (!story) return
    markStoryViewed(story.id, viewerUid)
  }, [story, viewerUid])

  useEffect(() => {
    if (paused) return
    timerRef.current = setTimeout(advance, 5000)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupIdx, storyIdx, paused])

  function advance() {
    const nextStory = storyIdx + 1
    if (nextStory < group.stories.length) {
      setStoryIdx(nextStory)
    } else {
      const nextGroup = groupIdx + 1
      if (nextGroup < groups.length) {
        setGroupIdx(nextGroup)
        setStoryIdx(0)
      } else {
        onClose()
      }
    }
  }

  function retreat() {
    if (storyIdx > 0) {
      setStoryIdx(storyIdx - 1)
    } else if (groupIdx > 0) {
      setGroupIdx(groupIdx - 1)
      setStoryIdx(0)
    }
  }

  if (!story) return null

  const elapsed = new Date().getTime() - story.createdAt.toMillis()
  const hoursAgo = Math.floor(elapsed / 3_600_000)
  const timeLabel = hoursAgo === 0 ? 'Just now' : `${hoursAgo}h ago`

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90"
      onMouseDown={() => setPaused(true)} onMouseUp={() => setPaused(false)}
      onTouchStart={() => setPaused(true)} onTouchEnd={() => setPaused(false)}>

      {/* Story card */}
      <div className="relative w-full max-w-sm h-[85dvh] rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        style={{ background: story.backgroundColor }}>

        {/* Progress bars */}
        <div className="flex gap-1 px-3 pt-3">
          {group.stories.map((_, i) => (
            <div key={i} className="flex-1 h-0.5 rounded-full bg-white/25 overflow-hidden">
              {i < storyIdx  && <div className="h-full w-full bg-white" />}
              {i === storyIdx && !paused && <div className="h-full bg-white story-progress-bar" />}
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="flex items-center gap-2.5 px-3 pt-2 pb-1">
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-lg flex-shrink-0 overflow-hidden">
            {group.photoURL
              ? <img src={group.photoURL} alt="" className="w-full h-full object-cover" />
              : group.treeEmoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold leading-tight truncate">{group.displayName}</p>
            <p className="text-white/50 text-xs leading-tight">{timeLabel}</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        {/* Media */}
        <div className="flex-1 flex items-center justify-center px-4 py-2">
          {story.mediaURL && story.mediaType === 'image' && (
            <img src={story.mediaURL} alt="" className="max-w-full max-h-full rounded-2xl object-contain" />
          )}
          {story.mediaURL && story.mediaType === 'video' && (
            <video src={story.mediaURL} autoPlay loop muted playsInline
              className="max-w-full max-h-full rounded-2xl object-contain" />
          )}
        </div>

        {/* Text overlay */}
        {story.content && (
          <div className="px-4 pb-5 text-center">
            <p className="text-white text-lg font-medium leading-snug drop-shadow-lg">{story.content}</p>
          </div>
        )}

        {/* Navigation tap zones */}
        <div className="absolute inset-0 flex pointer-events-none">
          <button className="w-1/3 h-full pointer-events-auto" onClick={retreat} />
          <div className="flex-1" />
          <button className="w-1/3 h-full pointer-events-auto" onClick={advance} />
        </div>
      </div>

      {/* Group nav arrows */}
      {groupIdx > 0 && (
        <button onClick={() => { setGroupIdx(g => g - 1); setStoryIdx(0) }}
          className="absolute left-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/40 rounded-full p-1">
          <ChevronLeft size={24} />
        </button>
      )}
      {groupIdx < groups.length - 1 && (
        <button onClick={() => { setGroupIdx(g => g + 1); setStoryIdx(0) }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/40 rounded-full p-1">
          <ChevronRight size={24} />
        </button>
      )}
    </div>
  )
}

// ─── Create story modal ───────────────────────────────────────────────────────
function CreateStoryModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { user, profile } = useAuth()
  const [text,    setText]    = useState('')
  const [busy,    setBusy]    = useState(false)

  const QUICK = ['🌱 Just sprouted!','🌿 Feeling rooted.','🌸 In full bloom!','🍃 Swaying in the breeze.','🌲 Standing tall.','🌧️ Growing through the rain.','☀️ Soaking up the sun!','🍂 Change is beautiful.']

  async function submit() {
    if (!user || !profile || !text.trim()) return
    setBusy(true)
    try {
      await createStory(user.uid, profile.displayName, profile.photoURL, profile.treeType, text.trim())
      toast.success('Story shared! 🌿')
      onCreated()
      onClose()
    } catch {
      toast.error('Could not share story')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm glass rounded-3xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold text-lg">Share a Forest Whisper 🌿</h3>
          <button onClick={onClose} className="text-forest-500 hover:text-white"><X size={20} /></button>
        </div>

        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          maxLength={180}
          rows={3}
          placeholder="What's your tree feeling right now?"
          className="w-full bg-forest-900/60 border border-forest-700/50 rounded-xl px-3 py-2.5
                     text-white placeholder-forest-600 text-sm resize-none focus:outline-none
                     focus:border-forest-500"
        />

        {/* Quick picks */}
        <div className="flex flex-wrap gap-1.5">
          {QUICK.map(q => (
            <button key={q} onClick={() => setText(q)}
              className="text-xs px-2.5 py-1 rounded-full bg-forest-900/70 border border-forest-700/40
                         text-forest-300 hover:border-forest-500 hover:text-white transition-colors">
              {q}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-forest-700/50
            text-forest-400 text-sm hover:text-white transition-colors">
            Cancel
          </button>
          <button onClick={submit} disabled={busy || !text.trim()}
            className="flex-1 py-2.5 rounded-xl bg-forest-600 hover:bg-forest-500 text-white text-sm
                       font-semibold disabled:opacity-50 transition-colors">
            {busy ? 'Sharing…' : 'Share'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Story avatar circle ───────────────────────────────────────────────────────
function StoryCircle({ group, onClick }: { group: StoryGroup; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 flex-shrink-0 w-16">
      <div className={group.hasUnseen ? 'story-ring' : 'story-ring-seen'}>
        <div className="w-12 h-12 rounded-full bg-forest-900 flex items-center justify-center text-xl overflow-hidden">
          {group.photoURL
            ? <img src={group.photoURL} alt={group.displayName} className="w-full h-full object-cover rounded-full" />
            : group.treeEmoji}
        </div>
      </div>
      <span className="text-[10px] text-white/60 leading-tight text-center w-full truncate">
        {group.displayName.split(' ')[0]}
      </span>
    </button>
  )
}

// ─── Main StoriesBar ──────────────────────────────────────────────────────────
export function StoriesBar() {
  const { user, profile } = useAuth()
  const { connections }   = useConnections()
  const [groups,       setGroups]       = useState<StoryGroup[]>([])
  const [myStories,    setMyStories]    = useState<Story[]>([])
  const [viewingIdx,   setViewingIdx]   = useState<number | null>(null)
  const [showCreate,   setShowCreate]   = useState(false)
  const [loading,      setLoading]      = useState(true)

  const connectedUids = connections
    .filter(c => c.status === 'accepted')
    .map(c => c.uid)

  async function load() {
    if (!user) return
    setLoading(true)
    try {
      const [friendStories, mine] = await Promise.all([
        getStoriesForUsers(connectedUids),
        getMyStories(user.uid),
      ])
      setMyStories(mine)

      // Group by uid
      const map = new Map<string, Story[]>()
      friendStories.forEach(s => {
        if (!map.has(s.uid)) map.set(s.uid, [])
        map.get(s.uid)!.push(s)
      })

      // Fetch profiles for each uid (use story data to avoid extra reads)
      const built: StoryGroup[] = []
      map.forEach((stories, uid) => {
        const first = stories[0]
        built.push({
          uid,
          displayName: first.displayName,
          photoURL:    first.photoURL,
          treeEmoji:   TREE_CONFIGS[first.treeType]?.emoji ?? '🌳',
          stories,
          hasUnseen:   stories.some(s => !s.viewedBy.includes(user.uid)),
        })
      })
      // Unseen first
      built.sort((a, b) => (b.hasUnseen ? 1 : 0) - (a.hasUnseen ? 1 : 0))
      setGroups(built)
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, connectedUids.join(',')])

  const allGroups: StoryGroup[] = []
  // My stories group (prepend)
  if (profile && myStories.length > 0) {
    allGroups.push({
      uid:         user!.uid,
      displayName: 'My Story',
      photoURL:    profile.photoURL,
      treeEmoji:   TREE_CONFIGS[profile.treeType]?.emoji ?? '🌳',
      stories:     myStories,
      hasUnseen:   false,
    })
  }
  allGroups.push(...groups)

  const hasAny = allGroups.length > 0

  if (loading && !hasAny) return null

  return (
    <>
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1">
        {/* Add story button */}
        <button onClick={() => setShowCreate(true)}
          className="flex flex-col items-center gap-1 flex-shrink-0 w-16">
          <div className="w-12 h-12 rounded-full border-2 border-dashed border-forest-600
                          flex items-center justify-center text-forest-500 hover:border-forest-400
                          hover:text-forest-300 transition-colors bg-forest-900/40">
            <Plus size={20} />
          </div>
          <span className="text-[10px] text-forest-600 leading-tight">Add</span>
        </button>

        {/* Story circles */}
        {allGroups.map((g, i) => (
          <StoryCircle key={g.uid} group={g} onClick={() => setViewingIdx(i)} />
        ))}

        {!hasAny && !loading && (
          <p className="text-forest-700 text-xs ml-1">No stories yet — share the first one!</p>
        )}
      </div>

      {/* Viewer */}
      {viewingIdx !== null && (
        <StoryViewer
          groups={allGroups}
          startIdx={viewingIdx}
          viewerUid={user!.uid}
          onClose={() => setViewingIdx(null)}
        />
      )}

      {/* Create modal */}
      {showCreate && (
        <CreateStoryModal
          onClose={() => setShowCreate(false)}
          onCreated={load}
        />
      )}
    </>
  )
}
