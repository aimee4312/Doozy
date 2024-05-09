import React from 'react';
import { View, Text, Button , StyleSheet, SafeAreaView, TextInput, Alert, TouchableOpacity} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';


const Bar = ({ navigation }) => {
    
    return (
        <View style={styles.bar}>
            <TouchableOpacity 
            onPress={() => navigation.navigate('Home')}
            style={[styles.button]}>
                <Text>
                    Home
                </Text>
            </TouchableOpacity>
            <TouchableOpacity 
            onPress={() => navigation.navigate('Login')}
            style={[styles.button]}>
                <Text>
                    Login
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