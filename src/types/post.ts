export interface PostFrontmatter {
  title: string
  date: string
  excerpt: string
  tags: string[]
  published: boolean
}

export interface Post {
  slug: string
  frontmatter: PostFrontmatter
}
