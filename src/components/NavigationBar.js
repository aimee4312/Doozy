import React from 'react';
import { View, Text, Button , StyleSheet, SafeAreaView, TextInput, Alert, TouchableOpacity} from 'react-native';
import { NavigationContainer, CommonActions } from '@react-navigation/native';
import { FIREBASE_AUTH } from '../../firebaseConfig';


const Bar = ({ navigation }) => {
    const currentUser = FIREBASE_AUTH.currentUser;
    
    const navigateTo = (screen, userID, status) => {
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [
                    {
                        name: screen,
                        params: {userID: userID, status: status}
                    }
                ]
            })
        )
    }
    return (
        <View style={styles.bar}>
            <View style={styles.emptySpace} />
            <TouchableOpacity 
                onPress={() => {navigateTo('Timeline')}}
                style={styles.button}>
                <Text>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                onPress={() => {navigateTo('TaskList')}}
                style={styles.button}>
                <Text>Task</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                onPress={() => {navigateTo('Profile', currentUser.uid, "currentUser")}}
                style={styles.button}>
                <Text>Profile</Text>
            </TouchableOpacity>
            <View style={styles.emptySpace} />
        </View>
    )
}

const styles = StyleSheet.create({
    bar: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
    },
    button: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    emptySpace: {
        flex: 0.001,
    }
})

export default Bar;