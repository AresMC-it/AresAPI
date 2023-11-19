const express = require("express");
const mysql = require("mysql2/promise");
const config = require("../config");
const router = express.Router();

async function getUserData(user, gamemode) {
  const connection = await mysql.createConnection(config[gamemode]);
  try {
    const [rows] = await connection.query(
      "SELECT * FROM users WHERE user = ?",
      [user]
    );
    return rows[0];
  } finally {
    await connection.end();
  }
}

router.get("/:user/infos/total", async (req, res) => { 
  try {
    const { user } = req.params;
    const userData = await getUserDataForAllGamemodes(user);

    if (Object.keys(userData).length === 0) {
      return res
        .status(404)
        .json({ error: "Nessun dato trovato per l'utente nei gamemode" });
    }

    res.json(userData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errore interno del server" });
  }
});

router.get("/:user/infos/:gamemode", async (req, res) => {
  try {
    const { user, gamemode } = req.params;

    if (!config[gamemode]) {
      return res.status(404).json({ error: "Gamemode non trovato" });
    }

    const userData = await getUserData(user, gamemode);

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

    const userData = await getUserData(user, gamemode);

    if (!userData) {
      return res.status(404).json({ error: "Utente non trovato" });
    }

    res.json({ [gamemode]: userData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errore interno del server" });
  }
});

router.get("/:user/infos/serial", async (req, res) => {
  try {
    const { user, gamemode } = req.params;

    if (!config[gamemode]) {
      return res.status(404).json({ error: "Gamemode non trovato" });
    }

    const userData = await getUserData(user, gamemode);

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
  for (const gamemode in config) {
    const name = config[gamemode].database;
    console.log(name);
    if (name == "lifesteal" || name == "practice") {
      const connection = await mysql.createConnection(config[gamemode]);
      try {
        const [rows] = await connection.query(
          "SELECT * FROM users WHERE user = ?",
          [user]
        );
        if (rows.length > 0) {
          allGamemodeData[gamemode] = rows[0];
        }
      } finally {
        await connection.end();
      }
    }
  }
  return allGamemodeData;
}

module.exports = router;
