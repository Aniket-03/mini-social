import { useState, useEffect, useCallback } from "react";
import { fetchPosts } from "../common/firebaseFunctions";
import Post from "../components/Post";
import { auth } from "../firebase-config";
import Loader from "../common/Loader";
import CreatePost from "../components/CreatePost";
import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { PostModal } from "../common/modal";
 
const Content = () => {
  const userId = auth?.currentUser?.uid;
  const [posts, setPosts] = useState<PostModal[]>([]);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(1);
  const loadPosts = useCallback(
    async (resetPosts = false) => {
      setLoading(true);

      try {
        const { posts: newPosts, lastVisible: newLastVisible } =
          await fetchPosts(resetPosts ? null : lastVisible);
        
        if (newPosts.length === 0) {
        } else {
          setPosts((prev: PostModal[]) =>
            [...prev, ...newPosts].filter(
              (post, index, self) =>
                index === self.findIndex((p) => p.id === post.id)
            )
          );

          setLastVisible(newLastVisible);
        }
      } catch (error) {
        console.error("Error loading posts:", error);
      } finally {
        setLoading(false);
      }
    },
    [loading, lastVisible,count]
  );
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Use non-null assertion or optional chaining
          const lastImage = document.querySelector(".infiniteScrollItem:last-child");
          if (lastImage) {
            observer.unobserve(lastImage);
          }
          setCount((prevCount) => prevCount + 1);
        }
      },
      { threshold: 1 }
    );
  
    const lastImage = document.querySelector(".infiniteScrollItem:last-child");
    if (lastImage) {
      observer.observe(lastImage);
    }
  
    // Change to direct disconnect without 'current'
    return () => observer.disconnect();
  }, [posts]);
  useEffect(() => {
    loadPosts();
  }, [count]);

  const handlePostAdded = () => {
    loadPosts(true);
  };

  return (
    <>
      {userId && <CreatePost onPostAdded={handlePostAdded} />}

      <div className="flex  py-4 px-6">
        {loading && <Loader />}
        <div className="w-full max-w-xl feeds-container">
          {posts.length === 0 && !loading && (
            <p className="text-center text-lg">No posts to display.</p>
          )}
          <div className="infiniteScrollContainer">
          {posts.map((post) => (
            <div
              key={post.id}
              className="p-4 mb-2   rounded-lg transition-all duration-300 infiniteScrollItem"
            >
              <Post
                post={post}
                currentUserId={userId}
                setLoading={setLoading}
                updatePost={() => {}}
              />
            </div>
          ))}
          </div>
          
          { !loading && posts.length !== 0 && (
            <p className="text-lg text-white pl-5">Looks like you're all caught up!</p>
          )}
        </div>
      </div>

      
    </>
  );
};

export default Content;
