import React, { useEffect, useState } from "react";
import "./App.css";

export default function App() {
  const [pokemon, setPokemon] = useState(null);
  const [search, setSearch] = useState("pikachu");
  const [location, setLocation] = useState(null);
  const [isFront, setIsFront] = useState(true);
  const [evolution, setEvolution] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
  const saved = localStorage.getItem("favorites");
  if (saved) setFavorites(JSON.parse(saved));
  }, []);

  useEffect(() => {
  localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (name) => {
  if (favorites.includes(name)) {
    setFavorites(favorites.filter(p => p !== name));
  } else {
    setFavorites([...favorites, name]);
  }
  };

  // 🧠 Fetch Pokémon data
  const fetchPokemon = async (nameOrId) => {
    try {
      const res = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${nameOrId}`
      );

      if (!res.ok) throw new Error("Not found");

      const data = await res.json();
      setPokemon(data);

      fetchLocation(data.name);
      fetchEvolution(data.name);
    } catch (err) {
      console.log(err);
      setPokemon(null);
      setLocation(null);
    }
  };

  // 📍 Fetch location data
  const fetchLocation = async (nameOrId) => {
    try {
      const res = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${nameOrId}/encounters`
      );

      const data = await res.json();

      if (!data || data.length === 0) {
        setLocation("Unknown location");
        return;
      }

      setLocation(data[0]?.location_area?.name || "Unknown location");
    } catch (err) {
      console.log(err);
      setLocation("Unknown location");
    }
  };

  const fetchEvolution = async (name) => {
  try {
    // 1. Get species
    const speciesRes = await fetch(
      `https://pokeapi.co/api/v2/pokemon-species/${name}`
    );
    const speciesData = await speciesRes.json();

    // 2. Get evolution chain
    const evoRes = await fetch(speciesData.evolution_chain.url);
    const evoData = await evoRes.json();

    // 3. Extract evolution names
    const chain = [];

    let current = evoData.chain;

    while (current) {
      chain.push(current.species.name);
      current = current.evolves_to[0];
    }

    setEvolution(chain);
  } catch (err) {
    console.log(err);
    setEvolution([]);
  }
};

  // 🔁 Load default Pokémon
  useEffect(() => {
    fetchPokemon("pikachu");
  }, []);

  return (
    <div className="container">
      {/* HEADER */}
      <div className="header">
        <h1 className="logo">POKÉMON</h1>
        <span className="tagline">A BIT DIFFERENT</span>
      </div>

      {/* SEARCH */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search Pokémon..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={() => fetchPokemon(search.toLowerCase())}>
          🔍
        </button>
      </div>

      {/* TOP SECTION */}
      <div className="top-section">
        {/* DISPLAY BOX */}
        <div className="display-box large">
  {pokemon ? (
    <div className="pokemon-card">
      <h2 className="poke-name">{pokemon.name}</h2>

      <img
        className="pokemon-img"
        src={
          isFront
            ? pokemon.sprites.other["official-artwork"].front_default
            : pokemon.sprites.other["official-artwork"].front_shiny
        }
        alt={pokemon.name}
      />

      <div className="pokemon-actions">
        <button
          className={`fav-btn ${
            favorites.includes(pokemon.name) ? "active" : ""
          }`}
          onClick={() => toggleFavorite(pokemon.name)}
        >
          {favorites.includes(pokemon.name)
            ? "💔 Remove Favorite"
            : "❤️ Save Favorite"}
        </button>
      </div>
    </div>
  ) : (
    <p className="empty-state">Search a Pokémon</p>
  )}
</div>

        {/* SIDE PANEL */}
        <div className="side-panel">
          <div className="pokeball">
            <div className="pokeball-button"></div>
          </div>

          <button
            className="random-btn"
            onClick={() => {
              const id = Math.floor(Math.random() * 1010) + 1;
              fetchPokemon(id);
            }}
          >
            Generate random Pokémon ✨
          </button>

          <button
            className="random-btn"
            onClick={() => setIsFront(!isFront)}
          >
            Flip / Shiny Toggle 🔄✨
          </button>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="bottom-section">
        <div className="card red">
          <div className="card-screen">
            {pokemon && (
              <>
                <p>Type: {pokemon.types[0].type.name}</p>
                <p>
                  Location: {location ? location.replace("-", " ") : "Unknown"}
                </p>
              </>
            )}
          </div>
          <div className="card-footer"></div>
        </div>

        <div className="card yellow">
        <div className="card-screen">
          {evolution.length > 0 ? (
            <>
              <p>Evolution:</p>

              {evolution.map((name, index) => (
                <p key={index}>➡ {name}</p>
              ))}
            </>
          ) : (
            <p>No evolution data</p>
          )}
        </div>

        <div className="card-footer"></div>
      </div>
      </div>
    </div>
  );
}