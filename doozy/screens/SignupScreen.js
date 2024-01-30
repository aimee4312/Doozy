import React from 'react';
import { View, Text, Button, StyleSheet, SafeAreaView, TextInput, Alert } from 'react-native';

const Signup = () => {
    const [username, setUsername] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [pass_confirmation, setPasswordConfirmation] = React.useState('');
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
                <TextInput
                    style={styles.input}
                    onChangeText={setEmail}
                    value={email}
                    placeholder="Email"
                />
                <TextInput
                    style={styles.input}
                    onChangeText={setPassword}
                    value={password}
                    placeholder="Password"
                />
                <TextInput
                    style={styles.input}
                    onChangeText={setPasswordConfirmation}
                    value={pass_confirmation}
                    placeholder="Confirm Password"
                />
                 <Button
                    title="Sign up"
                    onPress={() => {
                    console.log('Button pressed');
                    Alert.alert('Signed Up');
                    }}
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