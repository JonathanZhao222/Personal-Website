import { jobs } from '@/lib/jobs'
import type { Job } from '@/lib/jobs'
import { FadeIn } from '@/components/ui/FadeIn'

function JobCard({ job }: { job: Job }) {
  return (
    <div className="group flex flex-col md:flex-row md:items-start gap-2 md:gap-8 py-6 border-b border-black/10">
      <span className="shrink-0 font-sans text-sm text-black/40 md:w-28 pt-0.5">
        {job.year}
      </span>
      <div className="flex-1 min-w-0">
        <h3 className="font-serif text-lg leading-snug group-hover:translate-x-0.5 transition-transform duration-200">
          {job.title} @{' '}
          <a
            href={job.companyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-60 transition-opacity"
          >
            {job.company} ↗
          </a>
          {job.status === 'ongoing' && (
            <span className="ml-2 inline-block font-sans text-xs text-black/30 align-middle">
              ongoing
            </span>
          )}
        </h3>
        <p className="mt-1.5 font-sans text-sm text-black/60 leading-relaxed">
          {job.description}
        </p>
      </div>
    </div>
  )
}

export default function Work() {
  return (
    <section
      id="work"
      className="max-w-4xl mx-auto px-6 md:px-8 py-24"
      aria-labelledby="work-heading"
    >
      <FadeIn>
        <h2
          id="work-heading"
          className="font-sans text-xs tracking-widest uppercase text-black/40 mb-10"
        >
          Work
        </h2>
      </FadeIn>
      <div className="border-t border-black/10">
        {jobs.map((job, i) => (
          <FadeIn key={job.id} delay={i * 0.08}>
            <JobCard job={job} />
          </FadeIn>
        ))}
      </div>
    </section>
  )
}
