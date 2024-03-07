import React, { Component, useState } from 'react';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../firebaseConfig';
import { doc, getDoc } from "firebase/firestore";
import { View, Text, Button, StyleSheet, Dimensions, TouchableOpacity} from 'react-native';
import { TabView, SceneMap } from 'react-native-tab-view';
import { CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import UploadImage from './profilePic';


export class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userProfile: null
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

  goToSettingsScreen = () => {
    //this.props.navigation.navigate('AddTask');
  }
  

  render() {
    const { userProfile } = this.state;

    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={this.goToSettingsScreen}>
          <Ionicons name="settings-sharp" size={24} color="black" />
        </TouchableOpacity>
        {userProfile && (
          <View style={styles.content}>
            <UploadImage/>
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
            <View style={styles.detailsContainer}>
              <UserPosts/>
            </View>
          </View>
        )}
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

const FirstRoute = () => (
  <View style={[styles.scene, { backgroundColor: '#ff4081' }]} />
);

const SecondRoute = () => (
  <View style={[styles.scene, { backgroundColor: '#673ab7' }]} />
);

const UserPosts = () => {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'posts', title: 'Posts' },
    { key: 'achievements', title: 'Achievements' },
  ]);

  const renderScene = SceneMap({
    posts: FirstRoute,
    achievements: SecondRoute,
  });

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: Dimensions.get('window').width }}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  bioTextContainer: {
    alignItems: 'center',
    marginBottom: 20,
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
  scene: {
    flex: 1,
  },
})

export default Profile;
