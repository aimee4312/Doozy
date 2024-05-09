import React from 'react';
import { View, Text, Button , StyleSheet, SafeAreaView, TextInput, Alert, TouchableOpacity} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';


const Bar = ({ navigation }) => {
    
    return (
        <View style={styles.bar}>
            <TouchableOpacity 
            onPress={() => navigation.navigate('Landing')}
            style={[styles.button]}>
                <Text>
                    Landing
                </Text>
            </TouchableOpacity>
            <TouchableOpacity 
            onPress={() => navigation.navigate('TaskList')}
            style={[styles.button]}>
                <Text>
                    TaskList
                </Text>
            </TouchableOpacity>
        </View>
    )
}



const styles = StyleSheet.create({
    bar: {
        backgroundColor: 'skyblue',
        flexDirection: 'row',
    },
    button: {
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginHorizontal: '1%',
        marginBottom: 6,
        minWidth: '50%',
        textAlign: 'center',
    }
})

export default Bar;