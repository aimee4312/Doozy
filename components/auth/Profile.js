import React, { Component } from 'react'
import { View, Text, Button, StyleSheet, Image } from 'react-native'
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../firebaseConfig'
import { doc, getDoc } from "firebase/firestore";

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
    this.props.navigation.reset({
      index: 0,
      routes: [{ name: 'Landing' }],
    });
  }
  render() {
    const { userProfile } = this.state;

    return (
      <View style={styles.container}>
        {userProfile && (
          <View style={styles.content}>
            <Image source={require('../../profile-pic.jpeg')} style={styles.profileImage} />
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
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
  }
})

export default Profile
