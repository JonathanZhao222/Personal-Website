import type { Post } from '@/types/post'
import { categoryDescriptions } from '@/lib/categories'

/**
 * Split posts (newest first) into category folders and uncategorized posts,
 * and number every entry by publication order (oldest = 1).
 */
export function groupPosts(posts: Post[]) {
  const numbers: Record<string, number> = {}
  posts.forEach((p, i) => { numbers[p.slug] = posts.length - i })

  const uncategorized = posts.filter((p) => !p.frontmatter.category)
  const folders = Array.from(
    new Set(posts.map((p) => p.frontmatter.category).filter((c): c is string => Boolean(c)))
  ).map((category) => ({
    title: category,
    description: categoryDescriptions[category],
    posts: posts.filter((p) => p.frontmatter.category === category),
  }))

  return { numbers, uncategorized, folders }
}
