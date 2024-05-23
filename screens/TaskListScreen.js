import React, { createContext, useContext, useState, useRef, forwardRef, useEffect } from 'react';
import { StyleSheet, ScrollView, TextInput, Text, View, Button, Keyboard, KeyboardAvoidingView, Platform, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import Task from '../components/task-page/Task'
import TaskCreation from '../components/task-page/TaskCreation'
import { doc, collection, addDoc, getDocs, deleteDoc, updateDoc, runTransaction} from 'firebase/firestore';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../firebaseConfig';
import { MenuProvider } from 'react-native-popup-menu';
import * as ImagePicker from 'expo-image-picker';

const TaskListScreen = (props) => {
    
    const [taskItems, setTaskItems] = useState([]);
    const [completedTaskItems, setCompletedTaskItems] = useState([]);
    const childRef = useRef();
    const currentUser = FIREBASE_AUTH.currentUser;

    const fetchData = async () => {
        if (currentUser) {
            const userProfileRef = doc(FIRESTORE_DB, 'Users', currentUser.uid);
            const tasksRef = collection(userProfileRef, 'Tasks');
            const querySnapshot = await getDocs(tasksRef);
            const fetchedTasks = [];
            querySnapshot.forEach((doc) => {
                fetchedTasks.push({ id: doc.id, ...doc.data() });
            });
            const incompletedTasks = fetchedTasks.filter(task => !task.completed);
            const completedTasks = fetchedTasks.filter(task => task.completed);
            setTaskItems(incompletedTasks);
            setCompletedTaskItems(completedTasks);
        } else {
            console.error("Current user not found.");
        }
    }

    useEffect(() => {
        fetchData();
    }, []);
    
    // const handleSubmit = (newTask, completedCreateTask) => {
    //     if (newTask.length !== 0) {
    //         if (!completedCreateTask) {
    //             setTaskItems([...taskItems, newTask]);
    //             setShowTaskTitle(true);
    //         }
    //         else {
    //             setCompletedTaskItems([...completedTaskItems, newTask]);
    //             setShowCompletedTitle(true);
    //         }
    //     }
    // }

    const addImage = async () => {
        let _image = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
        console.log(JSON.stringify(_image));


        if (_image.assets && !_image.cancelled) {
            return _image.assets[0].uri;
        }
        return null;
    };

    const completeTask = async  (index, complete) => {
        let docId;
        const userProfileRef = doc(FIRESTORE_DB, 'Users', currentUser.uid);
        const tasksRef = collection(userProfileRef, 'Tasks');
        if (!complete) {
            const imageURI = await addImage();
            if (!imageURI) {
                return;
            }
            docId = taskItems[index].id;
            const docRef = doc(tasksRef, docId);
            updateDoc(docRef, {
                "completed": true,
                image: imageURI,
            }).then (() => {
                let itemsCopy = [...taskItems];
                let completedItem = taskItems[index];
                itemsCopy.splice(index, 1);
                setTaskItems(itemsCopy);
                setCompletedTaskItems([...completedTaskItems, completedItem]);
            });
        }
        else {
            docId = completedTaskItems[index].id;
            const docRef = doc(tasksRef, docId);
            updateDoc(docRef, {
                "completed": false,
                "image": null
            }).then (() => {
            let itemsCopy = [...completedTaskItems];
            let incompletedItem = completedTaskItems[index];
            itemsCopy.splice(index, 1);
            setCompletedTaskItems(itemsCopy);
            setTaskItems([...taskItems, incompletedItem]);
        });
    }
 }

    const deleteItem = async (index, complete) => {
        let docId;
        if (!complete) {
            docId = taskItems[index].id;
        }
        else {
            docId = completedTaskItems[index].id;
        }
        const userProfileRef = doc(FIRESTORE_DB, 'Users', currentUser.uid);
        const tasksRef = collection(userProfileRef, 'Tasks');
        const docRef = doc(tasksRef, docId);
        try {
            await deleteDoc(docRef)
                .then(() => {
                    if (!complete) {
                        const updatedTaskItems = [...taskItems];
                        updatedTaskItems.splice(index, 1);
                        setTaskItems(updatedTaskItems);
                    } else {
                        const updatedCompletedTaskItems = [...completedTaskItems];
                        updatedCompletedTaskItems.splice(index, 1);
                        setCompletedTaskItems(updatedCompletedTaskItems);
                    }
                })
            await runTransaction(FIRESTORE_DB, async (transaction) => {
                const userProfileDoc = await transaction.get(userProfileRef);

                const userProfileData = userProfileDoc.data();
                let posts = userProfileData.posts || [];

                posts = userProfileData.posts - 1;

                transaction.update(userProfileRef, { posts });
            });
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
        <TouchableWithoutFeedback onPress={() => childRef.current.closeKeyboard()}>
            {children}
        </TouchableWithoutFeedback>
        );

    return (
        <MenuProvider>
            <View style={styles.container}>
                <DismissKeyboard>
                    <ScrollView style={styles.ScrollView}>
                {taskItems.length !== 0 && <View style={styles.tasksContainer}>
                    <Text style={styles.sectionTitle}>Tasks</Text>
                    <View style={styles.tasks}>
                    {   
                        taskItems.map((task, index) => {
                            return(
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
                        })
                    }
                    </View>
                </View>}
                {completedTaskItems.length !== 0 && <View style={styles.tasksContainer}>
                    <Text style={styles.sectionTitle}>Completed</Text>
                    <View style={styles.tasks}>
                    {   
                        completedTaskItems.map((task, index) => {
                            return(
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
                        })
                    }
                    </View>
                </View>}
                <View style={{paddingBottom: 100}} />
                </ScrollView>
                </DismissKeyboard>
                <TaskCreation ref={childRef} callSubmitHandler={fetchData} nav={props.navigation}/>
            </View>
            </MenuProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 0,
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