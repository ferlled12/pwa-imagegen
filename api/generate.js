export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { prompt, apiKey } = req.body;

  if (!prompt || !apiKey) {
    return res.status(400).json({ error: "Missing prompt or apiKey" });
  }

  try {
    // Start prediction with Flux Schnell
    const startRes = await fetch("https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Prefer": "wait"
      },
      body: JSON.stringify({
        input: {
          prompt,
          go_fast: true,
          num_outputs: 1,
          aspect_ratio: "1:1",
          output_format: "webp",
          output_quality: 90
        }
      })
    });

    const prediction = await startRes.json();

    if (!startRes.ok) {
      return res.status(startRes.status).json({ error: prediction.detail || "Replicate API error" });
    }

    // Poll until complete
    let result = prediction;
    let attempts = 0;

    while (result.status !== "succeeded" && result.status !== "failed" && attempts < 30) {
      await new Promise(r => setTimeout(r, 1000));
      const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: { "Authorization": `Bearer ${apiKey}` }
      });
      result = await pollRes.json();
      attempts++;
    }

    if (result.status === "failed") {
      return res.status(500).json({ error: result.error || "Generation failed" });
    }

    if (result.status !== "succeeded") {
      return res.status(504).json({ error: "Timeout waiting for image" });
    }

    return res.status(200).json({ imageUrl: result.output[0] });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
