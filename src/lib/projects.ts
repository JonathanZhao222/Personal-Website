import type { Project } from '@/types/project'

export const projects: Project[] = [
  {
    id: 'sheltzer-lab',
    title: 'Paralog Dependency Research @ Stanford Sheltzer Lab',
    description: 'Single-cell virtual knockout on paralog dependency.',
    year: '2025–present',
    tags: [],
    status: 'ongoing',
    links: [
      { label: 'Virtual Cell', url: 'https://github.com/JonathanZhao222/Paralog-Virtual-Cell' },
      { label: 'Expression', url: 'https://github.com/JonathanZhao222/Paralog-Upregulation' },
      { label: 'RNA/DNA', url: 'https://github.com/JonathanZhao222/Paralog-Difference' },
    ],
  },
  {
    id: 'pfas-pollution',
    title: 'PFAS Pollution Research @ CIWEM',
    description:
      'Geospatial NNs to predict PFAS levels & ETDOT-optimised point-of-use filters.',
    year: '2023–present',
    tags: [],
    status: 'ongoing',
    link: 'https://chemrxiv.org/doi/10.26434/chemrxiv-2024-tx50z',
    award: 'Stockholm Junior Water Prize Winner',
    links: [
      { label: 'Forbes', url: 'https://www.forbes.com/sites/sanammahoozi/2024/09/06/this-is-what-happened-at-world-water-week-in-stockholm/' },
      { label: 'SIWI', url: 'https://stockholmwaterfoundation.org/news/uk-project-to-reduce-pfas-pollution-is-awarded-stockholm-junior-water-prize' },
      { label: 'Wiki', url: 'https://en.wikipedia.org/wiki/Stockholm_Junior_Water_Prize' },
    ],
  },
  {
    id: 'alzheimers',
    title: "Alzheimer's Pathology Research @ Cambridge CMD",
    description:
      'MD on inhibitors of β-secretase.',
    year: '2023–2024',
    tags: [],
    status: 'completed',
  },
]
