import Link from 'next/link'
import type { MDXComponents } from 'mdx/types'

export const mdxComponents: MDXComponents = {
  h1: ({ children }) => (
    <h1 className="font-serif text-3xl md:text-4xl mt-12 mb-6 leading-tight">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-serif text-2xl md:text-3xl mt-10 mb-4 leading-tight">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-serif text-xl md:text-2xl mt-8 mb-3 leading-snug">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mb-5 leading-relaxed text-black/80">{children}</p>
  ),
  a: ({ href, children }) => {
    const isExternal = href?.startsWith('http')
    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 decoration-black/30 hover:decoration-black transition-colors"
        >
          {children}
        </a>
      )
    }
    return (
      <Link
        href={href ?? '/'}
        className="underline underline-offset-2 decoration-black/30 hover:decoration-black transition-colors"
      >
        {children}
      </Link>
    )
  },
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-black/20 pl-4 my-6 text-black/60 italic">
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="font-mono text-sm bg-black/5 px-1.5 py-0.5 rounded">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="font-mono text-sm bg-black/5 p-4 rounded overflow-x-auto my-6">
      {children}
    </pre>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-outside ml-5 mb-5 space-y-1.5 text-black/80">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-outside ml-5 mb-5 space-y-1.5 text-black/80">
      {children}
    </ol>
  ),
  hr: () => <hr className="border-black/10 my-10" />,
}
