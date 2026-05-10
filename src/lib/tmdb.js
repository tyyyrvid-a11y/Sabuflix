const BASE_URL = 'https://api.themoviedb.org/3';

export const fetchTMDB = async (endpoint, params = {}) => {
  const apiKey = 'ee0794f59f93b7a056bb76ef52dc28d0';
  if (!apiKey) {
    console.error('TMDB API Key missing. Please set NEXT_PUBLIC_TMDB_API_KEY.');
    return null;
  }
  
  const queryParams = new URLSearchParams({
    api_key: apiKey,
    ...params
  });

  const res = await fetch(`${BASE_URL}${endpoint}?${queryParams.toString()}`);
  if (!res.ok) {
    console.error(`TMDB Error: ${res.status} on endpoint ${endpoint}`);
    return null;
  }
  return res.json();
};

export const searchMulti = async (query) => {
  return fetchTMDB('/search/multi', { query, include_adult: false, language: 'pt-BR', page: 1 });
};

export const getMovieDetails = async (movieId) => {
  return fetchTMDB(`/movie/${movieId}`, { language: 'pt-BR' });
};

export const getMovieSimilar = async (movieId) => {
  return fetchTMDB(`/movie/${movieId}/similar`, { language: 'pt-BR', page: 1 });
};

export const getPersonCombinedCredits = async (personId) => {
  return fetchTMDB(`/person/${personId}/combined_credits`, { language: 'pt-BR' });
};

export const getTVSeasons = async (tvId) => {
  return fetchTMDB(`/tv/${tvId}`, { language: 'pt-BR' });
};

export const getTVSeasonEpisodes = async (tvId, seasonNumber) => {
  return fetchTMDB(`/tv/${tvId}/season/${seasonNumber}`, { language: 'pt-BR' });
};

export const getTVSimilar = async (tvId) => {
  return fetchTMDB(`/tv/${tvId}/similar`, { language: 'pt-BR', page: 1 });
};

export const getTrending = async (mediaType = 'all', timeWindow = 'day') => {
  return fetchTMDB(`/trending/${mediaType}/${timeWindow}`, { language: 'pt-BR' });
};

export const getDiscover = async (mediaType = 'movie', params = {}) => {
  return fetchTMDB(`/discover/${mediaType}`, { language: 'pt-BR', ...params });
};

export const getImageUrl = (path, size = 'original') => {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

export const getGenres = async (mediaType = 'movie') => {
  return fetchTMDB(`/genre/${mediaType}/list`, { language: 'pt-BR' });
};

export const getMovieRating = async (movieId) => {
  return fetchTMDB(`/movie/${movieId}/release_dates`);
};

export const getTVRating = async (tvId) => {
  return fetchTMDB(`/tv/${tvId}/content_ratings`);
};

export const getExternalIds = async (id, mediaType = 'movie') => {
  return fetchTMDB(`/${mediaType}/${id}/external_ids`);
};
