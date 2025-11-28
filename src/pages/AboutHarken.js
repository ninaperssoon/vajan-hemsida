import React, { useEffect, useState } from "react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../firebase-config";


function AboutHarken () {
    const [text, setText] = useState('');
    const [photos, setPhotos] = useState([]);

    const infoTextCollectionRef = collection(db, "infoTexts");

    const getText = async () => {
        try {
          // Create query with orderBy timeStamp
          const querySnapshot = await getDocs(infoTextCollectionRef);
    
    
          if (querySnapshot.empty) {
            console.log("No documents found");
          } else {
    
            const textArray = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
            const allText = textArray[1].aboutHarken;

            setText(allText);
          }
        } catch (error) {
          console.error("Error fetching posts:", error);
        }
      };
    
    useEffect(() => {
        getText();
        fetchPhotos();
    }, []);

    const fetchPhotos = () => {
      // Example of hardcoded photo URLs from Firebase Storage
      const photoUrls = [
        {
          url: 'https://firebasestorage.googleapis.com/v0/b/vajan-hemsida.appspot.com/o/harken%2FCleo_20231014_LiamJohansson-7309428.jpg?alt=media&token=7c25f143-b49c-44ac-8c43-ffa5ecfe7498',
          alt: 'Cleo, fotad under Härken 2023'
        },
        {
          url: 'https://firebasestorage.googleapis.com/v0/b/vajan-hemsida.appspot.com/o/harken%2FHa%CC%88rken_Logga_20231014_LiamJohansson-7308924.jpg?alt=media&token=dfe1ca1b-935d-4bad-9d00-d3a90bfd3b1b',
          alt: 'FörstRen och konferencierer, fotad under hösten 2023'
        },
        {
          url: 'https://firebasestorage.googleapis.com/v0/b/vajan-hemsida.appspot.com/o/harken%2FHa%CC%88rken_Logga_20231014_LiamJohansson-7309025.jpg?alt=media&token=77cbc2f0-2bb0-4288-83a2-c5d488cd926f',
          alt: 'Årets Härk 2023'
        },
        {
          url: 'https://firebasestorage.googleapis.com/v0/b/vajan-hemsida.appspot.com/o/harken%2FHa%CC%88rken_Logga_20231014_LiamJohansson-7309094.jpg?alt=media&token=3717e45a-7f86-49b0-bae9-9874f2d20d38',
          alt: 'Kaffeunderhållningen Härken 2023'
        }
      ];
  
      setPhotos(photoUrls);
  };

    return (
        <div className="container album-container mb-5">
            <h1 className="mt-5">Härken</h1>
            <div className="mt-5">
                <p className="info-text">{text}</p>
            </div>
            <div className="photos-list row d-flex justify-content-center">
                {photos.map((photo, index) => (
                    <div className="harken-image-list col-lg-5 col-md-5 col-sm-12 m-2" key={index}>
                        <img 
                            src={photo.url} 
                            alt={photo.alt ? photo.alt : `Photo ${index + 1}`} 
                            className='harken-image'
                            loading="lazy"
                            fetchpriority={index === 0 ? "high" : "auto"}
                        />
                    </div>
                ))}
            </div>
          </div>

    )
}

export default AboutHarken;