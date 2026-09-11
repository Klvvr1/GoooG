// Cloudflare Pages Functions API route: /api/scrape
// Handles CORS proxying and extraction for Cloudflare Pages deployment

export async function onRequestGet(context: { request: Request }): Promise<Response> {
  const url = new URL(context.request.url);
  const category = url.searchParams.get('category') || 'All';
  const page = url.searchParams.get('page') || '1';
  const query = url.searchParams.get('q') || '';
  const targetUrl = url.searchParams.get('target');

  // If a specific target URL is passed, fetch and proxy it
  if (targetUrl) {
    try {
      const externalRes = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      const html = await externalRes.text();
      return new Response(JSON.stringify({ success: true, html }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return new Response(JSON.stringify({ success: false, error: errorMessage }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  }

  // Fallback response with structured metadata
  return new Response(
    JSON.stringify({
      success: true,
      message: 'Scraper endpoint ready. Pass target URL or configure dedicated website parser.',
      category,
      page,
      query,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}
