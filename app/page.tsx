import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terra Terra Sylvan — Where Connections Grow',
}

const FEATURES = [
  { emoji: '🌳', title: 'You Are a Tree',       body: 'Your profile is a living 3D tree. It grows as your account ages, and every action shapes it.' },
  { emoji: '🍃', title: 'Leaves are Chats',      body: 'Every message you send adds a leaf to your canopy. The more you talk, the fuller your tree.' },
  { emoji: '🌸', title: 'Flowers are Images',    body: 'Photos you share bloom as flowers on your branches — a gallery that lives in nature.' },
  { emoji: '🍎', title: 'Fruits are Videos',     body: 'Videos you post grow as fruit on your tree, visible to your connections at a glance.' },
  { emoji: '🌿', title: 'Roots are Connections', body: 'Friendships grow as roots linking your tree to others — deeper bonds, wider roots.' },
  { emoji: '🌲', title: 'Communities are Forests', body: 'Join or create a Forest — choose your biome: Tropical, Tundra, Mountain, and more.' },
]

const BIOMES = [
  { emoji: '🌴', name: 'Tropical' },
  { emoji: '❄️', name: 'Tundra' },
  { emoji: '🏜️', name: 'Arid' },
  { emoji: '⛰️', name: 'Mountain' },
  { emoji: '🌊', name: 'Mangrove' },
  { emoji: '🫒', name: 'Mediterranean' },
  { emoji: '🍁', name: 'Temperate' },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen forest-bg text-white overflow-x-hidden">

      {/* ── Nav ──────────────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌳</span>
          <span className="text-xl font-bold text-forest-200 tracking-tight">Terra Sylvan</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-forest-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-5 py-2 text-sm font-semibold bg-forest-600 hover:bg-forest-500 text-white rounded-xl transition-all shadow-lg shadow-forest-900/50"
          >
            Plant Your Tree
          </Link>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="flex flex-col items-center text-center px-6 pt-20 pb-32">
        {/* Animated tree art */}
        <div className="relative mb-10 select-none">
          <div className="text-[96px] animate-float drop-shadow-2xl">🌳</div>
          <div className="absolute -top-2 -right-6 text-3xl animate-float" style={{ animationDelay: '0.8s' }}>🌸</div>
          <div className="absolute top-8 -left-8 text-2xl animate-float" style={{ animationDelay: '1.4s' }}>🍎</div>
          <div className="absolute bottom-2 right-2 text-xl animate-float" style={{ animationDelay: '0.4s' }}>🍃</div>
          {/* Glow */}
          <div className="absolute inset-0 blur-3xl bg-forest-500/10 rounded-full -z-10" />
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-b from-white to-forest-300 bg-clip-text text-transparent max-w-3xl leading-tight">
          Where Connections<br />Grow
        </h1>

        <p className="mt-6 text-lg md:text-xl text-forest-400 max-w-xl leading-relaxed">
          Terra Sylvan is a 3D forest social platform. Your profile is a living tree —
          it grows with you, blooms with your creativity, and roots into your community.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-10">
          <Link
            href="/register"
            className="px-8 py-4 bg-forest-600 hover:bg-forest-500 text-white font-bold rounded-2xl text-lg transition-all shadow-xl shadow-forest-900/60 hover:scale-105 active:scale-95"
          >
            🌱 Plant Your First Tree
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 bg-forest-900/60 hover:bg-forest-800/80 text-forest-200 font-semibold rounded-2xl text-lg border border-forest-700/50 transition-all hover:scale-105 active:scale-95"
          >
            Sign In
          </Link>
        </div>

        {/* Tree stage preview */}
        <div className="flex items-end justify-center gap-4 mt-16 opacity-70">
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">🌱</span>
            <span className="text-xs text-forest-600">Seedling</span>
          </div>
          <div className="h-px w-6 bg-forest-800 self-center" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-3xl">🌿</span>
            <span className="text-xs text-forest-600">Sapling</span>
          </div>
          <div className="h-px w-6 bg-forest-800 self-center" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-4xl">🌳</span>
            <span className="text-xs text-forest-600">Mature</span>
          </div>
          <div className="h-px w-6 bg-forest-800 self-center" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-5xl">🌲</span>
            <span className="text-xs text-forest-600">Ancient</span>
          </div>
        </div>
      </section>

      {/* ── Feature Grid ─────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-center text-3xl md:text-4xl font-bold text-white mb-3">
          Every Action Shapes Your Tree
        </h2>
        <p className="text-center text-forest-500 mb-12 text-lg">Your social life — visualised as a living ecosystem</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="glass rounded-2xl p-6 hover:border-forest-600/50 transition-all duration-300 group"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200">{f.emoji}</div>
              <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
              <p className="text-forest-500 text-sm leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Biomes ───────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-white mb-3">7 Community Biomes</h2>
        <p className="text-forest-500 mb-10">Every community has its own living landscape</p>
        <div className="flex flex-wrap justify-center gap-3">
          {BIOMES.map((b) => (
            <div
              key={b.name}
              className="flex items-center gap-2 px-4 py-2.5 glass rounded-2xl text-sm font-medium text-forest-300 hover:text-white hover:border-forest-600/50 transition-all"
            >
              <span className="text-xl">{b.emoji}</span>
              {b.name}
            </div>
          ))}
        </div>
      </section>

      {/* ── Day/Night ────────────────────────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-6 py-16 text-center">
        <div className="glass rounded-3xl p-10">
          <div className="flex justify-center gap-6 text-5xl mb-6">
            <span className="animate-float">☀️</span>
            <span className="animate-float" style={{ animationDelay: '2s' }}>🌙</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Lives With Your Time</h2>
          <p className="text-forest-400">
            Your dashboard sky shifts with your local clock — golden dawn, bright noon, amber dusk, starlit night.
            Fireflies appear after dark. Your forest breathes.
          </p>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="text-center px-6 py-20">
        <h2 className="text-4xl font-bold text-white mb-4">Ready to Grow?</h2>
        <p className="text-forest-400 mb-8 text-lg">Free forever. No credit card. Just plant your tree.</p>
        <Link
          href="/register"
          className="inline-block px-10 py-5 bg-forest-600 hover:bg-forest-500 text-white font-bold rounded-2xl text-xl transition-all shadow-2xl shadow-forest-900/60 hover:scale-105 animate-pulse-glow"
        >
          🌳 Get Started — Free
        </Link>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="text-center py-8 border-t border-forest-900/50 text-forest-700 text-sm">
        <p>🌿 Terra Sylvan — A living social forest. Built with Next.js, React Three Fiber, Firebase & Vercel.</p>
      </footer>
    </main>
  )
}
