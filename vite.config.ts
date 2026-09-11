import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';


// Dev server scraper middleware plugin for local testing
function devScraperPlugin(): Plugin {
  return {
    name: 'dev-scraper-plugin',
    configureServer(server) {
      server.middlewares.use('/api/scrape', async (req, res) => {
        try {
          const url = new URL(req.url || '', 'http://localhost');
          const category = url.searchParams.get('category') || 'Sluts';
          const page = parseInt(url.searchParams.get('page') || '1', 10) || 1;
          const targetUrl = url.searchParams.get('target');
          const profileUrl = url.searchParams.get('profileUrl');

          const CATEGORY_MAP: Record<string, string> = {
            sluts: 'https://www.pornpics.com/pornstars/',
            trans: 'https://www.pornpics.com/pornstars/shemale/',
            twinks: 'https://www.pornpics.com/pornstars/gay/',
          };

          function getCategoryUrl(cat: string, pageNum: number): string {
            const norm = cat.toLowerCase().trim();
            const base = CATEGORY_MAP[norm] || CATEGORY_MAP['sluts'];
            if (pageNum <= 1) return base;
            return `${base}${pageNum}/`;
          }

          function parsePornstarsList(html: string, cat: string) {
            const ulMatches = html.match(/<ul[^>]*id=["']tiles["'][^>]*>([\s\S]*?)<\/ul>/i)
              || html.match(/<ul[^>]*class=["'][^"']*thumbs[^"']*["'][^>]*>([\s\S]*?)<\/ul>/i);
            if (!ulMatches) return [];
            const liMatches = [...ulMatches[1].matchAll(/<li[^>]*class=['"][^'"]*thumbwook[^'"]*['"][^>]*>([\s\S]*?)<\/li>/gi)];
            const results = [];
            for (const match of liMatches) {
              const liContent = match[1];
              const linkMatch = liContent.match(/<a[^>]*href=['"]([^'"]+)['"]/i);
              if (!linkMatch) continue;
              let href = linkMatch[1];
              if (href.startsWith('/')) href = 'https://www.pornpics.com' + href;
              const nameMatch = liContent.match(/class=['"][^'"]*m-name[^'"]*['"][^>]*>([^<]+)<\/span>/i)
                || liContent.match(/title=['"]([^'"]+)['"]/i);
              const name = nameMatch ? nameMatch[1].trim() : '';
              const imgMatch = liContent.match(/data-src=['"]([^'"]+)['"]/i)
                || liContent.match(/src=['"](https:\/\/cdni\.pornpics\.com\/[^'"]+)['"]/i);
              const avatarUrl = imgMatch ? imgMatch[1] : '';
              if (avatarUrl && name && !avatarUrl.includes('1px.png')) {
                const slug = href.replace(/^https?:\/\/[^\/]+/, '').replace(/^\/pornstars\//, '').replace(/\/$/, '');
                results.push({
                  id: `pp-${slug || Math.random().toString(36).slice(2, 8)}`,
                  name,
                  category: cat,
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

          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');

          if (profileUrl) {
            const externalRes = await fetch(profileUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              },
            });
            const html = await externalRes.text();
            const images = parseProfileGalleries(html);
            res.end(JSON.stringify({ success: true, profileUrl, images }));
            return;
          }

          const scrapeTarget = targetUrl || getCategoryUrl(category, page);
          const externalRes = await fetch(scrapeTarget, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            },
          });
          const html = await externalRes.text();
          const candidates = parsePornstarsList(html, category);

          res.end(
            JSON.stringify({
              success: true,
              sourceUrl: scrapeTarget,
              category,
              page,
              totalFound: candidates.length,
              candidates,
            })
          );
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: errorMessage }));
        }
      });

      // Dev server in-memory storage for characters & sync
      const devCharactersMap = new Map<string, any>();

      server.middlewares.use('/api/sync', async (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', '*');

        if (req.method === 'OPTIONS') {
          res.end();
          return;
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => (body += chunk));
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body || '{}');
              const incoming = Array.isArray(parsed.characters) ? parsed.characters : [];
              incoming.forEach((c: any) => devCharactersMap.set(c.id, c));
              const all = Array.from(devCharactersMap.values());
              res.end(
                JSON.stringify({
                  success: true,
                  source: 'local-dev-simulated',
                  syncedCount: incoming.length,
                  totalServerCount: all.length,
                  characters: all,
                })
              );
            } catch (e: any) {
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, error: e.message }));
            }
          });
          return;
        }

        res.end(
          JSON.stringify({
            success: true,
            source: 'local-dev-simulated',
            characters: Array.from(devCharactersMap.values()),
          })
        );
      });

      server.middlewares.use('/api/characters', async (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', '*');

        if (req.method === 'OPTIONS') {
          res.end();
          return;
        }

        const all = Array.from(devCharactersMap.values());
        res.end(
          JSON.stringify({
            success: true,
            count: all.length,
            characters: all,
            source: 'local-dev-simulated',
          })
        );
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    devScraperPlugin(),
  ],
});

