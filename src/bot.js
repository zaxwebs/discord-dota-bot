// Main Discord bot entrypoint

import 'dotenv/config';
import { Client, GatewayIntentBits, Events, EmbedBuilder } from 'discord.js';
import { getTopHeroesByRole, getAllRolesTop, ROLES, lookupHero } from './heroes.js';
import { buildRoleEmbed, buildOverviewEmbeds, buildMoviesEmbed, buildHeroEmbed } from './embeds.js';
import { getRandomTopMovies } from './movies.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { askDota } from './ask.js';
import { investigateDota } from './investigate.js';
import { logInteraction } from './logger.js';
import { playSound } from './soundboard.js';

const COMMANDS_INFO = [
    { name: '/topheroes', description: 'Show the top Dota 2 heroes by role (win rate)' },
    { name: '/hero', description: 'Look up a Dota 2 hero by name' },
    { name: '/ask', description: 'Ask a Dota 2 question (AI-powered)' },
    { name: '/investigate', description: 'Deep research a complex Dota 2 question (AI-powered)' },
    { name: '/movies', description: 'Get 5 random top movie recommendations (now playing)' },
    { name: '/coinflip', description: 'Flip a coin (Heads or Tails)' },
    { name: '/soundboard', description: 'Play a custom sound effect in your voice channel' },
    { name: '/help', description: 'Show all available commands' },
];

const token = process.env.DISCORD_TOKEN;

if (!token) {
    console.error('❌  Missing DISCORD_TOKEN in .env');
    process.exit(1);
}

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

client.once(Events.ClientReady, (c) => {
    console.log(`Logged in as ${c.user.tag}`);
    console.log(`Serving ${c.guilds.cache.size} server(s)`);
    c.guilds.cache.forEach(g => console.log(`  → Guild: ${g.name} (ID: ${g.id})`));
});

// Prevent silent crashes
process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
});

// Explicitly handle client errors so the process doesn't exit for network issues
client.on(Events.Error, (error) => {
    console.error('Discord client error:', error);
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const startTime = Date.now();
    let tokens = 0;
    let status = 200;

    try {
        if (interaction.commandName === 'topheroes') {
            const role = interaction.options.getString('role');
            const count = interaction.options.getInteger('count') ?? 5;
            try {
                await interaction.deferReply();
                if (role) {
                    const heroes = await getTopHeroesByRole(role, count);
                    if (heroes.length === 0) {
                        await interaction.editReply({ content: `No heroes found for role **${role}**.` });
                        return;
                    }
                    const embed = buildRoleEmbed(role, heroes);
                    await interaction.editReply({ embeds: [embed] });
                } else {
                    const allData = await getAllRolesTop(count);
                    const embeds = buildOverviewEmbeds(allData);
                    await interaction.editReply({ embeds: embeds.slice(0, 10) });
                }
            } catch (error) {
                console.error('Error handling /topheroes:', error);
                status = 500;
                const content = '❌ Failed to fetch hero data. Please try again later.';
                if (interaction.deferred || interaction.replied) await interaction.editReply({ content }).catch(console.error);
                else await interaction.reply({ content, ephemeral: true }).catch(console.error);
            }
            return;
        }

        if (interaction.commandName === 'hero') {
            const name = interaction.options.getString('name');
            try {
                await interaction.deferReply();
                const hero = await lookupHero(name);
                if (!hero) {
                    await interaction.editReply({ content: `No hero found matching **${name}**. Try a different name.` });
                    return;
                }
                const embed = buildHeroEmbed(hero);
                await interaction.editReply({ embeds: [embed] });
            } catch (error) {
                console.error('Error handling /hero:', error);
                status = 500;
                const content = '❌ Failed to fetch hero data. Please try again later.';
                if (interaction.deferred || interaction.replied) await interaction.editReply({ content }).catch(console.error);
                else await interaction.reply({ content, ephemeral: true }).catch(console.error);
            }
            return;
        }

        if (interaction.commandName === 'movies') {
            try {
                await interaction.deferReply();
                const movies = await getRandomTopMovies(5);
                const embed = buildMoviesEmbed(movies);
                await interaction.editReply({ embeds: [embed] });
            } catch (error) {
                console.error('Error handling /movies:', error);
                status = 500;
                const content = '❌ Failed to fetch movie data. Make sure TMDB_API_KEY is set in .env.';
                if (interaction.deferred || interaction.replied) await interaction.editReply({ content }).catch(console.error);
                else await interaction.reply({ content, ephemeral: true }).catch(console.error);
            }
            return;
        }

        if (interaction.commandName === 'ask') {
            const question = interaction.options.getString('question');
            try {
                await interaction.deferReply();
                const result = await askDota(question);
                tokens = result.tokens || 0;

                const embed = new EmbedBuilder()
                    .setTitle('🤖 Dota 2 AI')
                    .setDescription(`**❓ Question:**\n${question}\n\n**💡 Answer:**\n${result.answer.slice(0, 4000)}`)
                    .setColor(0x10A37F)
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });
            } catch (error) {
                console.error('Error handling /ask:', error);
                status = 500;
                const content = '❌ Failed to get an answer. Please try again later.';
                if (interaction.deferred || interaction.replied) await interaction.editReply({ content }).catch(console.error);
                else await interaction.reply({ content, ephemeral: true }).catch(console.error);
            }
            return;
        }

        if (interaction.commandName === 'investigate') {
            const question = interaction.options.getString('question');
            try {
                await interaction.deferReply();
                const result = await investigateDota(question);
                tokens = result.tokens || 0;

                const embed = new EmbedBuilder()
                    .setTitle('🔍 Dota 2 AI Research')
                    .setDescription(`**❓ Question:**\n${question}\n\n**💡 Research:**\n${result.answer.slice(0, 4000)}`)
                    .setColor(0x9C27B0)
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });
            } catch (error) {
                console.error('Error handling /investigate:', error);
                status = 500;
                const content = '❌ Failed to complete research. Please try again later.';
                if (interaction.deferred || interaction.replied) await interaction.editReply({ content }).catch(console.error);
                else await interaction.reply({ content, ephemeral: true }).catch(console.error);
            }
            return;
        }

        if (interaction.commandName === 'coinflip') {
            try {
                const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
                const emoji = result === 'Heads' ? '🪙' : '🦅';
                await interaction.reply(`${emoji} **${result}**!`);
            } catch (error) {
                console.error('Error handling /coinflip:', error);
                status = 500;
            }
            return;
        }

        if (interaction.commandName === 'soundboard') {
            const soundName = interaction.options.getString('sound');
            try {
                const voiceChannel = interaction.member?.voice?.channel;
                if (!voiceChannel) {
                    await interaction.reply({ content: '❌ You must be in a voice channel to use this command.', ephemeral: true });
                    return;
                }

                await interaction.deferReply();
                await playSound(voiceChannel, soundName);
                await interaction.editReply({ content: `🔊 Playing **${soundName}** in ${voiceChannel.name}!` });
            } catch (error) {
                console.error('Error handling /soundboard:', error);
                status = 500;
                const content = `❌ ${error.message || 'Failed to play sound. Please try again later.'}`;
                if (interaction.deferred || interaction.replied) await interaction.editReply({ content }).catch(console.error);
                else await interaction.reply({ content, ephemeral: true }).catch(console.error);
            }
            return;
        }

        if (interaction.commandName === 'help') {
            try {
                const list = COMMANDS_INFO.map(c => `**${c.name}** — ${c.description}`).join('\n');

                const soundsPath = join(__dirname, '..', 'sounds');
                const soundFiles = readdirSync(soundsPath)
                    .filter(file => file.endsWith('.mp3'))
                    .map(file => file.replace('.mp3', ''));

                const soundsList = soundFiles.length > 0
                    ? soundFiles.map(s => `\`${s}\``).join(', ')
                    : 'No sounds available.';

                const embed = new EmbedBuilder()
                    .setTitle('Available Commands')
                    .setDescription(list + `\n\n**🔊 Available Sounds:**\n${soundsList}`)
                    .setColor(0x2196F3);

                await interaction.reply({ embeds: [embed] });
            } catch (error) {
                console.error('Error handling /help:', error);
                status = 500;
            }
            return;
        }

    } finally {
        logInteraction(interaction, Date.now() - startTime, status, tokens);
    }
});

client.login(token);
