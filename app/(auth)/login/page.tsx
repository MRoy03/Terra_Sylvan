import { Metadata } from 'next'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Sign In — Terra Sylvan',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen forest-bg flex items-center justify-center px-4 py-12">
      {/* Floating tree decorations */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <span className="absolute top-12 left-12 text-6xl opacity-20 animate-float">🌲</span>
        <span className="absolute top-24 right-16 text-5xl opacity-15 animate-float" style={{ animationDelay: '1s' }}>🌳</span>
        <span className="absolute bottom-20 left-8 text-7xl opacity-10 animate-float" style={{ animationDelay: '2s' }}>🌿</span>
        <span className="absolute bottom-12 right-12 text-4xl opacity-20 animate-float" style={{ animationDelay: '0.5s' }}>🍃</span>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-forest-950/20 to-forest-950/60" />
      </div>

      <div className="relative z-10 w-full">
        <LoginForm />
      </div>
    </div>
  )
}
