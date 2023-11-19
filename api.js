const port = 3000;
const express = require("express");
const userRoutes = require('./routes/user');

const app = express();

app.use(express.static("public"));

app.use('/api/user', userRoutes);

app.get("*", (req, res) => {
  res.send(`
    <link rel="stylesheet" type="text/css" href="/style.css">

    <h1 style="font-size: 20px">
        Wrong path! Possible paths:
        <br>• api.aresmc.eu/api/user/:user/infos
        <br>• api.aresmc.eu/api/user/:user/infos/total
        <br>• api.aresmc.eu/api/user/:user/info/:gamemode (lifesteal, practice)
        <br>• api.aresmc.eu/api/user/serial
    </h1>`);
});

app.listen(3000, () => {
  console.log(`Listening on ${port}!`);
});
