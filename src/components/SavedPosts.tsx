import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import Post from "./Post";
import Loader from "../common/Loader";
import { PostModal } from "../common/modal";
import {
  collection,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
const SavedPosts = () => {
  const { user } = useAuth();
  const [savedPosts, setSavedPosts] = useState<PostModal[]>([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchSavedPosts = async () => {
      setLoading(true);
      try {
        const retrievedPosts = await getSavedPost(user.uid);
        setSavedPosts(retrievedPosts);
      } catch (error) {
        console.error("Failed to load saved posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedPosts();
  }, [user, refresh]);

  const getSavedPost = async (userId: string) => {
    try {
      const savedPostsRef = collection(db, "users", userId, "savedPosts");
  
      const querySnapshot = await getDocs(savedPostsRef);
  
      const savedPosts = [];
  
      for (const savedDoc of querySnapshot.docs) {
        const { postId } = savedDoc.data();
  
        const postRef = doc(db, "posts", postId);
        const postSnap = await getDoc(postRef);
  
        if (postSnap.exists()) {
          savedPosts.push({
            id: postId,
            ...postSnap.data(),
            isSaved: true,
          });
        }
      }
  
      return savedPosts;
    } catch (error) {
      console.error("Error fetching saved posts:", error);
      return [];
    }
  };

  return (
    <>
      <h3 className="text-center text-3xl bg-gray-900 text-gray-200 py-3 px-4 rounded-md mx-auto w-fit my-12">
        Saved Posts
      </h3>

      <div className="flex flex-wrap gap-10 m-10 sm:mt-4 p-3 sm:p-0">
        {loading && <Loader />}

        {!loading && savedPosts.length === 0 ? (
          <div className="w-50 mx-auto text-center text-lg text-gray-200">
            No posts found.
          </div>
        ) : (
          savedPosts.map((post) => (
            <div key={post.id} className="relative w-full sm:w-auto mb-4">
              <Post
                key={post.id}
                post={post}
                currentUserId={user.uid}
                setLoading={setLoading}
                updatePost={() => setRefresh((prev) => prev + 1)}
              />
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default SavedPosts;
