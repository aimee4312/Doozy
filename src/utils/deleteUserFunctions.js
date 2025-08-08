import { FIREBASE_AUTH, FIRESTORE_DB } from '../../firebaseConfig';
import { writeBatch, doc, getDocs, getDoc, increment, where, collection, query } from "firebase/firestore";
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { getStorage, ref, deleteObject } from 'firebase/storage';
import * as Notifications from "expo-notifications";

export const deleteUserProfile = async (email, password) => {
    const currentUser = FIREBASE_AUTH.currentUser;
    try {
        const credential = EmailAuthProvider.credential(email, password);

        await reauthenticateWithCredential(currentUser, credential);

        await deleteAllPosts(currentUser);
        await deleteAllFriends(currentUser);
        await deleteAllFriendRequests(currentUser);
        await deleteAllSentRequests(currentUser);
        await deleteAllLists(currentUser);
        await deleteAllTasks(currentUser);
        await deleteUserDoc(currentUser);
        await currentUser.delete();
    } catch (error) {
        if (error.code === 'auth/requires-recent-login') {
            console.error("Re-authentication required but failed.");
        } else {
            throw error;
        }
    }
}

const deleteAllPosts = async (currentUser) => {

    const postsRef = collection(FIRESTORE_DB, 'Posts');

    const q = query(postsRef, where("userId", "==", currentUser.uid));
    const querySnapshot = await getDocs(q);

    const batch = writeBatch(FIRESTORE_DB);

    for (const data of querySnapshot.docs) {
        if (data.data().image) {
            const imageRef = ref(getStorage(), data.data().image);
            await deleteObject(imageRef);
        }
        batch.delete(data.ref);
    }

    await batch.commit();
}

const deleteAllFriends = async (currentUser) => {
    const friendsRef = collection(FIRESTORE_DB, 'Requests', currentUser.uid, 'AllFriends');
    const snapshot = await getDocs(friendsRef);

    const batch = writeBatch(FIRESTORE_DB);

    snapshot.forEach((data) => {
        const friendRef = doc(FIRESTORE_DB, 'Requests', data.id, 'AllFriends', currentUser.uid);
        const friendUserRef = doc(FIRESTORE_DB, 'Users', data.id);
        batch.update(friendUserRef, { friends: increment(-1) });
        batch.delete(data.ref);
        batch.delete(friendRef);
    })

    await batch.commit();
}

const deleteAllFriendRequests = async (currentUser) => {
    const friendRequestsRef = collection(FIRESTORE_DB, 'Requests', currentUser.uid, 'FriendRequests');
    const snapshot = await getDocs(friendRequestsRef);

    const batch = writeBatch(FIRESTORE_DB);

    snapshot.forEach((data) => {
        const friendRequestRef = doc(FIRESTORE_DB, 'Requests', data.id, 'SentRequests', currentUser.uid);
        batch.delete(data.ref);
        batch.delete(friendRequestRef);
    })

    await batch.commit();
}

const deleteAllSentRequests = async (currentUser) => {
    const sentRequestsRef = collection(FIRESTORE_DB, 'Requests', currentUser.uid, 'SentRequests');
    const snapshot = await getDocs(sentRequestsRef);

    const batch = writeBatch(FIRESTORE_DB);

    snapshot.forEach((data) => {
        const sentRequestRef = doc(FIRESTORE_DB, 'Requests', data.id, 'FriendRequests', currentUser.uid);
        batch.delete(data.ref);
        batch.delete(sentRequestRef);
    })

    await batch.commit();
}

const deleteAllLists = async (currentUser) => {
    const listsRef = collection(FIRESTORE_DB, 'Users', currentUser.uid, 'Lists');
    const snapshot = await getDocs(listsRef);

    const batch = writeBatch(FIRESTORE_DB);

    snapshot.forEach((data) => {
        batch.delete(data.ref);
    })

    await batch.commit();
}

const deleteAllTasks = async (currentUser) => {
    const tasksRef = collection(FIRESTORE_DB, 'Users', currentUser.uid, 'Tasks');
    const snapshot = await getDocs(tasksRef);

    const batch = writeBatch(FIRESTORE_DB);

    for (const docSnap of snapshot.docs) {
        await cancelNotifications(docSnap.data().notificationIds);
        batch.delete(docSnap.ref);
    }

    await batch.commit();
}

const deleteUserDoc = async (currentUser) => {
    const userRef = doc(FIRESTORE_DB, 'Users', currentUser.uid);

    const batch = writeBatch(FIRESTORE_DB);

    const snapshot = await getDoc(userRef);
    if (snapshot.data().profilePic !== "https://firebasestorage.googleapis.com/v0/b/doozy-3d54c.appspot.com/o/profilePics%2Fdefault.jpg?alt=media&token=c4b20aae-830c-4d47-aa90-2a3ebd6e16fb") {
        const imageRef = ref(getStorage(), snapshot.data().profilePic);
        await deleteObject(imageRef);
    }

    batch.delete(userRef);

    await batch.commit()
}

const cancelNotifications = async (notificationIds) => {
    for (const notification of notificationIds) {
        await Notifications.cancelScheduledNotificationAsync(notification);
    }
};