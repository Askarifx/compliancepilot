// Supabase Edge Function: proxies chat requests to Anthropic so the API key
// never has to live in the browser bundle. The frontend calls this via
// supabase.functions.invoke("chat", { body: { system, messages } }).

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  // Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY is not set on this function." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    const { system, messages } = await req.json();

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        system,
        messages,
      }),
    });

    const data = await anthropicRes.json();

    return new Response(JSON.stringify(data), {
      status: anthropicRes.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
