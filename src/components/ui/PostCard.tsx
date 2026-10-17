import Link from 'next/link'
import type { Post } from '@/types/post'

interface PostCardProps {
  post: Post
  /** Entry number, shown as "No. 07" */
  number?: number
}

export function PostCard({ post, number }: PostCardProps) {
  const { slug, frontmatter } = post

  return (
    <Link
      href={`/writing/${slug}`}
      className="group flex flex-wrap gap-x-8 gap-y-2 py-7 border-b border-white/10 transition-colors duration-300 hover:bg-white/[0.02]"
    >
      <time dateTime={frontmatter.date} className="flex-[0_0_120px] font-mono text-xs text-dim pt-2">
        {frontmatter.date.replace(/-/g, '.')}
      </time>
      <span className="flex-[1_1_520px] min-w-0 flex flex-col gap-2 transition-transform duration-300 ease-out motion-safe:group-hover:translate-x-1.5">
        <span className="font-serif text-[28px] leading-[1.15] group-hover:text-accent transition-colors">
          {frontmatter.title}
        </span>
        <span className="text-[15px] leading-relaxed text-muted max-w-[720px]">
          {frontmatter.excerpt}
        </span>
      </span>
      {number !== undefined && (
        <span className="flex-none flex items-center gap-2 font-mono text-xs text-dim pt-2">
          <span
            aria-hidden="true"
            className="text-accent opacity-0 transition-[opacity,transform] duration-300 motion-safe:-translate-x-2 group-hover:opacity-100 motion-safe:group-hover:translate-x-0"
          >
            →
          </span>
          No. {String(number).padStart(2, '0')}
        </span>
      )}
    </Link>
  )
}
