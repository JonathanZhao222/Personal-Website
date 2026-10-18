import type { Metadata } from 'next'
import { getAllPosts } from '@/lib/posts'
import { groupPosts } from '@/lib/postGroups'
import { PostCard } from '@/components/ui/PostCard'
import { PostFolder } from '@/components/ui/PostFolder'
import { FadeIn } from '@/components/ui/FadeIn'
import { SectionHeader } from '@/components/ui/SectionHeader'

export const metadata: Metadata = {
  title: 'Writing',
  description:
    'Essays and notes on computational biology, neuroscience, and research.',
}

export default async function WritingPage() {
  const posts = await getAllPosts()
  const { numbers, uncategorized, folders } = groupPosts(posts)

  return (
    <div className="max-w-plate mx-auto px-6 pt-36 pb-28">
      <FadeIn>
        <SectionHeader
          as="h1"
          id="writing-heading"
          label="4° QUATERNARY"
          title="Fragments"
          description="I write about neuroscience, philosophy, and occasionally poems of love."
          aside={`${posts.length} entries`}
        />
      </FadeIn>

      {posts.length === 0 ? (
        <p className="font-mono text-xs text-dim py-12 border-t border-white/10">
          No posts yet. Check back soon.
        </p>
      ) : (
        <div className="border-t border-white/10">
          {folders.map((folder, i) => (
            <FadeIn key={folder.title} delay={i * 0.08}>
              <PostFolder {...folder} numbers={numbers} defaultOpen />
            </FadeIn>
          ))}
          {uncategorized.map((post, i) => (
            <FadeIn key={post.slug} delay={(folders.length + i) * 0.08}>
              <PostCard post={post} number={numbers[post.slug]} />
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  )
}
