import React from 'react';
import { View, Text, Button, StyleSheet, SafeAreaView, TextInput, Alert } from 'react-native';

const Signup = () => {
    const [username, setUsername] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [passConfirmation, setPasswordConfirmation] = React.useState('');
    const [usernameError, setUsernameError] = React.useState('');
    const [emailError, setEmailError] = React.useState('');
    const [passwordError, setPasswordError] = React.useState('');
    const [passConfirmationError, setPassConfirmationError] = React.useState('');
    const handleSignUp = () => {
        setUsernameError('');
        setEmailError('');
        setPasswordError('');
        setPassConfirmationError('');

        let isValid = true;

        if (!username) {
            setUsernameError('Username is required');
            isValid = false;
        }

        if (!email) {
            setEmailError('Email is required');
            isValid = false;
        }

        if (!password) {
            setPasswordError('Password is required');
            isValid = false;
        } else if (password.length < 8) {
            setPasswordError('Password must be at least 8 characters long');
            isValid = false;
        } else if (!/(?=.*[a-z])/.test(password)) {
            setPasswordError('Password must contain at least one lowercase letter');
            isValid = false;
        } else if (!/(?=.*[A-Z])/.test(password)) {
            setPasswordError('Password must contain at least one uppercase letter');
            isValid = false;
        } else if (!/(?=.*\d)/.test(password)) {
            setPasswordError('Password must contain at least one number');
            isValid = false;
        } else if (!/(?=.*\W)/.test(password)) {
            setPasswordError('Password must contain at least one special character');
            isValid = false;
        }

        if (!passConfirmation) {
            setPassConfirmationError('Please confirm your password');
            isValid = false;
        } else if (password !== passConfirmation) {
            setPassConfirmationError('Passwords do not match');
            isValid = false;
        }

        if (isValid) {
            // If all validations pass, sign up logic can be added here
            console.log('Signed up successfully');
            Alert.alert('Signed up successfully');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.title}>
                <Text>Signup screen</Text>
            </View>
            <View style={styles.content}>
                <TextInput
                    style={styles.input}
                    onChangeText={setUsername}
                    value={username}
                    placeholder="Username"
                />
                {usernameError ? <Text style={styles.error}>{usernameError}</Text> : null}
                <TextInput
                    style={styles.input}
                    onChangeText={setEmail}
                    value={email}
                    placeholder="Email"
                    keyboardType="email-address"
                />
                {emailError ? <Text style={styles.error}>{emailError}</Text> : null}
                <TextInput
                    style={styles.input}
                    onChangeText={setPassword}
                    value={password}
                    placeholder="Password"
                    secureTextEntry={true}
                />
                {passwordError ? <Text style={styles.error}>{passwordError}</Text> : null}
                <TextInput
                    style={styles.input}
                    onChangeText={setPasswordConfirmation}
                    value={passConfirmation}
                    placeholder="Confirm Password"
                    secureTextEntry={true}
                />
                {passConfirmationError ? <Text style={styles.error}>{passConfirmationError}</Text> : null}
                <Button
                    title="Sign up"
                    onPress={handleSignUp}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    content: {
        alignItems: 'center',
    },
    title:{
        alignItems: 'center'
    },
    input: {
        height: 40,
        width: 200,
        margin: 12,
        borderWidth: 1,
        padding: 10,
      },
});

export default Signup;