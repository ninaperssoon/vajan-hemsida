import React, { useEffect, useState } from 'react';
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";
import { Link } from 'react-router-dom';

function ImageArchive() {
  const [albums, setAlbums] = useState([]);

  useEffect(() => {
    const fetchAlbums = async () => {
      const storage = getStorage();
      const albumsRef = ref(storage, 'albums');
      const albumsList = await listAll(albumsRef);

      const albumsData = await Promise.all(albumsList.prefixes.map(async (albumRef) => {
        const albumName = albumRef.name;
        const albumImages = await listAll(albumRef);
        let firstImageUrl = '';

        if (albumImages.items.length > 0) {
          firstImageUrl = await getDownloadURL(albumImages.items[0]);
        }

        return {
          name: albumName,
          imageUrl: firstImageUrl,
          path: albumRef.fullPath
        };
      }));

      setAlbums(albumsData);
    };

    fetchAlbums();
  }, []);

  return (
    <div className='image-archive-page'>
      <div className="container album-container mb-5">
        <h1 className='my-5'>Vajans fotoarkiv</h1>
        <div className="album-list">
          {albums.map((album, index) => (
            <div className="album" key={index}>
              <Link to={`/albums/${album.name}`} className='album-link'>
                {album.imageUrl ? (
                  <img src={album.imageUrl} alt={album.name} />
                ) : (
                  <p>No image available</p>
                )}
                <h2>{album.name}</h2>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ImageArchive;
