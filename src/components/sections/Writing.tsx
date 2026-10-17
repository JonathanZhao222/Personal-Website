import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'
import { PostCard } from '@/components/ui/PostCard'
import { FadeIn } from '@/components/ui/FadeIn'
import { SectionHeader } from '@/components/ui/SectionHeader'

export default async function Writing() {
  const posts = await getAllPosts()
  const latest = posts.slice(0, 4)

  return (
    <section
      id="writing"
      className="max-w-plate mx-auto px-6 pb-28 scroll-mt-24"
      aria-labelledby="writing-heading"
    >
      <FadeIn>
        <SectionHeader
          id="writing-heading"
          label="4° QUATERNARY"
          title="Field notes"
          description="I write about neuroscience, philosophy, and occasionally poems of love."
          aside={
            <Link href="/writing" className="text-muted hover:text-accent transition-colors">
              all {posts.length} entries &rarr;
            </Link>
          }
        />
      </FadeIn>

      {latest.length === 0 ? (
        <FadeIn delay={0.08}>
          <p className="font-mono text-xs text-dim border-t border-white/10 pt-6">
            More to come.
          </p>
        </FadeIn>
      ) : (
        <div className="border-t border-white/10">
          {latest.map((post, i) => (
            <FadeIn key={post.slug} delay={i * 0.08}>
              <PostCard post={post} number={posts.length - i} />
            </FadeIn>
          ))}
        </div>
      )}
    </section>
  )
}
