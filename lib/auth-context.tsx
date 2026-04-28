'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from './firebase'
import { UserProfile, TreeType } from '@/types'

interface AuthContextType {
  user:    User | null
  profile: UserProfile | null
  loading: boolean
  signIn:           (email: string, password: string) => Promise<void>
  signUp:           (email: string, password: string, username: string, displayName: string, treeType: TreeType) => Promise<void>
  signInWithGoogle: () => Promise<void>
  logOut:           () => Promise<void>
  refreshProfile:   () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (uid: string) => {
    const snap = await getDoc(doc(db, 'users', uid))
    if (snap.exists()) setProfile(snap.data() as UserProfile)
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        await fetchProfile(firebaseUser.uid)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signUp = async (
    email:       string,
    password:    string,
    username:    string,
    displayName: string,
    treeType:    TreeType,
  ) => {
    const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(newUser, { displayName })

    const newProfile: UserProfile = {
      uid:             newUser.uid,
      email,
      username,
      displayName,
      photoURL:        null,
      bio:             '',
      status:          '🌱 Just planted my roots!',
      treeType,
      createdAt:       Date.now(),
      updatedAt:       Date.now(),
      connectionCount: 0,
      messageCount:    0,
      imageCount:      0,
      videoCount:      0,
      isOnline:        true,
      lastSeen:        Date.now(),
    }

    await setDoc(doc(db, 'users', newUser.uid), newProfile)
    setProfile(newProfile)
  }

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    const { user: gUser } = await signInWithPopup(auth, provider)

    const snap = await getDoc(doc(db, 'users', gUser.uid))
    if (!snap.exists()) {
      const username = gUser.email?.split('@')[0] ?? `user_${gUser.uid.slice(0, 6)}`
      const newProfile: UserProfile = {
        uid:             gUser.uid,
        email:           gUser.email ?? '',
        username,
        displayName:     gUser.displayName ?? username,
        photoURL:        gUser.photoURL,
        bio:             '',
        status:          '🌱 Just planted my roots!',
        treeType:        'oak',
        createdAt:       Date.now(),
        updatedAt:       Date.now(),
        connectionCount: 0,
        messageCount:    0,
        imageCount:      0,
        videoCount:      0,
        isOnline:        true,
        lastSeen:        Date.now(),
      }
      await setDoc(doc(db, 'users', gUser.uid), newProfile)
      setProfile(newProfile)
    } else {
      setProfile(snap.data() as UserProfile)
    }
  }

  const logOut = async () => {
    await signOut(auth)
    setUser(null)
    setProfile(null)
  }

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.uid)
  }

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signIn, signUp, signInWithGoogle, logOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
