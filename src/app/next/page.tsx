import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Next',
  robots: { index: false, follow: false },
}

type Seg = { text: string; href?: string }

function Para({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`leading-[1.85] text-[#c4c4c4] ${className}`}>{children}</p>
  )
}

function Link({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#d4d4d4] underline decoration-[#4a4a4a] underline-offset-2 hover:decoration-[#86efac] hover:text-[#86efac] transition-colors duration-150"
    >
      {children}
    </a>
  )
}

function Rule() {
  return <hr className="border-none border-t border-[#1f1f1f] my-0" />
}

export default function NextPage() {
  return (
    <div className="max-w-[680px] mx-auto px-6 md:px-8 pb-32">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="py-8 flex items-center justify-between">
        <span className="font-mono text-xs tracking-[0.25em] uppercase text-[#86efac]">
          NEXT
        </span>
      </header>
      <Rule />

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <div className="mt-12 space-y-7 text-[15px]">

        {/* Lede */}
        <Para className="text-[#e8e8e8] text-base">
          Ah, you&apos;ve made it to the section of my website that I don&apos;t want employers to see.
          Here, I talk about what I&apos;m building and why it&apos;s the next big thing.
        </Para>

        <Rule />

        {/* Background */}
        <Para>
          It started 100 years ago, when researchers at IG Farben and DuPont discovered PCTFE, the
          first perfluoroalkyl substance. These are completely artificial compounds designed to
          withstand heat, repel oil and achieve maximal chemical stability. PFAS, now called
          &ldquo;forever chemicals&rdquo;, consist of Carbon-Fluorine bonds, which are one of the
          strongest bonds in chemistry. This is why our body cannot break it down. Neither can the
          soil. Neither can the ocean. Now, PFAS is detected in{' '}
          <Link href="https://www.usgs.gov/news/national-news-release/tap-water-study-detects-pfas-forever-chemicals-across-us">
            45%
          </Link>{' '}
          of household tap waters and its market will grow to{' '}
          <Link href="https://www.marketsandmarkets.com/Market-Reports/pfas-waste-management-market-2812989.html">
            $2.98 billion by 2031
          </Link>
          . 3M alone has set aside $10.3 billion to settle PFAS lawsuits. DuPont, Chemours, and
          Corteva have committed another $1.18 billion. The DoD estimates PFAS remediation across
          U.S. military bases will cost over $30 billion. The EU&apos;s projected cleanup cost over
          the next 20 years sits around €2 trillion.
        </Para>

        {/* Pull quote */}
        <blockquote className="border-l-2 border-[#86efac] pl-5 py-1">
          <p className="text-[#e8e8e8] text-lg leading-snug font-light italic">
            &ldquo;We are looking at the largest environmental liability in human history.&rdquo;
          </p>
        </blockquote>

        {/* My work */}
        <Para>
          I&apos;ve done work with PFAS for the last 3 years, starting when I worked with the UK
          government (Chartered Institute for Water and Environment Management). I developed ways to
          detect PFAS with geospatial models and filter PFAS with activated carbon. This took me
          sampling water across the world, presenting at World Water Week,{' '}
          <Link href="https://chemrxiv.org/doi/10.26434/chemrxiv-2024-tx50z">
            a first author paper
          </Link>
          ,{' '}
          <Link href="https://www.forbes.com/sites/sanammahoozi/2024/09/06/this-is-what-happened-at-world-water-week-in-stockholm/">
            a feature in Forbes
          </Link>{' '}
          and{' '}
          <Link href="https://www.kungahuset.se/arkiv/nyheter/2024-08-28-kronprinsessan-delade-ut--stockholm-junior-water-prize">
            an award from the Swedish Royal Family
          </Link>
          .
        </Para>

        <Rule />

        <Para>
          Right now, there&apos;s a lot of work on PFAS detection and filtration. A lot.
        </Para>

        <Para>
          But these solutions just move the problem somewhere else. You can capture PFAS in
          activated carbon, ion exchange resins and reverse osmosis devices, but their disposal just
          returns PFAS into the soil. To fully break down PFAS, the only options on the market are
          through hydrothermal processing, photocatalysis or incineration. These are, frankly, a
          little ridiculous to be implemented at large scales or in a cost-effective way.
        </Para>

        <Rule />

        {/* PFASolve2 display */}
        <div className="py-4">
          <p className="font-mono text-[#86efac] text-sm tracking-widest uppercase">
            This is where PFASolve2 comes in.
          </p>
        </div>

        <Para>
          <Link href="/Alive.pdf">read the science</Link>
        </Para>

        <Para>
          I&apos;m on a journey to discover microbial organisms that break down PFAS permanently.
          This is an incredibly novel and emerging field, since PFAS has only become endemic to many
          regions recently and bacteria are just now evolving to break them down. There&apos;s been
          some preliminary research on this topic (
          <Link href="https://www.nature.com/articles/s44221-023-00077-6">1</Link>
          ,{' '}
          <Link href="https://www.sciencedirect.com/science/article/pii/S0304389426004991">2</Link>
          ,{' '}
          <Link href="https://www.sciencedirect.com/science/article/pii/S0043135425020524">3</Link>
          ) but nothing substantial and nothing at scale.
        </Para>

        <blockquote className="border-l-2 border-[#86efac] pl-5 py-1">
          <p className="text-[#e8e8e8] text-lg leading-snug font-light italic">
            &ldquo;We are finding bacteria that can be embedded in wastewater systems, bioreactors
            and point-of-use filters that permanently destroy PFAS compounds.&rdquo;
          </p>
        </blockquote>

        <Para>
          Like any biotech/climate tech startup, there&apos;s a lot of funding for R&amp;D that
          needs to come in before customer acquisition and investment.
        </Para>

        {/* The bet callout */}
        <div className="border border-[#1f1f1f] rounded-sm p-6 space-y-3 bg-[#0f0f0f]">
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#86efac] mb-4">
            The Bet
          </p>
          <Para>
            Within 12 months, I find the organism. Within 36 months, we engineer it for deployable
            activity to water utilities. Within 10 years, PFAS in groundwater is a solved problem.
          </Para>
        </div>

        {/* Closing */}
        <Para>
          If this works, we don&apos;t just clean up the existing contamination. We establish that
          the strongest bond in organic chemistry is biodegradable, given the right enzyme. That has
          implications far beyond PFAS — it&apos;s a foundational result for every other
          &ldquo;forever&rdquo; molecule we&apos;ve made and will make. It means the assumption that
          synthetic chemistry can outrun biology is wrong.
        </Para>

      </div>

      <div className="mt-16 flex justify-end">
        <span className="font-mono text-xs tracking-[0.2em] text-[#4a4a4a] italic">
          stay for updates...
        </span>
      </div>
    </div>
  )
}
