import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (_, res) => {
  res.send("Roblox Profile Proxy is running");
});

app.get("/user/:userId", async (req, res) => {
  const userId = req.params.userId;
  console.log("[DEBUG] Request for userId:", userId);

  try {
    // Get user info (display name)
    const infoRes = await fetch(
      "https://users.roblox.com/v1/users",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: [Number(userId)] })
      }
    );

    const infoJson = await infoRes.json();
    const userInfo = infoJson.data?.[0];

    if (!userInfo) {
      console.log("[ERROR] No user info found");
      return res.status(404).json({ error: "User not found" });
    }

    // Get followers
    const followersRes = await fetch(
      `https://friends.roblox.com/v1/users/${userId}/followers/count`
    );
    const followersJson = await followersRes.json();

    // Get following
    const followingRes = await fetch(
      `https://friends.roblox.com/v1/users/${userId}/followings/count`
    );
    const followingJson = await followingRes.json();

    // Get friends (connections)
    const friendsRes = await fetch(
      `https://friends.roblox.com/v1/users/${userId}/friends/count`
    );
    const friendsJson = await friendsRes.json();

    const payload = {
      userId,
      username: userInfo.name,
      displayName: userInfo.displayName,
      about: userInfo.description || "",
      followers: followersJson.count ?? 0,
      following: followingJson.count ?? 0,
      connections: friendsJson.count ?? 0
    };

    console.log("[DEBUG] Sending payload:", payload);
    res.json(payload);

  } catch (err) {
    console.error("[FATAL]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log("Proxy listening on port", PORT);
});
