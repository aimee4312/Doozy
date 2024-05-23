import React, { Component, useState } from 'react';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../firebaseConfig';
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { View, Text, Button, StyleSheet, Dimensions, TouchableOpacity, Image, ScrollView, SafeAreaView } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import UploadImage from './profilePic';
import NavBar from '../auth/NavigationBar'

export class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userProfile: null,
      tasks: []
    };
  }

  componentDidMount() {
    const currentUser = FIREBASE_AUTH.currentUser;

    if (currentUser) {
      const userProfileRef = doc(FIRESTORE_DB, 'Users', currentUser.uid);

      getDoc(userProfileRef)
        .then((docSnapshot) => {
          if (docSnapshot.exists()) {
            this.setState({ userProfile: docSnapshot.data() });
          } else {
            console.log("No such document!");
          }
          const tasksRef = collection(FIRESTORE_DB, 'Users', currentUser.uid, 'Tasks');
          getDocs(tasksRef)
            .then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                this.setState(prevState => ({
                  tasks: [...prevState.tasks, { id: doc.id, ...doc.data() }]
                }));
              });
            })
        })
        .catch((error) => {
          console.error("Error fetching document: ", error);

        });
    }
  }

  onLogOut() {
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

  onSettings = () => {
    this.props.navigation.navigate('Settings');
  }

  onHome = () => {
    this.props.navigation.navigate('Timeline');
  }

  handleImagePress = (task) => {
    this.props.navigation.navigate('TaskDetails', { task });
  }

  render() {
    const { userProfile, tasks } = this.state;
    const completedTasks = tasks.filter(task => task.completed);


    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <TouchableOpacity onPress={this.onSettings}>
            <Ionicons name="settings-sharp" size={24} color="black" />
          </TouchableOpacity>
          {userProfile && (
            <View style={styles.content}>
              <UploadImage />
              <View style={styles.bioTextContainer}>
                <Text style={styles.bioText}>{userProfile.name}</Text>
                <View style={styles.detailsContainer}>
                  <View style={styles.detail}>
                    <Text style={styles.detailText}>Friends</Text>
                    <Text style={styles.detailStat}>{userProfile.friends}</Text>
                  </View>
                  <View style={styles.detail}>
                    <Text style={styles.detailText}>Posts</Text>
                    <Text style={styles.detailStat}>{userProfile.posts}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

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
    );
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7fc',

  },
  scrollView: {
    paddingTop: 16,
    paddingBottom: 16
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  bioTextContainer: {
    alignItems: 'center',
    width: '80%',
    borderRadius: 10,
    height: '40%',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    margin: 10,
    backgroundColor: '#70bdb8',
    width: '100%',
    borderRadius: 20,
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
    backgroundColor: '#F5FCFF',
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
})

export default Profile;
