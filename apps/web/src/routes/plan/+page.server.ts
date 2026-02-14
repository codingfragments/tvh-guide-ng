import type { PageServerLoad } from './$types';

interface Feature {
  name: string;
  status: 'done' | 'in-progress' | 'planned';
  description: string;
}

interface Milestone {
  title: string;
  status: 'done' | 'in-progress' | 'planned';
  features: Feature[];
}

export const load: PageServerLoad = () => {
  const milestones: Milestone[] = [
    {
      title: 'Foundation',
      status: 'done',
      features: [
        { name: 'Monorepo setup', status: 'done', description: 'pnpm workspace with apps/services/libs' },
        { name: 'TVHeadend client', status: 'done', description: 'Type-safe API client library' },
        { name: 'EPG Cache service', status: 'done', description: 'SQLite cache with fuzzy search' },
        { name: 'EPG Cache client', status: 'done', description: 'Type-safe HTTP client for EPG Cache API' },
        { name: 'API documentation', status: 'done', description: 'OpenAPI specs with Stoplight Elements viewers' },
        { name: 'ESLint + Prettier', status: 'done', description: 'Strict TypeScript linting and formatting' },
      ],
    },
    {
      title: 'Web Frontend',
      status: 'in-progress',
      features: [
        { name: 'SvelteKit scaffold', status: 'in-progress', description: 'App shell with Tailwind + DaisyUI + PWA' },
        { name: 'EPG grid view', status: 'planned', description: 'Timeline grid showing programs by channel' },
        { name: 'Channel list', status: 'planned', description: 'Browse and filter channels' },
        { name: 'Program details', status: 'planned', description: 'Detailed program info with recording options' },
        { name: 'Search', status: 'planned', description: 'Fuzzy search across all programs' },
      ],
    },
    {
      title: 'Recordings & DVR',
      status: 'planned',
      features: [
        { name: 'Recording list', status: 'planned', description: 'View upcoming and completed recordings' },
        { name: 'Schedule recording', status: 'planned', description: 'One-click recording from EPG' },
        { name: 'Series timers', status: 'planned', description: 'Auto-record series episodes' },
      ],
    },
  ];

  return { milestones };
};
