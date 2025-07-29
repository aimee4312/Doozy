import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity, TextInput, SafeAreaView } from 'react-native';
import { fetchFriends } from '../utils/friendFunctions'
import { Ionicons } from '@expo/vector-icons';


const FriendsScreen = ({ navigation }) => {
    const [friends, setFriends] = useState([]);
    const [searchText, setSearchText] = useState("");

    useEffect(() => {

        const unsubscribeFriends = fetchFriends(setFriends);

        return () => unsubscribeFriends()

    }, []);


    const filteredFriends = friends.filter((friend) => {
        return friend.name.toLowerCase().startsWith(searchText.toLowerCase()) || friend.username.toLowerCase().startsWith(searchText.toLowerCase())
    });


    const ProfileCard = ({ item }) => (
        <TouchableOpacity onPress={() => { navigation.navigate('Profile', { userID: item.id, status: "friend" }) }} style={styles.profileCard}>
            <Image source={{ uri: item.profilePic }} style={styles.profilePic} />
            <View style={styles.profileCardNames}>
                <Text style={styles.nameText}> {item.name} </Text>
                <Text style={styles.usernameText}> {item.username} </Text>
            </View>
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
                        placeholder='Search Friends...'
                        style={styles.searchBox}
                        onChangeText={setSearchText}
                    />
                </View>
                <View style={styles.profileCardContainer}>
                    <FlatList
                        data={filteredFriends}
                        renderItem={({ item }) => (<ProfileCard item={item} />)}
                        keyExtractor={(item) => item.id} />
                </View>
            </View>
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
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


export default FriendsScreen;



