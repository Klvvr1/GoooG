// Cloudflare Pages Functions API route: /api/scrape
// Handles CORS proxying and extraction for Cloudflare Pages deployment

const CATEGORY_MAP: Record<string, string> = {
  sluts: 'https://www.pornpics.com/pornstars/',
  trans: 'https://www.pornpics.com/pornstars/shemale/',
  twinks: 'https://www.pornpics.com/pornstars/gay/',
};

function getCategoryUrl(category: string, pageNum: number): string {
  const norm = category.toLowerCase().trim();
  const base = CATEGORY_MAP[norm] || CATEGORY_MAP['sluts'];
  if (pageNum <= 1) {
    return base;
  }
  return `${base}${pageNum}/`;
}

function parsePornstarsList(html: string, category: string) {
  const ulMatches = html.match(/<ul[^>]*id=["']tiles["'][^>]*>([\s\S]*?)<\/ul>/i)
    || html.match(/<ul[^>]*class=["'][^"']*thumbs[^"']*["'][^>]*>([\s\S]*?)<\/ul>/i);
    
  if (!ulMatches) return [];
  
  const liMatches = [...ulMatches[1].matchAll(/<li[^>]*class=['"][^'"]*thumbwook[^'"]*['"][^>]*>([\s\S]*?)<\/li>/gi)];
  const results = [];

  for (const match of liMatches) {
    const liContent = match[1];
    
    // Extract link
    const linkMatch = liContent.match(/<a[^>]*href=['"]([^'"]+)['"]/i);
    if (!linkMatch) continue;
    
    let href = linkMatch[1];
    if (href.startsWith('/')) {
      href = 'https://www.pornpics.com' + href;
    }
    
    // Extract name from span.m-name or title
    const nameMatch = liContent.match(/class=['"][^'"]*m-name[^'"]*['"][^>]*>([^<]+)<\/span>/i)
      || liContent.match(/title=['"]([^'"]+)['"]/i);
    const name = nameMatch ? nameMatch[1].trim() : '';
    
    // Extract image
    const imgMatch = liContent.match(/data-src=['"]([^'"]+)['"]/i)
      || liContent.match(/src=['"](https:\/\/cdni\.pornpics\.com\/[^'"]+)['"]/i);
    const avatarUrl = imgMatch ? imgMatch[1] : '';
    
    if (avatarUrl && name && !avatarUrl.includes('1px.png')) {
      const slug = href.replace(/^https?:\/\/[^\/]+/, '').replace(/^\/pornstars\//, '').replace(/\/$/, '');
      results.push({
        id: `pp-${slug || Math.random().toString(36).slice(2, 8)}`,
        name,
        category,
        profileUrl: href,
        avatarUrl,
        availableImages: [avatarUrl],
        selectedImages: [avatarUrl],
      });
    }
  }

  return results;
}

function parseProfileGalleries(html: string): string[] {
  const ulMatches = html.match(/<ul[^>]*id=["']tiles["'][^>]*>([\s\S]*?)<\/ul>/i)
    || html.match(/<ul[^>]*class=["'][^"']*thumbs[^"']*["'][^>]*>([\s\S]*?)<\/ul>/i);
    
  if (!ulMatches) return [];
  
  const liMatches = [...ulMatches[1].matchAll(/<li[^>]*class=['"][^'"]*thumbwook[^'"]*['"][^>]*>([\s\S]*?)<\/li>/gi)];
  const images: string[] = [];

  for (const match of liMatches) {
    const liContent = match[1];
    const imgMatch = liContent.match(/data-src=['"]([^'"]+)['"]/i)
      || liContent.match(/src=['"](https:\/\/cdni\.pornpics\.com\/[^'"]+)['"]/i);
    if (imgMatch && imgMatch[1] && !imgMatch[1].includes('1px.png')) {
      images.push(imgMatch[1]);
    }
  }

  return Array.from(new Set(images));
}

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

export async function onRequestGet(context: { request: Request }): Promise<Response> {
  const url = new URL(context.request.url);
  const category = url.searchParams.get('category') || 'Sluts';
  const page = parseInt(url.searchParams.get('page') || '1', 10) || 1;
  const targetUrl = url.searchParams.get('target');
  const profileUrl = url.searchParams.get('profileUrl');

  try {
    // 1. If fetching photos for a specific character profile
    if (profileUrl) {
      const res = await fetch(profileUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });
      const html = await res.text();
      const images = parseProfileGalleries(html);
      return new Response(JSON.stringify({ success: true, profileUrl, images }), {
        headers: CORS_HEADERS,
      });
    }

    // 2. Determine target URL to fetch (custom or category-based)
    const scrapeTarget = targetUrl || getCategoryUrl(category, page);

    const externalRes = await fetch(scrapeTarget, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    const html = await externalRes.text();
    const candidates = parsePornstarsList(html, category);

    return new Response(
      JSON.stringify({
        success: true,
        sourceUrl: scrapeTarget,
        category,
        page,
        totalFound: candidates.length,
        candidates,
      }),
      {
        headers: CORS_HEADERS,
      }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}

