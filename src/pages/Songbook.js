import { useEffect, useState } from "react";
import Header from "./header";
import "./songs.css";
import { Tooltip } from 'react-tooltip'
import { getDocs, collection } from "firebase/firestore";
import { db } from "../firebase-config";


function Songbook() {
  const [songs, setSongs] = useState([]);
  const [allSongs, setAllSongs] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [scrollToTopFlag, setScrollToTopFlag] = useState(false);

  // --- Ladda låtar ---
  useEffect(() => {
    getSongs();
  }, []);

  useEffect(() => {
    if (scrollToTopFlag) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setScrollToTopFlag(false);
    }
  }, [scrollToTopFlag]); 

  const getSongs = async () => {
    const songsCollection = collection(db, "songs");
    const songsSnapshot = await getDocs(songsCollection);
    const songsList = songsSnapshot.docs
      .map(doc => ({ id: doc.data().id, ...doc.data() }))
      .sort((a, b) => a.id - b.id);
    setSongs(songsList);
    setAllSongs(songsList);
  };

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
      document.getElementById('song-container')?.scrollIntoView({ 
        behavior: "smooth", 
        block: "start" 
      });
    }, 100);
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
        songElement.scrollIntoView({ 
          behavior: "smooth", 
          block: "start" 
        });
      }
    }, 100);
  };

  return (
    <div id="songbook">
      <Header />
      <Tooltip id="tooltip" />
      {/* --- Navigation --- */}
      <div id="song-nav">
        <ul>
          {["All", "Vajan", "Norrlands", "Klassiker", "Vänner"].map((cat) => (
            <li key={cat}>
              <a
                onClick={() => filterByCategory(cat)}
                className={activeCategory === cat ? "nav-active" : ""}
                href="#"
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
            <a onClick={openRegister} href="#">Registret</a>
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
            <div
              id="overlay-content"
              style={{
                maxHeight: "70vh",
                overflowY: "auto",
                paddingRight: "0.5rem"
              }}
            >
              {allSongs
                .slice()
                .sort((a, b) => a.id - b.id)
                .map((song) => (
                  <a
                    key={song.id}
                    onClick={() => closeRegisterAndScrollToSong(song.id)}
                    href="#"
                  >
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

              <p style={{ whiteSpace: "pre-line" }}>{song.text.replace(/\\n/g, "\n")}</p>
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
