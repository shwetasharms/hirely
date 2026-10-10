import { useCallback, useEffect, useState } from 'react';

// Small localStorage-backed state, shared between components.
// Saved jobs, applied jobs, the resume and the signed-in user live here
// until real accounts and a database are added.

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export function useLocal(key, fallback) {
  const [value, setValue] = useState(() => read(key, fallback));

  useEffect(() => {
    const sync = (e) => {
      if (e.detail === key) setValue(read(key, fallback));
    };
    window.addEventListener('local-change', sync);
    return () => window.removeEventListener('local-change', sync);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next) => {
      const resolved = typeof next === 'function' ? next(read(key, fallback)) : next;
      try {
        localStorage.setItem(key, JSON.stringify(resolved));
      } catch {
        /* storage full or blocked — keep working in memory */
      }
      setValue(resolved);
      window.dispatchEvent(new CustomEvent('local-change', { detail: key }));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key]
  );

  return [value, update];
}

export const useSavedJobs = () => useLocal('hirely.saved', []);
export const useAppliedJobs = () => useLocal('hirely.applied', []);
export const useUser = () => useLocal('hirely.user', null);
export const useResume = () => useLocal('hirely.resume', sampleResume);

export const sampleResume = {
  name: 'Aarav Mehta',
  title: 'Frontend Developer',
  email: 'aarav.mehta@example.com',
  phone: '+91 90000 00000',
  location: 'Noida, India',
  summary:
    'Frontend developer with 4 years of experience building responsive web applications for travel and e-commerce products.',
  skills: ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript', 'Redux', 'Node.js', 'Jest', 'Git', 'Figma'],
  experience: [
    {
      role: 'Frontend Developer',
      company: 'Brightlane Tech',
      period: '2023 – Present',
      bullets: [
        'Worked with designers in Figma to deliver 30+ screens',
        'Built reusable React and TypeScript components used across 4 products',
        'Cut page load time by 35% by improving performance and splitting bundles with Webpack',
        'Wrote Jest tests that raised coverage from 40% to 82%',
      ],
    },
    {
      role: 'Junior Web Developer',
      company: 'Orbit Web Studio',
      period: '2021 – 2023',
      bullets: [
        'Built responsive pages with HTML, CSS and JavaScript for 12 client websites',
        'Connected React screens to REST APIs built with Node.js and Express',
      ],
    },
  ],
  education: 'MCA, 2021',
};

export const formatSalary = (j) => `₹${j.salaryMin}–${j.salaryMax} ${j.salaryUnit}`;

export const timeAgo = (iso) => {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${days < 14 ? '' : 's'} ago`;
  return `${Math.floor(days / 30)} month${days < 60 ? '' : 's'} ago`;
};

export const roleForCategory = {
  Frontend: 'frontend',
  Backend: 'backend',
  'Full Stack': 'fullstack',
  'AI / ML': 'ai',
  Data: 'data',
  DevOps: 'devops',
  Mobile: 'mobile',
  QA: 'qa',
  Design: 'design',
  Product: 'product',
};
