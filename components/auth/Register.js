import React, { Component } from 'react';
import { View, Button, TextInput } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../firebaseConfig';
import { collection } from 'firebase/firestore';


export class Register extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            email: '',
            password: ''
        }
        this.onSignUp = this.onSignUp.bind(this);
    }

    onSignUp() {
        const { name, email, password } = this.state;
        createUserWithEmailAndPassword(FIREBASE_AUTH, email, password)
        .then((result) => {
            collection(FIRESTORE_DB, "users")
            .doc(FIREBASE_AUTH.currentUser.uid)
            .set({
                name,
                email,
                password
            })
            console.log(result)
        })
        .catch((error) => {
            console.log(error)
        });
    }

    render() {
        return (
        <View>
            <TextInput
                placeholder="name"
                onChangeText={(name) => this.setState({ name })}
            />
            <TextInput
                placeholder="email"
                onChangeText={(email) => this.setState({ email })}
            />
            <TextInput
                placeholder="password"
                secureTextEntry={true}
                onChangeText={(password) => this.setState({ password })}
            />
            <Button
                onPress={() => this.onSignUp()}
                title="Sign Up"
            />
        </View>
        )
    }
}

export default Register