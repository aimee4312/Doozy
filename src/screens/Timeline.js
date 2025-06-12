import React, { Component, useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, ImageBackground, RefreshControl } from 'react-native';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../firebaseConfig';
import { doc, getDoc, collection, getDocs, where, query } from "firebase/firestore";
import NavBar from '../components/NavigationBar';
import { SafeAreaView } from 'react-native-safe-area-context';

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
      console.log("reading friends")
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
    let isMounted = true; // Add a flag to track if the component is mounted

    if (!currentUser) return;

    try {

      if (!isMounted) return;

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
        const q = query(postsRef, where("userId", "in", batch));
        const snapshot = await getDocs(q);
        tempPosts = tempPosts.concat(snapshot.docs.map(doc => ({id: doc.id, ...doc.data(), ...friendMap[doc.data().userId]})))
      }
      setPosts(tempPosts);

    } catch (error) {
      console.error("Error fetching posts: ", error);
    } finally {
      if (isMounted) {
        setRefreshing(false);
      }
    }

    return () => {
      isMounted = false; // Set flag to false when unmounting
    };
  };

  const handleRefresh = () => {
    setRefreshing(true);
    refreshPosts().finally(() => {
      setRefreshing(false);
    });
  };

  const getDateString = (timestamp) => {
    const millis = timestamp.seconds * 1000 + Math.floor(timestamp.nanoseconds / 1e6);
    const date = new Date(millis);
    return date.toLocaleDateString();
  }

  const getTimeString = (timestamp) => {
    const millis = timestamp.seconds * 1000 + Math.floor(timestamp.nanoseconds / 1e6);
    const date = new Date(millis);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  const renderTask = ({ item }) => ( // conflicting names!! change name to users-name and name to postname or something
    <View style={styles.postContainer}>
      <Image source={{ uri: item.image }} style={styles.postImage} />
      <View style={styles.taskInfo}>
        <View style={styles.titleContainer}>
          <Text style={styles.taskName}>{item.name}</Text>
          <Text style={styles.taskDate}>{getDateString(item.timePosted)}</Text>
          <Text style={styles.taskDate}>{getTimeString(item.timePosted)}</Text>
        </View>
        <Text style={styles.taskDescription}>{item.description}</Text>
        <Image source={{ uri: item.profilePic }} style={styles.postImage}/>
      </View>
    </View>
  );

  return (
    <ImageBackground
      source={require('../assets/background.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  postContainer: {
    marginLeft: 20,
    marginRight: 20,
    marginTop: 40,
    backgroundColor: 'rgba(249, 249, 249, 0.7)',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  taskInfo: {
    padding: 10,
  },
  taskName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  taskDescription: {
    fontSize: 16,
    marginTop: 5,
  },
  taskDate: {
    fontSize: 14,
    color: '#888',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
});


export default TimelineScreen;
