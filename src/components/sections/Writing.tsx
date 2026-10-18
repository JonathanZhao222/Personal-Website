import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'
import { groupPosts } from '@/lib/postGroups'
import { PostCard } from '@/components/ui/PostCard'
import { PostFolder } from '@/components/ui/PostFolder'
import { FadeIn } from '@/components/ui/FadeIn'
import { SectionHeader } from '@/components/ui/SectionHeader'

export default async function Writing() {
  const posts = await getAllPosts()
  const { numbers, uncategorized, folders } = groupPosts(posts)

  return (
    <section
      id="writing"
      className="max-w-plate mx-auto px-6 pb-28 scroll-mt-24"
      aria-labelledby="writing-heading"
    >
      <FadeIn>
        <SectionHeader
          id="writing-heading"
          label="4°"
          title="Fragments"
          description="I write about neuroscience, philosophy, and occasionally poems of love."
          aside={
            <Link href="/writing" className="text-muted hover:text-accent transition-colors">
              all {posts.length} entries &rarr;
            </Link>
          }
        />
      </FadeIn>

      {posts.length === 0 ? (
        <FadeIn delay={0.08}>
          <p className="font-mono text-xs text-dim border-t border-white/10 pt-6">
            More to come.
          </p>
        </FadeIn>
      ) : (
        <div className="border-t border-white/10">
          {folders.map((folder, i) => (
            <FadeIn key={folder.title} delay={i * 0.08}>
              <PostFolder {...folder} numbers={numbers} />
            </FadeIn>
          ))}
          {uncategorized.slice(0, 4).map((post, i) => (
            <FadeIn key={post.slug} delay={(folders.length + i) * 0.08}>
              <PostCard post={post} number={numbers[post.slug]} />
            </FadeIn>
          ))}
        </div>
      )}
    </section>
  )
}
