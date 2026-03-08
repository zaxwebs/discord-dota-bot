// Express API server for soundboard control
import express from 'express';
import morgan from 'morgan';
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { playSound } from './soundboard.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SOUNDS_DIR = join(__dirname, '..', 'sounds');

/**
 * Start the HTTP API server.
 * @param {import('discord.js').Client} client - The Discord client instance
 */
export function startServer(client) {
    const app = express();
    const port = process.env.API_PORT || 7330;

    app.use(morgan('dev'));
    app.use(express.json());

    // GET /api/sounds — list all available sound names
    app.get('/api/soundboard/list', (_req, res) => {
        try {
            const sounds = readdirSync(SOUNDS_DIR)
                .filter(f => f.endsWith('.mp3'))
                .map(f => f.replace('.mp3', ''));
            res.json({ sounds });
        } catch (error) {
            console.error('Error listing sounds:', error);
            res.status(500).json({ error: 'Failed to list sounds.' });
        }
    });

    // POST /api/soundboard/play — play a sound in a voice channel
    app.post('/api/soundboard/play', async (req, res) => {
        const { channelId, sound } = req.body;

        if (!channelId || !sound) {
            return res.status(400).json({ error: 'Missing required fields: channelId, sound' });
        }

        try {
            const channel = await client.channels.fetch(channelId);

            if (!channel || !channel.isVoiceBased()) {
                return res.status(404).json({ error: 'Voice channel not found.' });
            }

            await playSound(channel, sound);
            res.json({ success: true, message: `Playing "${sound}" in #${channel.name}` });
        } catch (error) {
            console.error('Error playing sound via API:', error);

            if (error.message?.includes('not found')) {
                return res.status(404).json({ error: error.message });
            }

            res.status(500).json({ error: error.message || 'Failed to play sound.' });
        }
    });

    app.listen(port, () => {
        console.log(`🌐 API server listening on port ${port}`);
    });
}
