export interface Project {
  id: string;
  title: string;
  client: string;
  year: number;
  stack: string[];
  url: string;
  screenshots: string[];
  description: string;
  results?: string;
}

const projects: Project[] = [
  {
    id: '01',
    title: 'Project One',
    client: 'Client Name',
    year: 2024,
    stack: ['Next.js', 'TypeScript', 'Tailwind'],
    url: 'https://example.com',
    screenshots: ['/textures/screen-preview/project-1-a.webp'],
    description: 'A high-performance e-commerce site with custom animations.',
    results: '+40% conversion rate',
  },
  {
    id: '02',
    title: 'Project Two',
    client: 'Client Name',
    year: 2024,
    stack: ['React', 'Node.js', 'PostgreSQL'],
    url: 'https://example.com',
    screenshots: ['/textures/screen-preview/project-2-a.webp'],
    description: 'A real-time dashboard for logistics data visualization.',
  },
];

export default projects;
