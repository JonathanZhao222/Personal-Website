import Hero from '@/components/sections/Hero'
import Work from '@/components/sections/Work'
import Research from '@/components/sections/Research'
import Writing from '@/components/sections/Writing'
import { projects } from '@/lib/projects'

export default function Home() {
  return (
    <>
      <Hero />
      <Work />
      <Research projects={projects} />
      <Writing />
    </>
  )
}
