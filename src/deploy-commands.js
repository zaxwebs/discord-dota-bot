// Register slash commands with Discord API — run once with: npm run deploy

import 'dotenv/config';
import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import { ROLES } from './heroes.js';

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;


if (!token || !clientId) {
    console.error('❌  Missing DISCORD_TOKEN or CLIENT_ID in .env');
    process.exit(1);
}

const commands = [
    new SlashCommandBuilder()
        .setName('topheroes')
        .setDescription('Show the top Dota 2 heroes by role (win rate)')
        .addStringOption(option =>
            option
                .setName('role')
                .setDescription('Filter by a specific role')
                .setRequired(false)
                .addChoices(...ROLES.map(r => ({ name: r, value: r })))
        )
        .addIntegerOption(option =>
            option
                .setName('count')
                .setDescription('Number of heroes to show (default 5, max 10)')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(10)
        )
        .toJSON(),
    new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show all available commands')
        .toJSON(),
    new SlashCommandBuilder()
        .setName('movies')
        .setDescription('Get 5 random top movie recommendations (now playing)')
        .toJSON(),
    new SlashCommandBuilder()
        .setName('hero')
        .setDescription('Look up a Dota 2 hero by name')
        .addStringOption(option =>
            option
                .setName('name')
                .setDescription('Hero name (e.g. Anti-Mage, Pudge, Crystal Maiden)')
                .setRequired(true)
        )
        .toJSON(),
    new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Flip a coin (Heads or Tails)')
        .toJSON(),
];

const rest = new REST({ version: '10' }).setToken(token);

try {
    console.log('Registering slash commands...');

    await rest.put(Routes.applicationCommands(clientId), { body: commands });
    console.log('Slash commands registered globally (may take up to 1 hour).');
} catch (error) {
    console.error('Failed to register commands:', error);
}
