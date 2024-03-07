import React, { Component } from 'react'
import { View, Button, TextInput, StyleSheet, TouchableWithoutFeedback, Keyboard } from 'react-native'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../firebaseConfig'

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
        }
        this.onSignUp = this.onSignUp.bind(this);
    }

    onSignUp() {
        const { name, email, password, friends, posts, profilePic } = this.state;
        createUserWithEmailAndPassword(FIREBASE_AUTH, email, password)
            .then((userCredential) => {
                const user = userCredential.user;

                const userRef = doc(FIRESTORE_DB, "Users", user.uid);
                return setDoc(userRef, {
                    name: name,
                    email: email,
                    password: password,
                    friends: friends,
                    posts: posts,
                    profilePic: profilePic,
                })
                    .then(() => {
                        console.log("User information stored in Firestore successfully!");
                    })
                    .catch((error) => {
                        console.error("Error storing user information in Firestore: ", error);
                    });
            })
            .catch((error) => {
                console.log(error)
            });
    }

    dismissKeyboard() {
        Keyboard.dismiss();
    }

    render() {
        return (
            <TouchableWithoutFeedback onPress={this.dismissKeyboard}>
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
                        onPress={() => this.onSignUp()}
                        title="Sign Up"
                    />
                </View>
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