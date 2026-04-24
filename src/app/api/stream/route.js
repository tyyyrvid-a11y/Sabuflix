import { NextResponse } from 'next/server';
import { makeFilmProvider } from 'vizertv';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title');
  const type = searchParams.get('type') || 'movie';
  const seasonOption = searchParams.get('season');
  const episodeOption = searchParams.get('episode');

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  try {
    const provider = makeFilmProvider('all');
    console.log(`[VizerTV API] Searching for: ${title}`);
    
    const searchResults = await provider.getSearch.get(title);
    if (!searchResults || searchResults.length === 0) {
      return NextResponse.json({ error: 'No results found' }, { status: 404 });
    }

    const bestMatch = searchResults.find(r => r.title.toLowerCase() === title.toLowerCase()) || searchResults[0];
    console.log(`[VizerTV API] Best match: ${bestMatch.title} [${bestMatch.provider}]`);

    const info = await provider.getInfo.get(bestMatch.url);
    if (!info) {
      return NextResponse.json({ error: 'Failed to fetch info' }, { status: 500 });
    }

    if (type === 'movie' || info.movieType === 'filme') {
      const players = info.players || [];
      const formattedPlayers = players.map(player => ({
        provider: player.provider || bestMatch.provider,
        url: player.embedUrl || player.url || player,
        title: info.name
      }));
      
      return NextResponse.json({
        success: true,
        provider: bestMatch.provider,
        title: info.name,
        players: formattedPlayers,
        embedUrl: formattedPlayers[0]?.url || null
      });
    } else {
      if (!seasonOption || !episodeOption) {
        return NextResponse.json({ error: 'Season and episode are required for TV series' }, { status: 400 });
      }

      const seasonIndex = parseInt(seasonOption) - 1;
      if (!info.seasons || info.seasons.length <= seasonIndex) {
         return NextResponse.json({ error: 'Season not found' }, { status: 404 });
      }

      const episodes = await provider.seasonEpisodes.load(info.seasons[seasonIndex].dataSeasonId);
      const epIndex = parseInt(episodeOption) - 1;

      if (!episodes || episodes.length <= epIndex) {
        return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
      }

      const player = await provider.getPlayerEpisode.load(episodes[epIndex].id);
      
      return NextResponse.json({
         success: true,
         provider: bestMatch.provider,
         title: info.name,
         players: player || [],
         embedUrl: player?.[0]?.url || player?.url || null
      });
    }

  } catch (error) {
    console.error('[VizerTV API] Error:', error);
    return NextResponse.json({ error: 'Failed to resolve streams via VizerTV' }, { status: 500 });
  }
}
