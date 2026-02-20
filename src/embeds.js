// Rich Discord embeds for hero data display

import { EmbedBuilder } from 'discord.js';

/** Dota 2 role → embed color mapping */
const ROLE_COLORS = {
    Carry: 0xF44336, // Red
    Support: 0x4CAF50, // Green
    Nuker: 0x9C27B0, // Purple
    Disabler: 0x2196F3, // Blue
    Initiator: 0xFF9800, // Orange
    Durable: 0x795548, // Brown
    Escape: 0x00BCD4, // Cyan
    Pusher: 0xFFEB3B, // Yellow
};



/**
 * Build an embed for a single role's top heroes.
 * @param {string} role   - Role name
 * @param {Array}  heroes - Array of hero objects from getTopHeroesByRole
 * @returns {EmbedBuilder}
 */
export function buildRoleEmbed(role, heroes) {
    const color = ROLE_COLORS[role] || 0x607D8B;

    // Build a clean table with aligned columns

    const nameWidth = Math.max(...heroes.map(h => h.name.length), 4);

    const header = `${'#'.padEnd(3)} ${'Hero'.padEnd(nameWidth)}  ${'Win %'.padStart(6)}`;
    const separator = '─'.repeat(header.length);

    const rows = heroes.map((h, i) => {
        const rank = `${i + 1}.`;
        const name = h.name.padEnd(nameWidth);
        const wr = `${h.winRate.toFixed(1)}%`.padStart(6);
        return `${rank.padEnd(3)} ${name}  ${wr}`;
    });

    const table = ['```', header, separator, ...rows, '```'].join('\n');

    const embed = new EmbedBuilder()
        .setTitle(`Top ${heroes.length} ${role} Heroes`)
        .setDescription(table)
        .setColor(color)
        .setFooter({ text: 'Public matches' })
        .setTimestamp();

    // Set thumbnail to the #1 hero's icon
    if (heroes.length > 0) {
        embed.setThumbnail(heroes[0].img);
    }

    return embed;
}

/**
 * Build embeds for all roles.
 * @param {Record<string, Array>} allRolesData - { role: heroes[] }
 * @returns {EmbedBuilder[]}
 */
export function buildOverviewEmbeds(allRolesData) {
    const embeds = [];

    for (const [role, heroes] of Object.entries(allRolesData)) {
        embeds.push(buildRoleEmbed(role, heroes));
    }

    return embeds;
}

/**
 * Build an embed showing random movie recommendations.
 * @param {Array<{title: string, overview: string, releaseDate: string, rating: number, posterUrl: string|null}>} movies
 * @returns {EmbedBuilder}
 */
export function buildMoviesEmbed(movies) {
    const lines = movies.map((m, i) => {
        const stars = '⭐'.repeat(Math.round(m.rating / 2));
        return [
            `**${i + 1}. ${m.title}**`,
            `${stars}  ${m.rating.toFixed(1)}/10  •  ${m.releaseDate}`,
            `${m.overview}`,
        ].join('\n');
    });

    const embed = new EmbedBuilder()
        .setTitle('🎬  Movie Recommendations')
        .setDescription(lines.join('\n\n'))
        .setColor(0xE50914) // Netflix red

        .setTimestamp();

    // Use the first movie's poster as thumbnail
    if (movies[0]?.posterUrl) {
        embed.setThumbnail(movies[0].posterUrl);
    }

    return embed;
}

/** Attribute → embed color */
const ATTR_COLORS = {
    Strength: 0xF44336,
    Agility: 0x4CAF50,
    Intelligence: 0x2196F3,
    Universal: 0xCDCDCD,
};

/**
 * Build a rich embed showing hero info, Dota-style.
 * @param {object} hero - Hero object from lookupHero
 * @returns {EmbedBuilder}
 */
export function buildHeroEmbed(hero) {
    const color = ATTR_COLORS[hero.primaryAttr] || 0x607D8B;

    const embed = new EmbedBuilder()
        .setTitle(hero.name)
        .setThumbnail(hero.img)
        .setColor(color)
        .addFields(
            {
                name: '🗡️ Attack',
                value: [
                    `**Type:** ${hero.attackType}`,
                    `**Damage:** ${hero.baseAttackMin}–${hero.baseAttackMax}`,
                    `**Range:** ${hero.attackRange}`,
                ].join('\n'),
                inline: true,
            },
            {
                name: '🛡️ Defense',
                value: [
                    `**Armor:** ${hero.baseArmor.toFixed(1)}`,
                    `**Health:** ${hero.baseHealth}`,
                    `**Mana:** ${hero.baseMana}`,
                ].join('\n'),
                inline: true,
            },
            {
                name: '👟 Mobility',
                value: `**Move Speed:** ${hero.moveSpeed}`,
                inline: true,
            },
            {
                name: '📊 Attributes',
                value: [
                    `**STR:** ${hero.baseStr} (+${hero.strGain}/lvl)`,
                    `**AGI:** ${hero.baseAgi} (+${hero.agiGain}/lvl)`,
                    `**INT:** ${hero.baseInt} (+${hero.intGain}/lvl)`,
                    `**Primary:** ${hero.primaryAttr}`,
                ].join('\n'),
                inline: false,
            },
            {
                name: '🎭 Roles',
                value: hero.roles.join(', ') || 'None',
                inline: true,
            },
            {
                name: '📈 Public Matches',
                value: `**Win Rate:** ${hero.winRate.toFixed(1)}%  •  **Picks:** ${hero.picks.toLocaleString()}`,
                inline: true,
            },
        )

        .setTimestamp();

    return embed;
}
