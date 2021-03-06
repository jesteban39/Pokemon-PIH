const axios = require("axios");
const { Pokemon, Grade } = require("../db.js");

const POKEAPI = "https://pokeapi.co/api/v2/pokemon/";
const TOTAL = 40;

/**
 * search for a pokemon by entering its name or id
 * @param {*} payload integer id or string name
 * @returns Pomise for a pokemon
 */
module.exports = searchPokemon = (payload) => {
  let id = parseInt(payload);
  if (id && id > 0 && id <= 898) {
    return searchInApi(id).then((pokemon) => pokemon);
  }
  if (id && id > 3000 && id < 4000) {
    return searchInDb(id).then((pokemon) => pokemon);
  }

  let name = new String(payload)
    .trim()
    .toLowerCase()
    .replace(/[\s]+/g, "-")
    .replace(/[^a-z\-]/gi, "");

  if (name && name.length > 2) {
    return searchInDb(name).then(
      (pokemon) => pokemon,
      () => {
        return searchInApi(name).then((pokemon) => {
          if (!pokemon || pokemon.id > 898) throw Error("out of range TOTAL");
          return pokemon;
        });
      }
    );
  }
  return searchInDb("0");
};

const searchInApi = (payload) => {
  return axios.get(POKEAPI + payload).then((data) => {
    return {
      id: data.data.id,
      name: data.data.name,
      height: data.data.height,
      weight: data.data.weight,
      stats: {
        life: data.data.stats[0].base_stat,
        force: data.data.stats[1].base_stat,
        defense: data.data.stats[2].base_stat,
        speed: data.data.stats[5].base_stat,
      },
      img: data.data.sprites.other["official-artwork"].front_default, //URL_IMG + id + ".png",
      types: data.data.types.map((type) => type.type.name),
    };
  });
};

const searchInDb = (payload) => {
  let attribute = "";

  if (typeof payload === "number") {
    payload -= 3000;
    attribute = "id";
  } else attribute = "name";

  //return Pokemon.findByPk(payload, { include: Grade });

  return Pokemon.findAll({
    where: { [attribute]: payload },
    include: Grade, //[{model: Grade, as: "types"}],
  }).then((data) => {
    data = data[0];
    //console.log("data-> ", data);
    if(!data) throw Error("no machets")
    return {
      id: data.id + 3000,
      name: data.name,
      height: data.height,
      weight: data.weight,
      stats: {
        life: data.life,
        force: data.force,
        defense: data.defense,
        speed: data.speed,
      },
      img: data.img,
      types: data.grades.map((grade) => grade.name),
    };
  });
};
