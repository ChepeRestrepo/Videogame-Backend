require("dotenv").config();
const { APIKEY } = process.env;
const { Router } = require("express");
const router = Router();
const axios = require("axios").default;
const { Videogame, Genres } = require("../db");

//TODO -----> GET a "/videogames" <--------
router.get("/rating", async (req, res) => {
  //pendiente el reto para traer cinco juegos filtrados por rating
});
router.get("/", async (req, res) => {
  //busco en la DB si tengo juegos creados y me traigo todos
  let videogamesDb = await Videogame.findAll({
    include: Genres,
  });
  //Parseo el objeto
  videogamesDb = JSON.stringify(videogamesDb);
  videogamesDb = JSON.parse(videogamesDb);
 
  videogamesDb = videogamesDb.reduce(
    (acc, el) =>
      acc.concat({
        ...el,
        genres: el.genres.map((g) => g.name),
      }),
    []
  );

  //TODO QUERIES --------> GET /videogames?name="..." <-----------
  
  if (req.query.name) {
    try {
      //busco si existe el juego en la API
      let response = await axios.get(
        `https://api.rawg.io/api/games?search=${req.query.name}&key=${APIKEY}`
      );
      if (!response.data.count)
        return res.status(204).json(`Juego no encontrado "${req.query.name}"`);
      //filtro la data que necesito para enviarle al front
      const gamesREADY = response.data.results.map((game) => {
        return {
          id: game.id,
          name: game.name,
          background_image: game.background_image,
          rating: game.rating,
          genres: game.genres.map((g) => g.name),
        };
      });

      //como antes me traje TODOS de la base de datos, si entro por queries, solo filtro los que coincidan con la busqueda
      const filteredGamesDb = videogamesDb.filter((g) =>
        g.name.toLowerCase().includes(req.query.name.toLowerCase())
      );
      //doy prioridad a la DB, y sumo todos, y corto el array en 15
      const results = [...filteredGamesDb, ...gamesREADY.splice(0, 5)];
      return res.json(results);
    } catch (err) {
      return console.log(err);
    }
  } else {
    // SI NO ENTRO POT QUERIES --> voy a buscar todos los juegos a la API
    try {
      let pages = 0;
      let results = [...videogamesDb]; //sumo lo que tengo en la DB
      let response = await axios.get(
        `https://api.rawg.io/api/games?key=${APIKEY}`
      );
      while (pages < 6) {
        pages++;
        //filtro solo la DATA que necesito enviar al FRONT
        const gammesREADY = response.data.results.map((game) => {
          return {
            id: game.id,
            name: game.name,
            background_image: game.background_image,
            rating: game.rating,
            genres: game.genres.map((g) => g.name),
          };
        });
        results = [...results, ...gammesREADY];
        response = await axios.get(response.data.next); //vuelvo a llamar a la API con next
      }
      return res.json(results);
    } catch (err) {
      console.log(err);
      return res.sendStatus(500);
    }
  }
});

module.exports = router;
