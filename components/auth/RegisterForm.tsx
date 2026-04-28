'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User, AtSign } from 'lucide-react'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { TreeType, TREE_CONFIGS } from '@/types'

const TREE_TYPES: TreeType[] = ['oak', 'pine', 'cherry', 'willow', 'bamboo']

export function RegisterForm() {
  const { signUp } = useAuth()
  const router = useRouter()

  const [step, setStep] = useState<1 | 2>(1)

  // Step 1 fields
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')

  // Step 2 fields
  const [username,     setUsername]     = useState('')
  const [displayName,  setDisplayName]  = useState('')
  const [selectedTree, setSelectedTree] = useState<TreeType>('oak')

  const [loading, setLoading] = useState(false)
  const [errors,  setErrors]  = useState<Record<string, string>>({})

  const validateStep1 = () => {
    const e: Record<string, string> = {}
    if (!email)               e.email    = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email'
    if (!password)            e.password = 'Password is required'
    else if (password.length < 6)         e.password = 'At least 6 characters'
    if (password !== confirm) e.confirm  = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateStep2 = () => {
    const e: Record<string, string> = {}
    if (!username)               e.username    = 'Username is required'
    else if (username.length < 3)              e.username = 'At least 3 characters'
    else if (!/^[a-zA-Z0-9_]+$/.test(username)) e.username = 'Letters, numbers and _ only'
    if (!displayName) e.displayName = 'Display name is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => {
    if (validateStep1()) setStep(2)
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validateStep2()) return
    setLoading(true)
    try {
      await signUp(email, password, username.toLowerCase(), displayName, selectedTree)
      toast.success('Your tree has been planted! 🌱')
      router.push('/dashboard')
    } catch (err: any) {
      const msg =
        err.code === 'auth/email-already-in-use' ? 'This email is already registered.' :
        err.code === 'auth/weak-password'         ? 'Password is too weak.' :
        'Registration failed. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="backdrop-blur-xl bg-forest-950/70 border border-forest-800/50 rounded-3xl p-8 shadow-2xl">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🌱</div>
          <h1 className="text-3xl font-bold text-white">Join Terra Sylvan</h1>
          <p className="text-forest-400 mt-1 text-sm">Plant your tree and grow your connections</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-7">
          {[1, 2].map((s) => (
            <div key={s} className={clsx(
              'flex-1 h-1.5 rounded-full transition-all duration-300',
              step >= s ? 'bg-forest-500' : 'bg-forest-800',
            )} />
          ))}
        </div>

        {step === 1 ? (
          <div className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              icon={<Mail size={16} />}
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              icon={<Lock size={16} />}
              hint="Minimum 6 characters"
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              error={errors.confirm}
              icon={<Lock size={16} />}
            />
            <Button size="lg" fullWidth onClick={handleNext} className="mt-2">
              Next: Choose Your Tree →
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Username"
              type="text"
              placeholder="forest_dweller"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={errors.username}
              icon={<AtSign size={16} />}
              hint="Unique handle — letters, numbers, underscore"
            />
            <Input
              label="Display Name"
              type="text"
              placeholder="Your Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              error={errors.displayName}
              icon={<User size={16} />}
            />

            {/* Tree Type Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-forest-300">Choose Your Tree</label>
              <div className="grid grid-cols-5 gap-2">
                {TREE_TYPES.map((t) => {
                  const cfg = TREE_CONFIGS[t]
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedTree(t)}
                      className={clsx(
                        'flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all duration-200 cursor-pointer',
                        selectedTree === t
                          ? 'border-forest-400 bg-forest-800/60 scale-105'
                          : 'border-forest-800/50 bg-forest-950/40 hover:border-forest-700',
                      )}
                      title={cfg.description}
                    >
                      <span className="text-2xl">{cfg.emoji}</span>
                      <span className="text-[10px] text-forest-400 font-medium">{cfg.label}</span>
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-forest-600 text-center">
                {TREE_CONFIGS[selectedTree].description}
              </p>
            </div>

            <div className="flex gap-3 mt-2">
              <Button variant="secondary" size="lg" onClick={() => setStep(1)} className="flex-1">
                ← Back
              </Button>
              <Button type="submit" size="lg" loading={loading} className="flex-1">
                Plant My Tree 🌱
              </Button>
            </div>
          </form>
        )}

        <p className="text-center text-forest-500 text-sm mt-6">
          Already have a tree?{' '}
          <Link href="/login" className="text-forest-400 hover:text-forest-200 underline underline-offset-2 transition-colors">
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  )
}
