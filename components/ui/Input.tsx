'use client'

import { InputHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:   string
  error?:   string
  hint?:    string
  icon?:    React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-forest-300">
            {label}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-500 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              'w-full rounded-xl border bg-forest-950/60 text-forest-100 placeholder-forest-600',
              'px-4 py-2.5 text-base transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-forest-500',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              icon ? 'pl-10' : '',
              error
                ? 'border-red-500/70 focus:ring-red-500'
                : 'border-forest-700/50 hover:border-forest-600',
              className,
            )}
            {...props}
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {hint && !error && <p className="text-xs text-forest-600">{hint}</p>}
      </div>
    )
  },
)

Input.displayName = 'Input'
