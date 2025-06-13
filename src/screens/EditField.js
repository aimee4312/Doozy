import { Text } from "react-native";
import { SafeAreaView, StyleSheet, View, TouchableOpacity, TextInput } from "react-native";
import {Ionicons} from '@expo/vector-icons';
import { useState } from "react";
import { updateNameField, updateUsernameField, updateBioField } from '../utils/checkFieldFunctions';
import { StackActions } from '@react-navigation/native';


const EditFieldScreen = ({route, navigation}) => {
    const {user, fieldName, fieldInput, description, placeholder} = route.params;

    const [field, setField] = useState(fieldInput);

    const handleUpdateField = async() => {
        try {
            let tempUser = user;
            if (fieldName == "Name") {
                await updateNameField(field);
                tempUser.name = field
            }
            else if (fieldName == "Username") {
                await updateUsernameField(field);
                tempUser.username = field;
            }
            else {
                await updateBioField(field);
                tempUser.bio = field;
            }
            navigation.dispatch(StackActions.popTo('EditProfile', {
                user: tempUser,
            }))
        } catch (e) {
            console.log(e)
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topContainer}>
                <TouchableOpacity onPress={navigation.goBack}>
                    <Ionicons name='chevron-back' size={24} color='black'/>
                </TouchableOpacity>
                <TouchableOpacity>
                    <Text onPress={handleUpdateField} style={styles.saveText}>Save</Text>
                </TouchableOpacity>
            </View>
            <View>
                <Text>{fieldName}</Text>
                <TextInput
                    style={styles.textInput}
                    onChangeText={text => setField(text)}
                    value={field}
                    placeholder={placeholder}
                    autoCorrect={false}
                    autoFocus={true}
                />
                <Text>{description}</Text>
            </View>
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topContainer: {
        marginHorizontal: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    saveText: {
        fontSize: 18,
        textAlign: 'center',
        color: 'blue',
        fontWeight: 'bold'
    },
})

export default EditFieldScreen;