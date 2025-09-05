import { NavLink, useLocation } from "react-router-dom";
import logoRed from './images/logoRed.png';
import { useState } from 'react';

const Navigation = ({ isAuth, signUserOut }) => {
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const isAboutActive = location.pathname.startsWith('/aboutvajan') || location.pathname.startsWith('/aboutharken');

  // Funktion för att hantera dropdownens öppning/stängning
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <nav className="navbar navbar-default navbar-expand-lg navbar-light bg-light sticky-top">
      <div className="container-fluid">
        <NavLink className="navbar-brand" to="/">
          <img src={logoRed} alt="Logo" width="50" height="50"></img>
        </NavLink>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link" exact to="/" activeClassName="active">Hem</NavLink>
            </li>

            <li className={`nav-item dropdown ${isDropdownOpen ? 'show' : ''} ${isAboutActive ? 'active' : ''}`}>
              <span 
                className={`nav-link dropdown-toggle ${isDropdownOpen ? 'active' : ''}`}
                id="navbarDropdown" 
                role="button"
                aria-expanded={isDropdownOpen ? 'true' : 'false'}
                onClick={toggleDropdown}
              >
                Om oss
              </span>
              <ul className={`dropdown-menu ${isDropdownOpen ? 'show' : ''}`} aria-labelledby="navbarDropdown">
                <li><NavLink className="dropdown-item" to="/aboutvajan" activeClassName="active" onClick={() => setIsDropdownOpen(false)}>Om Vajan</NavLink></li>
                <li><NavLink className="dropdown-item" to="/aboutharken" activeClassName="active" onClick={() => setIsDropdownOpen(false)}>Härken</NavLink></li>
              </ul>
            </li>

            <li className="nav-item">
              <NavLink className="nav-link" to="/imagearchive" activeClassName="active">Fotoarkiv</NavLink>
            </li>

            <li className="nav-item">
              <NavLink className="nav-link" to="/calendar" activeClassName="active">Kalendarium</NavLink>
            </li>

            <li className="nav-item">
              <NavLink className="nav-link" to="/contact" activeClassName="active">Kontakt</NavLink>
            </li>

            <li className="nav-item">
              <NavLink className="nav-link" to="https://ninaperssoon.github.io/songbook/" activeClassName="active">Sångbok länk</NavLink>
            </li>

            <li className="nav-item">
              <NavLink className="nav-link" to="/songbook" activeClassName="active">Sångbok här</NavLink>
            </li>

            {!isAuth ? (
              console.log( )
            ) : (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/createpost" activeClassName="active">Skapa inlägg</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/uploadimages" activeClassName="active">Ladda upp bilder</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/addevents" activeClassName="active">Lägg till event</NavLink>
                </li>
                <button className="btn btn-primary" onClick={signUserOut}>Logga ut</button>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
