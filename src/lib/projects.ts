import type { Project } from '@/types/project'

export const projects: Project[] = [
  {
    id: 'sheltzer-lab',
    title: 'Cancer Aneuploidy',
    institution: 'Stanford Cancer Institute',
    linkLabel: 'Sheltzer Lab',
    description:
      'Virtual cells and ML for cancer vulnerabilities: single-cell virtual knockouts on paralog dependency, across 11 datasets (2.6M cells) on Stanford HPC. PIs: Prof Jason Sheltzer & Dr Yi Bei.',
    year: '2025–present',
    tags: [],
    status: 'ongoing',
    link: 'https://www.sheltzerlab.org',
    links: [
      { label: 'Virtual Cell', url: 'https://github.com/JonathanZhao222/Paralog-Virtual-Cell' },
      { label: 'Expression', url: 'https://github.com/JonathanZhao222/Paralog-Upregulation' },
      { label: 'RNA/DNA', url: 'https://github.com/JonathanZhao222/Paralog-Difference' },
    ],
  },
  {
    id: 'pfas-pollution',
    title: 'PFAS Pollution',
    institution: 'CIWEM / Xylem / SIWI',
    linkLabel: 'preprint',
    description:
      'KNN-RF ensemble predicting PFAS concentrations to within 94% of field-measured values across river sources, translated into a point-of-use filter design validated against USEPA software.',
    year: '2024–2025',
    tags: [],
    status: 'completed',
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
    title: "Alzheimer's Pathology",
    institution: 'Cambridge Centre for Misfolding Diseases',
    linkLabel: 'Cambridge CMD',
    description:
      'Large-scale molecular dynamics of protein–ligand interactions and a docking-based virtual screen for β-secretase inhibitors in Alzheimer\'s.',
    year: '2023–2024',
    tags: [],
    status: 'completed',
    link: 'https://www.cmd.ch.cam.ac.uk/',
  },
]
