import React, { useState, useEffect } from 'react';
import { View, Button, TextInput, Keyboard, TouchableWithoutFeedback, StyleSheet, Text, KeyboardAvoidingView, Platform, ImageBackground, SafeAreaView, TouchableOpacity } from 'react-native';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../firebaseConfig';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { EmailAuthProvider, updateEmail, updatePassword, reauthenticateWithCredential, verifyBeforeUpdateEmail, signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import fonts from '../theme/fonts';

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
        <SafeAreaView style={styles.container}>
            <View style={styles.topContainer}>
                <TouchableOpacity onPress={navigation.goBack} style={{ width: 50 }}>
                    <Ionicons name='chevron-back' size={24} color={colors.primary} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.title}>Settings</Text>
                </View>
                <View style={{ width: 50 }} />
            </View>
            <Button
                onPress={onLogout}
                title="Logout"
                color="#007AFF"
            />
        </SafeAreaView>

    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topContainer: {
        marginHorizontal: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    title: {
        fontFamily: fonts.bold,
        color: colors.primary,
        fontSize: 18,
    },

});
