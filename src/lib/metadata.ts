import type { Metadata } from 'next'

export const siteUrl = 'https://jonathanzhao.com'

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Jonathan Zhao',
    template: '%s — Jonathan Zhao',
  },
  description:
    'Stanford student researching and building in computational biology and neuroscience.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Jonathan Zhao',
    title: 'Jonathan Zhao',
    description:
      'Stanford student researching and building in computational biology and neuroscience.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jonathan Zhao',
    description:
      'Stanford student researching and building in computational biology and neuroscience.',
  },
  robots: {
    index: true,
    follow: true,
  },
}
