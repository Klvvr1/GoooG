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
    
    // Extract listing image (scene photo from gallery - goes into gallery strip)
    const imgMatch = liContent.match(/data-src=['"]([^'"]+)['"]/i)
      || liContent.match(/src=['"](https:\/\/cdni\.pornpics\.com\/[^'"]+)['"](?![^>]*1px)/i);
    const listingThumb = (imgMatch && imgMatch[1] && !imgMatch[1].includes('1px.png')) ? imgMatch[1] : '';
    
    if (name) {
      // Extract clean model slug (e.g., 'angela-white')
      const cleanSlug = href.replace(/\/$/, '').split('/').pop()?.toLowerCase() || '';
      const firstChar = cleanSlug.charAt(0);
      
      // Official model avatar URL - proxied through our /api/avatar endpoint so it loads in browser
      const officialAvatarCdn = cleanSlug 
        ? `https://cdni.pornpics.com/models/${firstChar}/${cleanSlug.replace(/-/g, '_')}.jpg` 
        : '';
      const proxiedAvatarUrl = officialAvatarCdn 
        ? `/api/avatar?url=${encodeURIComponent(officialAvatarCdn)}` 
        : listingThumb;

      results.push({
        id: `pp-${cleanSlug || Math.random().toString(36).slice(2, 8)}`,
        name,
        category,
        profileUrl: href,
        // Proxied avatar URL for the small square box - always the official profile photo
        avatarUrl: proxiedAvatarUrl,
        // Start with listing thumb in gallery. Lazy-load will add more gallery photos.
        availableImages: listingThumb ? [listingThumb] : [],
        selectedImages: listingThumb ? [listingThumb] : [],
      });
    }
  }

  return results;
}

function parseProfileGalleries(html: string, avatarUrl?: string): string[] {
  const ulMatches = html.match(/<ul[^>]*id=["']tiles["'][^>]*>([\s\S]*?)<\/ul>/i)
    || html.match(/<ul[^>]*class=["'][^"']*thumbs[^"']*["'][^>]*>([\s\S]*?)<\/ul>/i);
    
  if (!ulMatches) return [];
  
  const liMatches = [...ulMatches[1].matchAll(/<li[^>]*class=['"][^'"]*thumbwook[^'"]*['"][^>]*>([\s\S]*?)<\/li>/gi)];
  const images: string[] = [];

  const getCleanFilename = (u: string) => {
    try {
      const p = new URL(u);
      return p.pathname.split('/').filter(Boolean).pop() || '';
    } catch {
      return u.split('?')[0].split('/').filter(Boolean).pop() || '';
    }
  };
  const avatarFile = avatarUrl ? getCleanFilename(avatarUrl) : '';

  for (const match of liMatches) {
    const liContent = match[1];
    const imgMatch = liContent.match(/data-src=['"]([^'"]+)['"]/i)
      || liContent.match(/src=['"](https:\/\/cdni\.pornpics\.com\/[^'"]+)['"]/i);
    if (imgMatch && imgMatch[1] && !imgMatch[1].includes('1px.png')) {
      const src = imgMatch[1];
      // Exclude if it matches the profile avatar
      if (avatarUrl && (src === avatarUrl || (avatarFile && getCleanFilename(src) === avatarFile))) {
        continue;
      }
      images.push(src);
    }
  }

  return Array.from(new Set(images));
}

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Cache-Control': 'public, max-age=3600, s-maxage=86400',
};

export async function onRequestGet(context: { request: Request }): Promise<Response> {
  const url = new URL(context.request.url);
  const category = url.searchParams.get('category') || 'Sluts';
  const page = parseInt(url.searchParams.get('page') || '1', 10) || 1;
  const targetUrl = url.searchParams.get('target');
  const profileUrl = url.searchParams.get('profileUrl');
  const avatarUrl = url.searchParams.get('avatarUrl') || undefined;

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

      // Extract official entity-card-avatar CDN URL from model's profile page
      const avatarMatch = html.match(/class=['"][^'"]*entity-card-avatar[^'"]*['"][^>]*>[\s\S]*?<img[^>]+src=['"]([^'"]+)['"]/i)
        || html.match(/<img[^>]+src=['"](https:\/\/cdni\.pornpics\.com\/models\/[^'"]+)['"]/i);
      const exactAvatarCdn = avatarMatch ? avatarMatch[1] : null;
      
      // Always proxy avatar image through our /api/avatar endpoint
      const proxiedAvatar = exactAvatarCdn
        ? `/api/avatar?url=${encodeURIComponent(exactAvatarCdn)}`
        : avatarUrl; // Fall back to whatever was passed in (already proxied)

      const images = parseProfileGalleries(html, exactAvatarCdn || undefined);
      return new Response(JSON.stringify({ success: true, profileUrl, avatarUrl: proxiedAvatar, images }), {
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

