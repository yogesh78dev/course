const db = require("../db");
const bcrypt = require("bcryptjs");

exports.getVimeoAccounts = async (req, res) => {
  try {
    const [accounts] = await db.query(
      "SELECT id, name, api_key_identifier, connected_at FROM vimeo_accounts ORDER BY connected_at DESC"
    );
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.addVimeoAccount = async (req, res) => {
  const { name, apiKey } = req.body;

  // In a real app, you would validate the key with Vimeo API
  // const encryptedApiKey = await bcrypt.hash(apiKey, 10);
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
      apiKeyIdentifier,
      connectedAt,
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

exports.getVimeoVideos = async (req, res) => {
  // In a real app, this would trigger a sync with the Vimeo API,
  // then fetch from the local DB cache. Here we just fetch.

  const vimeoUserId = "219090400";

  try {
    // Find the first account that has a real API key.
    const [activeAccount] = await db.query(
      "SELECT id, name, api_key, connected_at FROM vimeo_accounts ORDER BY connected_at DESC"
    );

    if (!activeAccount.length) {
      return res
        .status(404)
        .json({ message: "No connected Vimeo accounts found." });
    }

    let folderSynced = false;
    for (const acct of activeAccount) {
      const syncResult = await syncVimeoFolders(acct.api_key, vimeoUserId);
      if (syncResult.success) {
        folderSynced = true;
        break;
      } else {
        console.warn(
          `Folder sync failed for API key: ${acct.api_key}, error: ${syncResult.error}`
        );
      }
    }

    //Fetch folder list
    const [folders] = await db.query(
      `SELECT folder_id, name FROM vimeo_folders`
    );

    for (const folder of folders) {
      const folderId = folder.folder_id;

      activeAccount.forEach(async (acct) => {
        const response = await fetch(
          `https://api.vimeo.com/users/${vimeoUserId}/folders/${folderId}/videos?fields=link,uri,name,description,duration,created_time,pictures`,
          {
            headers: {
              Authorization: `bearer ${acct.api_key}`,
              Accept: "application/vnd.vimeo.*+json;version=3.4",
            },
          }
        );

        const data = await response.json();
        const result = data.data ?? [];
        result.forEach(async (res) => {
          const video_id = res.uri.split("/").pop();
          let thumbnail_url = null;

          if (
            res.pictures &&
            Array.isArray(res.pictures.sizes) &&
            res.pictures.sizes.length
          ) {
            const mediumSize =
              res.pictures.sizes.find((s) => s.width >= 320) ||
              res.pictures.sizes[0];
            thumbnail_url = mediumSize.link;
          }

          const [videoResult] = await db.query(
            "SELECT * FROM vimeo_videos WHERE video_id = ? ",
            [video_id]
          );
          if (videoResult.length == 0) {
            const [resultData] = await db.query(
              "INSERT INTO vimeo_videos (title, link, video_id, description, duration, upload_date,thumbnail_url) VALUES (?, ?, ?, ?, ?, ?,?)",
              [
                res.name,
                res.link,
                video_id,
                res.description,
                res.duration,
                res.created_time,
                thumbnail_url
              ]
            );
          } else {
            // UPDATE existing video
            await db.query(
              "UPDATE vimeo_videos SET thumbnail_url = ? WHERE video_id = ?",
              [
                thumbnail_url,
                video_id,
              ]
            );
          }
        });
      });
    }

    const [videos] = await db.query(
      "SELECT * FROM vimeo_videos ORDER BY upload_date DESC"
    );

    return res.json(videos);

    // if (!response.ok) {
    //     const errorData = await response.json();
    //     console.error("Vimeo API Error:", errorData);
    //     throw new Error(errorData.developer_message || "Failed to fetch videos from Vimeo.");
    // }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
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

    const data = await response.json();
    const folders = data.data || [];

    for (const folder of folders) {
      const folderId = folder.uri.split("/").pop();

      const [existing] = await db.query(
        "SELECT id FROM vimeo_folders WHERE folder_id = ?",
        [folderId]
      );

      if (!existing.length) {
        await db.query(
          `
                    INSERT INTO vimeo_folders (folder_id, name)
                    VALUES (?, ?)
                `,
          [folderId, folder.name]
        );
      }
    }

    return { success: true, message: `${folders.length} folders synced.` };
  } catch (error) {
    console.error("Error in syncVimeoFolders:", error);
    return { success: false, error: error.message };
  }
}
