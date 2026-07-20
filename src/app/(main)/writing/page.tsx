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
  const uncategorized = posts.filter((p) => !p.frontmatter.category)
  const categories = Array.from(
    new Set(
      posts
        .map((p) => p.frontmatter.category)
        .filter((c): c is string => Boolean(c))
    )
  )

  return (
    <div className="max-w-4xl mx-auto px-6 md:px-8 pt-28 pb-20">
      <FadeIn>
        <h1 className="font-sans text-xs tracking-widest uppercase text-black/40 mb-10">
          Writing
        </h1>
      </FadeIn>

      {posts.length === 0 ? (
        <p className="font-sans text-sm text-black/40 py-12 border-t border-black/10">
          No posts yet. Check back soon.
        </p>
      ) : (
        <>
          {uncategorized.length > 0 && (
            <div className="border-t border-black/10 mb-16">
              {uncategorized.map((post, i) => (
                <FadeIn key={post.slug} delay={i * 0.08}>
                  <PostCard post={post} />
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
                  <h2 className="font-sans text-xs tracking-widest uppercase text-black/40 mb-4">
                    {category}
                  </h2>
                </FadeIn>
                <div className="border-t border-black/10">
                  {categoryPosts.map((post, i) => (
                    <FadeIn key={post.slug} delay={i * 0.08}>
                      <PostCard post={post} />
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
