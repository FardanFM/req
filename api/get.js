export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const repo = 'FardanFM/req';
  const file = 'pesan.json' || 'database.json';
  const branch = 'main' || 'main';

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
