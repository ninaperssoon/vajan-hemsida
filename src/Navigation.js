import { NavLink, useLocation } from "react-router-dom";
import logoRed from './images/logoRed.png';
import { useState, useRef } from 'react';

const Navigation = ({ isAuth, signUserOut }) => {
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navbarCollapseRef = useRef(null);

  const isAboutActive = location.pathname.startsWith('/aboutvajan') || location.pathname.startsWith('/aboutharken');

  // Funktion för att hantera dropdownens öppning/stängning
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Funktion för att stänga nav-collapsen (Bootstrap-klasser)
  const collapseNavbar = () => {
    if (navbarCollapseRef.current && navbarCollapseRef.current.classList.contains('show')) {
      navbarCollapseRef.current.classList.remove('show');
    }
    setIsDropdownOpen(false);
  };

  // Helper to close dropdown and navbar
  const handleNavLinkClick = () => {
    collapseNavbar();
  };

  return (
    <nav className="navbar navbar-default navbar-expand-lg navbar-light bg-light sticky-top">
      <div className="container-fluid">
        <NavLink className="navbar-brand" to="/" onClick={handleNavLinkClick}>
          <img src={logoRed} alt="Logo" width="50" height="50"></img>
        </NavLink>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent" ref={navbarCollapseRef}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link" exact="true" to="/" activeClassName="active" onClick={handleNavLinkClick}>Hem</NavLink>
            </li>

            <li className={`nav-item dropdown ${isDropdownOpen ? 'show' : ''} ${isAboutActive ? 'active' : ''}`}>
              <span 
                className={`nav-link dropdown-toggle ${isDropdownOpen ? 'active' : ''}`}
                id="navbarDropdown" 
                role="button"
                aria-expanded={isDropdownOpen ? 'true' : 'false'}
                onClick={toggleDropdown}
                tabIndex={0}
              >
                Om oss
              </span>
              <ul className={`dropdown-menu ${isDropdownOpen ? 'show' : ''}`} aria-labelledby="navbarDropdown">
                <li>
                  <NavLink className="dropdown-item" to="/aboutvajan" activeClassName="active" onClick={() => { setIsDropdownOpen(false); handleNavLinkClick(); }}>Om Vajan</NavLink>
                </li>
                <li>
                  <NavLink className="dropdown-item" to="/aboutharken" activeClassName="active" onClick={() => { setIsDropdownOpen(false); handleNavLinkClick(); }}>Härken</NavLink>
                </li>
              </ul>
            </li>

            <li className="nav-item">
              <NavLink className="nav-link" to="/imagearchive" activeClassName="active" onClick={handleNavLinkClick}>Fotoarkiv</NavLink>
            </li>

            <li className="nav-item">
              <NavLink className="nav-link" to="/calendar" activeClassName="active" onClick={handleNavLinkClick}>Kalendarium</NavLink>
            </li>

            <li className="nav-item">
              <NavLink className="nav-link" to="/contact" activeClassName="active" onClick={handleNavLinkClick}>Kontakt</NavLink>
            </li>

            <li className="nav-item">
              <NavLink className="nav-link" to="/songbook" activeClassName="active" onClick={handleNavLinkClick}>Sångbok</NavLink>
            </li>

            {!isAuth ? (
              console.log()
            ) : (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/createpost" activeClassName="active" onClick={handleNavLinkClick}>Skapa inlägg</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/uploadimages" activeClassName="active" onClick={handleNavLinkClick}>Ladda upp bilder</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/addevents" activeClassName="active" onClick={handleNavLinkClick}>Lägg till event</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/uploadsongs" activeClassName="active" onClick={handleNavLinkClick}>Lägg till sång</NavLink>
                </li>
                <button className="btn btn-primary" onClick={() => { signUserOut(); collapseNavbar(); }}>Logga ut</button>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
