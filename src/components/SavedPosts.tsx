import { useEffect, useState } from "react";
import { fetchSavedPosts } from "../common/firebaseFunctions";
import { useAuth } from "../hooks/useAuth";
import Post from "./Post";
import Loader from "../common/Loader";
import { PostModal } from "../common/postModal";
import { Link } from "react-router-dom";

const SavedPosts = () => {
  const [savedPosts, setSavedPosts] = useState<PostModal[]>([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isPostUpdated, setIsPostUpdated] = useState(0);

  useEffect(() => {
    const getSavedPosts = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const posts = await fetchSavedPosts(user.uid);
        setSavedPosts(posts);
      } catch (error) {
        console.error("Error fetching saved posts:", error);
      } finally {
        setLoading(false);
      }
    };

    getSavedPosts();
  }, [isPostUpdated,user]);

  return <> 
    <div className="flex flex-wrap gap-10 m-10 sm:mt-4 p-3 sm:p-0">
      {loading && <Loader />}

      {!loading && savedPosts.length === 0 ? (
        <div className="w-50 mx-auto text-center text-lg">No saved posts found.</div>
      ) : (
        savedPosts.map((post) => (
          <div key={post.id} className="relative w-full sm:w-auto mb-4"> 
            <Post
            key={post.id}
            post={post}
            currentUserId={user.uid}
            setLoading={setLoading}
            updatePost={ () => setIsPostUpdated((prev) => prev + 1) }
          />
          </div>
         
        ))
      )}
      
    </div>
    
  </>
};

export default SavedPosts;
