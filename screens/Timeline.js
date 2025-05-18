import React, { Component, useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, ImageBackground, RefreshControl } from 'react-native';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../firebaseConfig';
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import NavBar from '../components/auth/NavigationBar';

const TimelineScreen = (props) => {
  const [tasks, setTasks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const completedTasks = tasks.filter(task => task.completed);

  useEffect(() => {
    refreshTasks();
  }, []);


  const fetchFriends = async () => {

    try {
      const AllFriendsRef = collection(FIRESTORE_DB, 'Requests', currentUser.uid, 'AllFriends');
      console.log("reading friends")
      const snapshot = getDocs(AllFriendsRef);
      const friends = [];
      snapshot.forEach((doc) => {
        friends.push({ id: doc.id, ...doc.data() });
      });
      return friends;
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  }


  const refreshTasks = async () => {
    const currentUser = FIREBASE_AUTH.currentUser;
    let isMounted = true; // Add a flag to track if the component is mounted

    if (!currentUser) return;

    try {

      if (!isMounted) return;

      const friends = await fetchFriends();

      tempTasks = []
      friends.forEach(async (friend) => {
        tasksRef = collection(FIRESTORE_DB, 'Users', friend.id, 'Tasks');
        snapshot = await getDocs(taskRef);

      })
      const querySnapshot = await getDocs(tasksRef);

      const tempTasks = [];
      querySnapshot.forEach((doc) => {
        tempTasks.push({ id: doc.id, ...doc.data() });
      });

      setTasks(tempTasks);
    } catch (error) {
      console.error("Error fetching tasks: ", error);
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
    refreshTasks().finally(() => {
      setRefreshing(false);
    });
  };

  const renderTask = ({ item }) => (
    <View style={styles.postContainer}>
      <Image source={{ uri: item.image }} style={styles.postImage} />
      <View style={styles.taskInfo}>
        <View style={styles.titleContainer}>
          <Text style={styles.taskName}>{item.name}</Text>
          <Text style={styles.taskDate}>{item.date.dateString}</Text>
        </View>
        <Text style={styles.taskDescription}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <ImageBackground
      source={require('../assets/background.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <FlatList
          data={completedTasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
        <NavBar navigation={props.navigation} style={styles.navBarContainer}></NavBar>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: 16,
    paddingBottom: 35,
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
