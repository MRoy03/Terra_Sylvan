import { Metadata } from 'next'
import { RegisterForm } from '@/components/auth/RegisterForm'

export const metadata: Metadata = {
  title: 'Create Account — Terra Sylvan',
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen forest-bg flex items-center justify-center px-4 py-12">
      {/* Decorative background trees */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <span className="absolute top-8 left-8 text-7xl opacity-15 animate-float">🌲</span>
        <span className="absolute top-20 right-10 text-6xl opacity-10 animate-float" style={{ animationDelay: '1.2s' }}>🌳</span>
        <span className="absolute bottom-16 left-12 text-5xl opacity-20 animate-float" style={{ animationDelay: '0.7s' }}>🌴</span>
        <span className="absolute bottom-8 right-8 text-4xl opacity-15 animate-float"  style={{ animationDelay: '1.8s' }}>🌿</span>
        <span className="absolute top-1/2 left-4 text-3xl opacity-10 animate-float"   style={{ animationDelay: '2.3s' }}>🍃</span>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-forest-950/20 to-forest-950/50" />
      </div>

      <div className="relative z-10 w-full">
        <RegisterForm />
      </div>
    </div>
  )
}
