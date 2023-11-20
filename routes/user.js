const express = require("express");
const mysql = require("mysql2/promise");
const config = require("../config");
const router = express.Router();

const pools = {};
for (const gamemode in config) {
  pools[gamemode] = mysql.createPool(config[gamemode]);
}

async function getUserData(pool, user, tableName, userField) {
  const [rows] = await pool.query(
    `SELECT * FROM ${tableName} WHERE ${userField} = ?`,
    [user]
  );
  return rows[0] || null;
}

router.get("/:user/infos/total", async (req, res) => {
  try {
    const { user } = req.params;
    const userData = await getUserDataForAllGamemodes(user);

    if (Object.keys(userData).length === 0) {
      return res
        .status(404)
        .json({ error: "Nessun dato trovato per l'utente" });
    }

    res.json(userData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errore interno del server" });
  }
});

router.get("/:user/infos/serial", async (req, res) => {
  try {
    const { user } = req.params;
    const pool = pools["hub"];

    const userData = await getUserData(pool, user, "users", "user");
    if (!userData) {
      return res
        .status(404)
        .json({ error: "Nessun dato trovato per l'utente" });
    }
    let isBanned = null,
      vips = null,
      prefixs = null;

    const uuid = userData.uuid;

    const litebansDatas = await getUserData(
      pools["litebans"],
      uuid,
      "litebans_bans",
      "uuid"
    );

    isBanned = litebansDatas.active;
    ranks = {
      "lifesteal": "default",
      "practice": "default"
    };

    res.json({ user: userData.user, uuid: userData.uuid, isBanned: isBanned, ranks: ranks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errore interno del server" });
  }
});

router.get("/:user/infos/:gamemode", async (req, res) => {
  try {
    const { user, gamemode } = req.params;
    const pool = pools[gamemode];

    if (!pool) {
      return res.status(404).json({ error: "Gamemode non trovato" });
    }
    const hubPool = pools["hub"];
    const uuidData = await getUserData(hubPool, user, "users", "user");
    if (!uuidData) {
      return res.status(404).json({ error: "Utente non trovato" });
    }
    const uuid = uuidData.uuid;

    const userData = await getUserData(pool, uuid, "users", "uuid");

    if (!userData) {
      return res.status(404).json({ error: "Utente non trovato" });
    }

    res.json({ [gamemode]: userData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errore interno del server" });
  }
});

router.get("/:user/infos/", async (req, res) => {
  try {
    const { user, gamemode } = req.params;

    if (!config[gamemode]) {
      return res.status(404).json({ error: "Gamemode non trovato" });
    }

    const userData = await getUserData(user, gamemode, "users", "user");

    if (!userData) {
      return res.status(404).json({ error: "Utente non trovato" });
    }

    res.json({ [gamemode]: userData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errore interno del server" });
  }
});

async function getUserDataForAllGamemodes(user) {
  let allGamemodeData = {};
  const hubPool = pools["hub"];
  const uuidData = await getUserData(hubPool, user, "users", "user");
  if (!uuidData) {
    return res.status(404).json({ error: "Utente non trovato" });
  }
  const uuid = uuidData.uuid;
  for (const gamemode in pools) {
    if(gamemode != "lifesteal" && gamemode != "practice") {
      return allGamemodeData;
    }
    const pool = pools[gamemode];

    const userData = await getUserData(pool, uuid, "users", "uuid");
    if (userData) {
      allGamemodeData[gamemode] = userData;
    }
  }
  return allGamemodeData;
}

module.exports = router;
