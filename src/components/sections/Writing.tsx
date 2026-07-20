import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'
import { PostCard } from '@/components/ui/PostCard'
import { FadeIn } from '@/components/ui/FadeIn'

export default async function Writing() {
  const posts = await getAllPosts()
  const latest = posts.slice(0, 4)

  return (
    <section
      id="writing"
      className="max-w-4xl mx-auto px-6 md:px-8 py-24"
      aria-labelledby="writing-heading"
    >
      <FadeIn>
        <h2
          id="writing-heading"
          className="font-sans text-xs tracking-widest uppercase text-black/40 mb-10"
        >
          Writing
        </h2>
      </FadeIn>

      {latest.length === 0 ? (
        <FadeIn delay={0.08}>
          <p className="font-sans text-sm text-black/40 border-t border-black/10 pt-6">
            More to come.
          </p>
        </FadeIn>
      ) : (
        <div className="border-t border-black/10">
          {latest.map((post, i) => (
            <FadeIn key={post.slug} delay={i * 0.08}>
              <PostCard post={post} />
            </FadeIn>
          ))}
        </div>
      )}

      <FadeIn delay={latest.length * 0.08 + 0.08}>
        <Link
          href="/writing"
          className="inline-block mt-8 font-sans text-sm text-black/40 hover:text-black transition-colors"
        >
          View all writing &rarr;
        </Link>
      </FadeIn>
    </section>
  )
}
