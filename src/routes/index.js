const { Router } = require("express");
require("dotenv").config();
const router = Router();

// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');
const videogames = require("./videogames");
const videogame = require("./videogame");
const genres = require("./genres");

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);
router.use("/videogames", videogames);
router.use("/genres", genres);
router.use("/videogame", videogame);

module.exports = router;
