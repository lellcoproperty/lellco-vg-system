export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const WP_BASE_URL = process.env.WP_BASE_URL;
  const WP_USERNAME = process.env.WP_USERNAME;
  const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD;

  if (!WP_BASE_URL || !WP_USERNAME || !WP_APP_PASSWORD) {
    return res.status(500).json({ error: "Missing WordPress environment variables. Set WP_BASE_URL, WP_USERNAME, and WP_APP_PASSWORD in Vercel." });
  }

  try {
    const { title, excerpt, content, status = "draft", featuredImageDataUrl, featuredImageName = "case-study-image.jpg" } = req.body || {};
    if (!title || !content) return res.status(400).json({ error: "Title and content are required." });

    const auth = Buffer.from(`${WP_USERNAME}:${WP_APP_PASSWORD}`).toString("base64");
    let featured_media;

    if (featuredImageDataUrl) {
      const match = featuredImageDataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
      if (!match) return res.status(400).json({ error: "Invalid featured image format." });

      const mimeType = match[1];
      const mediaBuffer = Buffer.from(match[2], "base64");

      const mediaResp = await fetch(`${WP_BASE_URL.replace(/\/$/, "")}/wp-json/wp/v2/media`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": mimeType,
          "Content-Disposition": `attachment; filename="${featuredImageName}"`
        },
        body: mediaBuffer
      });

      if (!mediaResp.ok) return res.status(500).json({ error: `Media upload failed: ${await mediaResp.text()}` });
      const mediaJson = await mediaResp.json();
      featured_media = mediaJson.id;
    }

    const payload = { title, excerpt, content, status };
    if (featured_media) payload.featured_media = featured_media;

    const postResp = await fetch(`${WP_BASE_URL.replace(/\/$/, "")}/wp-json/wp/v2/posts`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!postResp.ok) return res.status(500).json({ error: `Post publish failed: ${await postResp.text()}` });

    const postJson = await postResp.json();
    return res.status(200).json({ success: true, postId: postJson.id, link: postJson.link, status: postJson.status });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Unknown server error" });
  }
}
