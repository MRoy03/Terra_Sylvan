'use client'

import { clsx } from 'clsx'

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface AvatarProps {
  photoURL:    string | null
  displayName: string
  size?:       Size
  isOnline?:   boolean
  className?:  string
}

const sizeMap: Record<Size, string> = {
  xs: 'w-6  h-6  text-xs',
  sm: 'w-8  h-8  text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-14 h-14 text-xl',
  xl: 'w-20 h-20 text-3xl',
}

const dotMap: Record<Size, string> = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2   h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3   h-3',
  xl: 'w-4   h-4',
}

export function Avatar({ photoURL, displayName, size = 'md', isOnline, className }: AvatarProps) {
  const initial = (displayName?.[0] ?? '?').toUpperCase()

  return (
    <div className={clsx('relative flex-shrink-0', className)}>
      <div className={clsx(
        'rounded-full bg-forest-800 border-2 border-forest-700 flex items-center justify-center overflow-hidden font-bold text-forest-300',
        sizeMap[size],
      )}>
        {photoURL
          ? <img src={photoURL} alt={displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          : <span>{initial}</span>
        }
      </div>

      {isOnline !== undefined && (
        <span className={clsx(
          'absolute bottom-0 right-0 rounded-full border-2 border-forest-950',
          dotMap[size],
          isOnline ? 'bg-emerald-400' : 'bg-gray-500',
        )} />
      )}
    </div>
  )
}
