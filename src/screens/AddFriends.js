import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity, TextInput, SafeAreaView } from 'react-native';
import { addFriend, deleteRequest, deletePendingRequest, deleteFriend, requestUser, fetchFriends, fetchRequests, fetchRequesting, fetchProfiles } from '../utils/friendFunctions'
import { Ionicons } from '@expo/vector-icons';

const AddFriendsScreen = ({ navigation }) => {

    const [friends, setFriends] = useState([]);
    const [reqFriends, setReqFriends] = useState([]); // received requests
    const [requesting, setRequesting] = useState([]);
    const [profiles, setProfiles] = useState([]);
    const [searchProfilesText, setSearchProfilesText] = useState("");
    const unsubscribeRef = useRef([]);

    const filteredProfiles = profiles.filter((profile) => {
        return profile.name.toLowerCase().startsWith(searchProfilesText.toLowerCase()) 
         || profile.username.toLowerCase().startsWith(searchProfilesText.toLowerCase())
    });

    useEffect(() => {
    
        const unsubscribeFriends = fetchFriends(setFriends);
        const unsubscribeRequests = fetchRequests(setReqFriends);
        const unsubscribeRequesting = fetchRequesting(setRequesting);

        unsubscribeRef.current = [unsubscribeFriends, unsubscribeRequests, unsubscribeRequesting];

        return () => {
            unsubscribeRef.current.forEach(unsub => unsub());
            };
    
    }, []);

    useEffect(() => {
    
        const unsubscribeProfiles = fetchProfiles(friends, setProfiles);

        return () => unsubscribeProfiles();

    }, [friends, reqFriends, requesting]);

    const renderProfileCard = ({item}) => {
            let status;
            const reqFriendsIds = reqFriends.map(data => data.id);
            if (reqFriendsIds.includes(item.id)) {
                status = "userReceivedRequest"; //requested
            }
            else if (requesting.some(obj => obj.id === item.id)){
                status = "userSentRequest"; //requesting
            }
            else {
                status = "stranger";
            }
            return <ProfileCard item={item} status={status}/>
        };
    
    
       const ProfileCard = ({ item, status }) => (
            <TouchableOpacity onPress={() => {navigation.navigate('Profile', {userID: item.id, status: status})}} style={styles.profileCard}>
                <Image source={{ uri: item.profilePic }} style={styles.profilePic} />
                <View style={styles.profileCardNames}>
                    <Text style={styles.nameText}> {item.name} </Text>
                    <Text style={styles.usernameText}> {item.username} </Text>
                </View>
                    {status === "userReceivedRequest" &&
                    (<View style={styles.requestConfirmationButtons}>
                        <TouchableOpacity style={styles.deleteButton} onPress={() => {deleteRequest(item)}}>
                            <Text style={styles.deleteButtonText}>Delete</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.confirmButton} onPress={() => {addFriend(item)}}>
                            <Text style={styles.confirmButtonText}>Confirm</Text>
                        </TouchableOpacity>
                    </View>
                    )}
                    {status === "userSentRequest" &&
                    (<View style={styles.requestConfirmationButtons}>
                        <TouchableOpacity style={styles.confirmButton} onPress={() => {deletePendingRequest(item)}}>
                            <Text style={styles.confirmButtonText}>Requested</Text>
                        </TouchableOpacity>
                    </View>
                    )}
                    {status === "stranger" &&
                    (<View style={styles.requestConfirmationButtons}>
                        <TouchableOpacity style={styles.confirmButton} onPress={() =>{requestUser(item)}}>
                            <Text style={styles.confirmButtonText}>Add Friend</Text>
                        </TouchableOpacity>
                    </View>
                    )}
            </TouchableOpacity>
       );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topContainer}>
                <TouchableOpacity onPress={navigation.goBack}>
                    <Ionicons name='chevron-back' size={24} color='black' />
                </TouchableOpacity>
            </View>
            <View style={styles.searchBrowseContainer}>
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
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create ({
   container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start'
   },
   topContainer: {
        marginHorizontal: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
   searchBrowseContainer: {
        flex: 1,
   },
   searchBoxContainer: {
        backgroundColor: "white",
        borderRadius: 10,
        margin: 5,
        height: 40,
        flexDirection: "row",
        alignItems: "center",

   },
   searchBox: {
        paddingLeft: 10,
        paddingRight: 10,
        fontSize: 18,
        textAlign: 'left',
        textAlignVertical: 'center',
        includeFontPadding: false,  
        width: '100%'
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
       borderRadius: 50,
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

export default AddFriendsScreen;