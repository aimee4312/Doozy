import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, Platform } from 'react-native';
import { FIREBASE_AUTH } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LandingScreen from './src/screens/Landing';
import RegisterScreen from './src/screens/Register';
import LoginScreen from './src/screens/Login';
import ProfileScreen from './src/screens/Profile';
import SettingsScreen from './src/screens/Settings';
import TimelineScreen from './src/screens/Timeline';
import TaskListScreen from './src/screens/TaskListScreen';
import FriendsScreen from './src/screens/Friends';
import AddFriendsScreen from './src/screens/AddFriends';
import EditProfileScreen from './src/screens/EditProfile';
import EditFieldScreen from './src/screens/EditField';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Poppins_400Regular, Poppins_700Bold, Poppins_400Regular_Italic } from '@expo-google-fonts/poppins';
// import { MenuProvider } from 'react-native-popup-menu';

const Stack = createStackNavigator();

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [listId, setListId] = useState("0");
  const [order, setOrder] = useState("default");

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
    Poppins_400Regular_Italic,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setLoggedIn(!!user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    async function setupChannel() {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.HIGH,
          sound: 'default',
        });
      }
    }
    setupChannel();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ animation: 'none' }}>
            {loggedIn ? (
              <>
                <Stack.Screen name="TaskList" options={{ headerShown: false }}>
                  {(props) => <TaskListScreen {...props} listId={listId} setListId={setListId} order={order} setOrder={setOrder} />}
                </Stack.Screen>
                <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Timeline" component={TimelineScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Friends" component={FriendsScreen} options={{ headerShown: false }} />
                <Stack.Screen name="AddFriends" component={AddFriendsScreen} options={{ headerShown: false }} />
                <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{headerShown: false}} />
                <Stack.Screen name="EditField" component={EditFieldScreen} options={{headerShown: false}} />
              </>
            ) : (
              <>
                <Stack.Screen name="Landing" component={LandingScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}