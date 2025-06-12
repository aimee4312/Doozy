import React, { useState, useEffect, useCallback } from 'react';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../firebaseConfig';
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, ScrollView, SafeAreaView, ImageBackground, RefreshControl } from 'react-native';
import { CommonActions, useNavigationState } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import UploadImage from '../components/profile/profilePic';
import NavBar from '../components/NavigationBar';
import { addFriend, deleteRequest, deletePendingRequest, deleteFriend, requestUser } from '../utils/friendFunctions'
const ProfileScreen = ({ navigation, route }) => {
  const { userID, status } = route.params;
  const routes = useNavigationState(state => state.routes)
  const currentUser = FIREBASE_AUTH.currentUser;
  const [userProfile, setUserProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [friendStatus, setFriendStatus] = useState(null)

  const fetchData = async () => {
    let tempUserID;
    let tempFriendStatus;
    if (!userID) {
      tempUserID = currentUser.uid;
      setFriendStatus("currentUser");
      tempFriendStatus = "currentUser";
    }
    else {
      tempUserID = userID;
      setFriendStatus(status);
      tempFriendStatus = status;
    }

    try {
      const userProfileRef = doc(FIRESTORE_DB, 'Users', tempUserID);
      const postsRef = collection(FIRESTORE_DB, 'Posts');

      const docSnapshot = await getDoc(userProfileRef);
      if (docSnapshot.exists()) {
        setUserProfile({ id: docSnapshot.id, ...docSnapshot.data()});
      } else {
        console.log("No such document!");
      }

      if (tempFriendStatus == "currentUser" || tempFriendStatus == "friend") {
        const q = query(postsRef, where("userId", "==", tempUserID));
        const querySnapshot = await getDocs(q);
        const postsArray = [];
        querySnapshot.forEach((doc) => {
          postsArray.push({ id: doc.id, ...doc.data() });
        });
        setPosts(postsArray);
      }
    } catch (error) {
      console.error("Error fetching posts: ", error);
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh =() => {
    setRefreshing(true);
    fetchData();
  };

  const onLogOut = async () => {
    try {
      await FIREBASE_AUTH.signOut();
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Landing' }],
        })
      );
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  };

  const goToSettingsScreen = () => {
    navigation.navigate('Settings');
  };

  const goToFriendsScreen = () => {
    navigation.navigate('Friends');
  };

  const handleStatusChange = () => {
    console.log(status);
    if (friendStatus == "currentUser") {
      openEditProfile();
    }
    else if (friendStatus == "friend") {
      deleteFriend(userProfile);
      setFriendStatus("stranger");
    }
    else if (friendStatus == "stranger") {
      requestUser(userProfile);
      setFriendStatus("userSentRequest") // i should check if there was an error
    }
    else {
      deletePendingRequest(userProfile);
      setFriendStatus("stranger")
    }
  }

  const openEditProfile = () => {

  }

  return (
    <ImageBackground
      source={require('../assets/background4.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.topContainer}>
          <View style={styles.usernameContainer}>
            {routes.length > 1  && (
              <TouchableOpacity onPress={navigation.goBack} style={{paddingRight: 10}}>
                <Ionicons name='chevron-back' size={24} color='black'/>
              </TouchableOpacity>)}
            <Text style={styles.usernameText}>{userProfile ? userProfile.username : ""}</Text>
          </View>
          {friendStatus == "currentUser" && (<View style={styles.topContainerButtons}>
            <TouchableOpacity onPress={goToFriendsScreen} style={styles.friendsButton}>
              <Ionicons name="people-outline" size={32} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress={goToSettingsScreen} style={styles.settingsButton}>
              <Ionicons name="settings-sharp" size={32} color="black" />
            </TouchableOpacity>
          </View>)}
        </View>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
        >
          {userProfile && (
            <View style={styles.profileContainer}>
              <View style={styles.upperProfileContainer}>
                <Image source={{ uri: userProfile.profilePic }} style={{ width: 100, height: 100, borderRadius: 50 }} />
                {/* <UploadImage refreshing={refreshing} userID={userProfile.id} status={friendStatus} /> */}
                <View style={styles.detailsContainer}>
                  <View style={styles.dataContainer}>
                    <View style={styles.data}>
                      <Text style={styles.dataText}>Friends</Text>
                      <Text style={styles.dataStat}>{userProfile.friends}</Text>
                    </View>
                    <View style={styles.data}>
                      <Text style={styles.dataText}>Posts</Text>
                      <Text style={styles.dataStat}>{userProfile.posts}</Text>
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.lowerProfileContainer}>
                <Text style={styles.name}>{userProfile.name}</Text>
                {status == "userReceivedRequest" ? (<View>
                  <Text>{userProfile.username} wants to be friends with you</Text>
                  <TouchableOpacity onPress={() => {deleteRequest(userProfile); setFriendStatus("stranger")}}>
                    <Text>Delete</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => {addFriend(userProfile); setFriendStatus("friend")}}>
                    <Text>Confirm</Text>
                  </TouchableOpacity>
                </View>) :
                (<TouchableOpacity onPress={handleStatusChange}>
                  <Text>{friendStatus == "currentUser" ? "Edit Profile" : 
                    (friendStatus == "friend" ? "Friends" :
                      (friendStatus == "userSentRequest" ? "Cancel Request" :
                        "Add Friend"
                      ))}</Text>
                </TouchableOpacity>)}
              </View>
            </View>
          )}

          <View style={styles.tasksContainer}>
            <View style={styles.grid}>
              {posts.map((task, index) => (
                <TouchableOpacity key={task.id} onPress={() => handleImagePress(task)}>
                  <View style={styles.postContainer}>
                    <Image source={{ uri: task.image }} style={styles.photo} />
                    <View style={styles.postDescription}>
                      <Text style={styles.taskTitle}>{task.name}</Text>
                      <Text>{task.description}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
        <NavBar navigation={navigation} />
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  // ... (same as your original styles)
  container: {
    flex: 1,
  },
  topContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  usernameContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  usernameText: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  topContainerButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  settingsButton: {
    padding: 5
  },
  friendsButton: {
    padding: 5
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
  },
  profileContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    height: '20%',
    margin: 10
  },
  upperProfileContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    height: 100,
  },
  detailsContainer: {
    flexDirection: 'column',
    alignItems: 'left',
    borderRadius: 10,
    marginLeft: 20
    
  },
  dataContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    backgroundColor: '#70bdb8',
    width: '80%',
    borderRadius: 20,
  },
  data: {
    alignItems: 'center',
    margin: 10,
  },
  dataText: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#d9eced',
  },
  dataStat: {
    color: '#f9fcfd',
  },
  lowerProfileContainer: {
    flexDirection: 'column',
  },
  name: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 20,
  },
  postContainer: {
    width: '100%',
    backgroundColor: 'rgba(245, 252, 255, 0.8)',
    marginBottom: 20,
    padding: 15,
    borderRadius: 20,
    borderColor: 'F5FCFF',
    flexDirection: 'row',
  },
  postDescription: {
    width: '65%',
    alignItems: 'center',
  },
  photo: {
    width: (Dimensions.get('window').width - 30) / 3,
    height: (Dimensions.get('window').width - 30) / 3,
    marginBottom: 2,
    borderRadius: 20,
  },
  tasksContainer: {
    padding: 10,
    borderRadius: 10,
  },
  taskTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: '20%',
  },
});

export default ProfileScreen;
