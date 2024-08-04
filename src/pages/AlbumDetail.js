import React, { useEffect, useState } from 'react';
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";
import { useParams } from 'react-router-dom';

function AlbumDetail() {
  const { albumName } = useParams();
  const [photos, setPhotos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      const storage = getStorage();
      const albumRef = ref(storage, `albums/${albumName}`);
      const albumImages = await listAll(albumRef);

      const photosData = await Promise.all(
        albumImages.items.map(async (itemRef) => {
          const photoUrl = await getDownloadURL(itemRef);
          return photoUrl;
        })
      );

      setPhotos(photosData);
    };

    fetchPhotos();
  }, [albumName]);

  const openOverlay = (index) => {
    setCurrentIndex(index);
  };

  const closeOverlay = () => {
    setCurrentIndex(null);
  };

  const showNextPhoto = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
  };

  const showPreviousPhoto = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + photos.length) % photos.length);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (currentIndex !== null) {
        switch (event.key) {
          case 'ArrowRight':
            showNextPhoto();
            break;
          case 'ArrowLeft':
            showPreviousPhoto();
            break;
          case 'Escape':
            closeOverlay();
            break;
          default:
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex]);

  return (
    <div>
      <div className='container album-container'>
        <div className='mt-5 mb-3'>
          <a href='/imagearchive' className='return'>Tillbaka till fotoarkivet</a>
          <h1>{albumName}</h1>
        </div>
        
        <div className="photos-list mb-5">
          {photos.map((photoUrl, index) => (
            <div className="photo" key={index}>
              <img 
                src={photoUrl} 
                alt={`Photo ${index + 1}`} 
                className='photo-image'
                onClick={() => openOverlay(index)}
              />
            </div>
          ))}
        </div>
      </div>

      {currentIndex !== null && (
        <div className="overlay">
          <button className="close-button" onClick={closeOverlay}>×</button>
          <button className="prev-button" onClick={showPreviousPhoto}>←</button>
          <img src={photos[currentIndex]} alt={`Photo ${currentIndex + 1}`} className="overlay-image" />
          <button className="next-button" onClick={showNextPhoto}>→</button>
        </div>
      )}
    </div>
  );
}

export default AlbumDetail;
