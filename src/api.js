// OpenDota API service with in-memory caching
import dotaconstants from 'dotaconstants';

const HERO_STATS_URL = 'https://api.opendota.com/api/heroStats';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

let cache = {
  data: null,
  timestamp: 0,
};

/**
 * Fetch hero stats from OpenDota API (cached for 5 minutes).
 * @returns {Promise<Array>} Array of hero stat objects
 */
export async function fetchHeroStats() {
  const now = Date.now();

  if (cache.data && now - cache.timestamp < CACHE_TTL) {
    return cache.data;
  }

  const res = await fetch(HERO_STATS_URL);

  if (!res.ok) {
    throw new Error(`OpenDota API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  cache = { data, timestamp: now };
  return data;
}

/**
 * Map item ID to item name.
 */
function getItemName(itemId) {
  if (!itemId) return null;
  const itemKey = dotaconstants.item_ids[String(itemId)];
  if (!itemKey) return `Unknown Item ${itemId}`;
  const itemData = dotaconstants.items[itemKey];
  return itemData ? itemData.dname : itemKey;
}

/**
 * Fetch a summarized version of a Dota 2 match from OpenDota.
 * @param {string|number} matchId
 * @returns {Promise<string>} A JSON string summarizing match stats.
 */
export async function fetchMatchSummary(matchId) {
  const url = `https://api.opendota.com/api/matches/${matchId}`;
  const res = await fetch(url);

  if (!res.ok) {
    if (res.status === 404) return JSON.stringify({ error: "Match not found" });
    throw new Error(`OpenDota API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  if (data.error) {
    return JSON.stringify({ error: data.error });
  }

  // Summarize so we don't blow past context limits (the raw match output is huge)
  const summary = {
    match_id: data.match_id,
    radiant_win: data.radiant_win,
    duration_seconds: data.duration,
    radiant_score: data.radiant_score,
    dire_score: data.dire_score,
    players: (data.players || []).map(p => {
      const heroIdStr = String(p.hero_id);
      const heroName = dotaconstants.heroes[heroIdStr]?.localized_name || p.hero_name || p.hero_id;

      const items = [p.item_0, p.item_1, p.item_2, p.item_3, p.item_4, p.item_5].map(getItemName).filter(Boolean);
      const neutralItem = getItemName(p.item_neutral);

      return {
        player_name: p.name || p.personaname || 'Anonymous',
        hero_name: heroName,
        is_radiant: p.isRadiant,
        kills: p.kills,
        deaths: p.deaths,
        assists: p.assists,
        gpm: p.gold_per_min,
        xpm: p.xp_per_min,
        net_worth: p.net_worth,
        hero_damage: p.hero_damage,
        items: items,
        neutral_item: neutralItem
      };
    })
  };

  return JSON.stringify(summary, null, 2);
}
