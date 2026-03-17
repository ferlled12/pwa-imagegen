export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { prompt, apiKey } = req.body;
  if (!prompt || !apiKey) {
    return res.status(400).json({ error: "Missing prompt or apiKey" });
  }

  const MODEL = "stabilityai/stable-diffusion-xl-base-1.0";

  try {
    const hfRes = await fetch(
      `https://api-inference.huggingface.co/models/${MODEL}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "x-use-cache": "0"
        },
        body: JSON.stringify({ inputs: prompt })
      }
    );

    // Model may still be loading — HF returns 503 with estimated_time
    if (hfRes.status === 503) {
      const info = await hfRes.json();
      const wait = info.estimated_time ? Math.ceil(info.estimated_time) : 30;
      return res.status(503).json({
        error: `El modelo se está cargando, espera ${wait} segundos e inténtalo de nuevo.`,
        loading: true,
        estimated_time: wait
      });
    }

    if (!hfRes.ok) {
      const err = await hfRes.json().catch(() => ({}));
      return res.status(hfRes.status).json({ error: err.error || "Error en Hugging Face API" });
    }

    // Response is raw image bytes
    const buffer = await hfRes.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    return res.status(200).json({ imageBase64: base64, mimeType: "image/jpeg" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

