import React, { Component, useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, ImageBackground, RefreshControl } from 'react-native';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../firebaseConfig';
import { doc, getDoc, collection, getDocs, where, query, orderBy } from "firebase/firestore";
import NavBar from '../components/NavigationBar';
import { SafeAreaView } from 'react-native-safe-area-context';
import fonts from '../theme/fonts';
import colors from '../theme/colors';
import CheckedPostReceived from "../assets/checked-post-received.svg";
import CheckedPost from '../assets/checked-post-sent.svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getTimePassedString } from '../utils/timeFunctions'

const TimelineScreen = (props) => {
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState([]);

  const currentUser = FIREBASE_AUTH.currentUser;

  useEffect(() => {
    refreshPosts();
  }, []);


  const fetchFriends = async () => {

    try {
      const AllFriendsRef = collection(FIRESTORE_DB, 'Requests', currentUser.uid, 'AllFriends');
      const snapshot = await getDocs(AllFriendsRef);
      const friendsMap = {};
      snapshot.forEach((doc) => {
        friendsMap[doc.id] = doc.data();
      });
      return friendsMap;
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  }

  const splitArray = (array, size) => {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  }


  const refreshPosts = async () => {

    if (!currentUser) return;

    try {

      const friendMap = await fetchFriends();

      const userProfileRef = doc(FIRESTORE_DB, 'Users', currentUser.uid);
      const userSnapshot = await getDoc(userProfileRef);
      const userProfileData = userSnapshot.data();

      friendMap[currentUser.uid] = { name: userProfileData.name, profilePic: userProfileData.profilePic, username: userProfileData.username };

      const friendIds = Object.keys(friendMap);
      const batches = splitArray(friendIds, 10);

      const postsRef = collection(FIRESTORE_DB, 'Posts');

      let tempPosts = [];
      for (const batch of batches) {
        const q = query(postsRef, where("userId", "in", batch), where("hidden", "==", false), orderBy("timePosted", "desc"));
        const snapshot = await getDocs(q);
        tempPosts = tempPosts.concat(snapshot.docs.map(doc => ({ id: doc.id, userID: doc.data().userId, ...doc.data(), ...friendMap[doc.data().userId] })))
      }
      setPosts(tempPosts);

    } catch (error) {
      console.error("Error fetching posts: ", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    refreshPosts().finally(() => {
      setRefreshing(false);
    });
  };

  const renderTask = ({ item }) => (
    <View style={styles.postContainer}>
      <TouchableOpacity onPress={() => {props.navigation.navigate('Profile', {userID: item.userID, status: currentUser.uid === item.userID ? 'currentUser' : 'friend'})}} style={styles.profileInfo}>
        <Image source={{ uri: item.profilePic }} style={styles.profilePic} />
        <Text style={styles.username}>{item.username}</Text>
      </TouchableOpacity>
      {item.image && <Image source={{ uri: item.image }} style={styles.postImage} />}
      <View style={styles.taskInfo}>
        <View style={styles.titleContainer}>
          <View style={styles.postNameContainer}>
            <CheckedPostReceived width={32} height={32} />
            <Text style={styles.taskName}>{item.postName}</Text>
          </View>
          {item.description !== "" && <View style={styles.descriptionContainer}>
            <MaterialCommunityIcons name={"text"} size={16} color={colors.primary} />
            <Text style={styles.taskDescription}>{item.description}</Text>
          </View>}
          <Text style={styles.taskDate}>{getTimePassedString(item.timePosted)}</Text>
        </View>


      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBorder}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 1, paddingRight: 5, }}>
          <CheckedPost width={42} height={42} />
          <Text style={styles.title}>Doozy</Text>
        </View>
      </View>
      <FlatList
        data={posts}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
      <NavBar navigation={props.navigation} style={styles.navBarContainer}></NavBar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBorder: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 10
  },
  title: {
    fontSize: 32,
    color: colors.primary,
    fontFamily: fonts.bold,
  },
  postContainer: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1, 
    borderBottomColor: '#ccc',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 40,
    marginRight: 10,
  },
  username: {
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  postImage: {
    width: '100%',
    height: 300,
  },
  taskInfo: {
    paddingTop: 10,
  },
  postNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 5,
    paddingRight: 10,
    paddingBottom: 10
  },
  taskName: {
    marginLeft: 5,
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.primary,
  },
  descriptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginHorizontal: 10,

  },
  taskDescription: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.primary,
    paddingLeft: 10,
  },
  taskDate: {
    paddingLeft: 10,
    fontSize: 14,
    color: colors.fade,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
});


export default TimelineScreen;
