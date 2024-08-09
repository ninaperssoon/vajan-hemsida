import React, { useEffect, useState } from "react";
import { getDocs, collection, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { auth, db } from "../firebase-config";

function Home({ isAuth }) {
  const [postLists, setPostList] = useState([]);
  const postsCollectionRef = collection(db, "posts");
  const [tags, setTags] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);
  const [selectedDate, setSelectedDate] = useState({ month: null, year: null });
  const [archiveDates, setArchiveDates] = useState([]);
  console.log(archiveDates)

  const deletePost = async (id) => {
    const postDoc = doc(db, "posts", id);
    await deleteDoc(postDoc);
    getPosts();
  };

  const getPosts = async () => {
    try {
      const q = query(postsCollectionRef, orderBy("timeStamp", "desc"));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log("No documents found");
      } else {
        const posts = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setPostList(posts);
        setFilteredPosts(posts);
        generateArchiveDates(posts);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const generateArchiveDates = (posts) => {
    const dates = posts.map(post => {
      const postDate = new Date(post.timeStamp.seconds * 1000);
      return { month: postDate.getMonth() + 1, year: postDate.getFullYear() };
    });

    const uniqueDates = Array.from(new Set(dates.map(date => `${date.year}-${date.month}`)))
                             .map(dateString => {
                               const [year, month] = dateString.split('-').map(Number);
                               return { month, year };
                             });

    setArchiveDates(uniqueDates);
  };

  const fetchTags = async () => {
    const tagsCollection = collection(db, 'tags');
    const tagsSnapshot = await getDocs(tagsCollection);
    const tagsList = tagsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setTags(tagsList);
  };

  const getTagNames = (tagIds) => {
    return tagIds.map(tagId => {
      const tag = tags.find(t => t.id === tagId);
      return tag ? tag.name : "Unknown Tag";
    });
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const handleTagClick = (tagId) => {
    if (selectedTag === tagId) {
      setSelectedTag(null); // Deselect tag if it's already selected
    } else {
      setSelectedTag(tagId); // Select the new tag
    }
  };

  const handleDateChange = (month, year) => {
    if (selectedDate.month === month && selectedDate.year === year) {
      setSelectedDate({ month: null, year: null });
    } else {
      setSelectedDate({ month, year });
    }
  };

  useEffect(() => {
    getPosts();
    fetchTags();
  }, []);

  useEffect(() => {
    const filtered = postLists.filter(post => {
      const titleMatches = post.title.toLowerCase().includes(searchTerm);
      const tagsMatch = post.selectedTags && getTagNames(post.selectedTags).some(tagName =>
        tagName.toLowerCase().includes(searchTerm)
      );
      return titleMatches || tagsMatch;
    });
    setFilteredPosts(filtered);
  }, [searchTerm, postLists, tags]);

  useEffect(() => {
    if (selectedTag) {
      const filtered = postLists.filter(post => 
        post.selectedTags && post.selectedTags.includes(selectedTag)
      );
      setFilteredPosts(filtered);
    } else {
      setFilteredPosts(postLists);
    }
  }, [selectedTag, postLists]);

  useEffect(() => {
    if (selectedDate.month && selectedDate.year) {
      const filtered = postLists.filter(post => {
        const postDate = new Date(post.timeStamp.seconds * 1000);
        return postDate.getMonth() + 1 === selectedDate.month && postDate.getFullYear() === selectedDate.year;
      });
      setFilteredPosts(filtered);
    } else {
      setFilteredPosts(postLists);
    }
  }, [selectedDate, postLists]);

  return (
    <>
      <div className="hero-image">
        <div className="hero-text">
          <h1 className="hero-title">VAJAN BÄRS OCH FRIGJORDA KVINNOR</h1>
        </div>
      </div>

      <div className="homePage">
        <div className="mb-4 px-lg-5 px-md-2 px-1 py-3">
          <div className="row px-md-5 ">
            <div className="col-lg-3 col-md-6 ">
              <div className="card info-card p-4 mb-3">
                <form className="form-inline my-2 my-lg-0">
                  <input
                    className="form-control mr-sm-2"
                    type="search"
                    placeholder="Sök"
                    aria-label="Search"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </form>
                <div className="d-none d-md-block">
                  <div className="mt-3">
                    <h2>Kategorier</h2>
                    <div className="checkbox-buttons mt-3">
                      {tags.map((tag) => (
                        <div key={tag.id}>
                          <input 
                            type='checkbox' 
                            id={tag.id} 
                            className='checkbox-button' 
                            checked={selectedTag === tag.id}
                            onChange={() => handleTagClick(tag.id)} 
                          />
                          <label htmlFor={tag.id} className='checkbox-label px-3'>{tag.name}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3">
                    <h2>Arkiv</h2>
                    <div className="archive-menu">
                      {archiveDates.map((date, index) => (
                        <button 
                          key={index} 
                          onClick={() => handleDateChange(date.month, date.year)}
                          className={`btn-link mt-2 ${selectedDate.month === date.month && selectedDate.year === date.year ? 'btnn-link-active' : ''}`}
                        >
                          {new Date(date.year, date.month - 1).toLocaleString('default', { month: 'long' })} {date.year}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Accordion for smaller screens */}
                <div className="col-12 d-block d-md-none">
                  <div className="accordion" id="accordionExample">
                    <div className="accordion-item">
                      <h2 className="accordion-header" id="headingOne">
                        <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                          Filtrera
                        </button>
                      </h2>
                      <div id="collapseOne" className="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                        <div className="accordion-body">
                          <div className="mt-3">
                            <h2>Kategorier</h2>
                            <div className="checkbox-buttons mt-3">
                              {tags.map((tag) => (
                                <div key={tag.id}>
                                  <input 
                                    type='checkbox' 
                                    id={tag.id} 
                                    className='checkbox-button' 
                                    checked={selectedTag === tag.id}
                                    onChange={() => handleTagClick(tag.id)} 
                                  />
                                  <label htmlFor={tag.id} className='checkbox-label px-3'>{tag.name}</label>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="mt-3">
                            <h2>Arkiv</h2>
                            <div className="archive-menu">
                              {archiveDates.map((date, index) => (
                                <button 
                                  key={index} 
                                  onClick={() => handleDateChange(date.month, date.year)}
                                  className={`btn-link mt-2 ${selectedDate.month === date.month && selectedDate.year === date.year ? 'btnn-link-active' : ''}`}
                                >
                                  {new Date(date.year, date.month - 1).toLocaleString('default', { month: 'long' })} {date.year}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-9 col-md-6">
            {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <div key={post.id}>
                    <div className="post p-3 p-md-5">
                      <div className="postHeader">
                        <div className="title">
                          <h2>{post.title}</h2>
                          <p className="date">{new Date(post.timeStamp.seconds * 1000 + post.timeStamp.nanoseconds / 1000000).toLocaleDateString()}</p>
                        </div>
                        <div className="deletePost">
                          {isAuth && post.author.id === auth.currentUser.uid && (
                            <button onClick={() => deletePost(post.id)}>
                              <p>Radera inlägg</p>
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="postTextContainer preformatted-text">{post.postText}</div>
                        {post.imageUrl && <img src={post.imageUrl} alt="Post" />}
                        <p className="mt-3">Vaj vaj, {post.author.name}</p>
                        <hr></hr>
                        <div className="align-items-center d-flex">
                          <div className="checkbox-buttons">
                            {post.selectedTags && getTagNames(post.selectedTags).map((tagName, index) => (
                              <div key={index} className="checkbox-label px-3">
                                <span 
                                  className="tag" 
                                  onClick={() => handleTagClick(post.selectedTags[index])}
                                >
                                  {tagName}
                                </span>
                              </div>
                            ))}
                            {!post.selectedTags && (
                              <div className="checkbox-label px-3">
                                <span className="tag">Okategoriserat</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="d-flex justify-content-center">
                        <div className="divider my-4"></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-lg-9 col-md-6 no-posts">
                    <h1>Inga inlägg matchar din sökning.</h1>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
