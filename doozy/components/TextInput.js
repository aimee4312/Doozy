import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

const TextInputField = ({ onChangeText, value, placeholder }) => {
    return (
        <TextInput
            style={styles.input}
            onChangeText={onChangeText}
            value={value}
            placeholder={placeholder}
        />
    );
};

const styles = StyleSheet.create({
    input: {
        height: 40,
        width: 200,
        margin: 12,
        borderWidth: 1,
        padding: 10,
    },
});

export default TextInputField;
