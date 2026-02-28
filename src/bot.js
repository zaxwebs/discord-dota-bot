// Main Discord bot entrypoint

import 'dotenv/config';
import { Client, GatewayIntentBits, Events, EmbedBuilder } from 'discord.js';
import { getTopHeroesByRole, getAllRolesTop, ROLES, lookupHero } from './heroes.js';
import { buildRoleEmbed, buildOverviewEmbeds, buildMoviesEmbed, buildHeroEmbed } from './embeds.js';
import { getRandomTopMovies } from './movies.js';
import { askDota } from './ask.js';

const COMMANDS_INFO = [
    { name: '/topheroes', description: 'Show the top Dota 2 heroes by role (win rate)' },
    { name: '/hero', description: 'Look up a Dota 2 hero by name' },
    { name: '/ask', description: 'Ask a Dota 2 question (AI-powered)' },
    { name: '/movies', description: 'Get 5 random top movie recommendations (now playing)' },
    { name: '/coinflip', description: 'Flip a coin (Heads or Tails)' },
    { name: '/help', description: 'Show all available commands' },
];

const token = process.env.DISCORD_TOKEN;

if (!token) {
    console.error('❌  Missing DISCORD_TOKEN in .env');
    process.exit(1);
}

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
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

    if (interaction.commandName === 'topheroes') {
        const role = interaction.options.getString('role');
        const count = interaction.options.getInteger('count') ?? 5;

        try {
            // Defer reply since API call may take a moment
            await interaction.deferReply();

            if (role) {
                // Single role
                const heroes = await getTopHeroesByRole(role, count);

                if (heroes.length === 0) {
                    await interaction.editReply({ content: `No heroes found for role **${role}**.` });
                    return;
                }

                const embed = buildRoleEmbed(role, heroes);
                await interaction.editReply({ embeds: [embed] });
            } else {
                // All roles — Discord allows max 10 embeds per message
                const allData = await getAllRolesTop(count);
                const embeds = buildOverviewEmbeds(allData);

                // Send in batches of 10 (we have 8 roles, so one batch is fine)
                await interaction.editReply({ embeds: embeds.slice(0, 10) });
            }
        } catch (error) {
            console.error('Error handling /topheroes:', error);
            const content = '❌ Failed to fetch hero data. Please try again later.';
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ content }).catch(console.error);
            } else {
                await interaction.reply({ content, ephemeral: true }).catch(console.error);
            }
        }
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
            const content = '❌ Failed to fetch hero data. Please try again later.';
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ content }).catch(console.error);
            } else {
                await interaction.reply({ content, ephemeral: true }).catch(console.error);
            }
        }
    }

    if (interaction.commandName === 'movies') {
        try {
            await interaction.deferReply();
            const movies = await getRandomTopMovies(5);
            const embed = buildMoviesEmbed(movies);
            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error handling /movies:', error);
            const content = '❌ Failed to fetch movie data. Make sure TMDB_API_KEY is set in .env.';
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ content }).catch(console.error);
            } else {
                await interaction.reply({ content, ephemeral: true }).catch(console.error);
            }
        }
    }

    if (interaction.commandName === 'ask') {
        const question = interaction.options.getString('question');
        try {
            await interaction.deferReply();
            const answer = await askDota(question);

            const embed = new EmbedBuilder()
                .setTitle('🤖 Dota 2 AI')
                .setDescription(`**❓ Question:**\n${question}\n\n**💡 Answer:**\n${answer.slice(0, 4000)}`)
                .setColor(0x10A37F)
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error handling /ask:', error);
            const content = '❌ Failed to get an answer. Please try again later.';
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ content }).catch(console.error);
            } else {
                await interaction.reply({ content, ephemeral: true }).catch(console.error);
            }
        }
    }


    if (interaction.commandName === 'coinflip') {
        try {
            const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
            const emoji = result === 'Heads' ? '🪙' : '🦅';
            await interaction.reply(`${emoji} **${result}**!`);
        } catch (error) {
            console.error('Error handling /coinflip:', error);
        }
    }

    if (interaction.commandName === 'help') {
        try {
            const list = COMMANDS_INFO.map(c => `**${c.name}** — ${c.description}`).join('\n');

            const embed = new EmbedBuilder()
                .setTitle('Available Commands')
                .setDescription(list)
                .setColor(0x2196F3);

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error handling /help:', error);
        }
    }
});

client.login(token);
