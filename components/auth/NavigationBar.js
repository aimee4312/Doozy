import React from 'react';
import { View, Text, Button , StyleSheet, SafeAreaView, TextInput, Alert, TouchableOpacity} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';


const Bar = ({ navigation }) => {
    
    return (
        <View style={styles.bar}>
            <View style={styles.emptySpace} />
            <TouchableOpacity 
                onPress={() => navigation.navigate('Timeline')}
                style={styles.button}>
                <Text>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                onPress={() => navigation.navigate('TaskList')}
                style={styles.button}>
                <Text>Task</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                onPress={() => navigation.navigate('Profile')}
                style={styles.button}>
                <Text>Profile</Text>
            </TouchableOpacity>
            <View style={styles.emptySpace} />
        </View>
    )
}

const styles = StyleSheet.create({
    bar: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
    },
    button: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    emptySpace: {
        flex: 0.001,
    }
})

export default Bar;