import { Comment, PostModal } from "./modal";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  setDoc,
  where,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase-config";

export const getComments = async (postId: string): Promise<Comment[]> => {
  try {
    const commentsSnapshot = await getDocs(
      query(collection(db, "posts", postId, "comments"), orderBy("createdAt", "asc"))
    );

    const comments: Comment[] = commentsSnapshot.docs.map((doc) => {
      const data = doc.data() as Omit<Comment, "id" | "replies">;
      return { id: doc.id, replies: [], ...data };
    });

    const commentMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    comments.forEach((comment) => {
      if (comment.id) {
        commentMap.set(comment.id, comment);
      }
    });
    
    comments.forEach((comment) => {
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.replies ??= [];
          parent.replies.push(comment);
        }
      } else {
        rootComments.push(comment);
      }
    });

    return rootComments;
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
};

export const addCommentReply = async (
  postId: string,
  parentId: string | null,
  text: string,
  userId: string,
  username: string
): Promise<Comment> => {
  try {
    const commentData: Omit<Comment, "id"> = {
      text,
      userId,
      username,
      parentId,
      createdAt: serverTimestamp(),
    };

    const commentCollection = collection(db, "posts", postId, "comments");
    const commentDoc = await addDoc(commentCollection, commentData);

    return { id: commentDoc.id, ...commentData };
  } catch (error) {
    console.error("Failed to add comment:", error);
    throw error;
  }
};

export const savePost = async (postId: string, userId: string): Promise<boolean> => {
  try {
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, { savedBy: arrayUnion(userId) });

    const savedPostRef = doc(collection(db, "users", userId, "savedPosts"), postId);
    await setDoc(savedPostRef, { postId, savedAt: new Date() }, { merge: true });

    return true;
  } catch (error) {
    console.error("Error saving post:", error);
    return false;
  }
};

export const unsavePost = async (postId: string, userId: string): Promise<boolean> => {
  try {
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, { savedBy: arrayRemove(userId) });

    const savedPostRef = doc(collection(db, "users", userId, "savedPosts"), postId);
    await deleteDoc(savedPostRef);

    return true;
  } catch (error) {
    console.error("Error unsaving post:", error);
    return false;
  }
};

export const addPostToFirestore = async (imageFile: string): Promise<string> => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("User not logged in");

  try {
    const postRef = await addDoc(collection(db, "posts"), {
      imageURL: imageFile,
      username: auth.currentUser?.displayName,
      likes: [],
      userId,
      createdAt: serverTimestamp(),
    });
    return postRef.id;
  } catch (error) {
    console.error("Error adding post:", error);
    throw error;
  }
};

export const getSavedPost = async (userId: string) => {
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

export const getPosts = async (lastVisible: any): Promise<{ posts: PostModal[]; lastVisible: any }> => {
  const DEFAULT_LIMIT = 2;
  try {
    const baseQuery = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const paginatedQuery = lastVisible ? query(baseQuery, startAfter(lastVisible), limit(DEFAULT_LIMIT)) : query(baseQuery, limit(DEFAULT_LIMIT));
    const snapshot = await getDocs(paginatedQuery);
    return {
      posts: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      lastVisible: snapshot.docs[snapshot.docs.length - 1] || null,
    };
  } catch (error) {
    console.error("Error fetching posts:", error);
    return { posts: [], lastVisible: null };
  }
};

export const toggleLike = async (postId: string, userId: string): Promise<string[]> => {
  const postRef = doc(db, "posts", postId);
  try {
    const postSnapshot = await getDoc(postRef);
    const postData = postSnapshot.data();
    if (!postData) throw new Error("Post not found");
    const likes: string[] = postData.likes || [];
    await updateDoc(postRef, { likes: likes.includes(userId) ? arrayRemove(userId) : arrayUnion(userId) });
    return likes.includes(userId) ? likes.filter((id) => id !== userId) : [...likes, userId];
  } catch (error) {
    console.error("Error toggling like:", error);
    throw error;
  }
};

export const getMyPost = async (userId: string): Promise<PostModal[]> => {
  try {
    const postsRef = collection(db, "posts");
    const userPostsQuery = query(postsRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(userPostsQuery);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching user's posts:", error);
    return [];
  }
};

export const addPost = async (imageURL: string, username: string) => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error("User not logged in");
  }

  try {
    const postRef = await addDoc(collection(db, "posts"), {
      imageURL,
      username,
      likes: 0,
      userId,
      createdAt: serverTimestamp(),
    });
    return postRef.id;
  } catch (error) {
    console.error("Error adding post: ", error);
    throw error;
  }
};

export const deletePost = async (postId: string) => {
  try {
    const postRef = doc(db, "posts", postId);
    await deleteDoc(postRef);
    console.log("Post deleted successfully!");
  } catch (error) {
    console.error("Error deleting post:", error);
  }
};