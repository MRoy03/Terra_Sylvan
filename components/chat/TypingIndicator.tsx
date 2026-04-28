'use client'

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex items-center gap-1 bg-forest-900/60 rounded-2xl px-3 py-2">
        <span className="w-1.5 h-1.5 rounded-full bg-forest-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-forest-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-forest-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}
