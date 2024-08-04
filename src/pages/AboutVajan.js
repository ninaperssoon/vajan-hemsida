import React, { useEffect, useState } from "react";
import { getDocs, collection, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { auth, db } from "../firebase-config";

function AboutVajan () {
    const [text1, setText1] = useState('');
    const [text2, setText2] = useState('');
    const [text3, setText3] = useState('');

    const infoTextCollectionRef = collection(db, "infoTexts");
    console.log(infoTextCollectionRef)

    const getText = async () => {
        try {
          // Create query with orderBy timeStamp
          const querySnapshot = await getDocs(infoTextCollectionRef);
    
    
          if (querySnapshot.empty) {
            console.log("No documents found");
          } else {
           
            const textArray = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
            const allText = textArray[0].aboutVajan;
            const text1 = allText.slice(0, 470)
            const text2 = allText.slice(471, 730)
            const text3 = allText.slice(731, allText.length)

            setText1(text1);
            setText2(text2);
            setText3(text3);
          }
        } catch (error) {
          console.error("Error fetching posts:", error);
        }
      };
    
    useEffect(() => {
    getText();
    }, []);

    return (
        <div className="container album-container">
            <h1 className="mt-5">Om Vajan</h1>
            <div className="mt-5">
                <p className="info-text">{text1}</p>
                <p className="info-text">{text2}</p>
                <p className="info-text">{text3}</p>
            </div>
            

        </div>
    )
}

export default AboutVajan;