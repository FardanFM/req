export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const repo = process.env.GITHUB_REPO;
  const file = process.env.GITHUB_FILE || 'database.json';
  const branch = process.env.GITHUB_BRANCH || 'main';

  const rawUrl = `https://raw.githubusercontent.com/${repo}/${branch}/${file}`;

  try {
    const response = await fetch(rawUrl);
    if (!response.ok) throw new Error('GitHub raw fetch failed');
    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('Get error:', err);
    return res.status(500).json({ message: 'Failed to fetch data' });
  }
}
