import React, { createContext, useContext, useState, useRef, forwardRef, useEffect } from 'react';
import { StyleSheet, ScrollView, Alert, TextInput, Text, View, Button, Keyboard, KeyboardAvoidingView, Platform, TouchableOpacity, TouchableWithoutFeedback, Modal} from 'react-native';
import Task from '../components/task-page/Task';
import TaskCreation from '../components/task-page/TaskCreation';
import EditTask from '../components/task-page/EditTask';
import ListSelect from '../components/task-page/ListSelect';
import { doc, collection, getDoc, addDoc, getDocs, deleteDoc, updateDoc, runTransaction, writeBatch, increment, query, where, onSnapshot, arrayRemove, arrayUnion } from 'firebase/firestore';
import { FIREBASE_AUTH, FIRESTORE_DB, uploadToFirebase } from '../firebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, deleteObject } from "firebase/storage";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Drawer } from 'react-native-drawer-layout';



const TaskListScreen = (props) => {

    const {listId, setListId} = props;

    const [taskItems, setTaskItems] = useState([]);
    const [completedTaskItems, setCompletedTaskItems] = useState([]);
    const [listItems, setListItems] = useState([]);
    const [isEditTaskVisible, setEditTaskVisible] = useState(false);
    const [editIndex, setEditIndex] = useState();
    const [openDrawer, setOpenDrawer] = useState(false);
    const [userProfile, setUserProfile] = useState()
    const unsubscribeRef = useRef();
    const currentUser = FIREBASE_AUTH.currentUser;


    useEffect(() => {
        const unsubscribeTasks = fetchTasks();
        const unsubscribePosts = fetchPosts();
        const unsubscribeLists = fetchLists();
        const unsubscribeUserProfile = fetchUserProfile();

        unsubscribeRef.current = [unsubscribeTasks, unsubscribePosts, unsubscribeLists, unsubscribeUserProfile];
        return () => {
            unsubscribeRef.current.forEach(unsub => unsub());
        };
    }, [listId]);

    function fetchTasks() {
        let unsubscribeTasks = () => {};
        let unsubscribeList = () => {};
        let taskIds = []

        const userProfileRef = doc(FIRESTORE_DB, 'Users', currentUser.uid);
        const tasksRef = collection(userProfileRef, 'Tasks');
        const listRef = doc(userProfileRef, 'Lists', listId);

        try {
            unsubscribeList = onSnapshot(listRef, (listSnap) => {
                taskIds = listSnap.exists() ? listSnap.data().taskIds : [];
                unsubscribeTasks = onSnapshot(tasksRef, (querySnapshotTasks) => {
                    const fetchedTasks = [];
                    querySnapshotTasks.forEach((doc) => {
                        if (!listSnap.exists() || taskIds.includes(doc.id)) {
                            fetchedTasks.push({ id: doc.id, ...doc.data() });
                        }
                    });
                    setTaskItems(fetchedTasks);
                })
            })
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }

        return () => {unsubscribeTasks(); unsubscribeList;};
    }

    function fetchPosts() {
        let unsubscribeList = () => {};
        let unsubscribePosts = () => {};
        let postIds = [];

        const postsRef = collection(FIRESTORE_DB, 'Posts');
        const q = query(postsRef, where("userId", "==", currentUser.uid));
        const listRef = doc(FIRESTORE_DB, 'Users', currentUser.uid, 'Lists', listId);

        try {
            unsubscribeList = onSnapshot(listRef, (listSnap) => {
                postIds = listSnap.exists() ? listSnap.data().postIds : [];
                unsubscribePosts = onSnapshot(q, (querySnapshotPosts) => {
                    const fetchedPosts = [];
                    querySnapshotPosts.forEach((doc) => {
                        if (!listSnap.exists() || postIds.includes(doc.id)) {
                            fetchedPosts.push({ id: doc.id, ...doc.data() });
                        }
                    });
                    setCompletedTaskItems(fetchedPosts);
                })
            })
        } catch (error) {
            console.error("Error fetching posts:", error);
        }
        return () => {unsubscribePosts(); unsubscribeList();}

    }


    function fetchLists() {
        const userProfileRef = doc(FIRESTORE_DB, 'Users', currentUser.uid);
        const listsRef = collection(userProfileRef, 'Lists');
        try {
            const unsubscribeLists = onSnapshot(listsRef,
                (querySnapshotLists) => {
                    const fetchedLists = [];
                    querySnapshotLists.forEach((doc) => {
                        fetchedLists.push({ id: doc.id, ...doc.data() });
                    });
                    setListItems(fetchedLists);
                });
            return unsubscribeLists;
        } catch (error) {
            console.error("Error fetching lists:", error);
        }
    }

    function fetchUserProfile() {
        const userProfileRef = doc(FIRESTORE_DB, 'Users', currentUser.uid);
        try {
            const unsubscribeUserProfile = onSnapshot(userProfileRef, (docSnap) => {
                if (docSnap.exists()) {
                    setUserProfile(docSnap.data());
                }
            })
            return unsubscribeUserProfile;
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    }

    const addImage = async () => {
        try {
            let _image = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (_image.assets && !_image.cancelled) {
                console.log("uri::: " + _image.assets[0].uri);
                const { uri } = _image.assets[0];
                const fileName = uri.split('/').pop();
                const uploadResp = await uploadToFirebase(uri, `images/${fileName}`, (progress) =>
                    console.log(progress)
                );
                console.log(uploadResp);
                return uploadResp.downloadUrl;
            }
        } catch (e) {
            Alert.alert("Error Uploading Image " + e.message);
        }
    };

    const completeTask = async (index, complete) => { // clean this
        const userProfileRef = doc(FIRESTORE_DB, 'Users', currentUser.uid);
        const tasksRef = collection(userProfileRef, 'Tasks');
        const postsRef = collection(FIRESTORE_DB, 'Posts');
        const listsRef = collection(userProfileRef, 'Lists');
        if (!complete) {
            try {
                const batch = writeBatch(FIRESTORE_DB);
                const imageURI = await addImage(); // delete image if error occurs
                if (!imageURI) {
                    return; // make error
                }
                const docId = taskItems[index].id;
                const listIds = taskItems[index].listIds;
                const postRef = doc(postsRef);
                batch.set(postRef, {
                    userId: currentUser.uid,
                    name: taskItems[index].name,
                    description: taskItems[index].description,
                    timePosted: new Date(),
                    image: imageURI,
                    priority: taskItems[index].priority,
                    reminders: taskItems[index].reminders,
                    repeat: taskItems[index].repeat,
                    repeatEnds: taskItems[index].repeatEnds,
                    completeByDate: taskItems[index].completeByDate,
                    isCompletionTime: taskItems[index].isCompletionTime,
                    listIds: taskItems[index].listIds
                })

                let listRef;
                listIds.forEach((listId) => {
                    listRef = doc(listsRef, listId);
                    batch.update(listRef, {taskIds: arrayRemove(docId)});
                    batch.update(listRef, {postIds: arrayUnion(postRef.id)});
                })

                const taskRef = doc(tasksRef, taskItems[index].id);
                batch.delete(taskRef);

                batch.update(userProfileRef, { posts: increment(1), tasks: increment(-1) });

                await batch.commit();

            } catch (error) {
                // add error if image fails
                console.error('Error updating task completion: ', error);
            }
        }
        else {
            const batch = writeBatch(FIRESTORE_DB);
            const docId = completedTaskItems[index].id;
            const listIds = completedTaskItems[index].listIds;
            try {
                const postRef = doc(postsRef, docId);
                const querySnapshot = await getDoc(postRef);
                const image = querySnapshot.data().image;
                if (image) {
                    imageRef = ref(getStorage(), image);
                    deleteObject(imageRef);
                }
                const taskRef = doc(tasksRef);
                batch.set(taskRef, {
                    name: completedTaskItems[index].name,
                    description: completedTaskItems[index].description,
                    priority: completedTaskItems[index].priority,
                    reminders: completedTaskItems[index].reminders,
                    repeat: completedTaskItems[index].repeat,
                    repeatEnds: completedTaskItems[index].repeatEnds,
                    completeByDate: completedTaskItems[index].completeByDate,
                    isCompletionTime: completedTaskItems[index].isCompletionTime,
                    listIds: completedTaskItems[index].listIds,
                });
                let listRef;
                listIds.forEach((listId) => {
                    listRef = doc(listsRef, listId);
                    batch.update(listRef, {postIds: arrayRemove(docId)});
                    batch.update(listRef, {taskIds: arrayUnion(taskRef.id)})
                })
                batch.delete(postRef);
                batch.update(userProfileRef, { posts: increment(-1), tasks: increment(1) });
                await batch.commit();

            } catch (error) {
                console.error('Error updating task completion: ', error);
            }
        }
    }

    //diffentiate delete post and task and make batch
    const deleteItem = async (index, complete) => {
        let docId;
        let image;
        if (!complete) {
            docId = taskItems[index].id;
        }
        else {
            docId = completedTaskItems[index].id;
            image = completedTaskItems[index].image;
        }
        const userProfileRef = doc(FIRESTORE_DB, 'Users', currentUser.uid);
        const tasksRef = collection(userProfileRef, 'Tasks');
        const taskRef = doc(tasksRef, docId);
        const postRef = doc(FIRESTORE_DB, 'Posts', docId);
        const listsRef = collection(userProfileRef, 'Lists');
        try {
            const batch = writeBatch(FIRESTORE_DB);
            if (complete) {
                let listRef;
                completedTaskItems[index].listIds.forEach((listId) => {
                    listRef = doc(listsRef, listId);
                    batch.update(listRef, {postIds: arrayRemove(docId)})
                });
                batch.delete(postRef);
                if (image) {
                    const imageRef = ref(getStorage(), image);
                    await deleteObject(imageRef);
                }
                batch.update(userProfileRef, { posts: increment(-1) });
            }
            else {
                let listRef;
                taskItems[index].listIds.forEach((listId) => {
                    listRef = doc(listsRef, listId);
                    batch.update(listRef, {taskIds: arrayRemove(docId)})
                });
                batch.update(userProfileRef, { tasks: increment(-1) });
                batch.delete(taskRef)
            }
            await batch.commit();
        } catch (error) {
            console.error('Error deleting document: ', error);
        };

    }

    let swipedCardRef = null;
    const onOpen = ref => {
        if (swipedCardRef) swipedCardRef.current.close();
        swipedCardRef = ref;
    };

    const onClose = ref => {
        if (ref == swipedCardRef) {
            swipedCardRef = null;
        }
    };

    const closeSwipeCard = () => {
        if (swipedCardRef) swipedCardRef.current.close();
    }

    const handleTaskPress = (index) => {
        setEditIndex(index);
        setEditTaskVisible(true);
    }

    return (
            <TouchableWithoutFeedback onPress={closeSwipeCard}>
                <View style={styles.container}>
                    <Drawer
                        open={openDrawer}
                        onOpen={() => setOpenDrawer(true)}
                        onClose={() => setOpenDrawer(false)}
                        renderDrawerContent={() => {
                            return <ListSelect setOpenDrawer={setOpenDrawer} listItems={listItems} listId={listId} setListId={setListId} userProfile={userProfile} />;
                        }}
                        drawerStyle={{width: '70%'}}
                        >
                        <Modal 
                            visible={isEditTaskVisible}
                            transparent={true}
                            animationType='slide'
                        >
                            <EditTask task={taskItems[editIndex]} listItems={listItems} setEditTaskVisible={setEditTaskVisible} />
                        </ Modal>
                            <ScrollView style={styles.ScrollView}>
                                {taskItems.length !== 0 && <View style={styles.tasksContainer}>
                                    <Text style={styles.sectionTitle}>Tasks</Text>
                                    <View style={styles.tasks}>
                                        {taskItems.map((task, index) => {
                                            return (
                                                <TouchableOpacity onPress={() => handleTaskPress(index)} key={index}>
                                                    <Task
                                                        text={task.name}
                                                        tick={completeTask}
                                                        i={index}
                                                        complete={false}
                                                        deleteItem={deleteItem}
                                                        onOpen={onOpen}
                                                        onClose={onClose}
                                                    />
                                                </TouchableOpacity>
                                            )
                                        })}
                                    </View>
                                </View>}
                                {completedTaskItems.length !== 0 && <View style={styles.tasksContainer}>
                                    <Text style={styles.sectionTitle}>Completed</Text>
                                    <View style={styles.tasks}>
                                        {completedTaskItems.map((task, index) => {
                                            return (
                                                <View key={index}>
                                                    <Task
                                                        text={task.name}
                                                        tick={completeTask}
                                                        i={index}
                                                        complete={true}
                                                        deleteItem={deleteItem}
                                                        onOpen={onOpen}
                                                        onClose={onClose}
                                                    />
                                                </View>
                                            )
                                        })}
                                    </View>
                                </View>}
                                {/* <View style={{paddingBottom: 300}} /> */}
                            </ScrollView>
                        <TaskCreation closeSwipeCard={closeSwipeCard} listItems={listItems} nav={props.navigation} />
                    </Drawer>
                </View>
            </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {

    },
    tasksContainer: {
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    tasks: {
        backgroundColor: '#E5F4FA',
        marginTop: 5,
        borderRadius: 5,
    },
})
export default TaskListScreen;