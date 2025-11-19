export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const code = req.body.code;
  if (!code) return res.status(400).json({ error: "Missing code" });

  try {
    // Exchange code for token
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: "https://utpapp.vercel.app/callback",
      }),
    });
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // Get guild member info
    const memberRes = await fetch(
      `https://discord.com/api/users/@me/guilds/${process.env.GUILD_ID}/member`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const member = await memberRes.json();

    // Check HR role
    if (member.roles.includes(process.env.HR_ROLE_ID)) {
      res.json({ success: true, message: "✅ You have the HR role." });
    } else {
      res.json({ success: false, message: "❌ You do not have the HR role." });
    }
  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).json({ error: "Verification failed" });
  }
}
