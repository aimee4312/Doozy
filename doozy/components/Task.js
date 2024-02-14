import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const Task = (props) => {

    const { text, tick, i, complete} = props;

    const checkoff = () => {
        tick(i, complete);
    };

    return (
        <View style={styles.item}>
            <TouchableOpacity style={ complete ? styles.checkedbox : styles.uncheckedbox } key={i} onPress={checkoff}></TouchableOpacity>
            <Text style={styles.itemText}>{text}</Text>
        </View>
    )
}

    const styles = StyleSheet.create({
        item: {
            padding: 15,
            flexDirection: 'row',
            alignItems: 'center',
        },
        checkedbox: {
            width: 24,
            height: 24,
            opacity: 0.4,
            backgroundColor: 'orange',
            borderRadius: 5,
            marginRight: 15,
        },
        uncheckedbox: {
            width: 24,
            height: 24,
            opacity: 0.4,
            backgroundColor: '#55BCF6',
            borderRadius: 5,
            marginRight: 15,
        },
        itemText: {
            maxWidth: '80%',
        },
    });

export default Task;