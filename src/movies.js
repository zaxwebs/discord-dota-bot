// TMDB API service for fetching recent movies

const NOW_PLAYING_URL = 'https://api.themoviedb.org/3/movie/now_playing';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

let cache = {
    data: null,
    timestamp: 0,
};

/**
 * Fetch now-playing movies from TMDB (cached for 5 minutes).
 * @returns {Promise<Array>} Array of movie objects
 */
async function fetchNowPlaying() {
    const now = Date.now();

    if (cache.data && now - cache.timestamp < CACHE_TTL) {
        return cache.data;
    }

    const apiKey = process.env.TMDB_API_KEY;

    if (!apiKey) {
        throw new Error('Missing TMDB_API_KEY in .env');
    }

    // Fetch first two pages for a larger pool to randomize from
    const pages = await Promise.all(
        [1, 2].map(page =>
            fetch(`${NOW_PLAYING_URL}?api_key=${apiKey}&language=en-US&page=${page}`)
                .then(res => {
                    if (!res.ok) throw new Error(`TMDB API error: ${res.status} ${res.statusText}`);
                    return res.json();
                })
        )
    );

    const movies = pages.flatMap(p => p.results).filter(m => m.vote_average > 0);

    cache = { data: movies, timestamp: now };
    return movies;
}

/**
 * Shuffle an array in-place (Fisher-Yates).
 */
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/**
 * Get `count` random top movies currently playing.
 * Movies are sorted by rating first, then a random subset is picked.
 * @param {number} count - Number of movies to return (default 5)
 * @returns {Promise<Array<{title: string, overview: string, releaseDate: string, rating: number, posterUrl: string|null}>>}
 */
export async function getRandomTopMovies(count = 5) {
    const movies = await fetchNowPlaying();

    // Take the top-rated half, then randomly pick from those
    const sorted = [...movies].sort((a, b) => b.vote_average - a.vote_average);
    const topPool = sorted.slice(0, Math.max(count * 3, 15));
    const picked = shuffle([...topPool]).slice(0, count);

    return picked.map(m => ({
        title: m.title,
        overview: m.overview?.length > 120 ? m.overview.slice(0, 117) + '...' : (m.overview || 'No overview available.'),
        releaseDate: m.release_date,
        rating: m.vote_average,
        posterUrl: m.poster_path ? `${TMDB_IMAGE_BASE}${m.poster_path}` : null,
    }));
}
