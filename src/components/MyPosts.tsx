import { useEffect, useState } from "react";
import { fetchMyPosts, deletePost } from "../common/firebaseFunctions";
import { useAuth } from "../hooks/useAuth";
import Post from "./Post";
import Loader from "../common/Loader";
import { PostModal } from "../common/modal";

const MyPosts = () => {
  const [myPosts, setMyPosts] = useState<PostModal[]>([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getMyPosts = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const posts = await fetchMyPosts(user.uid);
        setMyPosts(posts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    getMyPosts();
  }, [user]);

  const handleDelete = async (postId: string) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      setLoading(true);
      try {
        await deletePost(postId);
        setMyPosts((prev) => prev.filter((post) => post.id !== postId));
      } catch (error) {
        console.error("Error deleting post:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return <> 
    <div className="flex flex-wrap m-10 gap-10 sm:mt-4 p-3 sm:p-0">
      {loading && <Loader />}

      {myPosts.length === 0 && !loading ? (
        <div className="w-50 mx-auto text-center text-lg">No posts found.</div>
      ) : (
        myPosts.map((post) => (
          <div key={post.id} className="relative w-full sm:w-auto mb-4">
            <Post
              post={post}
              currentUserId={user.uid}
              setLoading={setLoading}
              updatePost={() => {}}
            />
            {!loading && (
              <button
                onClick={() => handleDelete(post.id)}
                className="absolute top-2 right-2 bg-white text-white px-2 py-1 rounded-lg cursor-pointer"
              >
<svg width={24} height={24} viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg"  fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>cross-circle</title> <desc>Created with Sketch Beta.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Icon-Set-Filled"  transform="translate(-570.000000, -1089.000000)" fill="#000000"> <path d="M591.657,1109.24 C592.048,1109.63 592.048,1110.27 591.657,1110.66 C591.267,1111.05 590.633,1111.05 590.242,1110.66 L586.006,1106.42 L581.74,1110.69 C581.346,1111.08 580.708,1111.08 580.314,1110.69 C579.921,1110.29 579.921,1109.65 580.314,1109.26 L584.58,1104.99 L580.344,1100.76 C579.953,1100.37 579.953,1099.73 580.344,1099.34 C580.733,1098.95 581.367,1098.95 581.758,1099.34 L585.994,1103.58 L590.292,1099.28 C590.686,1098.89 591.323,1098.89 591.717,1099.28 C592.11,1099.68 592.11,1100.31 591.717,1100.71 L587.42,1105.01 L591.657,1109.24 L591.657,1109.24 Z M586,1089 C577.163,1089 570,1096.16 570,1105 C570,1113.84 577.163,1121 586,1121 C594.837,1121 602,1113.84 602,1105 C602,1096.16 594.837,1089 586,1089 L586,1089 Z" id="cross-circle" > </path> </g> </g> </g>
</svg>
</button>
            )}
          </div>
        ))
      )}
     
    </div>
  </>
};

export default MyPosts;
