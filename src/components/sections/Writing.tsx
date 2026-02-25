import { FadeIn } from '@/components/ui/FadeIn'

export default function Writing() {
  return (
    <section
      id="writing"
      className="max-w-4xl mx-auto px-6 md:px-8 py-24"
      aria-labelledby="writing-heading"
    >
      <FadeIn>
        <h2
          id="writing-heading"
          className="font-sans text-xs tracking-widest uppercase text-black/40 mb-10"
        >
          Writing
        </h2>
      </FadeIn>
      <FadeIn delay={0.08}>
        <p className="font-sans text-sm text-black/40 border-t border-black/10 pt-6">
          More to come.
        </p>
      </FadeIn>
    </section>
  )
}
