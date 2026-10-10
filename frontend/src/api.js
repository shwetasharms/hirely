const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

async function request(path, options) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new Error('Cannot reach the server. Check that the backend is running on port 5001.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = data.detail;
    const message = typeof detail === 'string' ? detail : Array.isArray(detail) ? detail[0]?.msg : null;
    throw new Error(message || 'Request failed');
  }
  return data;
}

const query = (params) => {
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null));
  const s = new URLSearchParams(clean).toString();
  return s ? `?${s}` : '';
};

export const api = {
  jobs: (params = {}) => request(`/jobs${query(params)}`),
  jobsMeta: () => request('/jobs/meta'),
  job: (id) => request(`/jobs/${id}`),
  apply: (body) => request('/applications', { method: 'POST', body: JSON.stringify(body) }),
  tailorResume: (jobId, resume) => request('/resume/tailor', { method: 'POST', body: JSON.stringify({ jobId, resume }) }),
  interviewRoles: () => request('/interview/roles'),
  interviewQuestions: (role, level) => request(`/interview/questions${query({ role, level })}`),
};
