import type { Metadata } from 'next'
import { getAllPosts } from '@/lib/posts'
import { PostCard } from '@/components/ui/PostCard'
import { FadeIn } from '@/components/ui/FadeIn'

export const metadata: Metadata = {
  title: 'Writing',
  description:
    'Essays and notes on computational biology, neuroscience, and research.',
}

export default async function WritingPage() {
  const posts = await getAllPosts()

  return (
    <div className="max-w-4xl mx-auto px-6 md:px-8 pt-28 pb-20">
      <FadeIn>
        <h1 className="font-sans text-xs tracking-widest uppercase text-black/40 mb-10">
          Writing
        </h1>
      </FadeIn>
      <div className="border-t border-black/10">
        {posts.length === 0 ? (
          <p className="font-sans text-sm text-black/40 py-12">
            No posts yet. Check back soon.
          </p>
        ) : (
          posts.map((post, i) => (
            <FadeIn key={post.slug} delay={i * 0.08}>
              <PostCard post={post} />
            </FadeIn>
          ))
        )}
      </div>
    </div>
  )
}
