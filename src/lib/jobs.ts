export interface Job {
  id: string
  title: string
  company: string
  companyUrl: string
  description: string
  year: string
  status: 'ongoing' | 'incoming' | 'completed'
}

export const jobs: Job[] = [
  {
    id: 'bridgewater',
    title: 'Investment Associate Intern',
    company: 'Bridgewater Associates',
    companyUrl: 'https://www.bridgewater.com/',
    description: 'Incoming for 2027.',
    year: '2027',
    status: 'incoming',
  },
  {
    id: 'arc',
    title: 'ML Research Intern · part-time',
    company: 'Arc Institute',
    companyUrl: 'https://arcinstitute.org/',
    description: 'De novo protein design.',
    year: 'Sep 2026–present',
    status: 'ongoing',
  },
  {
    id: 'stanford-cancer-institute',
    title: 'Computational Biology Researcher',
    company: 'Stanford Cancer Institute',
    companyUrl: 'https://med.stanford.edu/cancer.html',
    description:
      'Virtual cells, cancer aneuploidy and ML for cancer vulnerabilities. PIs: Prof Jason Sheltzer & Dr Yi Bei.',
    year: 'Oct 2025–present',
    status: 'ongoing',
  },
  {
    id: 'pumpkinseed',
    title: 'Machine Learning Engineer Intern',
    company: 'Pumpkinseed',
    companyUrl: 'https://www.pumpkinseed.bio/',
    description:
      'Protein sequence recovery from noisy signal data to 96.7% accuracy: dilated residual CNNs with BERT-style masked pretraining, a CRF output layer with Viterbi decoding, and ESM-2 embeddings. Models proposed to DARPA.',
    year: 'Jun–Aug 2026',
    status: 'completed',
  },
]
