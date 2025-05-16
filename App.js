import React, { Component } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { FIREBASE_AUTH } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LandingScreen from './components/auth/Landing';
import RegisterScreen from './components/auth/Register';
import LoginScreen from './components/auth/Login';
import ProfileScreen from './components/profile/Profile';
import SettingsScreen from './components/profile/Settings';
import TimelineScreen from './screens/Timeline';
import TaskListScreen from './screens/TaskListScreen';
import TaskDetailsScreen from './components/profile/TaskDetails';
import AddTaskScreen from './components/tasks/Task_db';
import FriendsScreen from './screens/Friends';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const Stack = createStackNavigator();

class App extends Component {
  constructor(props) {
    super(props)
    this.state = { loggedIn: false, loading: true,};
  }

  componentDidMount() {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      console.log(user);
      if (user) {
        this.setState({ loggedIn: true, loading: false});
      } else {
        this.setState({ loggedIn: false, loading: false });
      }
    });

    this.unsubscribe = unsubscribe;
  }

  render() {
    const { loggedIn, loading } = this.state;
    if (loading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      );
    }
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
            {loggedIn ? (
              <Stack.Navigator screenOptions={{ animationEnabled: false }}>
                <Stack.Screen name="TaskList" component={TaskListScreen} options={{ headerShown: false }}/>
                <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }}/>
                <Stack.Screen name="Settings" component={SettingsScreen} />
                <Stack.Screen name="Timeline" component={TimelineScreen} options={{ headerShown: false }}/>
                <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} />
                <Stack.Screen name="AddTask" component={AddTaskScreen} />
                <Stack.Screen name="Friends" component={FriendsScreen} />
              </Stack.Navigator>
            ) : (
              <Stack.Navigator screenOptions={{ animationEnabled: false }}>
                <Stack.Screen name="Landing" component={LandingScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }}/>
                <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }}/>
              </Stack.Navigator>
            )}
        </NavigationContainer>
      </GestureHandlerRootView>
    );
  }
}

export default App;