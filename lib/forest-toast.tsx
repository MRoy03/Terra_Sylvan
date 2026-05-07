import { toast } from 'react-hot-toast'
import { ForestToastCard } from '@/components/ui/ForestToast'
import type { ForestToastVariant } from '@/components/ui/ForestToast'

type Opts = { duration?: number; body?: string }

function fire(variant: ForestToastVariant, title: string, opts: Opts = {}) {
  const { duration = 3500, body } = opts
  return toast.custom(
    (t) => <ForestToastCard t={t} data={{ variant, title, body }} />,
    { duration, id: `${variant}-${Date.now()}` },
  )
}

export const forestToast = {
  growth:  (title: string, opts?: Opts)   => fire('growth',  title, opts),
  ritual:  (title: string, opts?: Opts)   => fire('ritual',  title, opts),
  mood:    (title: string, opts?: Opts)   => fire('mood',    title, opts),
  message: (title: string, opts?: Opts)   => fire('message', title, opts),
  connect: (title: string, opts?: Opts)   => fire('connect', title, opts),
  media:   (title: string, opts?: Opts)   => fire('media',   title, opts),
  call:    (title: string, opts?: Opts)   => fire('call',    title, opts),
  seed:    (title: string, opts?: Opts)   => fire('seed',    title, opts),
  badge:   (title: string, opts?: Opts)   => fire('badge',   title, opts),
  error:   (title: string, body?: string) => fire('error',   title, { body, duration: 4500 }),
  info:    (title: string, opts?: Opts)   => fire('info',    title, opts),
}
