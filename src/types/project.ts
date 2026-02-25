export interface ProjectLink {
  label: string
  url: string
}

export interface Project {
  id: string
  title: string
  description: string
  year: string
  tags: string[]
  status: 'ongoing' | 'completed'
  link?: string
  award?: string
  links?: ProjectLink[]
}
