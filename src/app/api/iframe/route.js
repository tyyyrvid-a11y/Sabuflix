import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    const allowedDomains = ['superflixapi.rest', 'warezcdn.site'];
    const hasValidDomain = allowedDomains.some(domain => url.includes(domain));
    
    if (!hasValidDomain) {
      return NextResponse.json({ error: 'Invalid domain' }, { status: 400 });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': `https://${new URL(url).hostname}/`,
        'Origin': `https://${new URL(url).hostname}`,
      }
    });

    const html = await response.text();

    const modifiedHtml = html
      .replace(/<head>/i, '<head><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">')
      .replace(/allow="autoplay/g, 'allow="fullscreen; autoplay')
      .replace(/<iframe/gi, '<iframe loading="auto"');

    return new NextResponse(modifiedHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'X-Frame-Options': 'ALLOWALL',
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (error) {
    console.error('[Iframe Proxy Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch URL' }, { status: 500 });
  }
}