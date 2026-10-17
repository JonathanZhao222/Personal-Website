import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getAllPosts, getPostContent } from '@/lib/posts'
import { mdxComponents } from '@/components/mdx/MDXComponents'

interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const posts = await getAllPosts()
  const post = posts.find((p) => p.slug === params.slug)
  if (!post) return {}

  return {
    title: post.frontmatter.title,
    description: post.frontmatter.excerpt,
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.excerpt,
      type: 'article',
      publishedTime: post.frontmatter.date,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.frontmatter.title,
      description: post.frontmatter.excerpt,
    },
  }
}

export default async function PostPage({ params }: Props) {
  const posts = await getAllPosts()
  const post = posts.find((p) => p.slug === params.slug)
  if (!post) notFound()

  const { content } = await getPostContent(params.slug)

  return (
    <article className="max-w-2xl mx-auto px-6 pt-36 pb-28">
      <Link
        href="/writing"
        className="inline-block font-mono text-xs text-muted hover:text-accent transition-colors mb-12"
      >
        ← /writing
      </Link>

      <header className="mb-12 pb-8 border-b border-white/10">
        <h1 className="font-serif text-4xl md:text-5xl leading-[1.1] mb-5">
          {post.frontmatter.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4">
          <time
            dateTime={post.frontmatter.date}
            className="font-mono text-xs text-dim"
          >
            {post.frontmatter.date.replace(/-/g, '.')}
          </time>
          <div className="flex flex-wrap gap-1.5">
            {post.frontmatter.tags.map((tag) => (
              <span
                key={tag}
                className="font-mono text-[11px] text-muted border border-white/[0.12] px-2 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </header>

      <div className="prose-content select-text">
        <MDXRemote source={content} components={mdxComponents} />
      </div>
    </article>
  )
}
