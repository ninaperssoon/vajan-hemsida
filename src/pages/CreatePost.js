import React, { useEffect, useState, useCallback, useRef } from 'react';
import { addDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../firebase-config';
import { useNavigate } from 'react-router-dom';
import Quill from 'quill';
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";
import DOMPurify from 'dompurify';


function CreatePost() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [title, setTitle] = useState("");
  const [postText, setPostText] = useState("");
  const [image, setImage] = useState(null);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const postCollectionRef = collection(db, "posts");
  const editorRef = useRef(null); // Create a ref for the editor container

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

    // Initialize Quill only if there's no existing instance
  if (editorRef.current && !editorRef.current.__quill) {
    const quill = new Quill(editorRef.current, {
      theme: 'bubble',
      placeholder: 'Skriv ditt inlägg här...',
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline'],
          ['link', 'blockquote', 'code-block'],
          [{ list: 'ordered' }, { list: 'bullet' }]
        ]
      }
    });

    // Save the instance to avoid re-initializing
    editorRef.current.__quill = quill;

    // Sync editor content with postText
    quill.on('text-change', () => {
      setPostText(quill.root.innerHTML);
    });
  }
    

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
      navigate("/login");
      return;
    }

    const formattedDate = formatDate(currentDate);
    let imageUrl = "";
    const sanitizedPostText = DOMPurify.sanitize(postText);


    if (image) {
      const imageRef = ref(storage, `images/${image.name}`);
      await uploadBytes(imageRef, image);
      imageUrl = await getDownloadURL(imageRef);
    }
    await addDoc(postCollectionRef, {
      title,
      sanitizedPostText, // Save the Quill content in postText state
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
      <div className='create-container container-md'>
        <h2>Skapa nytt inlägg</h2>
        <div className='inputGp'>
          <label className='create-label'>Titel:</label>
          <input 
            type='text'
            placeholder='Titel...' 
            onChange={(event) => { 
              setTitle(event.target.value);
            }}
          />
        </div>

        <div className='inputGp'>
          <label className='create-label'>Inlägg:</label>
          {/* Quill editor container */}
          <div className='form-control mt-3 mb-3'>
            <div 
              id='editor' 
              ref={editorRef} 
              className="quill-editor"
            ></div>
          </div>
          
        </div>

        <div>
          <label className='create-label mb-2'>Ladda upp bild:</label>
          <input 
            type='file'
            className='form-control'
            id='formFile'
            onChange={(event) => {
              setImage(event.target.files[0]);
            }}
          />
        </div>

        <div className='inputGp'>
          <label className='create-label mb-2'>Taggar:</label>
          <div className='checkbox-buttons'>
            {tags.map((tag) => (
              <div key={tag.id}>
                <input 
                  type='checkbox' 
                  id={tag.id} 
                  className='checkbox-button' 
                  onChange={handleTagChange}
                />
                <label 
                  htmlFor={tag.id} 
                  className='checkbox-label px-4 py-1 custom-size'>
                  {tag.name}
                </label>
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
