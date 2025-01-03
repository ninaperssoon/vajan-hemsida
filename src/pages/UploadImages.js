import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { auth, storage } from "../firebase-config";
import { ref, uploadBytes, listAll, getDownloadURL } from "firebase/storage";
import { v4 } from "uuid";

function UploadImages() {
    
    const [isAuth, setIsAuth] = useState(false);
    const navigate = useNavigate();
    const [existingAlbums, setExistingAlbums] = useState([]);

    
    useEffect(() => {
        // Kontrollera autentisering när sidan laddas
        const unsubscribe = auth.onAuthStateChanged(user => {
        if (user) {
            setIsAuth(true);
        } else {
            navigate("/login");
        }
        });

        // Städa upp prenumerationen när komponenten avmonteras
        return () => unsubscribe();
    }, [navigate]);

    useEffect(() => {
        // Fetch existing albums on component mount
        const fetchAlbums = async () => {
            const albumsRef = ref(storage);
            const response = await listAll(albumsRef);
            const albumNames = response.prefixes.map((prefix) => prefix.name);
            setExistingAlbums(albumNames);
        };
        fetchAlbums();
    }, []);

    const [albumTitle, setAlbumTitle] = useState("");
    const [imageUploads, setImageUploads] = useState([]);
    const [imageList, setImageList] = useState([]);

    const imageListRef = ref(storage, `${albumTitle}/`);

    const uploadImages = () => {
        try {
            if (imageUploads.length === 0) return;
            if (existingAlbums.includes(albumTitle)) {
                alert("Album name already exists. Please choose a different name.");
                return;
            };
            Array.from(imageUploads).forEach((imageUpload) => {
                const imageRef = ref(storage, `albums/${albumTitle}/${imageUpload.name + v4()}`)
                uploadBytes(imageRef, imageUpload).then((snapshot) => {
                    getDownloadURL(snapshot.ref).then((url) => {
                        setImageList((prev) => [...prev, url]);
                    })
                })
            })
            alert('Uppladdningen lyckades')
            navigate("/")
        }
        catch {
            alert('Uppladdningen misslyckades')
        }
    };

    useEffect(() => {
        listAll(imageListRef).then((response) => {
            response.items.forEach((item) => {
                getDownloadURL(item).then((url) => {
                    setImageList((prev) => [...prev, url]);
                });
            });
        });
    }, []);

    return (
        <div className="createPostPage my-5">
            <div className="create-container">
                <h2>Ladda upp bilder i ett album</h2>
                <div>
                <label className='create-label my-2'>Döp albumet:</label>
                    <input
                        placeholder="Albumnamn..."
                        className="form-control my-3"
                        onChange={(event) => { 
                            setAlbumTitle(event.target.value);
                        }}
                    ></input>
                </div>
                
                <input 
                    type="file" 
                    className="form-control my-3"
                    onChange={(event) => {
                        setImageUploads(event.target.files);
                    }}
                    multiple
                />
                <button onClick={uploadImages}> Ladda upp bilder </button>

            </div>
        </div>
        
    );
};

export default UploadImages;