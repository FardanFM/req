import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, request, timestamp, battery, charging } = req.body;
  if (!name || !request) {
    return res.status(400).json({ message: 'Name and request are required' });
  }

  const repo = process.env.GITHUB_REPO;
  const file = process.env.GITHUB_FILE || 'pesan.json';
  const branch = process.env.GITHUB_BRANCH || 'main';
  const token = process.env.GITHUB_TOKEN;

  const headers = {
    Authorization: `Bearer ${token}`,
    'User-Agent': 'vercel-bot',
    Accept: 'application/vnd.github.v3+json',
  };

  const apiUrl = `https://api.github.com/repos/${repo}/contents/${file}`;

  try {
    // 1. Fetch existing content
    const getRes = await fetch(`${apiUrl}?ref=${branch}`, { headers });
    const getData = await getRes.json();

    let existingData = [];
    let sha = null;

    if (getRes.ok && getData.content) {
      const decoded = Buffer.from(getData.content, 'base64').toString();
      existingData = JSON.parse(decoded);
      sha = getData.sha;
    }

    // 2. Append new entry
    const newEntry = {
      name,
      request,
      timestamp,
      battery,
      charging,
    };

    const updatedData = [newEntry, ...existingData];
    const encoded = Buffer.from(JSON.stringify(updatedData, null, 2)).toString('base64');

    // 3. Push to GitHub
    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: `Add request from ${name}`,
        content: encoded,
        sha,
        branch,
      }),
    });

    if (!putRes.ok) {
      throw new Error('Failed to update GitHub');
    }

    return res.status(200).json({ message: 'Request saved' });
  } catch (error) {
    console.error('Send error:', error);
    return res.status(500).json({ message: 'Failed to save request' });
  }
}
