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
       }, [page]); // maybe put page in there


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
            console.log(userSnap.data());
            batch.set(allFriendProfileRef, {name: friend.name, username: friend.username, profilePic: friend.profilePic});
            batch.set(currUserAllFriendsRef, {name: userData.name, username: userData.username, profilePic: userData.profilePic});
            batch.delete(friendReqProfileRef);
            batch.delete(currUserSentReqRef);

            await batch.commit()
        } catch (error) {
            console.error("Error adding friend:", error);
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
            (<TouchableOpacity style={styles.addFriendIcon} onPress={() => {addFriend(item)}}>
                <Ionicons name="person-add" size={28} color="black"/>
            </TouchableOpacity>)}
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
   addFriendIcon: {
        paddingRight: 15,
        marginLeft: 'auto',
    },
});


export default FriendsScreen;



