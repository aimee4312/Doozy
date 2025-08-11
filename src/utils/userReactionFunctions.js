import { arrayUnion, writeBatch, increment, arrayRemove } from "firebase/firestore";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../../firebaseConfig"
import { doc, collection,  } from "firebase/firestore";


export const fetchLikes = async () => {
    // fetch all users with query of userID in likes array
}

export const fetchComments = async () => {

}

export const sendLike = async (postID, didLike) => {
    const currentUser = FIREBASE_AUTH.currentUser;
    const postRef = doc(FIRESTORE_DB, 'Posts', postID);
    const postLikeRef = doc(postRef, 'Likes', currentUser.uid);
    const userLikeRef = doc(FIRESTORE_DB, 'Users', currentUser.uid, 'LikedPosts', postID)
    const batch = writeBatch(FIRESTORE_DB);
    if (didLike) {
        batch.delete(postLikeRef);
        batch.delete(userLikeRef);
        batch.update(postRef, { likeCount: increment(-1)});
    }
    else {
        batch.set(postLikeRef, {})
        batch.set(userLikeRef, {});
        batch.update(postRef, { likeCount: increment(1)});
    }
    await batch.commit();
}

export const sendComment = async (postID) => {

}