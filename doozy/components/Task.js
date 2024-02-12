import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const Task = (props) => {

    return (
        <View style={styles.item}>
            <TouchableOpacity style={styles.checkbox}></TouchableOpacity>
            <Text style={styles.itemText}>{props.text}</Text>
        </View>
    )
}

    const styles = StyleSheet.create({
        item: {
            padding: 15,
            flexDirection: 'row',
            alignItems: 'center',
        },
        checkbox: {
            width: 24,
            height: 24,
            backgroundColor: '#55BCF6',
            opacity: 0.4,
            borderRadius: 5,
            marginRight: 15,
        },
        itemText: {
            maxWidth: '80%',
        },
    });

export default Task;