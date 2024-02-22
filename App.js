import React, { Component } from 'react'
import { View, Text, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LandingScreen from './components/auth/Landing';
import RegisterScreen from './components/auth/Register';
import LoginScreen from './components/auth/Login'
import ProfileScreen from './components/auth/Profile'
import { onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_AUTH } from './firebaseConfig';

const Stack = createStackNavigator();

export class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loggedIn: false,
    }
  }

  componentDidMount(){
    onAuthStateChanged(FIREBASE_AUTH, (user) => {
      if (!user) {
        this.setState({
          loggedIn: false,
        })
      } else {
        this.setState({
          loggedIn: true,
        })
      }
    })
  }

  render() {
      return (
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Landing">
            <Stack.Screen 
              name="Landing"
              component={ LandingScreen }
              options={{ headShown: false}}
            />
            <Stack.Screen 
              name="Login"
              component={ LoginScreen }
              options={{ headShown: false}}
            />
            <Stack.Screen 
              name="Register"
              component={ RegisterScreen }
              options={{ headShown: false}}
            />
            <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ headerShown: false }}
          />
          </Stack.Navigator>
        </NavigationContainer>
      );
  }
}

export default App

