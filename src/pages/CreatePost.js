import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../firebase-config';
import { useNavigate } from 'react-router-dom';

function CreatePost() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [title, setTitle] = useState("");
  const [postText, setPostText] = useState("");
  const [image, setImage] = useState(null);
  const postCollecctionRef = collection(db, "posts");
  let navigate = useNavigate();

  const createPost = async () => {
    if (!auth.currentUser) {
      // Redirect to login if user is not authenticated
      navigate("/login");
      return;
    }

    const formattedDate = formatDate(currentDate);
    let imageUrl = "";
    if (image) {
        const imageRef = ref(storage, `images/${image.name}`);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
    }
    await addDoc(postCollecctionRef, {
      title,
      postText,
      imageUrl,
      formattedDate,
      author: { name: auth.currentUser.displayName, id: auth.currentUser.uid },
      timeStamp: serverTimestamp()
    });
    navigate("/");
  };

  function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  return (
    <div className='createPostPage'>
      <div className='cpContainer'>
        <h2>Skapa nytt inlägg</h2>
        <div className='inputGp'>
          <label>Titel:</label>
          <input 
            placeholder='Titel...' 
            onChange={(event) => { 
              setTitle(event.target.value);
            }}
          />
        </div>
        <div className='inputGp'>
          <label>Inlägg:</label>
          <textarea 
            placeholder='Skriv ditt inlägg här' 
            onChange={(event) => {
              setPostText(event.target.value);
            }}
          />
        </div>
        <div className='inputGp'>
          <label>Ladda upp bild:</label>
          <input 
            type='file'
            onChange={(event) => {
              setImage(event.target.files[0]);
            }}
          />
        </div>
        <button onClick={createPost}>Publicera</button>
      </div>
    </div>
  );
}

export default CreatePost;
