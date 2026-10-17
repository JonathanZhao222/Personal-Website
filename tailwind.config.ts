import type { Config } from 'tailwindcss'

// Colors are CSS variables (space-separated RGB) defined in globals.css,
// so opacity modifiers like `text-ink/60` keep working.
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './content/**/*.mdx',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      colors: {
        black: '#000000',
        white: '#ffffff',
        ground: token('ground'),
        ink: token('ink'),
        soft: token('soft'),
        body: token('body'),
        muted: token('muted'),
        dim: token('dim'),
        accent: token('accent'),
      },
      maxWidth: {
        plate: '1200px',
      },
    },
  },
  plugins: [],
}

export default config
