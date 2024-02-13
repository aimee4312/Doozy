import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LandingScreen from './components/auth/Landing'
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import { StyleSheet, Button, View, SafeAreaView } from 'react-native';

const Stack = createStackNavigator();
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Home'>
        <Stack.Screen 
          name="Landing"
          component={LandingScreen}
          options = {{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// const App = () => (
//   <NavigationContainer>
//     <Stack.Navigator initialRouteName="Home">
//       <Stack.Screen
//         name="Home"
//         component={HomeScreen}
//         options={{ title: 'Home' }}
//       />
//       <Stack.Screen
//         name="Login"
//         component={LoginScreen}
//         options={{ title: 'Login' }}
//       />
//       <Stack.Screen
//         name="Signup"
//         component={SignupScreen}
//         options={{ title: 'Signup' }}
//       />
//     </Stack.Navigator>
//   </NavigationContainer>
// );

// const HomeScreen = ({ navigation }) => (
//   <SafeAreaView style={styles.container}>
//     <View>
//       <Button
//         title="Login"
//         onPress={() => navigation.navigate('Login')}
//       />
//     </View>
//     <View>
//       <Button
//         title="Sign up"
//         onPress={() => navigation.navigate('Signup')}
//       />
//     </View>
//   </SafeAreaView>
// );

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     marginHorizontal: 16,
//   },
// });

// export default App;