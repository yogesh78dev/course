
const db = require("../db");

// Sample data for testing purposes
const MOCK_ACCOUNTS = [
  {
    id: 999,
    name: "Demo Enterprise Account (Test)",
    api_key_identifier: "•••• 8xK2",
    connected_at: new Date().toISOString()
  }
];

const MOCK_VIDEOS = [
  {
    id: 1001,
    video_id: "demo-v-1",
    title: "Mastering React Components",
    link: "https://vimeo.com/76979871",
    description: "An advanced deep dive into functional components and hooks.",
    duration: 1245,
    thumbnail_url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
    upload_date: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 1002,
    video_id: "demo-v-2",
    title: "Node.js Performance Tuning",
    link: "https://vimeo.com/148751763",
    description: "Learn how to optimize your backend for high-traffic applications.",
    duration: 3600,
    thumbnail_url: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80",
    upload_date: new Date(Date.now() - 86400000 * 10).toISOString()
  }
];

exports.getVimeoAccounts = async (req, res) => {
  try {
    const [accounts] = await db.query(
      "SELECT id, name, api_key_identifier, connected_at FROM vimeo_accounts ORDER BY connected_at DESC"
    );
    
    if (accounts.length === 0) {
        return res.json(MOCK_ACCOUNTS);
    }
    
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.addVimeoAccount = async (req, res) => {
  const { name, apiKey } = req.body;
  const apiKeyIdentifier = `•••• ${apiKey.slice(-4)}`;
  const connectedAt = new Date();

  try {
    const [result] = await db.query(
      "INSERT INTO vimeo_accounts (name, api_key_identifier, api_key, connected_at) VALUES (?, ?, ?, ?)",
      [name, apiKeyIdentifier, apiKey, connectedAt]
    );
    res.status(201).json({
      id: result.insertId,
      name,
      api_key_identifier: apiKeyIdentifier,
      connected_at: connectedAt,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.removeVimeoAccount = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM vimeo_accounts WHERE id = ?", [id]);
    res.json({ success: true, message: "Vimeo account removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Lightweight endpoint that only fetches cached videos from the local database.
 * This should be used for all UI rendering to ensure fast page loads.
 */
exports.getVimeoVideos = async (req, res) => {
  try {
    const [videos] = await db.query("SELECT * FROM vimeo_videos ORDER BY upload_date DESC");
    
    if (videos.length === 0) {
        // Only return mock if we truly have nothing
        const [accounts] = await db.query("SELECT id FROM vimeo_accounts");
        if (accounts.length === 0) return res.json(MOCK_VIDEOS);
    }

    return res.json(videos);
  } catch (error) {
    console.error("Fetch cached videos error:", error);
    res.json(MOCK_VIDEOS);
  }
};

/**
 * Heavyweight endpoint that triggers a real-time sync with Vimeo API.
 * This is only called when the user explicitly clicks the "Sync" button.
 */
exports.syncVimeoVideos = async (req, res) => {
  const vimeoUserId = "252313005";

  try {
    const [activeAccounts] = await db.query(
      "SELECT api_key FROM vimeo_accounts ORDER BY connected_at DESC"
    );

    if (!activeAccounts.length) {
      return res.status(400).json({ message: "No Vimeo accounts connected to sync." });
    }

    const apiKey = activeAccounts[0].api_key;

    // 1. Sync Folders
    await syncVimeoFolders(apiKey, vimeoUserId);

    // 2. Fetch Videos from synced folders
    const [folders] = await db.query(`SELECT folder_id FROM vimeo_folders`);

    for (const folder of folders) {
      try {
          const response = await fetch(
              `https://api.vimeo.com/users/${vimeoUserId}/folders/${folder.folder_id}/videos?fields=link,uri,name,description,duration,created_time,pictures`,
              {
                headers: {
                  Authorization: `bearer ${apiKey}`,
                  Accept: "application/vnd.vimeo.*+json;version=3.4",
                },
              }
          );

          if (!response.ok) continue;

          const data = await response.json();
          const videosList = data.data || [];
          
          for (const item of videosList) {
              const video_id = item.uri.split("/").pop();
              let thumbnail_url = null;

              if (item.pictures && Array.isArray(item.pictures.sizes) && item.pictures.sizes.length) {
                  const mediumSize = item.pictures.sizes.find((s) => s.width >= 640) || item.pictures.sizes[0];
                  thumbnail_url = mediumSize.link;
              }

              const [videoResult] = await db.query("SELECT id FROM vimeo_videos WHERE video_id = ?", [video_id]);
              
              if (videoResult.length === 0) {
                  await db.query(
                      "INSERT INTO vimeo_videos (title, link, video_id, description, duration, upload_date, thumbnail_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
                      [item.name, item.link, video_id, item.description, item.duration, item.created_time, thumbnail_url]
                  );
              } else {
                  await db.query(
                      "UPDATE vimeo_videos SET title = ?, link = ?, description = ?, duration = ?, thumbnail_url = ? WHERE video_id = ?",
                      [item.name, item.link, item.description, item.duration, thumbnail_url, video_id]
                  );
              }
          }
      } catch (err) {
          console.error("Vimeo fetch error for folder:", folder.folder_id, err);
      }
    }

    const [videos] = await db.query("SELECT * FROM vimeo_videos ORDER BY upload_date DESC");
    return res.json(videos);
  } catch (error) {
    console.error("Sync Videos API Error:", error);
    res.status(500).json({ message: "Failed to sync with Vimeo", error: error.message });
  }
};

async function syncVimeoFolders(apiKey, vimeoUserId) {
  try {
    const response = await fetch(
      `https://api.vimeo.com/users/${vimeoUserId}/folders`,
      {
        headers: {
          Authorization: `bearer ${apiKey}`,
          Accept: "application/vnd.vimeo.*+json;version=3.4",
        },
      }
    );

    if (!response.ok) return;

    const data = await response.json();
    const folders = data.data || [];

    for (const folder of folders) {
      const folderId = folder.uri.split("/").pop();
      const [existing] = await db.query("SELECT id FROM vimeo_folders WHERE folder_id = ?", [folderId]);
      if (!existing.length) {
        await db.query("INSERT INTO vimeo_folders (folder_id, name) VALUES (?, ?)", [folderId, folder.name]);
      }
    }
  } catch (error) {
    console.error("Error in syncVimeoFolders:", error);
  }
}

exports.syncVimeoVideos = async (req, res) => {
  const vimeoUserId = "252313005";

  try {
    const [activeAccounts] = await db.query(
      "SELECT api_key FROM vimeo_accounts ORDER BY connected_at DESC"
    );

    if (!activeAccounts.length) {
      return res.status(400).json({ message: "No Vimeo accounts connected to sync." });
    }

    const apiKey = activeAccounts[0].api_key;

    // 1. Sync Folders
    await syncVimeoFolders(apiKey, vimeoUserId);

    // 2. Fetch Videos from synced folders
    const [folders] = await db.query(`SELECT folder_id FROM vimeo_folders`);

    for (const folder of folders) {
      try {
          const response = await fetch(
              `https://api.vimeo.com/users/${vimeoUserId}/folders/${folder.folder_id}/videos?fields=link,uri,name,description,duration,created_time,pictures`,
              {
                headers: {
                  Authorization: `bearer ${apiKey}`,
                  Accept: "application/vnd.vimeo.*+json;version=3.4",
                },
              }
          );

          if (!response.ok) continue;

          const data = await response.json();
          const videosList = data.data || [];
          
          for (const item of videosList) {
              const video_id = item.uri.split("/").pop();
              let thumbnail_url = null;

              if (item.pictures && Array.isArray(item.pictures.sizes) && item.pictures.sizes.length) {
                  const mediumSize = item.pictures.sizes.find((s) => s.width >= 640) || item.pictures.sizes[0];
                  thumbnail_url = mediumSize.link;
              }

              const [videoResult] = await db.query("SELECT id FROM vimeo_videos WHERE video_id = ?", [video_id]);
              
              if (videoResult.length === 0) {
                  await db.query(
                      "INSERT INTO vimeo_videos (title, link, video_id, description, duration, upload_date, thumbnail_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
                      [item.name, item.link, video_id, item.description, item.duration, item.created_time, thumbnail_url]
                  );
              } else {
                  await db.query(
                      "UPDATE vimeo_videos SET title = ?, link = ?, description = ?, duration = ?, thumbnail_url = ? WHERE video_id = ?",
                      [item.name, item.link, item.description, item.duration, thumbnail_url, video_id]
                  );
              }
          }
      } catch (err) {
          console.error("Vimeo fetch error for folder:", folder.folder_id, err);
      }
    }

    const [videos] = await db.query("SELECT * FROM vimeo_videos ORDER BY upload_date DESC");
    return res.json(videos);
  } catch (error) {
    console.error("Sync Videos API Error:", error);
    res.status(500).json({ message: "Failed to sync with Vimeo", error: error.message });
  }
};