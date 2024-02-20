import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';

const Task = (props) => {

    const { text, tick, i, complete, deleteItem} = props;

    const checkoff = () => {
        tick(i, complete);
    };

    const deleteItemHelper = () => {
        deleteItem(i, complete);
    }

    const RightActions = ({ onPress }) => {

        return (
            <TouchableOpacity onPress={onPress}>
                <View style={styles.rightAction}>
                    <Text style={styles.rightActionText}>Delete</Text>
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <Swipeable 
            renderRightActions={() => <RightActions onPress={deleteItemHelper} />}>
            <View style={styles.item}>
                <TouchableOpacity style={ complete ? styles.checkedbox : styles.uncheckedbox } key={i} onPress={checkoff}></TouchableOpacity>
                <Text style={styles.itemText}>{text}</Text>
            </View>
        </Swipeable>
    )
}

    const styles = StyleSheet.create({
        item: {
            padding: 15,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'white',
            borderRadius: 5,
        },
        checkedbox: {
            width: 24,
            height: 24,
            opacity: 0.4,
            backgroundColor: '#55BCF6',
            borderRadius: 5,
            marginRight: 15,
        },
        uncheckedbox: {
            width: 24,
            height: 24,
            opacity: 0.4,
            backgroundColor: 'grey',
            borderRadius: 5,
            marginRight: 15,
        },
        itemText: {
            maxWidth: '80%',
        },
        rightAction: {
            backgroundColor: 'red',
            justifyContent: 'center',
            alignItems: 'flex-end',
            borderBottomRightRadius: 5,
            borderTopRightRadius: 5,
        },
        rightActionText: {
            color: 'white',
            fontWeight: '600',
            padding: 20,
        }
    });

export default Task;