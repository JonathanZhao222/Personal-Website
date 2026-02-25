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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function PostPage({ params }: Props) {
  const posts = await getAllPosts()
  const post = posts.find((p) => p.slug === params.slug)
  if (!post) notFound()

  const { content } = await getPostContent(params.slug)

  return (
    <article className="max-w-2xl mx-auto px-6 md:px-8 pt-28 pb-24">
      <Link
        href="/writing"
        className="inline-block font-sans text-sm text-black/40 hover:text-black transition-colors mb-12"
      >
        ← Writing
      </Link>

      <header className="mb-12">
        <h1 className="font-serif text-3xl md:text-4xl leading-tight mb-4">
          {post.frontmatter.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4">
          <time
            dateTime={post.frontmatter.date}
            className="font-sans text-sm text-black/40"
          >
            {formatDate(post.frontmatter.date)}
          </time>
          <div className="flex flex-wrap gap-1.5">
            {post.frontmatter.tags.map((tag) => (
              <span
                key={tag}
                className="font-sans text-xs text-black/40 border border-black/15 px-2 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </header>

      <div className="prose-content">
        <MDXRemote source={content} components={mdxComponents} />
      </div>
    </article>
  )
}
