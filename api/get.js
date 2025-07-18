import { promises as fs } from 'fs';
import path from 'path';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const filePath = path.join(process.cwd(), 'pesan.json');
        
        // Read messages
        try {
            const fileContent = await fs.readFile(filePath, 'utf-8');
            const messages = JSON.parse(fileContent);
            return res.status(200).json(messages);
        } catch (error) {
            if (error.code === 'ENOENT') {
                return res.status(200).json([]);
            }
            throw error;
        }
    } catch (error) {
        console.error('Error reading messages:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}