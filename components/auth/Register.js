import React, { Component, useEffect } from 'react';
import { View, Button, TextInput, StyleSheet, Text, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, ImageBackground } from 'react-native';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { FIREBASE_AUTH, FIRESTORE_DB, FIREBASE_STORAGE } from '../../firebaseConfig';
import { ref, updateMetadata } from "firebase/storage";

class Register extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            email: '',
            username: '',
            password: '',
        };
        this.onSignUp = this.onSignUp.bind(this);
    }

    async onSignUp() {
        const { name, email, username, password } = this.state;
        try {
            const userCredential = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
            const user = userCredential.user;

            const userRef = doc(FIRESTORE_DB, "Users", user.uid);
            await setDoc(userRef, {
                name: name,
                email: email,
                username: username,
                posts: 0,
                profilePic: "https://firebasestorage.googleapis.com/v0/b/doozy-3d54c.appspot.com/o/profilePics%2Fdefault.jpg?alt=media&token=c4b20aae-830c-4d47-aa90-2a3ebd6e16fb"
            });

            const forestRef = ref(FIREBASE_STORAGE, 'profilePics/default.jpg');

            const newMetadata = {
                cacheControl: 'public,max-age=31536000'
              };
              
              // Update metadata properties
              await updateMetadata(forestRef, newMetadata);

            console.log("User information stored in Firestore successfully!");

        } catch (error) {
            console.error("Error signing up and storing user information: ", error);
        }
    }

    goToLoginScreen = () => {
        this.props.navigation.navigate('Login');
    }

    goBackHome = () => {
        this.props.navigation.goBack();
    }

    dismissKeyboard() {
        Keyboard.dismiss();
    }

    render() {
        return (
            <TouchableWithoutFeedback onPress={this.dismissKeyboard}>
                <ImageBackground
                    source={require('../../assets/background2.jpg')}
                    style={styles.backgroundImage}
                    resizeMode="cover"
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.container}
                    >
                        <View style={styles.formContainer}>
                            <Text style={styles.title}>Create an Account</Text>
                            <Text style={styles.label}>Name</Text>
                            <TextInput
                                placeholder="Name"
                                onChangeText={(name) => this.setState({ name })}
                                style={styles.textBox}
                            />
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                placeholder="Email"
                                onChangeText={(email) => this.setState({ email })}
                                style={styles.textBox}
                                keyboardType="email-address"
                            />
                            <Text style={styles.label}>Username</Text>
                            <TextInput
                                placeholder="Username"
                                onChangeText={(username) => this.setState({ username })}
                                style={styles.textBox}
                            />
                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                placeholder="Password"
                                secureTextEntry={true}
                                onChangeText={(password) => this.setState({ password })}
                                style={styles.textBox}
                            />
                            <Button
                                onPress={() => this.onSignUp()}
                                title="Sign Up"
                                color="#007bff"
                            />
                            <Button
                                onPress={this.goToLoginScreen}
                                title="Already have an account?"
                                color="#007bff"
                            />
                            <Button
                                onPress={this.goBackHome}
                                title="Home"
                                color="#ccc"
                                style={styles.smallButton}
                            />
                        </View>
                    </KeyboardAvoidingView>
                </ImageBackground>
            </TouchableWithoutFeedback>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    formContainer: {
        width: '80%',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: 20,
        borderRadius: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    textBox: {
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        width: '100%',
        height: 40,
        paddingHorizontal: 10,
        marginBottom: 20,
    },
    successMessage: {
        color: 'green',
        marginTop: 10,
        textAlign: 'center',
    },
    label: {
        fontSize: 18,
        marginBottom: 5,
        color: '#333',
    },
    backgroundImage: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
    },
    smallButton: {
        fontSize: 12,
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
});

export default Register;
