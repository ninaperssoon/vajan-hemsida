import React from "react";
import { useEffect, useState } from "react";
import { auth, provider, db, onAuthStateChanged } from "../firebase-config";
import { signInWithPopup, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";


function Login({ setIsAuth }) {
  let navigate = useNavigate();

  const [whitelist, setWhitelist] = useState([]);

  useEffect(() => {
    const fetchWhitelist = async () => {
      try {
        const whitelistCollection = collection(db, "whiteList"); // Kontrollera att samlingsnamnet är rätt
        const whitelistSnapshot = await getDocs(whitelistCollection);
        const whitelistEmails = whitelistSnapshot.docs.map(doc => doc.data().email);
        setWhitelist(whitelistEmails);
      } catch (error) {
        console.error("Error fetching whitelist:", error);
      }
    };

    fetchWhitelist();
  }, []);

  const signInWithGoogle = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        const userEmail = result.user.email;
        
        if (whitelist.includes(userEmail)) {
          localStorage.setItem("isAuth", true);
          setIsAuth(true);
          navigate("/createpost");
        } else {
          // Logga ut användaren och visa ett meddelande
          signOut(auth).then(() => {
            alert("Du har inte behörighet att logga in.");
          });
        }
      })
      .catch((error) => {
        console.error("Error signing in with Google:", error);
      });
  };

  return (
    <div className="loginPage">
      <p>Logga in med Google för att fortsätta</p>
      <button className="login-with-google-btn" onClick={signInWithGoogle}>
        Logga in med Google
      </button>
    </div>
  );
}

export default Login;