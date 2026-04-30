// Vercel Edge Function — Anthropic Proxy
// Keeps your API key safe on the server, never exposed in the browser
// Deploy to Vercel for free at vercel.com

export const config = {
  runtime: "edge",
}

export default async function handler(req) {
  // Only allow POST
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 })
  }

  // CORS headers — allows your Framer site to call this
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  }

  // Handle preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers })
  }

  try {
    const body = await req.json()

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY, // stored safely in Vercel env vars
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return new Response(JSON.stringify(data), { status: 200, headers })

  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Something went wrong" }),
      { status: 500, headers }
    )
  }
}
