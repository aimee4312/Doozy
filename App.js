import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LandingScreen from './components/auth/Landing';
import RegisterScreen from './components/auth/Register';
import { FIREBASE_APP, FIREBASE_AUTH } from './firebaseConfig';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Landing">
        <Stack.Screen 
          name="Landing"
          component={ LandingScreen }
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

