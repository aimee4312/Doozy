import {React, useState, useEffect } from 'react';
import { View, Button, TextInput, Keyboard, TouchableWithoutFeedback, StyleSheet, Text } from 'react-native';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../firebaseConfig';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { EmailAuthProvider, updateEmail, updatePassword, reauthenticateWithCredential } from 'firebase/auth';


export default function Settings() {
    const [userProfile, setUserProfile] = useState(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [password, setPassword] = useState('');
    const currentUser = FIREBASE_AUTH.currentUser;

    useEffect(() => {
        fetchUserProfile();
    }, [userProfile]);

    const fetchUserProfile = async () => {``
        if (currentUser) {
            const userProfileRef = doc(FIRESTORE_DB, 'Users', currentUser.uid);

            try {
                const docSnapshot = await getDoc(userProfileRef);
                if (docSnapshot.exists()) {
                    setUserProfile(docSnapshot.data());
                }
            } catch (error) {
                console.error('Error fetching user profile: ', error);
            }
        }
    };

    const updateUserProfile = async () => {
        if (currentUser) {
            const userProfileRef = doc(FIRESTORE_DB, 'Users', currentUser.uid);
    
            try {
                const credential = EmailAuthProvider.credential(currentUser.email, oldPassword);
                await reauthenticateWithCredential(currentUser, credential);
                if (email)
                {
                    updateEmail(currentUser, email);
                    console.log('Email updated!');
                }

                if (password) {
                    await updatePassword(currentUser, password);
                    console.log('Password updated!');
                }
    
                await updateDoc(userProfileRef, {
                    email: email,
                    name: name,
                });
                console.log('Profile updated!');
            } catch (error) {
                console.error('Error updating profile: ', error);
            }
        }
    };
    
    
    

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    return (
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <View style={styles.container}>
                <Text>Name</Text>
                <TextInput
                    placeholder="Name"
                    onChangeText={setName}
                    style={styles.textBoxes}
                />
                <Text>Email</Text>
                <TextInput
                    placeholder="Email"
                    onChangeText={setEmail}
                    style={styles.textBoxes}
                />
                <Text>Old Password</Text>
                <TextInput
                    placeholder="Password"
                    secureTextEntry={true}
                    onChangeText={setOldPassword}
                    style={styles.textBoxes}
                />
                <Text>Password</Text>
                <TextInput
                    placeholder="Password"
                    secureTextEntry={true}
                    onChangeText={setPassword}
                    style={styles.textBoxes}
                />
                <Button
                    onPress={updateUserProfile}
                    title="Save"
                />
            </View>
        </TouchableWithoutFeedback>
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
