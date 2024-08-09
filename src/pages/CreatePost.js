import React, { useEffect, useState } from 'react';
import { addDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../firebase-config';
import { useNavigate } from 'react-router-dom';

function CreatePost() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [title, setTitle] = useState("");
  const [postText, setPostText] = useState("");
  const [image, setImage] = useState(null);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const postCollecctionRef = collection(db, "posts");

  console.log(selectedTags)

  let navigate = useNavigate();

  useEffect(() => {
    const fetchTags = async () => {
      const tagsCollection = collection(db, 'tags');
      const tagsSnapshot = await getDocs(tagsCollection);
      const tagsList = tagsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTags(tagsList);
    };

    fetchTags();
  }, []);

  const handleTagChange = (event) => {
    const { id, checked } = event.target;
    if (checked) {
      setSelectedTags([...selectedTags, id]);
    } else {
      setSelectedTags(selectedTags.filter(tagId => tagId !== id));
    }
  };

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
      selectedTags,
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
    <div className='createPostPage my-3'>
      <div className='cpContainer'>
        <h2>Skapa nytt inlägg</h2>
        <div className='inputGp'>
          <label className='cp-label'>Titel:</label>
          <input 
            placeholder='Titel...' 
            onChange={(event) => { 
              setTitle(event.target.value);
            }}
          />
        </div>
        <div className='inputGp'>
          <label className='cp-label'>Inlägg:</label>
          <textarea 
            placeholder='Skriv ditt inlägg här' 
            onChange={(event) => {
              setPostText(event.target.value);
            }}
          />
        </div>
        <div className='inputGp'>
          <label className='cp-label'>Ladda upp bild:</label>
          <input 
            type='file'
            onChange={(event) => {
              setImage(event.target.files[0]);
            }}
          />
        </div>
        <div className='inputGp'>
          <label className='cp-label mb-2'>Taggar:</label>
          <div className='checkbox-buttons'>
            {tags.map((tag) => (
              <div>
                <input type='checkbox' id={tag.id} className='checkbox-button' onChange={handleTagChange}/>
                <label for={tag.id} className='checkbox-label px-4 py-1 custom-size'>{tag.name}</label>
              </div>
              
            ))}
          </div>
          
        </div>
        <button onClick={createPost}>Publicera</button>
      </div>
    </div>
  );
}

export default CreatePost;
