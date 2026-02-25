import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import type { Post, PostFrontmatter } from '@/types/post'

const POSTS_DIR = path.join(process.cwd(), 'content/posts')

export async function getAllPosts(): Promise<Post[]> {
  const files = await fs.readdir(POSTS_DIR)
  const posts = await Promise.all(
    files
      .filter((f) => f.endsWith('.mdx'))
      .map(async (filename) => {
        const slug = filename.replace(/\.mdx$/, '')
        const raw = await fs.readFile(path.join(POSTS_DIR, filename), 'utf-8')
        const { data } = matter(raw)
        return {
          slug,
          frontmatter: data as PostFrontmatter,
        }
      })
  )
  return posts
    .filter((p) => p.frontmatter.published)
    .sort((a, b) => b.frontmatter.date.localeCompare(a.frontmatter.date))
}

export async function getPostBySlug(slug: string): Promise<PostFrontmatter> {
  const raw = await fs.readFile(path.join(POSTS_DIR, `${slug}.mdx`), 'utf-8')
  const { data } = matter(raw)
  return data as PostFrontmatter
}

export async function getPostContent(
  slug: string
): Promise<{ frontmatter: PostFrontmatter; content: string }> {
  const raw = await fs.readFile(path.join(POSTS_DIR, `${slug}.mdx`), 'utf-8')
  const { data, content } = matter(raw)
  return {
    frontmatter: data as PostFrontmatter,
    content,
  }
}
