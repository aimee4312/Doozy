import { SafeAreaView, StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import CheckedPostReceived from "../assets/checked-post-received.svg";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import fonts from "../theme/fonts";
import colors from "../theme/colors";
import { getTimePassedString } from '../utils/timeFunctions'


const PostScreen = ({ route, navigation }) => {
    const { post, user } = route.params;

    return (
        <SafeAreaView style={styles.postContainer}>
            <View style={styles.topContainer}>
                <TouchableOpacity onPress={navigation.goBack}>
                    <Ionicons name='chevron-back' size={24} color='black' />
                </TouchableOpacity>
            </View>
            <View style={styles.profileInfo}>
                <Image source={{ uri: user.profilePic }} style={styles.profilePic} />
                <Text style={styles.username}>{user.username}</Text>
            </View>
            {post.image && <Image source={{ uri: post.image }} style={styles.postImage} />}
            <View style={styles.taskInfo}>
                <View style={styles.titleContainer}>
                    <View style={styles.postNameContainer}>
                        <CheckedPostReceived width={32} height={32} />
                        <Text style={styles.taskName}>{post.postName}</Text>
                    </View>
                    {post.description !== "" && <View style={styles.descriptionContainer}>
                        <MaterialCommunityIcons name={"text"} size={16} color={colors.primary} />
                        <Text style={styles.taskDescription}>{post.description}</Text>
                    </View>}
                    <Text style={styles.taskDate}>{getTimePassedString(post.timePosted)}</Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    
    postContainer: {
        flex: 1,
      },
    topContainer: {
        marginHorizontal: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
      profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
      },
      profilePic: {
        width: 40,
        height: 40,
        borderRadius: 40,
        marginRight: 10,
      },
      username: {
        fontFamily: fonts.bold,
        color: colors.primary,
      },
      postImage: {
        width: '100%',
        height: 300,
      },
      taskInfo: {
        paddingTop: 10,
      },
      postNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 5,
        paddingRight: 10,
        paddingBottom: 10
      },
      taskName: {
        marginLeft: 5,
        fontFamily: fonts.bold,
        fontSize: 16,
        color: colors.primary,
      },
      descriptionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        marginHorizontal: 10,
    
      },
      taskDescription: {
        fontSize: 14,
        fontFamily: fonts.regular,
        color: colors.primary,
        paddingLeft: 10,
      },
      taskDate: {
        paddingLeft: 10,
        fontSize: 14,
        color: colors.fade,
      },
      backgroundImage: {
        flex: 1,
        width: '100%',
      },
});

export default PostScreen;