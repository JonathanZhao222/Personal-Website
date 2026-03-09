import type { Project } from '@/types/project'
import { ProjectCard } from '@/components/ui/ProjectCard'
import { FadeIn } from '@/components/ui/FadeIn'

interface ResearchProps {
  projects: Project[]
}

export default function Research({ projects }: ResearchProps) {
  return (
    <section
      id="research"
      className="max-w-4xl mx-auto px-6 md:px-8 py-24"
      aria-labelledby="research-heading"
    >
      <FadeIn>
        <h2
          id="research-heading"
          className="font-sans text-xs tracking-widest uppercase text-black/40 mb-10"
        >
          Research
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
