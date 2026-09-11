// Cloudflare Pages Functions API route: /api/avatar
// Proxies model avatar images from cdni.pornpics.com/models/ to bypass 403 restrictions

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Cache-Control': 'public, max-age=86400, s-maxage=604800',
};

export async function onRequestGet(context: { request: Request }): Promise<Response> {
  const url = new URL(context.request.url);
  const imageUrl = url.searchParams.get('url');

  if (!imageUrl) {
    return new Response('Missing url param', { status: 400, headers: CORS_HEADERS });
  }

  // Allow proxying any image from cdni.pornpics.com (models/ avatar and 460/ gallery photos)
  if (!imageUrl.startsWith('https://cdni.pornpics.com/')) {
    return new Response('Forbidden: only cdni.pornpics.com allowed', { status: 403, headers: CORS_HEADERS });
  }

  try {
    const res = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Referer': 'https://www.pornpics.com/',
        'Origin': 'https://www.pornpics.com',
      },
    });

    if (!res.ok) {
      return new Response('Image fetch failed: ' + res.status, { status: res.status, headers: CORS_HEADERS });
    }

    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const body = await res.arrayBuffer();

    return new Response(body, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': contentType,
        'Content-Length': body.byteLength.toString(),
      },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return new Response('Proxy error: ' + errorMessage, { status: 500, headers: CORS_HEADERS });
  }
}
