import { SafeAreaView, StyleSheet, TextInput, Text, View, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, TouchableOpacity } from 'react-native';
import UploadImage from '../components/profile/profilePic';
import {Ionicons} from '@expo/vector-icons';

const EditProfileScreen = ({route, navigation}) => {

    const {user} = route.params;

    const openNameEdit = () => {
        navigation.navigate("EditField", {
            user: user,
            fieldName: "Name", 
            fieldInput: user.name, //might have to change this
            description: "description", 
            placeholder: "required", 
        })
    }

    const openUsernameEdit = () => {
        navigation.navigate("EditField", {
            user: user,
            fieldName: "Username", 
            fieldInput: user.username,
            description: "description", 
            placeholder: "required", 
        })
    }

    const openBioEdit = () => {
        navigation.navigate("EditField", {
            user: user,
            fieldName: "Bio", 
            fieldInput: user.bio,
            description: "description", 
            placeholder: "optional", 
        })
    }

    // profile pic, name, username, bio
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topContainer}>
              <TouchableOpacity onPress={navigation.goBack}>
                <Ionicons name='chevron-back' size={24} color='black'/>
              </TouchableOpacity>
          </View>
            <TouchableWithoutFeedback style={{flex: 1}} onPress={() => {Keyboard.dismiss()}}>
                <KeyboardAvoidingView style={styles.editContainer}>
                    <UploadImage userID={user.id} />
                    <TouchableOpacity onPress={openNameEdit}style={styles.textEditContainer}>
                        <Text style={styles.prompt}>Name</Text>
                        <Text style={styles.textInput}>{user.name}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={openUsernameEdit} style={styles.textEditContainer}>
                        <Text style={styles.prompt}>Username</Text>
                        <Text style={styles.textInput}>{user.username}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={openBioEdit} style={styles.textEditContainer}>
                        <Text style={styles.prompt}>Bio</Text>
                        <Text style={styles.textInput}>{user.bio}</Text>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
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
    },
    editContainer: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        margin: 10,
        alignItems: 'center',
        flex: 1
    },
    textEditContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10
    },
    prompt: {
        fontSize: 18,
        flex: 3
    },
    textInput: {
        fontSize: '18',
        flex: 7
    }
});

export default EditProfileScreen;