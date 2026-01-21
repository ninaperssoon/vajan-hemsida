import React from "react";
import { useState } from "react";
import { setDoc, collection, getDocs, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../firebase-config';
import { useNavigate } from 'react-router-dom'; 
import Dropdown from 'react-bootstrap/Dropdown';
import { query, orderBy } from 'firebase/firestore';


function UploadSongs () {

    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [melody, setMelody] = useState("");
    const [text, setText] = useState("");
    const [category, setCategory] = useState("");
    const [info, setInfo] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Välj kategori");
    const postCollectionRef = collection(db, "songs");


    async function uploadSong() {
        if (!title || !text || !selectedCategory || selectedCategory === "Välj kategori") {
            alert('Fyll i titel, text och kategori.');
            return;
        }
    
        // Hämta högsta id
        const songsRef = collection(db, "songs");
        const q = query(songsRef, orderBy("id", "desc"));
        const querySnapshot = await getDocs(q);
    
        let maxId = 0;
        if (!querySnapshot.empty) {
            maxId = querySnapshot.docs[0].data().id; // id är redan nummer
        }
        const nextId = maxId + 1;
    
        // Lägg till sången
        await setDoc(doc(db, "songs", String(nextId)), {
            id: nextId,
            title,
            author: author || "",
            melody: melody || "",
            text,
            category: selectedCategory,
            info: info || ""
        });
    
        alert('Sången har publicerats!');
        navigate("/");
    }
    
    

    function handleTitleChange(event) {
        setTitle(event.target.value);
    }
    function handleAuthorChange(event) {
        setAuthor(event.target.value);
    }
    function handleMelodyChange(event) {
        setMelody(event.target.value);
    }
    function handleTextChange(event) {
        setText(event.target.value);
    }
    function handleInfoChange(event) {
        setInfo(event.target.value);
    }
    function handleCategoryChange(event) {
        setSelectedCategory(event);
        setCategory(event);
    }
    return (
        <div className="create-container my-5" style={{ maxWidth: "600px", margin: "0 auto" }}>
            <h2>Ladda upp en sång</h2>

            {/* Titel */}
            <div className="mb-3 mt-3">
                <label className='create-label'>
                Sångtitel <span style={{ color: 'var(--primary-active-color)'}}>*</span>
                </label>
                <input
                placeholder="Titel..."
                className="form-control"
                onChange={handleTitleChange}
                />
            </div>

            {/* Författare och Melodi på samma rad, mindre utrymme */}
            <div className="d-flex gap-2 mb-3">
                <div style={{ flex: 1 }}>
                <label className='create-label'>Författare</label>
                <input
                    placeholder="Författare..."
                    className="form-control"
                    onChange={handleAuthorChange}
                />
                </div>

                <div style={{ flex: 1 }}>
                <label className='create-label'>Melodi</label>
                <input
                    placeholder="Melodi..."
                    className="form-control"
                    onChange={handleMelodyChange}
                />
                </div>
            </div>

            {/* Text */}
            <div className="mb-3">
                <label className='create-label'>
                Text <span style={{ color: 'var(--primary-active-color)'}}>*</span>
                </label>
                <textarea
                placeholder="Text..."
                className="form-control"
                onChange={handleTextChange}
                value={text}
                rows={6}
                style={{ resize: "vertical" }}
                />
            </div>

            {/* Fun fact */}
            <div className="mb-3">
                <label className='create-label'>Har låten någon fun fact?</label>
                <input
                placeholder="Fun fact..."
                className="form-control"
                onChange={handleInfoChange}
                />
            </div>

            {/* Dropdown */}
            <div className="mb-3">
                <Dropdown onSelect={handleCategoryChange}>
                <Dropdown.Toggle variant='secondary' id='dropdown-basic'>
                    {selectedCategory}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    <Dropdown.Item eventKey='Vajan'>Vajan</Dropdown.Item>
                    <Dropdown.Item eventKey='Norrlands'>Norrlands</Dropdown.Item>
                    <Dropdown.Item eventKey='Klassiker'>Klassiker</Dropdown.Item>
                    <Dropdown.Item eventKey='Vänner'>Vänner</Dropdown.Item>
                </Dropdown.Menu>
                </Dropdown>
            </div>

            <button className='btn btn-primary' onClick={uploadSong}>
                Ladda upp sång
            </button>
        </div>
    )
      
}

export default UploadSongs;