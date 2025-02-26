import { PostModal } from "./postModal";
import { collection, addDoc, getDocs, query, orderBy, limit, startAfter, doc, updateDoc, arrayUnion, arrayRemove, serverTimestamp, setDoc, where, deleteDoc, getDoc,} from "firebase/firestore";
import { db, auth } from "../firebase-config";

interface Comment {
  id?: string;
  text: string;
  userId: string;
  username?: string;
  parentId?: string | null;
  createdAt: any;
  replies?: Comment[];
}

export const fetchComments = async (postId: string) => {
  try {
    // Fetch all comments for the post
    const commentsQuery = query(
      collection(db, "posts", postId, "comments"),
      orderBy("createdAt", "asc")
    );

    const commentsSnapshot = await getDocs(commentsQuery);

    // Transform comments into a nested structure
    const comments: Comment[] = commentsSnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Comment)
    );

    // Create a map to quickly look up comments by their ID
    const commentMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    // First pass: Add all comments to the map
    comments.forEach((comment) => {
      commentMap.set(comment.id!, { ...comment, replies: [] });

      if (!comment.parentId) {
        rootComments.push(commentMap.get(comment.id!)!);
      }
    });

    // Second pass: Recursively build nested structure
    const addReplies = (comment: Comment) => {
      comments.forEach((potentialReply) => {
        if (potentialReply.parentId === comment.id) {
          comment.replies = comment.replies || [];
          comment.replies.push(potentialReply);
          addReplies(potentialReply);
        }
      });
    };

    // Build full nested structure
    rootComments.forEach(addReplies);

    return rootComments;
  } catch (error) {
    console.error("Error fetching comments: ", error);
    return [];
  }
};

export const addNestedComment = async (
  postId: string,
  parentId: string | null,
  text: string,
  userId: string,
  username: string
): Promise<Comment> => {
  try {
    const comment: Omit<Comment, "id"> = {
      text,
      userId,
      username,
      parentId,
      createdAt: serverTimestamp(),
    };

    const commentRef = await addDoc(
      collection(db, "posts", postId, "comments"),
      comment
    );

    return {
      id: commentRef.id,
      ...comment,
    };
  } catch (error) {
    console.error("Error adding comment: ", error);
    throw error;
  }
};

export const savePost = async (postId: string, userId: string) => {
  try {
    const postRef = doc(db, "posts", postId);

    await updateDoc(postRef, {
      savedBy: arrayUnion(userId),
    });

    const savedPostRef = doc(
      collection(db, "users", userId, "savedPosts"),
      postId
    );
    await setDoc(
      savedPostRef,
      {
        postId,
        savedAt: new Date(),
      },
      { merge: true }
    );

    return true;
  } catch (error) {
    console.error("Error saving post:", error);
    return false;
  }
};

export const unsavePost = async (postId: string, userId: string) => {
  try {
    const postRef = doc(db, "posts", postId);

    await updateDoc(postRef, {
      savedBy: arrayRemove(userId),
    });

    const savedPostRef = doc(
      collection(db, "users", userId, "savedPosts"),
      postId
    );
    await deleteDoc(savedPostRef);

    return true;
  } catch (error) {
    console.error("Error unsaving post:", error);
    return false;
  }
};

export const addPostToFirestore = async (imageFile: File) => {
  const userId = auth.currentUser?.uid;

  try {
    const postRef = await addDoc(collection(db, "posts"), {
      imageURL: imageFile,
      username: auth.currentUser?.displayName,
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


export const fetchSavedPosts = async (userId: string) => {
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

export const fetchPosts = async (lastVisible: any) => {
  const DEFAULT_LIMIT = 2;

  try {
    const baseQuery = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc")
    );

    if (!lastVisible) {
      const initialQuery = query(baseQuery, limit(DEFAULT_LIMIT));
      const initialSnapshot = await getDocs(initialQuery);

      const posts = initialSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return {
        posts,
        lastVisible:
          initialSnapshot.docs[initialSnapshot.docs.length - 1] || null,
      };
    }

    const paginatedQuery = query(
      baseQuery,
      startAfter(lastVisible),
      limit(DEFAULT_LIMIT)
    );

    const snapshot = await getDocs(paginatedQuery);

    const posts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      posts,
      lastVisible: snapshot.docs[snapshot.docs.length - 1] || null,
    };
  } catch (error) {
    console.error("Error fetching posts:", error);
    return { posts: [], lastVisible: null };
  }
};

export const toggleLike = async (postId: string, userId: string) => {
  const postRef = doc(db, "posts", postId);

  try {
    const postSnapshot = await getDoc(postRef);
    const postData = postSnapshot.data();

    if (!postData) {
      throw new Error("Post not found");
    }

    const likes = postData.likes || [];

    if (likes.includes(userId)) {
      // User already liked the post, so remove the like
      await updateDoc(postRef, {
        likes: arrayRemove(userId),
      });
    } else {
      // User hasn't liked the post, so add the like
      await updateDoc(postRef, {
        likes: arrayUnion(userId),
      });
    }

    return likes.includes(userId)
      ? likes.filter((id: string) => id !== userId)
      : [...likes, userId];
  } catch (error) {
    console.error("Error toggling like:", error);
    throw error;
  }
};

export const fetchMyPosts = async (userId: string) => {
  try {
    const postsRef = collection(db, "posts");
    const userPostsQuery = query(postsRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(userPostsQuery);
    const myPosts:PostModal[] = [];
    querySnapshot.forEach((doc) => {
      myPosts.push({ id: doc.id, ...doc.data() });
    });
    return myPosts;
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
