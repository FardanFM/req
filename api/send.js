import { promises as fs } from 'fs';
import path from 'path';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const filePath = path.join(process.cwd(), 'pesan.json');
        let messages = [];
        
        // Read existing messages
        try {
            const fileContent = await fs.readFile(filePath, 'utf-8');
            messages = JSON.parse(fileContent);
        } catch (error) {
            if (error.code !== 'ENOENT') {
                throw error;
            }
        }
        
        // Add new message
        const newMessage = {
            ...req.body,
            id: Date.now().toString()
        };
        
        messages.push(newMessage);
        
        // Save updated messages
        await fs.writeFile(filePath, JSON.stringify(messages, null, 2));
        
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error saving message:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}