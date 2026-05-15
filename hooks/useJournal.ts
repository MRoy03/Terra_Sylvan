import { useState, useEffect } from 'react'
import { subscribeJournal, type JournalEntry } from '@/lib/firestore'

export function useJournal(uid: string | undefined) {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) { setLoading(false); return }
    setLoading(true)
    const unsub = subscribeJournal(uid, (e) => { setEntries(e); setLoading(false) })
    return () => unsub()
  }, [uid])

  return { entries, loading }
}
