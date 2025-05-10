import React, {useEffect, useState} from 'react';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../firebaseConfig';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { collection, getDocs, writeBatch, doc, getDoc } from "firebase/firestore";
import SwitchSelector from 'react-native-switch-selector';
import { Ionicons } from '@expo/vector-icons';


const FriendsScreen = () => {
   const [page, setPage] = useState("friends-page");
   const [friends, setFriends] = useState([]);
   const [reqFriends, setReqFriends] = useState([])

   const currentUser = FIREBASE_AUTH.currentUser;


   useEffect(() => {
           fetchFriends();
           fetchRequests();
       }, [page]); // change to onSnapshot


   const fetchFriends = async() => {

       if (!currentUser) return;


       try {
           const AllFriendsRef = collection(FIRESTORE_DB, 'Requests', currentUser.uid, 'AllFriends');
           const snapshot = await getDocs(AllFriendsRef);
           if (!snapshot.empty) {
               const tempFriends = [];
               snapshot.forEach((doc) => {
                   tempFriends.push({ id: doc.id, ...doc.data() });
               });
               setFriends(tempFriends);
               return
           }
           else return;
       } catch (error) {
           console.error("Error fetching friends:", error);
       }
   }
  
   const fetchRequests = async() => {

       if (!currentUser) return;

       try {
           const friendsReqRef = collection(FIRESTORE_DB, 'Requests', currentUser.uid, 'FriendRequests');
           const snapshot = await getDocs(friendsReqRef);
           if (!snapshot.empty) {
               const tempFriendsReq = []
               snapshot.forEach((doc) => {
                   tempFriendsReq.push({ id: doc.id, ...doc.data() });
               });
               setReqFriends(tempFriendsReq);
               return
           }
           else return;
       } catch (error) {
           console.error("Error fetching friend requests:", error);
       }
   }


    const addFriend = async (friend) => { // add person to AllFriends, remove person from FriendRequests, add current user to AllFriends, remove currentUser from SentRequests
        if (!currentUser) return;

        const userProfileRef = doc(FIRESTORE_DB, 'Users', currentUser.uid);
        const allFriendProfileRef = doc(FIRESTORE_DB, "Requests", currentUser.uid, "AllFriends", friend.id);
        const friendReqProfileRef = doc(FIRESTORE_DB, "Requests", currentUser.uid, "FriendRequests", friend.id);
        const currUserAllFriendsRef = doc(FIRESTORE_DB, "Requests", friend.id, "AllFriends", currentUser.uid);
        const currUserSentReqRef = doc(FIRESTORE_DB, "Requests", friend.id, "SentRequests", currentUser.uid);
        try {
            const batch = writeBatch(FIRESTORE_DB);
            const userSnap = await getDoc(userProfileRef);
            const userData = userSnap.data()
            batch.set(allFriendProfileRef, {name: friend.name, username: friend.username, profilePic: friend.profilePic});
            batch.set(currUserAllFriendsRef, {name: userData.name, username: userData.username, profilePic: userData.profilePic});
            batch.delete(friendReqProfileRef);
            batch.delete(currUserSentReqRef);

            await batch.commit()
        } catch (error) {
            console.error("Error adding friend:", error);
        }
    }


    const deleteRequest = async (friend) => {
        if (!currentUser) return;
        const friendReqProfileRef = doc(FIRESTORE_DB, "Requests", currentUser.uid, "FriendRequests", friend.id);
        const currUserSentReqRef = doc(FIRESTORE_DB, "Requests", friend.id, "SentRequests", currentUser.uid);

        try {
           const batch = writeBatch(FIRESTORE_DB);
           batch.delete(friendReqProfileRef);
           batch.delete(currUserSentReqRef);
           await batch.commit();
        } catch(error) {
            console.error("Error deleting request:", error);
        }
    }


   const ProfileCard = ({ item }) => (
       <View style={styles.profileCard}>
           <Image source={{ uri: item.profilePic }} style={styles.profilePic} />
           <View style={styles.profileCardNames}>
               <Text style={styles.nameText}> {item.name} </Text>
               <Text style={styles.usernameText}> {item.username} </Text>
           </View>
            {page === "add-friends-page" && 
            (<View style={styles.requestConfirmationButtons}>
                <TouchableOpacity style={styles.deleteButton} onPress={() => {deleteRequest(item)}}>
                    <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmButton} onPress={() => {addFriend(item)}}>
                    <Text style={styles.confirmButtonText}>Confirm</Text>
                </TouchableOpacity>
            </View>
            )}

       </View>
   );




   return (
       <View style={styles.container}>
           <SwitchSelector
               options=
                   {[{label: "Friends", value: "friends-page"},
                   {label: "Add Friends", value: "add-friends-page"}]}
               initial={0}
               onPress={value => setPage(value)}
           />
           {page === "friends-page" &&
           (<View style={styles.profileCardContainer}>
               <FlatList
                   data={friends}
                   renderItem={ProfileCard}
                   keyExtractor={(item) => item.id} />
           </View>)}
           {page === "add-friends-page" &&
           (<View style={styles.profileCardContainer}>
               <Text>Add Friends Page</Text>
               <FlatList
                   data={reqFriends}
                   renderItem={ProfileCard}
                   keyExtractor={(item) => item.id} />
           </View>)}
       </View>
   );
};


const styles = StyleSheet.create ({
   container: {
       flex: 1,
   },
   profileCardContainer: {
       flex: 1,
   },
   profileCard: {
       flexDirection: 'row',
       justifyContent: 'flex-start',
       alignItems: 'center',
       marginTop: 5,
   },
   profileCardNames: {
       flexDirection: 'column',
       justifyContent: 'flex-start',
   },
   profilePic: {
       marginLeft: 10,
       marginRight: 10,
       height: 60,
       width: 60,
       borderRadius: '50%',
   },
   nameText: {
       fontSize: 18,
       fontWeight: "600",
   },
   usernameText: {
       fontSize: 14,
       color: "grey",
   },
   requestConfirmationButtons: {
        flexDirection: "row",
        marginLeft: "auto",
   },
   confirmButton: {
        marginRight: 15,
        marginLeft: 'auto',
        padding: 5,
        width: 80,
        backgroundColor: "blue",
        borderRadius: 20,
        borderWidth: 1,
    },
    deleteButton: {
        marginRight: 10,
        marginLeft: 'auto',
        padding: 5,
        width: 80,
        backgroundColor: "white",
        borderRadius: 20,
        borderWidth: 1,
    },
    confirmButtonText: {
        color: "white",
        alignSelf: "center",
        fontSize: 16,
    },
    deleteButtonText: {
        color: "grey",
        alignSelf: "center",
        fontSize: 16,
    }
});


export default FriendsScreen;



