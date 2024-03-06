import React, { Component } from 'react';
import { View, Button, TextInput, StyleSheet, TouchableWithoutFeedback, Keyboard, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../firebaseConfig';

export class Register extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            email: '',
            password: '',
            friends: '0',
            posts: '0',
            profilePic: 'null',
            emailSent: false,
        }
        this.onSignUp = this.onSignUp.bind(this);
    }

    async onSignUp() {
        const { name, email, password, friends, posts, profilePic } = this.state;
        try {
            const userCredential = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
            const user = userCredential.user;
    
            await sendEmailVerification(user);
            console.log("Email sent!");

            while (!user.emailVerified) {
                await user.reload();
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            const userRef = doc(FIRESTORE_DB, "Users", user.uid);
            await setDoc(userRef, {
                name: name,
                email: email,
                password: password,
                friends: friends,
                posts: posts,
                profilePic: profilePic,
            });
            console.log("User information stored in Firestore successfully!");
        } catch (error) {
            console.error("Error signing up and storing user information: ", error);
        }
    }

    goToLoginScreen = () => {
        this.props.navigation.navigate('Login');
    }

    dismissKeyboard() {
        Keyboard.dismiss();
    }

    render() {
        return (
            <TouchableWithoutFeedback onPress={this.dismissKeyboard}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.container}
                >
                    <View style={styles.container}>
                        <TextInput
                            placeholder="Name"
                            onChangeText={(name) => this.setState({ name })}
                            style={styles.textBoxes}
                        />
                        <TextInput
                            placeholder="Email"
                            onChangeText={(email) => this.setState({ email })}
                            style={styles.textBoxes}
                        />
                        <TextInput
                            placeholder="Password"
                            secureTextEntry={true}
                            onChangeText={(password) => this.setState({ password })}
                            style={styles.textBoxes}
                        />
                        <Button
                            onPress={() => {
                                this.onSignUp();
                                this.setState({ emailSent: true });
                            }}
                            title="Sign Up"
                        />
                        {this.state.emailSent && <Text>Email sent!</Text>}
                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        )
    }
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

export default Register