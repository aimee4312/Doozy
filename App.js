import React, { Component } from 'react'
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LandingScreen from './components/auth/Landing';
import RegisterScreen from './components/auth/Register';
import LoginScreen from './components/auth/Login'
import ProfileScreen from './components/profile/Profile'
import { onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_AUTH } from './firebaseConfig';

const Stack = createStackNavigator();

export class App extends Component {
  constructor(props) {
    super(props)
    this.state = { loggedIn: false, }
  }

  componentDidMount(){
    onAuthStateChanged(FIREBASE_AUTH, (user) => {
      if (!user) {
        this.setState({ loggedIn: false, })
      } else {
        this.setState({ loggedIn: true, })
      }
    })
  }

  render() {
    const { loggedIn } = this.state;
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName={loggedIn ? "Profile" : "Landing"}>
          {loggedIn ? (
            <>
              <Stack.Screen name="Profile" component={ ProfileScreen }
              />
            </>
          ) : (
            <>
              <Stack.Screen name="Landing" component={ LandingScreen }
              />
              <Stack.Screen name="Login" component={ LoginScreen }
              />
              <Stack.Screen name="Register" component={ RegisterScreen }
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}

export default App

