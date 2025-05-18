import React, { createContext, useContext, useState, useRef, forwardRef, useEffect } from 'react';
import { StyleSheet, ScrollView, Alert, TextInput, Text, View, Button, Keyboard, KeyboardAvoidingView, Platform, TouchableOpacity, TouchableWithoutFeedback} from 'react-native';
import Task from '../components/task-page/Task'
import TaskCreation from '../components/task-page/TaskCreation'
import { doc, collection, getDoc, addDoc, getDocs, deleteDoc, updateDoc, runTransaction, writeBatch, increment, query, where, onSnapshot } from 'firebase/firestore';
import { FIREBASE_AUTH, FIRESTORE_DB, uploadToFirebase } from '../firebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, deleteObject } from "firebase/storage";
import { SafeAreaView } from 'react-native-safe-area-context';


const TaskListScreen = (props) => {

    const [taskItems, setTaskItems] = useState([]);
    const [completedTaskItems, setCompletedTaskItems] = useState([]);
    const childRef = useRef();
    const unsubscribeRef = useRef();
    const currentUser = FIREBASE_AUTH.currentUser;


    useEffect(() => {
        const unsubscribeTasks = fetchTasks();
        const unsubscribePosts = fetchPosts();

        unsubscribeRef.current = [unsubscribeTasks, unsubscribePosts];
        return () => {
            unsubscribeRef.current.forEach(unsub => unsub());
        };
    }, []);

    function fetchTasks() {
        const userProfileRef = doc(FIRESTORE_DB, 'Users', currentUser.uid);
        const tasksRef = collection(userProfileRef, 'Tasks');

        try {
            const unsubscribeTasks = onSnapshot(tasksRef,
                (querySnapshotTasks) => {
                    const fetchedTasks = [];
                    querySnapshotTasks.forEach((doc) => {
                        fetchedTasks.push({ id: doc.id, ...doc.data() });
                    });
                    setTaskItems(fetchedTasks);
                });
            return unsubscribeTasks;
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    }

    function fetchPosts() {
        const postsRef = collection(FIRESTORE_DB, 'Posts');
        const q = query(postsRef, where("userId", "==", currentUser.uid));
        try {
            const unsubscribePosts = onSnapshot(q,
                (querySnapshotPosts) => {
                    const fetchedPosts = [];
                    querySnapshotPosts.forEach((doc) => {
                        fetchedPosts.push({ id: doc.id, ...doc.data() });
                    });
                    setCompletedTaskItems(fetchedPosts);
                }
            );
            return unsubscribePosts;
        } catch (error) {
            console.error("Error fetching posts:", error);
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
        let docId;
        const userProfileRef = doc(FIRESTORE_DB, 'Users', currentUser.uid);
        const tasksRef = collection(userProfileRef, 'Tasks');
        const postsRef = collection(FIRESTORE_DB, 'Posts');
        if (!complete) {
            try {
                const batch = writeBatch(FIRESTORE_DB);
                const imageURI = await addImage(); // delete image if error occurs
                if (!imageURI) {
                    return; // make error
                }
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
                    isCompletionTime: taskItems[index].isCompletionTime
                })
                const taskRef = doc(tasksRef, taskItems[index].id);
                batch.delete(taskRef);

                batch.update(userProfileRef, { posts: increment(1) });

                await batch.commit();

            } catch (error) {
                // add error if image fails
                console.error('Error updating task completion: ', error);
            }
        }
        else {
            const batch = writeBatch(FIRESTORE_DB);
            docId = completedTaskItems[index].id;
            try {
                const postRef = doc(postsRef, docId);
                const querySnapshot = await getDoc(postRef);
                const image = querySnapshot.data().image;
                console.log(image);
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
                    isCompletionTime: completedTaskItems[index].isCompletionTime
                })
                batch.delete(postRef);
                batch.update(userProfileRef, { posts: increment(-1) });
                await batch.commit();

            } catch (error) {
                console.error('Error updating task completion: ', error);
            }
        }
    }

    //diffentiate delete post and task
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
        try {
            
            if (complete) {
                await deleteDoc(postRef);
                if (image) {
                    const imageRef = ref(getStorage(), image);
                    await deleteObject(imageRef);
                }
                await updateDoc(userProfileRef, { posts: increment(-1) });
            }
            else {
                await deleteDoc(taskRef)
            }
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

    const DismissKeyboard = ({ children }) => (
        <TouchableWithoutFeedback onPress={() => { childRef.current.closeKeyboard() }}>
            {children}
        </TouchableWithoutFeedback>
    );

    return (
            <TouchableWithoutFeedback onPress={() => { if (swipedCardRef) swipedCardRef.current.close(); }}>
                <SafeAreaView style={styles.container}>
                    <DismissKeyboard>
                        <ScrollView style={styles.ScrollView}>
                            {taskItems.length !== 0 && <View style={styles.tasksContainer}>
                                <Text style={styles.sectionTitle}>Tasks</Text>
                                <View style={styles.tasks}>
                                    {taskItems.map((task, index) => {
                                        return (
                                            <View key={index}>
                                                <Task
                                                    text={task.name}
                                                    tick={completeTask}
                                                    i={index}
                                                    complete={false}
                                                    deleteItem={deleteItem}
                                                    onOpen={onOpen}
                                                    onClose={onClose}
                                                />
                                            </View>
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
                    </DismissKeyboard>
                    <TaskCreation ref={childRef} nav={props.navigation} />
                </SafeAreaView>
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