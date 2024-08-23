import React, { useEffect, useState, useCallback } from 'react';
import { addDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../firebase-config';
import { useNavigate } from 'react-router-dom';
import { createEditor, Node } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { Editor, Transforms } from 'slate';

function CreatePost() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [title, setTitle] = useState("");
  const [postText, setPostText] = useState("");
  const [image, setImage] = useState(null);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const postCollecctionRef = collection(db, "posts");

  const [editor] = useState(() => withReact(createEditor()));
  const [value, setValue] = useState([
    {
      type: 'paragraph',
      children: [{ text: 'Skriv ditt inlägg här...' }],
    },
  ]);

  // Local state for tracking active formatting
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
  });

  const handleChange = (newValue) => {
    setValue(newValue);
    const text = newValue.map(n => Node.string(n)).join('\n');
    setPostText(text);

    // Update the active formatting state
    setActiveFormats({
      bold: Editor.marks(editor)?.bold || false,
      italic: Editor.marks(editor)?.italic || false,
      underline: Editor.marks(editor)?.underline || false,
    });
  };

  const toggleMark = (format) => {
    const isActive = activeFormats[format];
    if (isActive) {
      Editor.removeMark(editor, format);
    } else {
      Editor.addMark(editor, format, true);
    }

    // Update local state immediately
    setActiveFormats((prev) => ({
      ...prev,
      [format]: !isActive,
    }));
  };

  const CodeElement = props => (
    <pre {...props.attributes}>
      <code>{props.children}</code>
    </pre>
  );

  const DefaultElement = props => <p {...props.attributes}>{props.children}</p>;

  const Leaf = props => (
    <span
      {...props.attributes}
      style={{
        fontWeight: props.leaf.bold ? 'bold' : 'normal',
        fontStyle: props.leaf.italic ? 'italic' : 'normal',
        textDecoration: props.leaf.underline ? 'underline' : 'none',
      }}
    >
      {props.children}
    </span>
  );

  const renderElement = props => {
    switch (props.element.type) {
      case 'code':
        return <CodeElement {...props} />;
      default:
        return <DefaultElement {...props} />;
    }
  };

  const renderLeaf = useCallback(props => {
    return <Leaf {...props} />;
  }, []);

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
      <div className='create-container container-md'>
        <h2>Skapa nytt inlägg</h2>
        <div className='inputGp'>
          <label className='create-label'>Titel:</label>
          <input 
            placeholder='Titel...' 
            onChange={(event) => { 
              setTitle(event.target.value);
            }}
          />
        </div>

        <div className='inputGp'>
          <label className='create-label'>Inlägg:</label>
          <Slate 
            editor={editor} 
            initialValue={value} 
            onChange={handleChange}
          >
            <div style={{ marginBottom: '10px' }}>
              <button 
                type="button" 
                className={`format-btn ${activeFormats.bold ? 'active' : ''}`}
                onClick={() => toggleMark('bold')}>
                <strong>B</strong>
              </button>
              <button 
                type="button" 
                className={`format-btn ${activeFormats.italic ? 'active' : ''}`}
                onClick={() => toggleMark('italic')}>
                <em>I</em>
              </button>
              <button 
                type="button" 
                className={`format-btn ${activeFormats.underline ? 'active' : ''}`}
                onClick={() => toggleMark('underline')}>
                <u>U</u>
              </button>
            </div>
            <Editable 
              renderElement={renderElement}
              renderLeaf={renderLeaf}
            />
          </Slate>
        </div>

        <div className='inputGp'>
          <label className='create-label'>Ladda upp bild:</label>
          <input 
            type='file'
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
