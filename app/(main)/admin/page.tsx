'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Trash2, RefreshCw, Users, MessageSquare, Image, Video, TreePine, X, AlertTriangle, Search } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { getAllUsers, deleteUserProfile } from '@/lib/firestore'
import { computeTreeStats } from '@/lib/tree-utils'
import { TREE_CONFIGS } from '@/types'
import { forestToast } from '@/lib/forest-toast'
import type { UserProfile } from '@/types'

const ADMIN_EMAIL = 'roy62125@gmail.com'

// ─── helpers ──────────────────────────────────────────────────────────────────

function fmtDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtAge(ts: number) {
  const days = Math.floor((Date.now() - ts) / 86_400_000)
  return days === 0 ? 'Today' : days === 1 ? '1 day' : `${days}d`
}

// ─── sub-components ───────────────────────────────────────────────────────────

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: number | string; accent: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl px-4 py-3 border"
         style={{ background: `${accent}10`, borderColor: `${accent}30` }}>
      <div className="text-lg" style={{ color: accent }}>{icon}</div>
      <div>
        <p className="text-xl font-bold text-white/90 leading-none">{value}</p>
        <p className="text-[11px] mt-0.5" style={{ color: `${accent}99` }}>{label}</p>
      </div>
    </div>
  )
}

function DeleteConfirmModal({
  user,
  onConfirm,
  onCancel,
  loading,
}: {
  user: UserProfile
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-red-900/50 p-6 shadow-2xl"
           style={{ background: '#0f0a0a' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-red-900/60 flex items-center justify-center">
            <AlertTriangle size={16} className="text-red-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-red-300">Delete Account</p>
            <p className="text-[11px] text-red-900">This action cannot be undone</p>
          </div>
        </div>

        <p className="text-sm text-white/70 mb-1">
          Remove <span className="font-medium text-white">{user.displayName}</span> from Terra Sylvan?
        </p>
        <p className="text-[11px] text-red-800 mb-5">
          Their profile and data will be deleted from Firestore. The Firebase Auth account
          will remain but the user cannot access the app without a profile.
        </p>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-xl text-xs border border-white/10 text-white/50
                       hover:text-white/80 hover:border-white/20 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2 rounded-xl text-xs bg-red-900/60 border border-red-800/60
                       text-red-300 hover:bg-red-800/60 disabled:opacity-50 transition-colors font-medium"
          >
            {loading ? 'Deleting…' : 'Delete user'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── main page ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [users,      setUsers]      = useState<UserProfile[]>([])
  const [fetching,   setFetching]   = useState(true)
  const [search,     setSearch]     = useState('')
  const [toDelete,   setToDelete]   = useState<UserProfile | null>(null)
  const [deleting,   setDeleting]   = useState(false)
  const [sortKey,    setSortKey]    = useState<'createdAt' | 'messageCount' | 'imageCount' | 'connectionCount'>('createdAt')
  const [sortDesc,   setSortDesc]   = useState(true)

  // ── gate ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return
    if (!user || user.email !== ADMIN_EMAIL) {
      router.replace('/dashboard')
    }
  }, [user, authLoading, router])

  // ── fetch all users ───────────────────────────────────────────────────────
  const loadUsers = useCallback(async () => {
    setFetching(true)
    try {
      const list = await getAllUsers()
      setUsers(list)
    } catch {
      forestToast.error('Could not load users')
    } finally {
      setFetching(false)
    }
  }, [])

  useEffect(() => { loadUsers() }, [loadUsers])

  // ── delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await deleteUserProfile(toDelete.uid)
      setUsers(prev => prev.filter(u => u.uid !== toDelete.uid))
      forestToast.info(`${toDelete.displayName} removed from Terra Sylvan.`)
      setToDelete(null)
    } catch {
      forestToast.error('Delete failed. Check Firestore rules.')
    } finally {
      setDeleting(false)
    }
  }

  // ── guard: render nothing until auth resolves ─────────────────────────────
  if (authLoading || !user || user.email !== ADMIN_EMAIL) return null

  // ── derived lists ─────────────────────────────────────────────────────────
  const filtered = users
    .filter(u => {
      const q = search.toLowerCase()
      return (
        u.displayName.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      const av = (a as any)[sortKey] ?? 0
      const bv = (b as any)[sortKey] ?? 0
      return sortDesc ? bv - av : av - bv
    })

  const totalMessages = users.reduce((s, u) => s + (u.messageCount ?? 0), 0)
  const totalMedia    = users.reduce((s, u) => s + (u.imageCount ?? 0) + (u.videoCount ?? 0), 0)
  const onlineNow     = users.filter(u => u.isOnline).length

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDesc(d => !d)
    else { setSortKey(key); setSortDesc(true) }
  }

  const SortBtn = ({ k, label }: { k: typeof sortKey; label: string }) => (
    <button
      onClick={() => toggleSort(k)}
      className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
        sortKey === k
          ? 'border-amber-700/60 bg-amber-900/30 text-amber-400'
          : 'border-white/10 text-white/30 hover:text-white/60'
      }`}
    >
      {label} {sortKey === k ? (sortDesc ? '↓' : '↑') : ''}
    </button>
  )

  return (
    <div className="min-h-screen" style={{ background: '#060f07' }}>

      {/* ── Header ── */}
      <nav className="sticky top-0 z-40 flex items-center justify-between px-5 py-3 border-b border-white/6 backdrop-blur-md"
           style={{ background: 'rgba(6,15,7,0.85)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-amber-900/40 border border-amber-700/40 flex items-center justify-center">
            <Shield size={15} className="text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-300 leading-none">Forest Warden</p>
            <p className="text-[10px] text-amber-900 mt-0.5">Admin Panel · Terra Sylvan</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadUsers}
            disabled={fetching}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] border
                       border-forest-800/50 text-forest-500 hover:text-forest-300 transition-colors"
          >
            <RefreshCw size={12} className={fetching ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] border
                       border-white/10 text-white/40 hover:text-white/70 transition-colors"
          >
            <X size={12} />
            Exit
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* ── Summary stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={<Users size={16}/>}        label="Total members"    value={users.length}    accent="#86efac" />
          <StatCard icon={<MessageSquare size={16}/>} label="Total messages"   value={totalMessages}   accent="#6ee7b7" />
          <StatCard icon={<Image size={16}/>}         label="Total media"      value={totalMedia}      accent="#c4b5fd" />
          <StatCard icon={<TreePine size={16}/>}      label="Online now"       value={onlineNow}       accent="#fcd34d" />
        </div>

        {/* ── Search + sort ── */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-700 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name, username, email…"
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-forest-900/60 bg-forest-950/50
                         text-xs text-forest-200 placeholder-forest-800
                         focus:outline-none focus:border-forest-700/50"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-forest-800">Sort:</span>
            <SortBtn k="createdAt"       label="Newest" />
            <SortBtn k="messageCount"    label="Messages" />
            <SortBtn k="imageCount"      label="Photos" />
            <SortBtn k="connectionCount" label="Connections" />
          </div>
        </div>

        {/* ── User table ── */}
        {fetching ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 rounded-2xl bg-forest-950/40 animate-pulse border border-white/4" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <p className="text-4xl">🌾</p>
            <p className="text-forest-700 text-sm">No users match your search.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((u) => {
              const treeConfig = TREE_CONFIGS[u.treeType]
              const stats      = computeTreeStats(u)
              const mediaTotal = (u.imageCount ?? 0) + (u.videoCount ?? 0)
              const isMe       = u.email === ADMIN_EMAIL

              return (
                <div
                  key={u.uid}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl border transition-colors"
                  style={{
                    background:   isMe ? 'rgba(217,119,6,0.06)' : 'rgba(10,20,11,0.7)',
                    borderColor:  isMe ? 'rgba(217,119,6,0.25)' : 'rgba(255,255,255,0.05)',
                  }}
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-forest-950 border border-forest-800/40
                                  flex items-center justify-center text-lg flex-shrink-0 overflow-hidden">
                    {u.photoURL
                      ? <img src={u.photoURL} alt={u.displayName} className="w-full h-full object-cover" />
                      : treeConfig?.emoji ?? '🌳'}
                  </div>

                  {/* Identity */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-white/90 leading-none truncate">
                        {u.displayName}
                      </p>
                      {isMe && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-900/40 border border-amber-700/40 text-amber-400">
                          You (admin)
                        </span>
                      )}
                      {u.isOnline && (
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" title="Online" />
                      )}
                    </div>
                    <p className="text-[11px] text-forest-600 mt-0.5 truncate">@{u.username}</p>
                    <p className="text-[10px] text-forest-800 truncate">{u.email}</p>
                  </div>

                  {/* Tree */}
                  <div className="hidden sm:flex flex-col items-center gap-0.5 text-center w-16 flex-shrink-0">
                    <span className="text-base">{treeConfig?.emoji ?? '🌳'}</span>
                    <p className="text-[9px] text-forest-700 leading-none">{treeConfig?.label ?? u.treeType}</p>
                    <p className="text-[9px] text-forest-800">{stats.stage}</p>
                  </div>

                  {/* Activity pills */}
                  <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-forest-950/60 border border-forest-900/60 text-[10px] text-forest-500">
                      🍃 {u.messageCount ?? 0}
                    </span>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-forest-950/60 border border-forest-900/60 text-[10px] text-forest-500">
                      🌸 {u.imageCount ?? 0}
                    </span>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-forest-950/60 border border-forest-900/60 text-[10px] text-forest-500">
                      🍎 {u.videoCount ?? 0}
                    </span>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-forest-950/60 border border-forest-900/60 text-[10px] text-forest-500">
                      🌿 {u.connectionCount ?? 0}
                    </span>
                  </div>

                  {/* Age / joined */}
                  <div className="hidden lg:flex flex-col items-end gap-0.5 w-20 flex-shrink-0">
                    <p className="text-[10px] text-forest-700">Joined</p>
                    <p className="text-[10px] text-forest-600">{fmtDate(u.createdAt)}</p>
                    <p className="text-[9px] text-forest-800">{fmtAge(u.createdAt)} ago</p>
                  </div>

                  {/* Media usage bar */}
                  <div className="hidden lg:flex flex-col gap-0.5 w-20 flex-shrink-0">
                    <div className="flex justify-between text-[9px] text-forest-800">
                      <span>Media</span>
                      <span>{mediaTotal}</span>
                    </div>
                    <div className="h-1 rounded-full bg-forest-950/80 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-700 to-pink-600 transition-all"
                        style={{ width: `${Math.min(100, (mediaTotal / 20) * 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-forest-800">
                      <span>Msgs</span>
                      <span>{u.messageCount ?? 0}</span>
                    </div>
                    <div className="h-1 rounded-full bg-forest-950/80 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-forest-700 to-forest-500 transition-all"
                        style={{ width: `${Math.min(100, ((u.messageCount ?? 0) / 50) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Delete */}
                  {!isMe && (
                    <button
                      onClick={() => setToDelete(u)}
                      title="Delete user"
                      className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center
                                 border border-transparent text-forest-800
                                 hover:border-red-900/60 hover:bg-red-950/40 hover:text-red-500
                                 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <p className="text-center text-[10px] text-forest-900 pb-4">
          {filtered.length} of {users.length} members shown · Terra Sylvan Admin
        </p>
      </div>

      {/* ── Delete confirm modal ── */}
      {toDelete && (
        <DeleteConfirmModal
          user={toDelete}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
