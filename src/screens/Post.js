import { useEffect, useState } from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity, Modal, TouchableWithoutFeedback } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import CheckedPostReceived from "../assets/checked-post-received.svg";
import { MaterialCommunityIcons, Ionicons, FontAwesome } from "@expo/vector-icons";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import fonts from "../theme/fonts";
import colors from "../theme/colors";
import { getTimePassedString } from '../utils/timeFunctions'
import { sendLike } from "../utils/userReactionFunctions";
import CommentModal from "../components/timeline/CommentModal";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

//CHAGE EVERYTING
const PostScreen = ({ route, navigation }) => {
  const { post, user } = route.params;

  const [isCommentModalVisible, setCommentModalVisible] = useState(false);
  const [tempPost, setTempPost] = useState([post]);
  const [liked, setLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const toggleCommentModal = () => {
    setCommentModalVisible(!isCommentModalVisible);
  }

  const toggleLike = async (postID) => {
    if (isLiking) return;
    try {
      setIsLiking(true);
      await sendLike(postID, liked);
      setTempPost(prevPosts =>
        prevPosts.map(post =>
          true
            ? { ...post, likeCount: liked ? post.likeCount - 1 : post.likeCount + 1 }
            : post
        )
      )
      setLiked(!liked);
    } catch (error) {
      console.error("Error liking post:", error);
    } finally {
      setIsLiking(false);
    }
  }

  const likeOnly = async (postID) => {
    if (!liked) {
      toggleLike(postID);
    }
  }

  function doubleTapGesture(postID) {
    return Gesture.Tap().numberOfTaps(2).maxDuration(250).onEnd(() => {
      likeOnly(postID, liked);
    }).runOnJS(true);
  }

  const setLikeStatus = async () => {
    const currentUser = FIREBASE_AUTH.currentUser;
    const currUserLikeRef = doc(FIRESTORE_DB, 'Users', currentUser.uid, 'LikedPosts', post.id)
    const likedSnapshot = await getDoc(currUserLikeRef);
    setLiked(likedSnapshot.exists());
    console.log(likedSnapshot.exists());
  }

  useEffect(() => {
    setLikeStatus();
  }, [])

  return (
    <SafeAreaView style={styles.postContainer}>
      <Modal
        visible={isCommentModalVisible}
        transparent={true}
        animationType='slide'
      >
        <TouchableWithoutFeedback onPress={() => toggleCommentModal(null)}>
          <View style={{ flex: 1 }}>
          </View>
        </TouchableWithoutFeedback>
        <CommentModal
          navigation={navigation}
          postID={tempPost[0].id}
          toggleCommentModal={toggleCommentModal}
          setPosts={setTempPost}
        />
      </Modal>
      <View style={styles.topContainer}>
        <TouchableOpacity onPress={navigation.goBack}>
          <Ionicons name='chevron-back' size={24} color='black' />
        </TouchableOpacity>
      </View>
      <View style={styles.profileInfo}>
        <Image source={{ uri: user.profilePic }} style={styles.profilePic} />
        <Text style={styles.username}>{user.username}</Text>
      </View>
      {tempPost[0].image &&
        <GestureDetector gesture={doubleTapGesture(tempPost[0].id)}>
          <Image source={{ uri: tempPost[0].image }} style={styles.postImage} />
        </GestureDetector>}
      <View style={styles.taskInfo}>
        {tempPost[0].image && <View style={styles.reactionContainer}>
          <View style={styles.reaction}>
            <TouchableOpacity onPress={() => toggleLike(tempPost[0].id)}>
              {liked ? (<FontAwesome name='heart' size={24} color={colors.red} />)
                :
                (<FontAwesome name='heart-o' size={24} color={colors.primary} />)}
            </TouchableOpacity>
            <Text style={styles.count}>{tempPost[0].likeCount}</Text>
          </View>
          <View style={styles.reaction}>
            <TouchableOpacity onPress={() => { toggleCommentModal() }}>
              <Ionicons name='chatbubble-outline' size={26} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.count}>{tempPost[0].commentCount}</Text>
          </View>
        </View>}
        <View style={styles.postNameContainer}>
          <CheckedPostReceived width={32} height={32} />
          <Text style={styles.taskName}>{tempPost[0].postName}</Text>
        </View>
        {tempPost[0].description !== "" && <View style={styles.descriptionContainer}>
          <MaterialCommunityIcons name={"text"} size={16} color={colors.primary} />
          <Text style={styles.taskDescription}>{tempPost[0].description}</Text>
        </View>}
        {!tempPost[0].image && <View style={styles.reactionContainer}>
          <View style={styles.reaction}>
            <TouchableOpacity onPress={() => toggleLike(tempPost[0].id)}>
              {liked ? (<FontAwesome name='heart' size={24} color={colors.red} />)
                :
                (<FontAwesome name='heart-o' size={24} color={colors.primary} />)}
            </TouchableOpacity>
            <Text style={styles.count}>{tempPost[0].likeCount}</Text>
          </View>
          <View style={styles.reaction}>
            <TouchableOpacity onPress={() => { toggleCommentModal() }}>
              <Ionicons name='chatbubble-outline' size={26} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.count}>{tempPost[0].commentCount}</Text>
          </View>
        </View>}
        <Text style={styles.taskDate}>{getTimePassedString(tempPost[0].timePosted)}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  postContainer: {
    flex: 1,
    backgroundColor: colors.background,
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
    marginBottom: 10,
  },
  taskInfo: {
    marginHorizontal: 5,
  },
  postNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 5,
    paddingBottom: 5
  },
  reactionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingBottom: 5,
      paddingLeft: 10,
    },
    reaction: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    count: {
      fontFamily: fonts.regular,
      color: colors.primary,
      fontSize: 14,
      marginLeft: 5,
      minWidth: 20,
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