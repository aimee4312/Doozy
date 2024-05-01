import { React, useState } from 'react'
import { View, Text, TextInput, Button, TouchableWithoutFeedback, KeyboardAvoidingView, Keyboard, StyleSheet, Platform, Image, TouchableOpacity } from 'react-native'
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../firebaseConfig';
import { doc, collection, addDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import UploadImage from '../profile/profilePic';
import { AntDesign } from '@expo/vector-icons';

export default function Task_db() {
    const [taskName, setTaskName] = useState('');
    const [description, setDescription] = useState('');
    const [folder, setFolder] = useState('');
    const [completed, setCompleted] = useState(false);
    const [image, setImage] = useState(null);
    const currentUser = FIREBASE_AUTH.currentUser;

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    const addImage = async () => {
        let _image = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
        console.log(JSON.stringify(_image));
        if (!_image.cancelled) {
            setImage(_image.assets[0].uri);
        }
    };

    const storeTask = () => {
        if (currentUser) {
            const userProfileRef = doc(FIRESTORE_DB, 'Users', currentUser.uid);
            const tasksRef = collection(userProfileRef, 'Tasks');
            if (folder) {
                const folderRef = collection(tasksRef, 'Folders', folder);
                return addDoc(folderRef, {
                    title: taskName,
                    description: description,
                    completed: completed,
                    image: image,
                }).then(() => {
                    console.log("Task stored successfully!");
                }).catch((error) => {
                    console.error("Error storing task:", error);
                });

            } else {
                return addDoc(tasksRef, {
                    title: taskName,
                    description: description,
                    completed: completed,
                    image: image,
                }).then(() => {
                    console.log("Task stored successfully!");
                }).catch((error) => {
                    console.error("Error storing task:", error);
                });
            }
        } else {
            console.error("Current user not found.");
        }

    }

    return (
        <View>
            <View>
                <View style={styles.picContainer}>
                    {
                        image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />
                    }
                    <View style={styles.uploadBtnContainer}>
                        <TouchableOpacity onPress={addImage} style={styles.uploadBtn} >
                            <Text>{image ? 'Edit' : 'Upload'} Image</Text>
                            <AntDesign name="camera" size={20} color="black" />
                        </TouchableOpacity>
                    </View>
                </View>
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
                <Text>Folder</Text>
                <TextInput
                    placeholder="Folder"
                    onChangeText={setFolder}
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
    },

    picContainer: {
        elevation: 2,
        height: 150,
        width: 150,
        backgroundColor: '#efefef',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: 20,
        marginTop: 0,
    },
    uploadBtnContainer: {
        opacity: 0.7,
        position: 'absolute',
        right: 0,
        bottom: 0,
        backgroundColor: 'lightgrey',
        width: '100%',
        height: '25%',
    },
    uploadBtn: {
        display: 'flex',
        alignItems: "center",
        justifyContent: 'center'
    }
})