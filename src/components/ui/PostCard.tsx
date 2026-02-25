import Link from 'next/link'
import type { Post } from '@/types/post'

interface PostCardProps {
  post: Post
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function PostCard({ post }: PostCardProps) {
  const { slug, frontmatter } = post

  return (
    <Link href={`/writing/${slug}`} className="block group">
      <div className="flex flex-col md:flex-row md:items-start gap-1 md:gap-8 py-6 border-b border-black/10">
        <time
          dateTime={frontmatter.date}
          className="shrink-0 font-sans text-sm text-black/40 md:w-28 pt-0.5"
        >
          {formatDate(frontmatter.date)}
        </time>
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-lg leading-snug group-hover:translate-x-0.5 transition-transform duration-200">
            {frontmatter.title}
          </h3>
          <p className="mt-1.5 font-sans text-sm text-black/60 leading-relaxed">
            {frontmatter.excerpt}
          </p>
        </div>
        <span className="shrink-0 font-sans text-xs text-black/30 group-hover:text-black transition-colors mt-0.5 hidden md:block">
          ↗
        </span>
      </div>
    </Link>
  )
}
