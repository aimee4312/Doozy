import React, { useState, useEffect } from 'react';
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
import { SafeAreaProvider } from 'react-native-safe-area-context';
// import { MenuProvider } from 'react-native-popup-menu';

const Stack = createStackNavigator();

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [listId, setListId] = useState("0");
  const [order, setOrder] = useState("priority");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setLoggedIn(!!user);
      setLoading(false);
    });
    return unsubscribe;
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
                <Stack.Screen name="Settings" component={SettingsScreen} />
                <Stack.Screen name="Timeline" component={TimelineScreen} options={{ headerShown: false }} />
                <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} />
                <Stack.Screen name="AddTask" component={AddTaskScreen} />
                <Stack.Screen name="Friends" component={FriendsScreen} />
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