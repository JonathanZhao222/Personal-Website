import type { Project } from '@/types/project'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="group flex flex-col md:flex-row md:items-start gap-2 md:gap-8 py-6 border-b border-black/10">
      <span className="shrink-0 font-sans text-sm text-black/40 md:w-28 pt-0.5">
        {project.year}
      </span>
      <div className="flex-1 min-w-0">
        <h3 className="font-serif text-lg leading-snug group-hover:translate-x-0.5 transition-transform duration-200">
          {project.link ? (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-60 transition-opacity"
            >
              {project.title} ↗
            </a>
          ) : (
            project.title
          )}
          {project.status === 'ongoing' && (
            <span className="ml-2 inline-block font-sans text-xs text-black/30 align-middle">
              ongoing
            </span>
          )}
        </h3>

        {project.award && (
          <p className="mt-1 font-sans text-xs text-black/50 italic">
            {project.award}
          </p>
        )}

        <p className="mt-1.5 font-sans text-sm text-black/60 leading-relaxed">
          {project.description}
        </p>

        {project.links && project.links.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            {project.links.map((l) => (
              <a
                key={l.label}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-xs text-black/40 hover:text-black transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
