import type { Metadata } from 'next'
import { getAllPosts } from '@/lib/posts'
import { PostCard } from '@/components/ui/PostCard'
import { FadeIn } from '@/components/ui/FadeIn'
import { SectionHeader } from '@/components/ui/SectionHeader'

export const metadata: Metadata = {
  title: 'Writing',
  description:
    'Essays and notes on computational biology, neuroscience, and research.',
}

export default async function WritingPage() {
  const posts = await getAllPosts()
  const uncategorized = posts.filter((p) => !p.frontmatter.category)
  const categories = Array.from(
    new Set(
      posts
        .map((p) => p.frontmatter.category)
        .filter((c): c is string => Boolean(c))
    )
  )
  const numberOf = (slug: string) => posts.length - posts.findIndex((p) => p.slug === slug)

  return (
    <div className="max-w-plate mx-auto px-6 pt-36 pb-28">
      <FadeIn>
        <SectionHeader
          as="h1"
          id="writing-heading"
          label="4° QUATERNARY"
          title="Field notes"
          description="I write about neuroscience, philosophy, and occasionally poems of love."
          aside={`${posts.length} entries`}
        />
      </FadeIn>

      {posts.length === 0 ? (
        <p className="font-mono text-xs text-dim py-12 border-t border-white/10">
          No posts yet. Check back soon.
        </p>
      ) : (
        <>
          {uncategorized.length > 0 && (
            <div className="border-t border-white/10 mb-16">
              {uncategorized.map((post, i) => (
                <FadeIn key={post.slug} delay={i * 0.08}>
                  <PostCard post={post} number={numberOf(post.slug)} />
                </FadeIn>
              ))}
            </div>
          )}

          {categories.map((category) => {
            const categoryPosts = posts.filter(
              (p) => p.frontmatter.category === category
            )
            return (
              <div key={category} className="mb-16">
                <FadeIn>
                  <h2 className="font-mono text-xs tracking-[0.16em] uppercase text-accent mb-4">
                    {category}
                  </h2>
                </FadeIn>
                <div className="border-t border-white/10">
                  {categoryPosts.map((post, i) => (
                    <FadeIn key={post.slug} delay={i * 0.08}>
                      <PostCard post={post} number={numberOf(post.slug)} />
                    </FadeIn>
                  ))}
                </div>
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}
