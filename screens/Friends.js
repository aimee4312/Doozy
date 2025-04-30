import React, {useEffect, useState} from 'react';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../firebaseConfig';
import { View, Text, Image } from 'react-native';
import { collection, getDocs } from "firebase/firestore";
import SwitchSelector from 'react-native-switch-selector';

const FriendsScreen = () => {
    const [page, setPage] = useState("friends-page");
    const [friends, setFriends] = useState([]);

    useEffect(() => {
            fetchFriends();
        }, []);

    const fetchFriends = async() => {
        const currentUser = FIREBASE_AUTH.currentUser;

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
            else {
                return
            }
        } catch (error) {
            console.error("Error fetching friends:", error);
        }
    }


    return (
        <View>
            <SwitchSelector 
                options=
                    {[{label: "Friends", value: "friends-page"}, 
                    {label: "Add Friends", value: "add-friends-page"}]}
                initial={0}
                onPress={value => setPage(value)}
            />
            {page === "friends-page" && 
            (<View>
                <Text>Friend Page</Text>
                {friends.map((friend, index) => (
                <View key={index} onPress={() => this.handleImagePress(task)}>
                <View>
                    <Image source={{ uri: friend.profilePic }} style={{ width: 200, height: 200 }} />
                    <Text>{friend.username}</Text>
                </View>
                </View>
            ))}
            </View>)}
            {page === "add-friends-page" && 
            (<View>
                <Text>Add Friend Page</Text>
            </View>)}
        </View>
    );
};

export default FriendsScreen;