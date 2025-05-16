import React, {useEffect, useState, useRef} from 'react';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../firebaseConfig';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { collection, getDocs, writeBatch, doc, getDoc, onSnapshot, increment } from "firebase/firestore";
import SwitchSelector from 'react-native-switch-selector';
import { Ionicons } from '@expo/vector-icons';


const FriendsScreen = () => {
    const [page, setPage] = useState("friends-page");
    const [friends, setFriends] = useState([]);
    const [reqFriends, setReqFriends] = useState([]);
    const [requesting, setRequesting] = useState([]);
    const [profiles, setProfiles] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [searchProfilesText, setSearchProfilesText] = useState("");
    const unsubscribeRef = useRef([]);

    const currentUser = FIREBASE_AUTH.currentUser;


    useEffect(() => {

        const unsubscribeFriends = fetchFriends();
        const unsubscribeRequests = fetchRequests();
        const unsubscribeRequesting = fetchRequesting();

        unsubscribeRef.current = [unsubscribeFriends, unsubscribeRequests, unsubscribeRequesting];

        return () => {
            console.log(unsubscribeRef);
            unsubscribeRef.current.forEach(unsub => unsub());
          };
    
    }, []);

    useEffect(() => {

        const unsubscribeProfiles = fetchProfiles();

        return () => unsubscribeProfiles();

    }, [friends, reqFriends, requesting]);



    function fetchFriends() {

        try {
            const AllFriendsRef = collection(FIRESTORE_DB, 'Requests', currentUser.uid, 'AllFriends');
            console.log("reading friends")
            const unsubscribeFriends = onSnapshot(AllFriendsRef, 
                (snapshot) => {
                    const tempFriends = [];
                    snapshot.forEach((doc) => {
                        tempFriends.push({ id: doc.id, ...doc.data() });
                    });
                    setFriends(tempFriends);
                });
            return unsubscribeFriends;
        } catch (error) {
            console.error("Error fetching friends:", error);
        }
    }
  
    function fetchRequests () {

        try {
            const friendsReqRef = collection(FIRESTORE_DB, 'Requests', currentUser.uid, 'FriendRequests');
            console.log("reading requests")
            const unsubscribeRequests = onSnapshot(friendsReqRef, 
                (snapshot) => {
                    const tempFriendsReq = []
                    snapshot.forEach((doc) => {
                        tempFriendsReq.push({ id: doc.id, ...doc.data() });
                    });
                    setReqFriends(tempFriendsReq);
                }
            );
            return unsubscribeRequests;
        } catch (error) {
            console.error("Error fetching friend requests:", error);
        }
    }
    function fetchRequesting() {

        try {
            const requestingRef = collection(FIRESTORE_DB, "Requests", currentUser.uid, "SentRequests");
            console.log("reading requesting")
            const unsubscribeRequesting = onSnapshot(requestingRef, 
                (snapshot) => {
                    const tempRequesting = []
                    snapshot.forEach((doc) => {
                        tempRequesting.push({ id: doc.id });
                    });
                    setRequesting(tempRequesting);
                }
            );
            return unsubscribeRequesting;
        } catch (error) {
            console.error("Error fetching requesting:", error);
        }
    }

    function fetchProfiles() {

        try {
            const friendUIDs = friends.map(doc => doc.id);
            const profilesRef = collection(FIRESTORE_DB, 'Users');
            console.log("reading profiles");
            const unsubscribeProfiles = onSnapshot(profilesRef, 
                (snapshot) => {
                    const tempProfiles = snapshot.docs
                    .filter(doc => doc.id !== currentUser.uid && !friendUIDs.includes(doc.id))
                    .map(doc => ({ id: doc.id, ...doc.data()}));
                    setProfiles(tempProfiles);
                }
            );
            return unsubscribeProfiles;
        } catch (error) {
            console.error("Error fetching profiles:", error);
        }
    }

    const filteredFriends = friends.filter((friend) => {
        return friend.name.toLowerCase().startsWith(searchText.toLowerCase()) || friend.username.toLowerCase().startsWith(searchText.toLowerCase())
    });
    const filteredProfiles = profiles.filter((profile) => {
        return profile.name.toLowerCase().startsWith(searchProfilesText.toLowerCase()) 
        // || profile.username.toLowerCase().startsWith(searchProfilesText.toLowerCase())
    }); // error occuring because there isnt a username property on some of the users


    const addFriend = async (friend) => { // add person to AllFriends, remove person from FriendRequests, add current user to AllFriends, remove currentUser from SentRequests
        if (!currentUser) return;

        const currUserProfileRef = doc(FIRESTORE_DB, 'Users', currentUser.uid);
        const otherUserProfileRef = doc(FIRESTORE_DB, 'Users', friend.id);
        const allFriendProfileRef = doc(FIRESTORE_DB, "Requests", currentUser.uid, "AllFriends", friend.id);
        const friendReqProfileRef = doc(FIRESTORE_DB, "Requests", currentUser.uid, "FriendRequests", friend.id);
        const currUserAllFriendsRef = doc(FIRESTORE_DB, "Requests", friend.id, "AllFriends", currentUser.uid);
        const currUserSentReqRef = doc(FIRESTORE_DB, "Requests", friend.id, "SentRequests", currentUser.uid);
        try {
            const batch = writeBatch(FIRESTORE_DB);
            const userSnap = await getDoc(currUserProfileRef);
            const userData = userSnap.data()
            batch.set(allFriendProfileRef, {name: friend.name, username: friend.username, profilePic: friend.profilePic});
            batch.set(currUserAllFriendsRef, {name: userData.name, username: userData.username, profilePic: userData.profilePic});
            batch.delete(friendReqProfileRef);
            batch.delete(currUserSentReqRef);
            batch.update(currUserProfileRef, {friends: increment(1)});
            batch.update(otherUserProfileRef, {friends: increment(1)});


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

    const deletePendingRequest = async (user) => {
        if (!currentUser) return;
        const friendReqProfileRef = doc(FIRESTORE_DB, "Requests", currentUser.uid, "SentRequests", user.id);
        const currUserSentReqRef = doc(FIRESTORE_DB, "Requests", user.id, "FriendRequests", currentUser.uid);

        try {
           const batch = writeBatch(FIRESTORE_DB);
           batch.delete(friendReqProfileRef);
           batch.delete(currUserSentReqRef);
           await batch.commit();
        } catch(error) {
            console.error("Error deleting pending request:", error);
        }
    }

    const deleteFriend = async (friend) => { // add this later
        if (!currentUser) return;
        const currUserFriendRef = doc(FIRESTORE_DB, "Requests", currentUser.uid, "AllFriends", friend.id);
        const recUserFriendRef = doc(FIRESTORE_DB, "Requests", friend.id, "AllFriends", currentUser.uid);

        try {
           const batch = writeBatch(FIRESTORE_DB);
           batch.delete(currUserFriendRef);
           batch.delete(recUserFriendRef);
           // add decrement friend 
           await batch.commit();
        } catch(error) {
            console.error("Error deleting friend:", error);
        }
    }


    const requestUser = async (user) => { // update currentusers requesting, update other user's requested
        const currUserProfileRef = doc(FIRESTORE_DB, 'Users', currentUser.uid);
        const requestingRef = doc(FIRESTORE_DB, "Requests", currentUser.uid, "SentRequests", user.id);
        const requestedRef = doc(FIRESTORE_DB, "Requests", user.id, "FriendRequests", currentUser.uid);

        try {
            const batch = writeBatch(FIRESTORE_DB);
            const userSnapshot = await getDoc(currUserProfileRef);
            const userData = userSnapshot.data();
            batch.set(requestedRef, {name: userData.name, username: userData.username, profilePic: userData.profilePic});
            batch.set(requestingRef, {name: user.name, username: user.username, profilePic: user.profilePic});
            await batch.commit();
            console.log("user request successful")
        } catch(error) {
            console.error("Error requesting user:", error);
        }
    } 


    const renderProfileCard = ({item}) => {
        let status;
        const reqFriendsIds = reqFriends.map(data => data.id);
        if (reqFriendsIds.includes(item.id)) {
            status = "requested";
        }
        else if (requesting.some(obj => obj.id === item.id)){
            status = "requesting";
        }
        else {
            status = "stranger";
        }
        return <ProfileCard item={item} status={status}/>
    };


   const ProfileCard = ({ item, status }) => (
        <View style={styles.profileCard}>
            <Image source={{ uri: item.profilePic }} style={styles.profilePic} />
            <View style={styles.profileCardNames}>
                <Text style={styles.nameText}> {item.name} </Text>
                <Text style={styles.usernameText}> {item.username} </Text>
            </View>
                {page === "add-friends-page" && status === "requested" &&
                (<View style={styles.requestConfirmationButtons}>
                    <TouchableOpacity style={styles.deleteButton} onPress={() => {deleteRequest(item)}}>
                        <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.confirmButton} onPress={() => {addFriend(item)}}>
                        <Text style={styles.confirmButtonText}>Confirm</Text>
                    </TouchableOpacity>
                </View>
                )}
                {page ==="add-friends-page" && status === "requesting" &&
                (<View style={styles.requestConfirmationButtons}>
                    <TouchableOpacity style={styles.confirmButton} onPress={() => {deletePendingRequest(item)}}>
                        <Text style={styles.confirmButtonText}>Requested</Text>
                    </TouchableOpacity>
                </View>
                )}
                {page ==="add-friends-page" && status === "stranger" &&
                (<View style={styles.requestConfirmationButtons}>
                    <TouchableOpacity style={styles.confirmButton} onPress={() =>{requestUser(item)}}>
                        <Text style={styles.confirmButtonText}>Add Friend</Text>
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
               onPress={value => {setSearchProfilesText(""); setSearchText(""); setPage(value);}}
           />
           {page === "friends-page" &&
           (<View style={styles.searchBrowseContainer}>
                <View style={styles.searchBoxContainer}>
                    <TextInput 
                        placeholder='Search Friends...' 
                        style={styles.searchBox}
                        onChangeText={setSearchText}
                    />
                </View>
                <View style={styles.profileCardContainer}>
                    <FlatList
                        data={filteredFriends}
                        renderItem={ProfileCard}
                        keyExtractor={(item) => item.id} />
                </View>
           </View>)}
           {page === "add-friends-page" &&
           (<View style={styles.searchBrowseContainer}>
                <View style={styles.searchBoxContainer}>
                    <TextInput 
                        placeholder='Search Profiles...' 
                        style={styles.searchBox}
                        onChangeText={setSearchProfilesText}
                    />
                </View>
                {searchProfilesText === "" && (
                <View style={styles.profileCardContainer}>
                    <FlatList
                        data={reqFriends}
                        renderItem={renderProfileCard}
                        keyExtractor={(item) => item.id} />
                </View>)}
                {searchProfilesText !== "" && 
                (
                    <View style={styles.profileCardContainer}>
                        <FlatList
                            data={filteredProfiles}
                            renderItem={renderProfileCard}
                            keyExtractor={(item) => item.id} />
                    </View>)}
            </View>)}
       </View>
   );
};


const styles = StyleSheet.create ({
   container: {
        flex: 1,
   },
   searchBrowseContainer: {
        flex: 1,
   },
   searchBoxContainer: {
        backgroundColor: "white",
        borderRadius: 10,
        margin: 5,
        height: 30,
        flexDirection: "row",
        alignItems: "center",

   },
   searchBox: {
        paddingLeft: 10,
        paddingRight: 10,
        fontSize: 20,
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
        marginRight: 10,
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



