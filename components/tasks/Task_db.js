import { React, useState } from 'react'
import { View, Text, TextInput, Button, TouchableWithoutFeedback, KeyboardAvoidingView, Keyboard, StyleSheet, Platform } from 'react-native'
import CheckBox from '@react-native-community/checkbox';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../firebaseConfig';
import { doc, collection, addDoc } from 'firebase/firestore';

export default function Task_db() {
    const [taskName, setTaskName] = useState('');
    const [description, setDescription] = useState('');
    const [completed, setCompleted] = useState(false);
    const currentUser = FIREBASE_AUTH.currentUser;

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    const storeTask = () => {
        if (currentUser) {
            const userProfileRef = doc(FIRESTORE_DB, 'Users', currentUser.uid);
            const tasksRef = collection(userProfileRef, 'Tasks');

            return addDoc(tasksRef, {
                title: taskName,
                description: description,
                completed: completed
            }).then(() => {
                console.log("Task stored successfully!");
            }).catch((error) => {
                console.error("Error storing task:", error);
            });
        } else {
            console.error("Current user not found.");
        }

    }

    return (
        <View>
            <View>
                <Text>Task Name</Text>
                <TextInput
                    placeholder="Task Name"
                    onChangeText={setTaskName}
                    style={styles.textBoxes}
                />
            </View>
            <View>
                <Text>Description</Text>
                <TextInput
                    placeholder="Description"
                    onChangeText={setDescription}
                    style={styles.textBoxes}
                />
            </View>
            <View>
                <Text>Completed</Text>
            </View>
            <Button
                onPress={storeTask}
                title="Save"
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },

    textBoxes: {
        fontSize: 20,
        borderWidth: 1,
        borderColor: '#000000',
        borderRadius: 20,
        width: 200,
        height: 40,
        paddingHorizontal: 10,
        marginBottom: 30,
    }
})