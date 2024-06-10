import React, { Component } from 'react';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../firebaseConfig';
import { doc, getDoc, collection, getDocs, addDoc, writeBatch } from "firebase/firestore";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, ScrollView, SafeAreaView, ImageBackground, RefreshControl, TextInput, Button } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import UploadImage from './profilePic';
import NavBar from '../auth/NavigationBar';

export class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userProfile: null,
      tasks: [],
      refreshing: false,
      friendUsername: '',
      friends: [],
    };
  }

  componentDidMount() {
    this.focusListener = this.props.navigation.addListener('focus', this.fetchData);
    this.fetchData();
    this.focusListener = this.props.navigation.addListener('focusFriends', this.fetchDataFriends);
    this.fetchDataFriends();
  }

  componentWillUnmount() {
    this.focusListener();
  }

  fetchData = () => {
    const currentUser = FIREBASE_AUTH.currentUser;

    if (currentUser) {
      const userProfileRef = doc(FIRESTORE_DB, 'Users', currentUser.uid);
      const tasksRef = collection(FIRESTORE_DB, 'Users', currentUser.uid, 'Tasks');

      return getDoc(userProfileRef)
        .then((docSnapshot) => {
          if (docSnapshot.exists()) {
            this.setState({ userProfile: docSnapshot.data() });
          } else {
            console.log("No such document!");
          }

          return getDocs(tasksRef);
        })
        .then((querySnapshot) => {
          const tasks = [];
          querySnapshot.forEach((doc) => {
            tasks.push({ id: doc.id, ...doc.data() });
          });
          this.setState({ tasks });
        })
        .catch((error) => {
          console.error("Error fetching data: ", error);
        });
    } else {
      return Promise.resolve(); 
    }
  }

  fetchDataFriends = () => {
    const currentUser = FIREBASE_AUTH.currentUser;

    if (currentUser) {
      const userProfileRef = doc(FIRESTORE_DB, 'Users', currentUser.uid);
      const friendsRef = collection(FIRESTORE_DB, 'Users', currentUser.uid, 'Friends');

      return getDoc(userProfileRef)
        .then((docSnapshot) => {
          if (docSnapshot.exists()) {
            this.setState({ userProfile: docSnapshot.data() });
          } else {
            console.log("No such document!");
          }

          return getDocs(friendsRef);
        })
        .then((querySnapshot) => {
          const friends = [];
          querySnapshot.forEach((doc) => {
            friends.push({ id: doc.id, ...doc.data() });
          });
          this.setState({ friends });
        })
        .catch((error) => {
          console.error("Error fetching data: ", error);
        });
    } else {
      return Promise.resolve(); 
    }
  }

  onRefresh = () => {
    this.setState({ refreshing: true });
    this.fetchData().finally(() => {
      this.setState({ refreshing: false });
    });
  }

  onLogOut = () => {
    FIREBASE_AUTH.signOut().then(() => {
      this.props.navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Landing' }],
        })
      );
    }).catch((error) => {
      console.error("Error logging out: ", error);
    });
  }

  goToSettingsScreen = () => {
    this.props.navigation.navigate('Settings');
  }

  async addFriend() {
    const { friendUsername } = this.state;

    const currentUser = FIREBASE_AUTH.currentUser;

    if (currentUser) {
      const userProfileRef = doc(FIRESTORE_DB, 'Users', currentUser.uid);
      const usernameDoc = doc(FIRESTORE_DB, "Usernames", friendUsername);

      try {
        const usernameDocSnap = await getDoc(usernameDoc);
        const userDocSnap = await getDoc(userProfileRef);

        // Creating batch job for adding friend and adding you as an incoming friend request to said friend
        const batch = writeBatch(FIRESTORE_DB);

        const newFriendRef = doc(FIRESTORE_DB, 'Users/' + currentUser.uid + '/Friends', friendUsername);
        const incomingFriendRef = doc(FIRESTORE_DB, 'Users/' + usernameDocSnap.data().uid + '/Friends', userDocSnap.data().username);
        
        batch.set(newFriendRef, {  // Self
          relationship: "outgoing_friend_request"
        })
        batch.set(incomingFriendRef, {  // Friend
          relationship: "incoming_friend_request"
        })

        await batch.commit();

      } catch(error) {
        console.error("Error adding friend request:", error);
      }
    } else {
      console.error("Current user not found.");
    }
  }

  async acceptFriend(friend) {
    const currentUser = FIREBASE_AUTH.currentUser;

    if (currentUser) {
      const userProfileRef = doc(FIRESTORE_DB, 'Users', currentUser.uid);
      const usernameDoc = doc(FIRESTORE_DB, "Usernames", friend.id);

      try {
        const usernameDocSnap = await getDoc(usernameDoc);
        const userDocSnap = await getDoc(userProfileRef);

        // Creating batch job for adding friend and adding you as an incoming friend request to said friend
        const batch = writeBatch(FIRESTORE_DB);

        const newFriendRef = doc(FIRESTORE_DB, 'Users/' + currentUser.uid + '/Friends', friend.id);
        const incomingFriendRef = doc(FIRESTORE_DB, 'Users/' + usernameDocSnap.data().uid + '/Friends', userDocSnap.data().username);
        
        batch.update(newFriendRef, {  // Self
          relationship: "mutual"
        })
        batch.update(incomingFriendRef, {  // Friend
          relationship: "mutual"
        })

        await batch.commit();

        this.componentDidMount();

      } catch(error) {
        console.error("Error adding friend request:", error);
      }
    } else {
      console.error("Current user not found.");
    }
  }

  async rejectFriend(friend) {
    const currentUser = FIREBASE_AUTH.currentUser;

    if (currentUser) {
      const userProfileRef = doc(FIRESTORE_DB, 'Users', currentUser.uid);
      const usernameDoc = doc(FIRESTORE_DB, "Usernames", friend.id);

      try {
        const usernameDocSnap = await getDoc(usernameDoc);
        const userDocSnap = await getDoc(userProfileRef);

        // Creating batch job for adding friend and adding you as an incoming friend request to said friend
        const batch = writeBatch(FIRESTORE_DB);

        const newFriendRef = doc(FIRESTORE_DB, 'Users/' + currentUser.uid + '/Friends', friend.id);
        const incomingFriendRef = doc(FIRESTORE_DB, 'Users/' + usernameDocSnap.data().uid + '/Friends', userDocSnap.data().username);
        
        batch.delete(newFriendRef);
        batch.delete(incomingFriendRef);

        await batch.commit();

        this.componentDidMount();

      } catch(error) {
        console.error("Error adding friend request:", error);
      }
    } else {
      console.error("Current user not found.");
    }
  }

  render() {
    const { userProfile, tasks, refreshing, friends } = this.state;
    const completedTasks = tasks.filter(task => task.completed);

    const mutualFriends = friends.filter(friend => friend.relationship == "mutual");
    const pendingFriends = friends.filter(friend => friend.relationship == "incoming_friend_request");

    var viewPosts = true;

    function postTabClicked() {
      console.log("postTabClicked");
      viewPosts = true;
    }

    function friendsTabClicked() {
      console.log("friendsTabClicked");
      viewPosts = false;
    }

    function Post_Friend_Area() {
      if (false) {
        return (
        <View style={styles.tasksContainer}>
          <View style={styles.grid}>
            {completedTasks.map((task, index) => (
              <View key={index} onPress={() => this.handleImagePress(task)}>
                <View style={styles.postContainer}>
                  <Image source={{ uri: task.image }} style={styles.photo} />
                  <View style={styles.postDescription}>
                    <Text style={styles.taskTitle}>{task.name}</Text>
                    <Text>{task.description}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      )} else {
        return (
        <View>
          <View style={styles.friendSearchContainer}>
            <TextInput
                placeholder="Username"
                onChangeText={(friendUsername) => this.setState({ friendUsername })}
                style={styles.friendSearchBox}
            />
            <TouchableOpacity
                onPress={() => this.addFriend()}
                title="Add"
                color="#007bff"
                style={styles.friendAddButton}>
              <Text style={styles.friendAddButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tasksContainer}>
            <View style={styles.grid}>
              {pendingFriends.map((friend, index) => (
                <View key={index} onPress={() => this.handleImagePress(friend)}>
                  
                  <View style={styles.incomingFriendRequest}>
                    <View style={styles.friendRequest}>
                      <Text style={styles.friendName}>{friend.id} wants to be friends</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => this.acceptFriend(friend)}
                        title="Accept"
                        color="#98FB98"
                        style={styles.acceptFriendButton}>
                      <Text style={styles.friendAddButtonText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => this.rejectFriend(friend)}
                        title="Delete"
                        color="#FA8072"
                        style={styles.rejectFriendButton}>
                      <Text style={styles.friendAddButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.tasksContainer}>
            <View style={styles.grid}>
              {mutualFriends.map((friend, index) => (
                <View key={index} onPress={() => this.handleImagePress(friend)}>
                  <View style={styles.friendList}>
                    <Text style={styles.friendName}>{friend.id}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}
    }

    return (
      <ImageBackground
        source={require('../../assets/background4.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.container}>
          <ScrollView 
            style={styles.scrollView} 
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing}
                onRefresh={this.onRefresh}
              />
            }
          >
            <TouchableOpacity onPress={this.goToSettingsScreen}>
              <Ionicons name="settings-sharp" size={24} color="black" />
            </TouchableOpacity>
            {userProfile && (
              <View style={styles.content}>
                <UploadImage />
                <View style={styles.bioTextContainer}>
                  <Text style={styles.bioText}>{userProfile.name}</Text>
                  <View style={styles.detailsContainer}>
                    <TouchableOpacity style={styles.detail} onPress={() => (postTabClicked())}>
                      <Text style={styles.detailText}>Posts</Text>
                      <Text style={styles.detailStat}>{userProfile.posts}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.detail} onPress={() => (friendsTabClicked())}>
                      <Text style={styles.detailText}>Friends</Text>
                      <Text style={styles.detailStat}>{userProfile.numFriends}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* <Post_Friend_Area /> */}

            <View>
              <View style={styles.friendSearchContainer}>
                <TextInput
                    placeholder="Username"
                    onChangeText={(friendUsername) => this.setState({ friendUsername })}
                    style={styles.friendSearchBox}
                />
                <TouchableOpacity
                    onPress={() => this.addFriend()}
                    title="Add"
                    color="#007bff"
                    style={styles.friendAddButton}>
                  <Text style={styles.friendAddButtonText}>Add</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.tasksContainer}>
                <View style={styles.grid}>
                  {pendingFriends.map((friend, index) => (
                    <View key={index} onPress={() => this.handleImagePress(friend)}>
                      
                      <View style={styles.incomingFriendRequest}>
                        <View style={styles.friendRequest}>
                          <Text style={styles.friendName}>{friend.id} wants to be friends</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => this.acceptFriend(friend)}
                            title="Accept"
                            color="#98FB98"
                            style={styles.acceptFriendButton}>
                          <Text style={styles.friendAddButtonText}>Accept</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => this.rejectFriend(friend)}
                            title="Delete"
                            color="#FA8072"
                            style={styles.rejectFriendButton}>
                          <Text style={styles.friendAddButtonText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.tasksContainer}>
                <View style={styles.grid}>
                  {mutualFriends.map((friend, index) => (
                    <View key={index} onPress={() => this.handleImagePress(friend)}>
                      <View style={styles.friendList}>
                        <Text style={styles.friendName}>{friend.id}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.tasksContainer}>
              <View style={styles.grid}>
                {completedTasks.map((task, index) => (
                  <View key={index} onPress={() => this.handleImagePress(task)}>
                    <View style={styles.postContainer}>
                      <Image source={{ uri: task.image }} style={styles.photo} />
                      <View style={styles.postDescription}>
                        <Text style={styles.taskTitle}>{task.name}</Text>
                        <Text>{task.description}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>

          </ScrollView>
          <NavBar navigation={this.props.navigation}></NavBar>
        </SafeAreaView>
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  content: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  bioTextContainer: {
    alignItems: 'center',
    width: '80%',
    borderRadius: 10,
    height: '20%',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    margin: 10,
    backgroundColor: '#70bdb8',
    width: '100%',
    borderRadius: 20,
    height: '110%'
  },
  detail: {
    alignItems: 'center',
    margin: 10,
  },
  detailText: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#d9eced',
  },
  detailStat: {
    color: '#f9fcfd',
  },
  bioText: {
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
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  taskTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: '20%',
  },
  friendSearchContainer: {
    paddingHorizontal: 10,
    paddingTop: 10,
    borderRadius: 10,
    flexDirection: 'row',
  },
  friendSearchBox: {
    width: '80%',
    backgroundColor: 'rgba(245, 252, 255, 0.8)',
    marginBottom: 20,
    padding: 15,
    borderRadius: 20,
    borderColor: 'F5FCFF',
    flexDirection: 'row',
  },
  friendAddButton: {
    width: '20%',
    backgroundColor: 'rgba(245, 252, 255, 0.8)',
    marginBottom: 20,
    padding: 15,
    borderRadius: 20,
    borderColor: 'F5FCFF',
    flexDirection: 'row',
  },
  friendAddButtonText: {
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000000',
  },
  friendList: {
    flexDirection: 'collumn',
    padding: 15,
    width: '100%',
    backgroundColor: 'rgba(245, 252, 255, 0.8)',
    borderRadius: 20,
    marginBottom: 20,
  },
  friendName: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  friendRequest: {
    flexDirection: 'collumn',
    padding: 15,
    width: '60%',
    backgroundColor: 'rgba(245, 252, 255, 0.8)',
    borderRadius: 20,
    marginBottom: 20,
  },
  incomingFriendRequest: {
    flexDirection: 'row',
  },
  acceptFriendButton: {
    width: '20%',
    backgroundColor: '#98FB98',
    marginBottom: 20,
    padding: 15,
    borderRadius: 20,
    borderColor: '#F5FCFF',
    flexDirection: 'row',
  },
  rejectFriendButton: {
    width: '20%',
    backgroundColor: '#FA8072',
    marginBottom: 20,
    padding: 15,
    borderRadius: 20,
    borderColor: '#F5FCFF',
    flexDirection: 'row',
  },
});

export default Profile;
