export interface Job {
  id: string
  title: string
  company: string
  companyUrl: string
  description: string
  year: string
  status: 'ongoing' | 'completed'
}

export const jobs: Job[] = [
  {
    id: 'pumpkinseed',
    title: 'Machine Learning Engineer',
    company: 'Pumpkinseed',
    companyUrl: 'https://www.pumpkinseed.bio/',
    description: 'Variational Autoencoders (VAEs) for Raman Spectroscopy Fingerprints for protein sequencing.',
    year: 'Mar 2026–present',
    status: 'ongoing',
  },
  {
    id: 'babylonbio',
    title: 'Bioinformatics Research Engineer',
    company: 'BabylonBio',
    companyUrl: 'https://babylon.bio/',
    description: 'Constructing Knowledge Graphs for Swansen Linkage-based drug discovery.',
    year: 'Mar 2026–present',
    status: 'ongoing',
  },
]
