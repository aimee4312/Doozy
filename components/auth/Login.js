import React, { Component } from 'react';
import { View, Button, TextInput, StyleSheet, Text, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, ImageBackground } from 'react-native';
import { FIREBASE_AUTH } from '../../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: ''
        };
        this.onSignIn = this.onSignIn.bind(this);
    }

    onSignIn() {
        const { email, password } = this.state;
        signInWithEmailAndPassword(FIREBASE_AUTH, email, password)
            .then((result) => {
                console.log(result);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    goBackHome() {
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
                        <Text style={styles.title}>Login</Text>
                        <View style={styles.formContainer}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                placeholder="Email"
                                onChangeText={(email) => this.setState({ email })}
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
                                onPress={() => this.onSignIn()}
                                title="Sign In"
                                color="#007bff"
                            />
                            <Button
                                onPress={() => this.goBackHome()}
                                title="Home"
                                color="#CCC"
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
    label: {
        fontSize: 18,
        marginBottom: 5,
        color: '#333',
        textAlign: 'left',
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'left',
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

export default Login;
