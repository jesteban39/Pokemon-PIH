const { Router } = require("express");
const { Pokemon } = require("../db");

const {
  searchPokemon,
  addPokemon,
  verifyName,
} = require("../actions");

const TOTAL = 40;
const ROUTE = "http://191.89.96.186:80/"+"pokemons";
const router = Router();

module.exports = router;

router.get("/", (req, res) => {
  let { from, limit, name, id } = req.query;

  if (name) {
    name = verifyName(name);
    if (!name)
      return res.status(404).json({
        message: "name in not valid",
        data: {},
      });
    return searchPokemon(name)
      .then((pokemon) => {
        return res.json({
          message: "successful search",
          data: pokemon,
        });
      })
      .catch(() => {
        return res.status(404).json({
          message: `No matches found for ${name}`,
          data: {},
        });
      });
  }

  from = parseInt(from);
  if (!from || from < 0) from = 1;
  limit = parseInt(limit);
  if (!limit || limit < 1) limit = 12;

  if (from <= 0) {
    return Pokemon.count().then((count) => {
      return res.json({
        count: TOTAL + count,
        previous: null,
        next: ROUTE + `?from=1&limit=${limit}`,
        message: "successful search",
        data: {},
      });
    });
  }

  let pokemonsP = [];
  let i = from;
  for (; i < from + limit && i <= TOTAL; i++) {
    pokemonsP.push(
      searchPokemon(i).then((pokemon) => {
        const { id, name, img, types, stats } = pokemon;
        return { id, name, img, types, force: stats.force };
      })
    );
  }

  let total = 0;
  Pokemon.count()
    .then((count) => count)
    .then((count) => {
      total = count;
      //if (i > TOTAL) from += 3001;
      if (
        (i > TOTAL && i <= from + limit) ||
        (i > 3000 && i <= total + 3000)
      ) {
        let j;
        if (from === TOTAL + 1) throw Error("no machets");
        if (i === TOTAL + 1) j = 3000 + 1;
        else if (i > 3000) j = i;
        else throw Error("no machets");
        for (
          ;
          (i < from + limit || j < from + limit) && j <= total + 3000;
          j++, i++
        ) {
          pokemonsP.push(
            searchPokemon(j).then((pokemon) => {
              const { id, name, img, types, stats } = pokemon;
              return { id, name, img, types, force: stats.force };
            })
          );
        }
        i = j;
      }
      return Promise.all(pokemonsP);
    })
    .then((pokemons) => {
      let next = null;

      if (
        (i <= TOTAL && i <= TOTAL + total) ||
        (i > 3000 && i <= total + 3000)
      ) {
        next = ROUTE + `?from=${i}&limit=${limit}`;
      }
      return res.json({
        count: TOTAL + total,
        previous:
          from > 1 ? TOTAL + `?from=${from}&limit=${limit}` : null,
        next,
        message: "successful search",
        data: pokemons,
      });
    })
    .catch((error) => {
      return res.status(404).json({
        mesages: "uups!",
        data: [],
      });
    });
});

router.get("/:payload", (req, res) => {
  let { payload } = req.params;
  return searchPokemon(payload)
    .then((pokemon) => {
      return res.json({
        message: "successful search",
        data: pokemon,
      });
    })
    .catch((error) => {
      return res.status(404).json({
        message: `No matches found for ${payload}`,
        data: {},
      });
    });
});

router.post("/", (req, res) => {
  let { name } = req.body;
  name = verifyName(name);
  if (!name)
    return res.status(404).json({
      message: "name is not valid",
      data: {},
    });
  req.body.name = name;
  return addPokemon(req.body)
    .then((newPokemon) => {
      const { id, name, img, types, force } = newPokemon;
      return res.json({
        message: "successful add",
        data: { id, name, img, types, force },
      });
    })
    .catch((error) => {
      return res.status(500).json({
        message: "uuuups!!!",
        data: {},
      });
    });
});

/* 
let { name } = req.query;
  
 */
