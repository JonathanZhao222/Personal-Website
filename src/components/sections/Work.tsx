import type { Project } from '@/types/project'
import { ProjectCard } from '@/components/ui/ProjectCard'
import { FadeIn } from '@/components/ui/FadeIn'

interface WorkProps {
  projects: Project[]
}

export default function Work({ projects }: WorkProps) {
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
        {projects.map((project, i) => (
          <FadeIn key={project.id} delay={i * 0.08}>
            <ProjectCard project={project} />
          </FadeIn>
        ))}
      </div>
    </section>
  )
}
