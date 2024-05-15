import { React, Component } from 'react';
import { FIREBASE_AUTH } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LandingScreen from './components/auth/Landing';
import RegisterScreen from './components/auth/Register';
import LoginScreen from './components/auth/Login';
import ProfileScreen from './components/profile/Profile';
import SettingsScreen from './components/profile/Settings';
import TimelineScreen from './components/timeline/Timeline';
import TaskListScreen from './screens/TaskListScreen';
import TaskDetailsScreen from './components/profile/TaskDetails';
import AddTaskScreen from './components/tasks/Task_db';

const Stack = createStackNavigator();

class App extends Component {
  constructor(props) {
    super(props)
    this.state = { loggedIn: false };
  }

  componentDidMount() {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
        if (user && user.emailVerified) {
            this.setState({ loggedIn: true });
        } else {
            this.setState({ loggedIn: false });
        }
    });

    this.unsubscribe = unsubscribe;
  }

  render() {
    const { loggedIn } = this.state;
    return (
      <NavigationContainer>
      <Stack.Navigator initialRouteName={loggedIn ? "Profile" : "Landing"}>
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen  name="TaskList" component={ TaskListScreen } options={{ headShown: false}} />
        <Stack.Screen name="Timeline" component={TimelineScreen} />
        <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} />
        <Stack.Screen name="AddTask" component={AddTaskScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    );
  }
}

export default App;
