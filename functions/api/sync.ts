import { Env } from "../types";

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, { headers: CORS_HEADERS });
}

// Bidirectional Sync Endpoint
export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  try {
    const payload: any = await context.request.json();
    const clientCharacters = Array.isArray(payload.characters) ? payload.characters : [];

    let serverCharacters: any[] = [];
    let source = "none";

    if (context.env.DB) {
      source = "d1";
      // 1. Batch upsert incoming client characters into D1
      if (clientCharacters.length > 0) {
        const statements = clientCharacters.map((c: any) =>
          context.env.DB!.prepare(
            "INSERT OR REPLACE INTO characters (id, name, category, images, avatar_url, enabled, created_at, stats) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
          ).bind(
            c.id,
            c.name,
            c.category || "General",
            JSON.stringify(c.images || []),
            c.avatarUrl || "",
            c.enabled !== false ? 1 : 0,
            c.createdAt || Date.now(),
            c.stats ? JSON.stringify(c.stats) : null
          )
        );

        // Execute in batches of 50
        for (let i = 0; i < statements.length; i += 50) {
          const batch = statements.slice(i, i + 50);
          await context.env.DB.batch(batch);
        }
      }

      // 2. Fetch all characters from D1 to return to client
      const { results } = await context.env.DB.prepare("SELECT * FROM characters ORDER BY created_at DESC").all();
      serverCharacters = (results || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        category: row.category,
        images: JSON.parse((row.images as string) || "[]"),
        avatarUrl: row.avatar_url,
        enabled: Boolean(row.enabled),
        createdAt: row.created_at,
        stats: row.stats ? JSON.parse(row.stats as string) : null,
      }));
    }

    return new Response(
      JSON.stringify({
        success: true,
        source,
        syncedCount: clientCharacters.length,
        totalServerCount: serverCharacters.length,
        characters: serverCharacters,
      }),
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}
