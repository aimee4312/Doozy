import React from 'react';
import { View, Button } from 'react-native';
import NavigationBar from '../auth/NavigationBar';

export default function Landing({ navigation }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <Button
        title="Register"
        onPress={() => navigation.navigate("Register")}
      />
      <Button
        title="Login"
        onPress={() => navigation.navigate("Login")}
      />
    <NavigationBar/>
    </View>
  )
}
