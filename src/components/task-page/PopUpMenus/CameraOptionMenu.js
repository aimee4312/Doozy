import { Feather, MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native"


const CameraOptionMenu = (props) => {
    const {onChoose} = props;

    return (
        <SafeAreaView style={styles.modalContainer}>
            <TouchableOpacity onPress={() => onChoose("camera")} style={styles.option}>
                <Feather name="camera" size={18} color="black" style={styles.icon}/>
                <Text style={styles.text}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onChoose("library")} style={styles.option}>
                <MaterialIcons name="photo-library" size={18} color="black" style={styles.icon}/>
                <Text style={styles.text}>Choose Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onChoose("no photo")} style={styles.option}>
                <Feather name="camera-off" size={18} color="black" style={styles.icon}/>
                <Text style={styles.text}>No Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onChoose("cancel")} style={styles.option}>
                <Text style={{color: 'red', ...styles.text}}>Cancel</Text>
            </TouchableOpacity>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    modalContainer: {
        backgroundColor: 'grey',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingLeft: 20,
        paddingRight: 20,
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'column',
    },
    option: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center'
    },
    icon: {
        marginRight: 10,
    },
    text: {
        fontSize: 18,
        fontWeight: '500'
    }
})

export default CameraOptionMenu;