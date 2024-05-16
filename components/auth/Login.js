import React, { Component } from 'react';
import { View, Button, TextInput, StyleSheet, Text, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import { FIREBASE_AUTH } from '../../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';


export class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: ''
        }
        this.onSignUp = this.onSignIn.bind(this);

    }

    onSignIn() {
        const { email, password } = this.state;
        signInWithEmailAndPassword(FIREBASE_AUTH, email, password)
            .then((result) => {
                console.log(result)
                this.props.navigation.navigate('TaskList');
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
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.container}
                >
                    <View style={styles.container}>
                        <Text>Email</Text>
                        <TextInput
                            placeholder="Email"
                            onChangeText={(email) => this.setState({ email })}
                            style={styles.textBoxes}
                        />
                        <Text>Password</Text>
                        <TextInput
                            placeholder="Password"
                            secureTextEntry={true}
                            onChangeText={(password) => this.setState({ password })}
                            style={styles.textBoxes}
                        />
                        <Button
                            onPress={() => this.onSignIn()}
                            title="Sign In"
                        />
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

export default Login