import { Env } from "../types";

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  try {
    const session: any = await context.request.json();
    if (!session.id) {
      return new Response(JSON.stringify({ success: false, error: "Missing session id" }), { status: 400, headers: CORS_HEADERS });
    }

    if (context.env.DB) {
      await context.env.DB.prepare(
        "INSERT INTO game_sessions (id, category, mode, total_questions, score, accuracy, duration_seconds, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      ).bind(
        session.id,
        session.category || "General",
        session.mode || "classic",
        session.totalQuestions || 0,
        session.score || 0,
        session.accuracy || 0,
        session.durationSeconds || 0,
        session.createdAt || Date.now()
      ).run();
    }

    return new Response(JSON.stringify({ success: true, recorded: session.id }), { headers: CORS_HEADERS });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: CORS_HEADERS });
  }
}
