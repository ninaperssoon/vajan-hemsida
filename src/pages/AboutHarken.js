import React, { useEffect, useState } from "react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../firebase-config";
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";


function AboutHarken () {
    const [text, setText] = useState('');
    const [photos, setPhotos] = useState([]);

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

    const fetchPhotos = async () => {
        const storage = getStorage();
        const albumRef = ref(storage, `harken/`);
        const albumImages = await listAll(albumRef);
  
        const photosData = await Promise.all(
          albumImages.items.map(async (itemRef) => {
            const photoUrl = await getDownloadURL(itemRef);
            return photoUrl;
          })
        );
  
        setPhotos(photosData);
        console.log('photos:', photos)
      };

    return (
        <div className="container album-container mb-5">
            <h1 className="mt-5">Härken</h1>
            <div className="mt-5">
                <p className="info-text">{text}</p>
            </div>
            <div className="photos-list row d-flex justify-content-center">
                {photos.map((photoUrl, index) => (
                <div className="harken-image-list col-lg-5 col-md-5 col-sm-12 m-2" key={index}>
                    <img 
                        src={photoUrl} 
                        alt={`Photo ${index + 1}`} 
                        className='harken-image'
                    />
                </div>
            ))}
            </div>

        </div>
    )
}

export default AboutHarken;