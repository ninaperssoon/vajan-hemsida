import React, { useEffect, useState, useCallback } from 'react';
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";
import { useParams } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';

function AlbumDetail() {
  const { albumName } = useParams();
  const [photos, setPhotos] = useState([]);
  const [loadedPhotos, setLoadedPhotos] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);  // Flagga för initial laddning
  const { ref: observerRef, inView } = useInView({
    threshold: 1,
    triggerOnce: false
  });

  const preloadImage = (src) => {
    const img = new Image();
    img.src = src;
  };

  const fetchPhotos = useCallback(async (startIndex, limit) => {
    const storage = getStorage();
    const albumRef = ref(storage, `albums/${albumName}`);
    const albumImages = await listAll(albumRef);
  
    const limitedItems = albumImages.items.slice(startIndex, startIndex + limit);
  
    // Dela upp nedladdningar i batchar om 5
    const batchSize = 5;
    const photoBatches = [];
  
    for (let i = 0; i < limitedItems.length; i += batchSize) {
      const batch = limitedItems.slice(i, i + batchSize);
      photoBatches.push(
        Promise.all(
          batch.map(async (itemRef) => {
            const photoUrl = await getDownloadURL(itemRef);
            preloadImage(photoUrl);
            return photoUrl;
          })
        )
      );
    }
  
    const photosData = (await Promise.all(photoBatches)).flat();
  
    setLoadedPhotos((prev) => {
      const newPhotos = photosData.filter((photo) => !prev.includes(photo));
      return [...prev, ...newPhotos];
    });
  
    if (photosData.length < limit) {
      setHasMore(false);
    }
  }, [albumName]);

  // Throttle-funktion
  function throttle(func, limit) {
    let lastFunc;
    let lastRan;
    return function(...args) {
      const context = this;
      if (!lastRan) {
        func.apply(context, args);
        lastRan = Date.now();
      } else {
        clearTimeout(lastFunc);
        lastFunc = setTimeout(function() {
          if ((Date.now() - lastRan) >= limit) {
            func.apply(context, args);
            lastRan = Date.now();
          }
        }, limit - (Date.now() - lastRan));
      }
    };
  }

  // Använd throttle på fetchPhotos-funktionen
  const throttledFetchPhotos = useCallback(throttle(fetchPhotos, 20), [fetchPhotos]);

  useEffect(() => {
    if (initialLoad) {
      fetchPhotos(0, 10);
      setInitialLoad(false);  // Stäng av initial laddning efter första körningen
    }
  }, [fetchPhotos, initialLoad]);

  useEffect(() => {
    if (inView && hasMore && !initialLoad) {
      throttledFetchPhotos(loadedPhotos.length, 10);
    }
  }, [inView, hasMore, throttledFetchPhotos, loadedPhotos.length, initialLoad]);

  const openOverlay = (index) => {
    setCurrentIndex(index);
  };

  const closeOverlay = () => {
    setCurrentIndex(null);
  };

  const showNextPhoto = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % loadedPhotos.length);
  };

  const showPreviousPhoto = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + loadedPhotos.length) % loadedPhotos.length);
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
        <div className='mt-2 mb-3'>
          <a href='/imagearchive' className='return'>Tillbaka till fotoarkivet</a>
          <h1>{albumName}</h1>
        </div>
        
        <div className="photos-list mb-5">
          {loadedPhotos.map((photoUrl, index) => (
            <div className="photo" key={index}>
              <img 
                src={photoUrl} 
                alt={`Photo ${index + 1}`} 
                className='photo-image'
                onClick={() => openOverlay(index)}
                loading="lazy" 
              />
            </div>
          ))}
        </div>
        
        {/* Observer för att ladda fler bilder */}
        {hasMore && (
          <div ref={observerRef} className="loading-indicator">
            Laddar fler bilder...
          </div>
        )}
      </div>

      {currentIndex !== null && (
        <div className="overlay">
          <button className="close-button mt-5" onClick={closeOverlay}>×</button>
          <button className="prev-button" onClick={showPreviousPhoto}>←</button>
          <img src={loadedPhotos[currentIndex]} alt={`Photo ${currentIndex + 1}`} className="overlay-image mt-5" />
          <button className="next-button" onClick={showNextPhoto}>→</button>
        </div>
      )}
    </div>
  );
}

export default AlbumDetail;
