import { jobs } from '@/lib/jobs'
import type { Job } from '@/lib/jobs'
import { FadeIn } from '@/components/ui/FadeIn'
import { SectionHeader } from '@/components/ui/SectionHeader'

function StatusTag({ status }: { status: Job['status'] }) {
  const live = status === 'ongoing'
  return (
    <span
      className={`flex items-center gap-2 border border-white/[0.12] px-2.5 py-[3px] ${
        live ? 'text-accent' : 'text-muted'
      }`}
    >
      <span
        aria-hidden="true"
        className={`w-1.5 h-1.5 rounded-full ${live ? 'bg-accent' : 'border border-muted'}`}
      />
      {live ? 'ongoing' : status === 'incoming' ? 'queued' : 'completed'}
    </span>
  )
}

function JobCard({ job, index }: { job: Job; index: number }) {
  return (
    <article className="group flex flex-wrap gap-x-8 gap-y-3 py-7 border-b border-white/10 transition-colors duration-300 hover:bg-white/[0.02]">
      <span className="flex-[0_0_48px] font-mono text-xs text-dim pt-2.5 transition-colors duration-300 group-hover:text-accent">
        2{String.fromCharCode(97 + index)}
      </span>
      <div className="flex-[1_1_460px] min-w-0 transition-transform duration-300 ease-out motion-safe:group-hover:translate-x-1.5">
        <h3 className="font-serif font-normal text-[32px] leading-[1.1]">
          <a
            href={job.companyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent transition-colors"
          >
            {job.company}
          </a>
        </h3>
        <p className="mt-1.5 text-[15px] text-ink">{job.title}</p>
        <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{job.description}</p>
      </div>
      <div className="flex-none flex flex-col items-end gap-2.5 font-mono text-xs pt-2.5">
        <span className="text-muted">{job.year.replace('–', ' – ')}</span>
        <StatusTag status={job.status} />
      </div>
    </article>
  )
}

export default function Work() {
  return (
    <section
      id="work"
      className="max-w-plate mx-auto px-6 pb-28 scroll-mt-24"
      aria-labelledby="work-heading"
    >
      <FadeIn>
        <SectionHeader
          id="work-heading"
          label="2°"
          title="Work"
          aside={`${jobs.length} roles`}
        />
      </FadeIn>
      <div className="border-t border-white/10">
        {jobs.map((job, i) => (
          <FadeIn key={job.id} delay={i * 0.08}>
            <JobCard job={job} index={i} />
          </FadeIn>
        ))}
      </div>
    </section>
  )
}
