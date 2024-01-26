import React from 'react';
import { View, Text, Button , StyleSheet, SafeAreaView, TextInput, Alert} from 'react-native';

const Login = () => {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text>Login screen</Text>
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
                 <Button
                    title="Login"
                    onPress={() => {
                    console.log('Button pressed');
                    Alert.alert('Logged in');
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
});

export default Login;