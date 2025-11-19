import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = "https://utpapp.vercel.app/callback";
const GUILD_ID = process.env.GUILD_ID;
const HR_ROLE_ID = process.env.HR_ROLE_ID;

app.post("/verify", async (req, res) => {
  const code = req.body.code;
  if (!code) return res.status(400).json({ error: "Missing code" });

  try {
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    const memberRes = await fetch(
      `https://discord.com/api/users/@me/guilds/${GUILD_ID}/member`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const member = await memberRes.json();

    if (member.roles.includes(HR_ROLE_ID)) {
      res.json({ success: true, message: "✅ You have the HR role." });
    } else {
      res.json({ success: false, message: "❌ You do not have the HR role." });
    }
  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).json({ error: "Verification failed" });
  }
});

export default app;
