import React, { Component, useState } from 'react';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../firebaseConfig';
import { doc, getDoc } from "firebase/firestore";
import { View, Text, Button, StyleSheet, Dimensions, TouchableOpacity} from 'react-native';
import { TabView, SceneMap } from 'react-native-tab-view';
import { CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';


export class NavigationBar extends Component {
    constructor(props) {
        super(props);
    }

    goToLandingScreen = () => {
        this.props.navigation.navigate('Landing');
    }

    goToTaskListScreen = () => {
        this.props.navigation.navigate('TaskList');
    }

    render() { 
        return (
          <View style={styles.container}>
            <View style={styles.buttonContainer}>
              <Button
                onPress={() => this.goToLandingScreen()}
                title="Landing"
              />
            </View>
            <View style={styles.buttonContainer}>
              <Button
                onPress={() => this.goToTaskListScreen()}
                title="TaskList"
              />
            </View>
          </View>
        );
      }
}


const styles = StyleSheet.create({
    buttonContainer: {
        marginBottom: 20,
    },
})

export default NavigationBar;