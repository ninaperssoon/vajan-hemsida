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
  const [currentPage, setCurrentPage] = useState(1); // Håller reda på vilken sida vi är på
  const postsPerPage = 10; // Antal inlägg per sida
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  const maxPageButtons = 3; // Number of page buttons to show

  const getPageNumbers = () => {
    if (totalPages <= maxPageButtons) {
      // Show all pages if total pages are less than or equal to maxPageButtons
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    // When on the first page(s)
    if (currentPage <= 2) {
      return [1, 2, 3];
    }

    // When on the last page(s)
    if (currentPage >= totalPages - 1) {
      return [totalPages - 2, totalPages - 1, totalPages];
    }

    // Show current, previous, and next page when in the middle
    return [currentPage - 1, currentPage, currentPage + 1];
  };


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
        setFilteredPosts(posts.slice(0, postsPerPage));
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
  
    // Apply tag filtering if a tag is selected
    const tagFiltered = selectedTag
      ? filtered.filter(post => post.selectedTags && post.selectedTags.includes(selectedTag))
      : filtered;
  
    // Apply date filtering if a date is selected
    const dateFiltered = selectedDate.month && selectedDate.year
      ? tagFiltered.filter(post => {
          const postDate = new Date(post.timeStamp.seconds * 1000);
          return postDate.getMonth() + 1 === selectedDate.month && postDate.getFullYear() === selectedDate.year;
        })
      : tagFiltered;
  
    setFilteredPosts(dateFiltered);
  }, [searchTerm, selectedTag, selectedDate, postLists, tags]);
  

  return (
    <>
      <div className="hero-image">
        <div className="hero-text">
          <h1 className="hero-title">HEMBYGDSFÖRENINGEN VAJAN</h1>
          <h2>Vajan, bärs och frigjorda kvinnor</h2>
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
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
                          Filtrera
                        </button>
                      </h2>
                      <div id="collapseOne" className="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
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

            <div className="col-lg-9 ">
            {currentPosts.length > 0 ? (
                currentPosts.map((post) => (
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
                      <div className="postTextContainer preformatted-text" 
                        dangerouslySetInnerHTML={{ __html: post.sanitizedPostText }} 
                      />
                        {post.imageUrl && <img src={post.imageUrl} alt="Post" />}
                        <p className="mt-3">Vaj vaj!</p>
                        <p>{post.author.name}</p>

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
              <div className="justify-content-center d-flex">
                <nav aria-label="Page navigation example">
                  <ul className="pagination">
                    {/* Previous Button */}
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => paginate(currentPage - 1)}
                        aria-label="Previous"
                        disabled={currentPage === 1}
                      >
                        <span aria-hidden="true">&laquo;</span>
                      </button>
                    </li>

                    {/* Page Number Buttons */}
                    {getPageNumbers().map((pageNumber) => (
                      <li key={pageNumber} className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => paginate(pageNumber)}>
                          {pageNumber}
                        </button>
                      </li>
                    ))}

                    {/* Next Button */}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => paginate(currentPage + 1)}
                        aria-label="Next"
                        disabled={currentPage === totalPages}
                      >
                        <span aria-hidden="true">&raquo;</span>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
