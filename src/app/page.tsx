import Hero from '@/components/sections/Hero'
import Work from '@/components/sections/Work'
import Writing from '@/components/sections/Writing'
import { projects } from '@/lib/projects'

export default function Home() {
  return (
    <>
      <Hero />
      <Work projects={projects} />
      <Writing />
    </>
  )
}
