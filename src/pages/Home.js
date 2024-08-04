import React, { useEffect, useState } from "react";
import { getDocs, collection, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { auth, db } from "../firebase-config";

function Home({ isAuth }) {
  const [postLists, setPostList] = useState([]);
  const postsCollectionRef = collection(db, "posts");

  const deletePost = async (id) => {
    const postDoc = doc(db, "posts", id);
    await deleteDoc(postDoc);
    getPosts(); // Refresh the list after deleting a post
  };

  const getPosts = async () => {
    try {
      // Create query with orderBy timeStamp
      const q = query(postsCollectionRef, orderBy("timeStamp", "desc"));
      const querySnapshot = await getDocs(q);


      if (querySnapshot.empty) {
        console.log("No documents found");
      } else {
        querySnapshot.forEach((doc) => {
          console.log("Document ID:", doc.id);
          console.log("Document Data:", doc.data());
        });

        const posts = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        console.log("Posts array:", posts);
        setPostList(posts);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    getPosts();
  }, []);

  return (
    <>
      <div className="hero-image">
        <div className="hero-text">
          <h1 className="hero-title">VAJAN BÄRS OCH FRIGJORDA KVINNOR</h1>
        </div>
      </div>

      <div className="homePage">
        <div className="container mb-4">
          <div className="row">
            <div className="col-sm-8 p-0">
              {postLists.map((post) => (
                <div key={post.id}>
                  <div className="post">
                    <div className="postHeader">
                      <div className="title">
                        <h2>{post.title}</h2>
                        <p className="date">{post.formattedDate}</p>
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
                  </div>
                  <div className="divider my-4"></div>
                </div>
              ))}
            </div>
            <div className="col-sm-4 special">
              <div className="card info-card p-4">
                <h2>Välkommen!</h2>
                <p>Här kan det stå lite kort information om Hembygdsföreningen Vajan. Vill dom läsa mer kan dom trycka på en länken här som tar de vidare till sidan <a href="/aboutVajan">om oss</a>, som de även kan finna i headern.</p>
                <p>Jag skriver lite till för att ge extra effekt av denna ruta. Färgen är jag lite osäker på, men vill få in gult på något sätt. Kanske på knappar?</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
