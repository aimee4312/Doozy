import React, { Component } from 'react'
import { View, Text, Button } from 'react-native'
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
      <View style={{ flex:1, justifyContent: 'center', alignItems: 'center' }}>
        {userProfile && (
            <View>
              <Text>{userProfile.name} is logged in</Text>
              <Button
                onPress={() => this.onLogOut()}
                title="Log Out"
              />
            </View>
        )}
      </View>
    );
  }
}

export default Profile
