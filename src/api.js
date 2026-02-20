// OpenDota API service with in-memory caching

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
