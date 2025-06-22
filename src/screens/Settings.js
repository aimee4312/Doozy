import React, { useState, useEffect } from 'react';
import { View, Button, TextInput, Keyboard, TouchableWithoutFeedback, StyleSheet, Text, KeyboardAvoidingView, Platform, ImageBackground } from 'react-native';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../firebaseConfig';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { EmailAuthProvider, updateEmail, updatePassword, reauthenticateWithCredential, verifyBeforeUpdateEmail, signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

export default function Settings() {
    const [userProfile, setUserProfile] = useState(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [password, setPassword] = useState('');
    const currentUser = FIREBASE_AUTH.currentUser;
    const navigation = useNavigation();

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
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

                if (email || password) {
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

    const onLogout = () => {
        signOut(FIREBASE_AUTH)
        .then(() => {
            console.log("User signed out");
        })
        .catch(error => {
            console.error("Error signing out: ", error);
        });
    };

    return (
            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.container}
                >
                    <View style={styles.formContainer}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>New Name</Text>
                            <TextInput
                                placeholder="New Name"
                                onChangeText={setName}
                                style={[styles.input, styles.inputBackground]}
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>New Email</Text>
                            <TextInput
                                placeholder="New Email"
                                onChangeText={setEmail}
                                style={[styles.input, styles.inputBackground]}
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Old Password</Text>
                            <TextInput
                                placeholder="Old Password"
                                secureTextEntry={true}
                                onChangeText={setOldPassword}
                                style={[styles.input, styles.inputBackground]}
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>New Password</Text>
                            <TextInput
                                placeholder="New Password"
                                secureTextEntry={true}
                                onChangeText={setPassword}
                                style={[styles.input, styles.inputBackground]}
                            />
                        </View>
                        <Button
                            onPress={updateUserProfile}
                            title="Save"
                            color="#007AFF"
                        />
                        <Button
                            onPress={onLogout}
                            title="Logout"
                            color="#007AFF"
                        />
                    </View>
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
    formContainer: {
        width: '80%',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: 20,
        borderRadius: 10,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        color: '#333',
    },
    input: {
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        width: '100%',
        height: 40,
        paddingHorizontal: 10,
    },
    inputBackground: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
    },
    backgroundImage: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
    },
});
