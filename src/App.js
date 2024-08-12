import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CreatePost from "./pages/CreatePost";
import Login from "./pages/Login";
import UploadImages from "./pages/UploadImages";
import Contact from "./pages/Contact";
import AboutHarken from "./pages/AboutHarken";
import AboutVajan from "./pages/AboutVajan";
import ImageArchive from "./pages/ImageArchive";
import AlbumDetail from "./pages/AlbumDetail";
import PrivateRoutes from './pages/PrivateRoutes';
import Calendar from "./pages/Calendar";
import AddEvents from "./pages/AddEvents";
import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "./firebase-config";
import 'bootstrap/dist/css/bootstrap.min.css';
import './custom.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import Navigation from './Navigation';
import facebookLogo from './images/Facebook copy.png';
import instagramLogo from './images/Instagram copy.png';


function App() {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const authState = localStorage.getItem("isAuth");
    if (authState === "true") {
      setIsAuth(true);
    }
  }, []);

  const signUserOut = () => {
    signOut(auth).then(() => {
      localStorage.clear();
      setIsAuth(false);
      window.location.pathname = "/login";
    });
  };

  return (
    <Router>
      <div id="root">
        <Navigation isAuth={isAuth} signUserOut={signUserOut} />

        <main>
          <Routes>
            <Route path="/" element={<Home isAuth={isAuth} />} />
            <Route path="/createpost" element={<PrivateRoutes component={CreatePost} />} />
            <Route path="/login" element={<Login setIsAuth={setIsAuth} />} />
            <Route path="/uploadimages" element={<PrivateRoutes component={UploadImages} />} />
            <Route path="/imagearchive" element={<ImageArchive />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/aboutharken" element={<AboutHarken />} />
            <Route path="/aboutvajan" element={<AboutVajan />} />
            <Route path="/albums/:albumName" element={<AlbumDetail />} />
            <Route path="/calendar" element={<Calendar isAuth={isAuth}/>} />
            <Route path="/addevents" element={<PrivateRoutes component={AddEvents} />} />
          </Routes>
        </main>

        <footer className="footer">
        <div >
        
          <p>Du hittar oss här:</p>
          <ul>
            <li>
              <a href="https://www.facebook.com/groups/hbfvajan">
                <img className="socials-image" src={facebookLogo}></img>
              </a>
            </li>
            <li>
              <a href="https://www.instagram.com/hbf_vajan/">
                <img className="socials-image" src={instagramLogo}></img>
              </a>
            </li>
            
          </ul>
          
        </div>
        
        
      </footer>
      </div>
    </Router>
  );
}

export default App;

