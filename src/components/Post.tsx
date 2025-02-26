import React, { useState, useEffect } from "react";
import {
  toggleLike,
  addNestedComment,
  fetchComments,
  savePost,
  unsavePost,
} from "../common/firebaseFunctions";
import { useAuth } from "../hooks/useAuth";
import { Comment, PostModal } from "../common/modal";

const CommentComponent: React.FC<{
  comment: Comment;
  postId: string;
  onReply: (parentId: string, text: string) => void;
}> = ({ comment, postId, onReply }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const { user } = useAuth();

  const handleReply = () => {
    if (!user || !replyText.trim()) return;

    onReply(comment.id!, replyText);
    setReplyText("");
    setShowReplyInput(false);
  };

  return (
    <div className="ml-4 mt-2 pl-2">
      <div>
        <p className="font-medium">{comment.username}</p>
        <p>{comment.text}</p>
        <button
          onClick={() => setShowReplyInput(!showReplyInput)}
          className="text-sm text-blue-500 cursor-pointer"
        >
          Reply
        </button>
      </div>

      {showReplyInput && (
        <div className="mt-2 mx-4">
          <input
            type="text"
            placeholder="Write a reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="w-full p-2 border rounded-lg"
          />
          <button
            onClick={handleReply}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer"
          >
            Reply
          </button>
        </div>
      )}

      {comment.replies &&
        comment.replies.map((reply) => (
          <CommentComponent
            key={reply.id}
            comment={reply}
            postId={postId}
            onReply={onReply}
          />
        ))}
    </div>
  );
};

const Post = ({
  post,
  currentUserId,
  setLoading,
  updatePost= () => {}
}: {
  post: PostModal;
  currentUserId: string | null | undefined;
  setLoading: (loading: boolean) => void;
  updatePost: () => void;
}) => {
  const [likes, setLikes] = useState<string[]>(Array.isArray(post.likes) ? post.likes : []);
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(
    typeof currentUserId === 'string' ? likes.includes(currentUserId) : false
  );
  const [isSaved, setIsSaved] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    if (user && post.savedBy) {
      setIsSaved(post.savedBy.includes(user.uid));
    }
  }, [user, post.savedBy]);

  // Handle Like Functionality
  const handleLike = async () => {
    if (!currentUserId) return;
    setLoading(true);

    try {
      const updatedLikes = await toggleLike(post.id, currentUserId);
      setLikes(updatedLikes);
      setIsLiked(updatedLikes?.includes(currentUserId));
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle Comments View
  const toggleComments = async () => {
    if (!currentUserId) return;
    setShowComments((prev) => !prev);
    if (!showComments) {
      const fetchedComments = await fetchComments(post.id);
      setComments(fetchedComments);
    }
  };

  // Handle Save Post
  const handleSavePost = async () => {
    if (!currentUserId) return;
    setLoading(true);

    try {
      if (isSaved) {
        await unsavePost(post.id, user.uid);
        setIsSaved(false);
      } else {
        await savePost(post.id, user.uid);
        setIsSaved(true);
      }
      updatePost();
    } catch (error) {
      console.error("Error saving/unsaving post:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle adding a new comment (top-level or nested)
  const handleAddComment = async (
    parentId: string | null = null,
    commentText?: string
  ) => {
    const text = commentText || newComment;
    if (!user || !text.trim()) return;

    setLoading(true);
    try {
      const createdComment = await addNestedComment(
        post.id,
        parentId,
        text,
        user.uid,
        user.displayName || "Anonymous"
      );

      const updateNestedComments = (commentsList: Comment[]): Comment[] => {
        return commentsList.map((comment) => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), createdComment],
            };
          }

          if (comment.replies) {
            return {
              ...comment,
              replies: updateNestedComments(comment.replies),
            };
          }

          return comment;
        });
      };

      if (parentId) {
        const updatedComments = updateNestedComments(comments);
        setComments(updatedComments);
      } else {
        setComments([...comments, createdComment]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full sm:max-w-lg  bg-white rounded-lg shadow-lg mb-1 p-2 sm:p-4">
      <img
        src={post.imageURL}
        alt="Post"
        className="w-full sm:w-90 h-74 object-cover rounded-lg shadow-md"
      />
      <div className="flex justify-between mt-4">
        <h4 className="font-semibold">{post.username}</h4>
        <div className="flex space-x-4">
          {/* Like Button */}
          <div
            className={`${isLiked && "text-red-500"} ${
              currentUserId ? "cursor-pointer" : ""
            }`}
            onClick={handleLike}
          >
            {isLiked ? 
             <svg
             xmlns="http://www.w3.org/2000/svg"
             fill="currentColor"
             viewBox="0 0 24 24"
             className="size-6"
           >
             <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
           </svg>
            : 
            <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    className="size-6"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
    />
  </svg>
  }
            <span className="ml-[7px]">{likes.length}</span>
          </div>

          <div
            className={`${currentUserId ? "cursor-pointer" : "text-gray-500"}`}
            onClick={toggleComments}
          >
<svg fill="#000000" height="24px" width="24px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 512 512"  stroke="#000000" stroke-width="9.728"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M256,21.952c-141.163,0-256,95.424-256,212.715c0,60.267,30.805,117.269,84.885,157.717l-41.109,82.219 c-2.176,4.331-1.131,9.579,2.496,12.779c2.005,1.771,4.501,2.667,7.04,2.667c2.069,0,4.139-0.597,5.952-1.813l89.963-60.395 c33.877,12.971,69.781,19.541,106.752,19.541C397.141,447.381,512,351.957,512,234.667S397.163,21.952,256,21.952z M255.979,426.048c-36.16,0-71.168-6.741-104.043-20.032c-3.264-1.323-6.997-0.96-9.941,1.024l-61.056,40.981l27.093-54.187 c2.368-4.757,0.896-10.517-3.477-13.547c-52.907-36.629-83.243-89.707-83.243-145.6c0-105.536,105.28-191.381,234.667-191.381 s234.667,85.824,234.667,191.36S385.365,426.048,255.979,426.048z"></path> </g> </g> </g>
</svg>  
</div>

          <div
            className={`${currentUserId ? "cursor-pointer" : "text-gray-500"}`}
            onClick={handleSavePost}
          >
            {isSaved ? 
              <svg height="24px" width="24px" viewBox="-4 0 30 30" version="1.1" xmlns="http://www.w3.org/2000/svg"  fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>bookmark</title> <desc>Created with Sketch Beta.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" > <g id="Icon-Set-Filled" transform="translate(-419.000000, -153.000000)" fill="#000000"> <path d="M437,153 L423,153 C420.791,153 419,154.791 419,157 L419,179 C419,181.209 420.791,183 423,183 L430,176 L437,183 C439.209,183 441,181.209 441,179 L441,157 C441,154.791 439.209,153 437,153" id="bookmark"> </path> </g> </g> </g></svg>            
            : 
<svg viewBox="0 0 24 24" height="24px" width="24px" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M5 6.2C5 5.07989 5 4.51984 5.21799 4.09202C5.40973 3.71569 5.71569 3.40973 6.09202 3.21799C6.51984 3 7.07989 3 8.2 3H15.8C16.9201 3 17.4802 3 17.908 3.21799C18.2843 3.40973 18.5903 3.71569 18.782 4.09202C19 4.51984 19 5.07989 19 6.2V21L12 16L5 21V6.2Z" stroke="#000000" stroke-width="1.7280000000000002" stroke-linejoin="round"></path> </g></svg>         
}
</div>
        </div>
      </div>

      {showComments && (
        <div className="mt-4 h-64 overflow-y-auto">
          <div className="space-y-4 mx-2">
            {comments.map((comment) => (
              <CommentComponent
                key={comment.id}
                comment={comment}
                postId={post.id}
                onReply={(parentId, text) => {
                  //setNewComment(text);
                  handleAddComment(parentId, text);
                }}
              />
            ))}
          </div>

          <div className="mt-4 flex space-x-2 mx-2">
            <input
              type="text"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
            <button
              onClick={() => handleAddComment()}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer"
            >
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;
