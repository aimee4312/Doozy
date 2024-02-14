import React, { Component } from 'react'
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LandingScreen from './components/auth/Landing';
import RegisterScreen from './components/auth/Register';
import LoginScreen from './components/auth/Login'

const Stack = createStackNavigator();

export class App extends Component {
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
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}

export default App

