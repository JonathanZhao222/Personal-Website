import type { Project } from '@/types/project'
import { ProjectCard } from '@/components/ui/ProjectCard'
import { FadeIn } from '@/components/ui/FadeIn'
import { SectionHeader } from '@/components/ui/SectionHeader'

interface ResearchProps {
  projects: Project[]
}

export default function Research({ projects }: ResearchProps) {
  return (
    <section
      id="research"
      className="max-w-plate mx-auto px-6 pb-28 scroll-mt-24"
      aria-labelledby="research-heading"
    >
      <FadeIn>
        <SectionHeader
          id="research-heading"
          label="3°"
          title="Research"
          aside={`${projects.length} projects`}
        />
      </FadeIn>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
        {projects.map((project, i) => (
          <FadeIn key={project.id} delay={i * 0.08} className="flex">
            <ProjectCard project={project} index={i} />
          </FadeIn>
        ))}
      </div>
    </section>
  )
}
