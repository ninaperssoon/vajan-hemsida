import { useEffect, useState } from "react";
import Header from "./header";
import { getSongData } from "./data-retriever";
import "./songs.css";

function Songbook() {
  const [songs, setSongs] = useState([]);
  const [allSongs, setAllSongs] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [scrollToTopFlag, setScrollToTopFlag] = useState(false);

  // --- Ladda låtar ---
  useEffect(() => {
    async function fetchSongs() {
      const data = await getSongData();
      setSongs(data);
      setAllSongs(data);
    }
    fetchSongs();
  }, []);

  useEffect(() => {
    if (scrollToTopFlag) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setScrollToTopFlag(false);
    }
  }, [scrollToTopFlag]); // Bara scrollToTopFlag här, INTE songs

  // --- Filtrera efter kategori ---
  const filterByCategory = (category) => {
    setActiveCategory(category);
    setSearchQuery("");
  
    if (category === "All") {
      setSongs(allSongs);
    } else {
      const filtered = allSongs.filter((song) =>
        song.category.toLowerCase().includes(category.toLowerCase())
      );
      setSongs(filtered);
    }
  
    setTimeout(() => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0; // För äldre browsers
    }, 50);
  };

  // --- Filtrera efter sökning ---
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchQuery(value);
    setActiveCategory("All");

    if (!value) {
      setSongs(allSongs);
    } else {
      const filtered = allSongs.filter((song) =>
        song.title.toLowerCase().includes(value)
      );
      setSongs(filtered);
    }

  };

  // --- Overlay (register) ---
  const openRegister = () => setIsRegisterOpen(true);
  const closeRegister = () => setIsRegisterOpen(false);

  const closeRegisterAndScrollToSong = (songId) => {
    closeRegister();
    setSongs(allSongs);
    setActiveCategory("All");
    setSearchQuery("");
    setTimeout(() => {
      const songElement = document.getElementById(`song-${songId}`);
      if (songElement) {
        const elementPosition = songElement.offsetTop;
        const offset = 200; // Justera detta värde
        
        document.documentElement.scrollTop = elementPosition - offset;
        document.body.scrollTop = elementPosition - offset;
      }
    }, 100);
  };

  return (
    <div id="songbook">
      <Header />

      {/* --- Navigation --- */}
      <div id="song-nav">
        <ul>
          {["All", "Vajan", "Norrlands", "Klassiker", "Vänner"].map((cat) => (
            <li key={cat}>
              <a
                onClick={() => filterByCategory(cat)}
                className={activeCategory === cat ? "nav-active" : ""}
              >
                {cat === "All" ? "Alla sånger" : cat}
              </a>
            </li>
          ))}
        </ul>

        <div id="search">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Sök efter sång"
          />
          <div id="register">
            Eller bläddra bland alla sånger i{" "}
            <a onClick={openRegister}>Registret</a>
          </div>
        </div>
      </div>

      {/* --- Song container --- */}
      <div id="song-container">
        {/* --- Overlay (register) --- */}
        {isRegisterOpen && (
          <div id="overlay">
            <button onClick={closeRegister}>
              <p>x</p>
            </button>
            <div id="overlay-content">
                {allSongs
                    .slice()
                    .sort((a, b) => a.title.localeCompare(b.title))
                    .map((song) => (
                    <a key={song.id} onClick={() => closeRegisterAndScrollToSong(song.id)}>
                        {song.title}
                    </a>
                    ))}
                </div>
          </div>
        )}

        {/* --- Songs --- */}
        {songs.length > 0 ? (
          songs.map((song) => (
            <div key={song.id} className="song-div" id={`song-${song.id}`}>
              <div className="songtitle-container">
                <header>
                  <h2>{song.title}</h2>
                  {song.info && (
                    <div>
                      <button
                        data-tooltip-id="tooltip"
                        data-tooltip-content={song.info}
                        data-tooltip-place="top"
                        data-tooltip-variant="light"
                      >
                        i
                      </button>
                    </div>
                  )}
                </header>

                {song.melody && (
                  <p style={{ fontStyle: "italic" }}>Mel: {song.melody}</p>
                )}
                {song.author && (
                  <p style={{ fontStyle: "italic" }}>Text: {song.author}</p>
                )}
              </div>

              <p style={{ whiteSpace: "pre-line" }}>{song.text}</p>
            </div>
          ))
        ) : (
          <p>Ingen sång matchar din sökning</p>
        )}
      </div>
    </div>
  );
}

export default Songbook;
