// Hero ranking logic — filters and sorts heroes by role and win rate

import { fetchHeroStats } from './api.js';

/** All Dota 2 roles found in OpenDota hero data */
export const ROLES = [
    'Carry',
    'Support',
    'Nuker',
    'Disabler',
    'Initiator',
    'Durable',
    'Escape',
    'Pusher',
];

/**
 * Calculate the overall public win rate for a hero.
 * @param {object} hero - Hero stats object from OpenDota
 * @returns {number} Win rate as a percentage (0–100)
 */
function winRate(hero) {
    if (!hero.pub_pick || hero.pub_pick === 0) return 0;
    return (hero.pub_win / hero.pub_pick) * 100;
}

/**
 * Get the top N heroes for a specific role, sorted by win rate.
 * @param {string} role   One of the ROLES values
 * @param {number} count  How many heroes to return (default 5)
 * @returns {Promise<Array<{name: string, winRate: number, picks: number, img: string, icon: string, id: number}>>}
 */
export async function getTopHeroesByRole(role, count = 5) {
    const heroes = await fetchHeroStats();

    return heroes
        .filter(h => h.roles && h.roles.includes(role))
        .map(h => ({
            id: h.id,
            name: h.localized_name,
            winRate: winRate(h),
            picks: h.pub_pick,
            img: `https://cdn.dota2.com${h.img}`,
            icon: `https://cdn.dota2.com${h.icon}`,
            primaryAttr: h.primary_attr,
        }))
        .sort((a, b) => b.winRate - a.winRate)
        .slice(0, count);
}

/**
 * Get top heroes for every role.
 * @param {number} count  Heroes per role (default 5)
 * @returns {Promise<Record<string, Array>>}
 */
export async function getAllRolesTop(count = 5) {
    const result = {};
    for (const role of ROLES) {
        result[role] = await getTopHeroesByRole(role, count);
    }
    return result;
}

const ATTR_LABELS = { str: 'Strength', agi: 'Agility', int: 'Intelligence', all: 'Universal' };

/**
 * Look up a hero by name (case-insensitive partial match).
 * @param {string} query  Search string
 * @returns {Promise<object|null>} Rich hero info object, or null if not found
 */
export async function lookupHero(query) {
    const heroes = await fetchHeroStats();
    const q = query.toLowerCase().trim();

    // Exact match first, then partial match
    let hero = heroes.find(h => h.localized_name.toLowerCase() === q);
    if (!hero) {
        hero = heroes.find(h => h.localized_name.toLowerCase().includes(q));
    }
    if (!hero) return null;

    const totalPicks = hero.pub_pick || 1;
    const totalWins = hero.pub_win || 0;

    return {
        name: hero.localized_name,
        img: `https://cdn.dota2.com${hero.img}`,
        icon: `https://cdn.dota2.com${hero.icon}`,
        primaryAttr: ATTR_LABELS[hero.primary_attr] || hero.primary_attr,
        attackType: hero.attack_type,
        roles: hero.roles || [],
        baseStr: hero.base_str,
        baseAgi: hero.base_agi,
        baseInt: hero.base_int,
        strGain: hero.str_gain,
        agiGain: hero.agi_gain,
        intGain: hero.int_gain,
        moveSpeed: hero.move_speed,
        baseArmor: hero.base_armor,
        attackRange: hero.attack_range,
        baseAttackMin: hero.base_attack_min,
        baseAttackMax: hero.base_attack_max,
        baseHealth: hero.base_health,
        baseMana: hero.base_mana,
        winRate: (totalWins / totalPicks) * 100,
        picks: totalPicks,
    };
}

