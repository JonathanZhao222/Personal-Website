import type { Project } from '@/types/project'

interface ProjectCardProps {
  project: Project
  index: number
}

const underline = 'underline decoration-white/25 underline-offset-[3px] hover:text-accent transition-colors'

export function ProjectCard({ project, index }: ProjectCardProps) {
  const ongoing = project.status === 'ongoing'
  const hasLinks = project.links && project.links.length > 0

  return (
    <article className="group flex flex-col gap-4 w-full p-7 border border-white/10 bg-white/[0.015] transition-[transform,border-color,background-color,box-shadow] duration-300 ease-out hover:border-accent/40 hover:bg-white/[0.03] hover:shadow-[0_12px_40px_-20px_rgb(var(--accent)/0.35)] motion-safe:hover:-translate-y-1">
      <div className="flex justify-between font-mono text-[11px] tracking-[0.12em] text-dim">
        <span>3{String.fromCharCode(97 + index)}</span>
        <span>{project.year.replace('–', ' – ').toUpperCase()}</span>
      </div>
      <div
        aria-hidden="true"
        className={`h-px w-10 transition-[width,background-color] duration-500 ease-out group-hover:w-20 ${
          ongoing ? 'bg-accent' : 'bg-dim group-hover:bg-accent'
        }`}
      />

      <h3 className="font-serif font-normal text-[30px] leading-[1.1]">{project.title}</h3>

      {(project.institution || project.link) && (
        <p className="font-mono text-xs text-muted">
          {project.institution}
          {project.institution && project.link && ' · '}
          {project.link && (
            <a href={project.link} target="_blank" rel="noopener noreferrer" className={underline}>
              {project.linkLabel ?? 'link'}
            </a>
          )}
        </p>
      )}

      <p className="flex-auto text-[15px] leading-relaxed text-body">{project.description}</p>

      {project.award && (
        <p className="flex items-center gap-2.5 font-mono text-xs text-accent">
          <svg
            aria-hidden="true"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <circle cx="12" cy="9" r="6" />
            <path d="M8.5 14 7 22l5-3 5 3-1.5-8" />
          </svg>
          {project.award.replace(/ Winner$/, '')}
        </p>
      )}

      <div className="flex flex-wrap gap-x-[18px] gap-y-2 pt-3.5 border-t border-white/[0.08] font-mono text-xs">
        {hasLinks ? (
          project.links!.map((l) => (
            <a
              key={l.label}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors"
            >
              {l.label} ↗
            </a>
          ))
        ) : (
          <span className="text-dim">{ongoing ? 'in progress' : 'archived'}</span>
        )}
      </div>
    </article>
  )
}
