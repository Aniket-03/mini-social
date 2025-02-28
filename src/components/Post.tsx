import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  toggleLike,
  addCommentReply,
  getComments,
  savePost,
  unsavePost,
} from "../common/shared";
import { Comment, PostModal } from "../common/modal";


const Post = ({ post, currentUserId, setLoading, updatePost = () => {} }: { post: PostModal; currentUserId: string | null | undefined; setLoading: (loading: boolean) => void; updatePost: () => void; }) => {
  const { user } = useAuth();
  const [likes, setLikes] = useState<string[]>(Array.isArray(post.likes) ? post.likes : []);
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(currentUserId ? likes.includes(currentUserId) : false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (user && post.savedBy) {
      setIsSaved(post.savedBy.includes(user.uid));
    }
  }, [user, post.savedBy]);

  const handleLike = async () => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      const updatedLikes = await toggleLike(post.id, currentUserId);
      setLikes(updatedLikes);
      setIsLiked(updatedLikes.includes(currentUserId));
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleComments = async () => {
    if (!currentUserId) return;
    setShowComments((prev) => !prev);
    if (!showComments) {
      setComments(await getComments(post.id));
    }
  };

  const handleSavePost = async () => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      isSaved ? await unsavePost(post.id, user!.uid) : await savePost(post.id, user!.uid);
      setIsSaved(!isSaved);
      updatePost();
    } catch (error) {
      console.error("Error saving/unsaving post:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (parentId: string | null = null, commentText = newComment) => {
    if (!user || !commentText.trim()) return;
    setLoading(true);
    try {
      const createdComment = await addCommentReply(post.id, parentId, commentText, user.uid, user.displayName || "Anonymous");
      parentId ? setComments(updateNestedComments(comments, parentId, createdComment)) : setComments([...comments, createdComment]);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateNestedComments = (commentsList: Comment[], parentId: string, newComment: Comment): Comment[] =>
    commentsList.map((comment) =>
      comment.id === parentId ? { ...comment, replies: [...(comment.replies || []), newComment] } : { ...comment, replies: updateNestedComments(comment.replies || [], parentId, newComment) }
    );

  return (
    <div className="w-full sm:max-w-lg bg-white rounded-sm shadow-lg mb-1 p-2 sm:p-4">
      <h4 className="font-semibold mb-2 ml-1">{post.username}</h4>
      <img src={post.imageURL} alt="Post" className="w-full sm:w-90 h-74 object-cover rounded-sm shadow-md" />
      <div className="flex justify-between mt-4">
        <div className="flex space-x-4">
          <button onClick={handleLike} className="flex items-center cursor-pointer">
            {isLiked ? 
             <svg  width={24} height={24} viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M320 1344q0-26-19-45t-45-19q-27 0-45.5 19t-18.5 45q0 27 18.5 45.5t45.5 18.5q26 0 45-18.5t19-45.5zm160-512v640q0 26-19 45t-45 19h-288q-26 0-45-19t-19-45v-640q0-26 19-45t45-19h288q26 0 45 19t19 45zm1184 0q0 86-55 149 15 44 15 76 3 76-43 137 17 56 0 117-15 57-54 94 9 112-49 181-64 76-197 78h-129q-66 0-144-15.5t-121.5-29-120.5-39.5q-123-43-158-44-26-1-45-19.5t-19-44.5v-641q0-25 18-43.5t43-20.5q24-2 76-59t101-121q68-87 101-120 18-18 31-48t17.5-48.5 13.5-60.5q7-39 12.5-61t19.5-52 34-50q19-19 45-19 46 0 82.5 10.5t60 26 40 40.5 24 45 12 50 5 45 .5 39q0 38-9.5 76t-19 60-27.5 56q-3 6-10 18t-11 22-8 24h277q78 0 135 57t57 135z"/></svg> : 
             <svg viewBox="0 0 24 24" width={24} height={24} fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M3 10C3 9.44772 3.44772 9 4 9H7V21H4C3.44772 21 3 20.5523 3 20V10Z" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M7 11V19L8.9923 20.3282C9.64937 20.7662 10.4214 21 11.2111 21H16.4586C17.9251 21 19.1767 19.9398 19.4178 18.4932L20.6119 11.3288C20.815 10.1097 19.875 9 18.6391 9H14" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M14 9L14.6872 5.56415C14.8659 4.67057 14.3512 3.78375 13.4867 3.49558V3.49558C12.6336 3.21122 11.7013 3.59741 11.2992 4.4017L8 11H7" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
          } <span className="ml-1">{likes.length}</span>
          </button>
          <button onClick={toggleComments} className="cursor-pointer">💬</button>
          <button onClick={handleSavePost} className="cursor-pointer">{isSaved ? "🔖" : "📌"}</button>
        </div>
      </div>
      {showComments && (
        <div className="mt-4 h-64 overflow-y-auto">
          <div className="space-y-4 mx-2">
            {comments.map((comment) => (
              <CommentComponent key={comment.id} comment={comment} postId={post.id} onReply={handleAddComment} />
            ))}
          </div>
          <div className="mt-4 flex space-x-2 mx-2">
            <input type="text" placeholder="Write a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} className="w-full p-2 border rounded-lg" />
            <button onClick={() => handleAddComment()} className="px-4 py-2 text-white font-semibold rounded-sm bg-gray-900">
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const CommentComponent: React.FC<{ comment: Comment; postId: string; onReply: (parentId: string, text: string) => void; }> = ({ comment, postId, onReply }) => {
  const { user } = useAuth();
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");

  const submitReply = () => {
    if (user && replyText.trim()) {
      onReply(comment.id!, replyText);
      setReplyText("");
      setShowReplyInput(false);
    }
  };

  return (
    <div className="ml-4 mt-2 pl-2">
      <div>
        <p className="font-medium">{comment.username}</p>
        <p>{comment.text}</p>
        <button onClick={() => setShowReplyInput(!showReplyInput)} className="text-sm text-gray-500 cursor-pointer">
          Reply
        </button>
      </div>
      {showReplyInput && (
        <div className="mt-2 mx-4">
          <input type="text" placeholder="Write a reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} className="w-full p-2 border rounded-lg" />
          <button onClick={submitReply} className="mt-2 bg-gray-900 text-white px-4 py-2 rounded-lg cursor-pointer">
            Reply
          </button>
        </div>
      )}
      {comment.replies?.map((reply) => (
        <CommentComponent key={reply.id} comment={reply} postId={postId} onReply={onReply} />
      ))}
    </div>
  );
};

export default Post;
