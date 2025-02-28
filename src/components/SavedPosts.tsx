import { useEffect, useState } from "react";
import { getSavedPost } from "../common/shared";
import { useAuth } from "../hooks/useAuth";
import Post from "./Post";
import Loader from "../common/Loader";
import { PostModal } from "../common/modal";

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
