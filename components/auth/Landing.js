import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ImageBackground } from 'react-native';

export default function Landing({ navigation }) {
  return (
    <ImageBackground source={require('../../assets/background.jpg')} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.appName}>Doozy</Text>
        <TouchableOpacity
          style={styles.todoItem}
          onPress={() => navigation.navigate("Register")}
        >
          <View style={styles.bubble}>
            <View style={styles.checkbox}></View>
            <Text style={[styles.todoText, styles.todoTextLeft]}>Register</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.todoItem}
          onPress={() => navigation.navigate("Login")}
        >
          <View style={styles.bubble}>
            <View style={styles.checkbox}></View>
            <Text style={[styles.todoText, styles.todoTextLeft]}>Login</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
  },
  todoItem: {
    width: '100%',
    alignItems: 'center',
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    padding: 10,
    margin: 10,
    width: '90%',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#007bff',
    marginRight: 10,
  },
  todoText: {
    fontSize: 18,
    color: '#333',
  },
  todoTextLeft: {
    flex: 1,
    textAlign: 'left',
  },
});
