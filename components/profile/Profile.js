import React, { Component, useState } from 'react';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../firebaseConfig';
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { View, Text, Button, StyleSheet, Dimensions, TouchableOpacity, Image, ScrollView } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import UploadImage from './profilePic';



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

    return (
      <View style={styles.container}>
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
                  <Text>{userProfile.friends}</Text>
                </View>
                <View style={styles.detail}>
                  <Text style={styles.detailText}>Posts</Text>
                  <Text>{userProfile.posts}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <ScrollView style={styles.tasksContainer}>
          <View style={styles.grid}>
            {tasks && tasks.map((task, index) => (
              <TouchableOpacity key={index} onPress={() => this.handleImagePress(task)}>
                <View style={styles.postContainer}>
                  <Image source={{ uri: task.image }} style={styles.photo} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <Button
            onPress={() => this.onHome()}
            title="Home"
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button
            onPress={() => this.onLogOut()}
            title="Log Out"
          />
        </View>
      </View>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  bioTextContainer: {
    alignItems: 'center',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  detail: {
    alignItems: 'center',
    margin: 10,
  },
  detailText: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  bioText: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  postContainer: {
    margin: 1.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  photo: {
    width: (Dimensions.get('window').width - 30) / 3,
    height: (Dimensions.get('window').width - 30) / 3,
    marginBottom: 2,
  },
  tasksContainer: {
    paddingHorizontal: 10,
    paddingVertical: 15,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    maxHeight: 300,
  },
})

export default Profile;
