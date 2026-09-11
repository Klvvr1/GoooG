import { Env } from "../types";

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  const url = new URL(context.request.url);
  const category = url.searchParams.get("category");
  const id = url.searchParams.get("id");

  try {
    if (context.env.DB) {
      if (id) {
        const row: any = await context.env.DB.prepare("SELECT * FROM characters WHERE id = ?").bind(id).first();
        if (!row) {
          return new Response(JSON.stringify({ success: false, error: "Character not found" }), { status: 404, headers: CORS_HEADERS });
        }
        return new Response(JSON.stringify({
          success: true,
          character: {
            ...row,
            images: JSON.parse((row.images as string) || "[]"),
            stats: row.stats ? JSON.parse(row.stats as string) : null,
            enabled: Boolean(row.enabled),
          }
        }), { headers: CORS_HEADERS });
      }

      let query = "SELECT * FROM characters";
      const params: string[] = [];
      if (category && category.toLowerCase() !== "all" && category.toLowerCase() !== "mix") {
        query += " WHERE LOWER(category) = LOWER(?)";
        params.push(category);
      }
      query += " ORDER BY created_at DESC";

      const stmt = params.length > 0 ? context.env.DB.prepare(query).bind(...params) : context.env.DB.prepare(query);
      const { results } = await stmt.all();

      const characters = (results || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        category: row.category,
        images: JSON.parse((row.images as string) || "[]"),
        avatarUrl: row.avatar_url,
        enabled: Boolean(row.enabled),
        createdAt: row.created_at,
        stats: row.stats ? JSON.parse(row.stats as string) : null,
      }));

      return new Response(JSON.stringify({ success: true, count: characters.length, characters, source: "d1" }), {
        headers: CORS_HEADERS,
      });
    }

    return new Response(JSON.stringify({
      success: true,
      source: "none",
      message: "Cloudflare D1 is not bound yet. Using client-side IndexedDB.",
      characters: [],
    }), { headers: CORS_HEADERS });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  try {
    const char: any = await context.request.json();
    if (!char.id || !char.name) {
      return new Response(JSON.stringify({ success: false, error: "Missing id or name" }), { status: 400, headers: CORS_HEADERS });
    }

    if (context.env.DB) {
      await context.env.DB.prepare(
        "INSERT OR REPLACE INTO characters (id, name, category, images, avatar_url, enabled, created_at, stats) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      ).bind(
        char.id,
        char.name,
        char.category || "General",
        JSON.stringify(char.images || []),
        char.avatarUrl || "",
        char.enabled !== false ? 1 : 0,
        char.createdAt || Date.now(),
        char.stats ? JSON.stringify(char.stats) : null
      ).run();
    }

    return new Response(JSON.stringify({ success: true, character: char, source: context.env.DB ? "d1" : "none" }), { headers: CORS_HEADERS });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: CORS_HEADERS });
  }
}

export async function onRequestDelete(context: { request: Request; env: Env }): Promise<Response> {
  const url = new URL(context.request.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return new Response(JSON.stringify({ success: false, error: "Missing character id" }), { status: 400, headers: CORS_HEADERS });
  }

  try {
    if (context.env.DB) {
      await context.env.DB.prepare("DELETE FROM characters WHERE id = ?").bind(id).run();
    }
    return new Response(JSON.stringify({ success: true, deletedId: id, source: context.env.DB ? "d1" : "none" }), { headers: CORS_HEADERS });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: CORS_HEADERS });
  }
}

