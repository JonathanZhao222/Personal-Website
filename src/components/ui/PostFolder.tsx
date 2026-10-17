'use client'

import { useEffect, useId, useRef, useState } from 'react'
import type { Post } from '@/types/post'
import { PostCard } from '@/components/ui/PostCard'

interface PostFolderProps {
  title: string
  description?: string
  posts: Post[]
  /** Entry number for each post, by slug */
  numbers: Record<string, number>
  defaultOpen?: boolean
}

/** A collapsible group of posts: a folder row that expands to its entries. */
export function PostFolder({ title, description, posts, numbers, defaultOpen = false }: PostFolderProps) {
  const [open, setOpen] = useState(defaultOpen)
  const panelId = useId()
  const innerRef = useRef<HTMLDivElement>(null)

  // Collapsed entries stay in the DOM for the height animation; inert keeps them out of tab order.
  // Set directly because React 18 doesn't pass `inert` through.
  useEffect(() => {
    if (innerRef.current) innerRef.current.inert = !open
  }, [open])

  return (
    <div className="border-b border-white/10">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="group w-full flex flex-wrap items-start gap-x-8 gap-y-2 py-7 text-left transition-colors duration-300 hover:bg-white/[0.02]"
      >
        <span className="flex-[0_0_120px] flex items-center gap-2 font-mono text-xs text-dim pt-2.5 transition-colors duration-300 group-hover:text-accent">
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          >
            {open ? (
              <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v1H7.5a2 2 0 0 0-1.9 1.4L3 19V7Zm0 12 2.6-7.6A2 2 0 0 1 7.5 10H22l-2.6 7.6a2 2 0 0 1-1.9 1.4H3Z" />
            ) : (
              <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
            )}
          </svg>
          {String(posts.length).padStart(2, '0')} papers
        </span>
        <span className="flex-[1_1_520px] min-w-0 flex flex-col gap-2 transition-transform duration-300 ease-out motion-safe:group-hover:translate-x-1.5">
          <span className="font-serif text-[32px] leading-[1.1] group-hover:text-accent transition-colors">
            {title}
          </span>
          {description && (
            <span className="text-[15px] leading-relaxed text-muted">— {description}</span>
          )}
        </span>
        <span className="flex-none flex items-center gap-2 font-mono text-xs text-muted pt-2.5 group-hover:text-accent transition-colors">
          {open ? 'Show less' : 'Show all'}
          <svg
            aria-hidden="true"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </button>

      {/* grid-rows 0fr → 1fr animates to the content's natural height */}
      <div
        id={panelId}
        className={`grid transition-[grid-template-rows] duration-500 ease-out ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div ref={innerRef} className="overflow-hidden">
          <div className="md:pl-12 border-t border-white/[0.06]">
            {posts.map((post, i) => (
              <div
                key={post.slug}
                className={`transition-[opacity,transform] duration-500 ease-out ${
                  open ? 'opacity-100 translate-y-0' : 'opacity-0 motion-safe:-translate-y-2'
                } last:[&>a]:border-b-0`}
                style={{ transitionDelay: open ? `${80 + i * 40}ms` : '0ms' }}
              >
                <PostCard post={post} number={numbers[post.slug]} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
