export interface ProjectLink {
  label: string
  url: string
}

export interface Project {
  id: string
  title: string
  /** Where the work happened, shown under the title */
  institution?: string
  /** Text for `link`; shown after the institution */
  linkLabel?: string
  description: string
  year: string
  tags: string[]
  status: 'ongoing' | 'completed'
  link?: string
  award?: string
  links?: ProjectLink[]
}
