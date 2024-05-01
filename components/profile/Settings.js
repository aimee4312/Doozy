import {React, useState, useEffect } from 'react';
import { View, Button, TextInput, Keyboard, TouchableWithoutFeedback, StyleSheet, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../firebaseConfig';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { EmailAuthProvider, updateEmail, updatePassword, reauthenticateWithCredential, verifyBeforeUpdateEmail } from 'firebase/auth';


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
                await updateDoc(userProfileRef, {
                    name: name,
                });

                if (email || password)
                {
                    const credential = EmailAuthProvider.credential(currentUser.email, oldPassword);
                    await reauthenticateWithCredential(currentUser, credential);

                    if (email) {

                        await verifyBeforeUpdateEmail(currentUser, email);
                        console.log("Email verification sent!");
        
                        while (!currentUser.emailVerified) {
                            await currentUser.reload();
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        }

                        await updateDoc(userProfileRef, {
                            email: email,
                        });
        
                        await updateEmail(currentUser, email);
                        console.log('Email updated!');
                    }
        
                    if (password) {
                        await updatePassword(currentUser, password);
                        console.log('Password updated!');
                    }
                }

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
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <View>
                    <Text>New Name</Text>
                    <TextInput
                        placeholder="New Name"
                        onChangeText={setName}
                        style={styles.textBoxes}
                    />
                </View>
                <View>
                    <Text>New Email</Text>
                    <TextInput
                        placeholder="New Email"
                        onChangeText={setEmail}
                        style={styles.textBoxes}
                    />
                </View>
                <View>
                    <Text>Old Password</Text>
                    <TextInput
                        placeholder="Old Password"
                        secureTextEntry={true}
                        onChangeText={setOldPassword}
                        style={styles.textBoxes}
                    />
                </View>
                <View>
                    <Text>New Password</Text>
                    <TextInput
                        placeholder="New Password"
                        secureTextEntry={true}
                        onChangeText={setPassword}
                        style={styles.textBoxes}
                    />
                </View>
                <Button
                    onPress={updateUserProfile}
                    title="Save"
                />
            </KeyboardAvoidingView>
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
