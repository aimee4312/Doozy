import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Platform, TextInput, Text, View, TouchableOpacity, Button, TouchableHighlight, TouchableWithoutFeedback, Dimensions, Modal, Keyboard, Animated, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import { Ionicons } from '@expo/vector-icons';
import ListModal from './PopUpMenus/ListModal';
import ScheduleMenu from './ScheduleMenu';
import { doc, collection, addDoc, runTransaction, writeBatch, increment, arrayUnion } from 'firebase/firestore';
import { FIREBASE_AUTH, FIRESTORE_DB, uploadToFirebase } from '../../firebaseConfig';
import NavBar from "../auth/NavigationBar";
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from "expo-notifications";


const TaskCreation = (props) => {
    const { closeSwipeCard, listItems, nav, configureNotifications, scheduleNotifications } = props;

    const textTaskInputRef = useRef(null);

    const [newTask, setNewTask] = useState(''); // Task Name
    const [newDescription, setNewDescription] = useState(''); // Task Description
    const [selectedLists, setSelectedLists] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedPriority, setSelectedPriority] = useState(0);
    const [selectedReminders, setSelectedReminders] = useState([]);
    const [selectedRepeat, setSelectedRepeat] = useState(null);
    const [isCompleted, setCompleted] = useState(false);
    const [isTime, setIsTime] = useState(false);
    const [dateRepeatEnds, setDateRepeatEnds] = useState(null);
    
    const [showPriority, setShowPriority] = useState(false);
    const [isTaskCreationModalVisible, setTaskCreationModalVisible] = useState(false);
    const [isCalendarModalVisible, setCalendarModalVisible] = useState(false);
    const [isListModalVisible, setListModalVisible] = useState(false);


    const currentUser = FIREBASE_AUTH.currentUser;

    const modalHeight = 700;
    const taskCreationHeight = 135;

    const animatedHeight = useRef(new Animated.Value(taskCreationHeight)).current;

    useEffect(() => {
            const willShowSub = Keyboard.addListener('keyboardWillShow', (e) => {
                Animated.timing(animatedHeight, {
                    toValue: taskCreationHeight + e.endCoordinates.height,
                    duration: e.duration,
                    useNativeDriver: false
                }).start();
            });
    
            const willHideSub = Keyboard.addListener('keyboardWillHide', (e) => {
                Animated.timing(animatedHeight, {
                    toValue: 0,
                    duration: e.duration,
                    useNativeDriver: false
                }).start();
            });
    
            return () => {
                willShowSub.remove();
                willHideSub.remove();
            };
        }, []);

    const storeTask = async (imageURI) => {
        if (!currentUser) {
            console.error("Current user not found.");
            return;
        }
        const batch = writeBatch(FIRESTORE_DB);
        const userProfileRef = doc(FIRESTORE_DB, 'Users', currentUser.uid);
        const tasksRef = collection(userProfileRef, 'Tasks');
        const postsRef = collection(FIRESTORE_DB, 'Posts');
        try {
            if (!isCompleted) {
                const taskRef = doc(tasksRef);
                batch.set(taskRef, {
                    name: newTask,
                    description: newDescription,
                    completeByDate: selectedDate,
                    isCompletionTime: isTime,
                    priority: selectedPriority,
                    reminders: selectedReminders,
                    repeat: selectedRepeat,
                    repeatEnds: dateRepeatEnds,
                    listIds: selectedLists,
                    timeTaskCreated: new Date(),
                    notificationIds: [],
                });
                let listRef;
                selectedLists.forEach((listId) => {
                    listRef = doc(userProfileRef, 'Lists', listId);
                    batch.update(listRef, {taskIds: arrayUnion(taskRef.id)});
                });
                batch.update(userProfileRef, { tasks: increment(1) });
                if (selectedReminders.length !== 0) {
                    if (await configureNotifications()) {
                        const tempNotifIds = await scheduleNotifications(selectedReminders, selectedDate, isTime, newTask);
                        batch.update(taskRef, {notificationIds: tempNotifIds});
                    }
                }
            }
            else {
                const postRef = doc(postsRef);
                batch.set(postRef, {
                    userId: currentUser.uid,
                    name: newTask,
                    description: newDescription,
                    timePosted: new Date(),
                    timeTaskCreated: new Date(),
                    image: imageURI,
                    completeByDate: selectedDate,
                    isCompletionTime: isTime,
                    priority: selectedPriority,
                    reminders: selectedReminders,
                    repeat: selectedRepeat,
                    repeatEnds: dateRepeatEnds,
                    listIds: selectedLists,
                })
                let listRef;
                selectedLists.forEach((listId) => {
                    listRef = doc(userProfileRef, 'Lists', listId);
                    batch.update(listRef, {postIds: arrayUnion(postRef.id)});
                });
                batch.update(userProfileRef, { posts: increment(1) });
            } 
            await batch.commit();
        } catch (error) {
            console.error("Error storing task or posting:", error);
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
                const { uri } = _image.assets[0];
                const fileName = uri.split('/').pop();
                const uploadResp = await uploadToFirebase(uri, `images/${fileName}`, (progress) =>
                    console.log(progress)
                );
                return uploadResp.downloadUrl;
            }
        } catch (e) {
            Alert.alert("Error Uploading Image " + e.message);
        }
    };


    const toggleCalendarModal = () => {
        setCalendarModalVisible(!isCalendarModalVisible);
    };

    const toggleListModal = () => {
        setListModalVisible(!isListModalVisible);
    };

    const openTaskCreatonModal = () => {
        closeSwipeCard();
        setTaskCreationModalVisible(true);
        setTimeout(() => {
            textTaskInputRef?.current?.focus();
        }, 10);
    };

    const closeTaskCreationModal = () => {
        Keyboard.dismiss();
        setTimeout(() => {
            setTaskCreationModalVisible(false);
        }, 100);
    }

    const handleSubmitHelper = async () => {
        if (newTask.length !== 0) {
            if (isCompleted) {
                const imageURI = await addImage();
                console.log(imageURI);
                if (!imageURI) {
                    return;
                }
                storeTask(imageURI);
            }
            else {
                storeTask(null);
            }
        }

        setNewTask('');
        setNewDescription('');
        setCompleted(false);
        setSelectedLists([]);
        setSelectedDate('');
        setSelectedPriority(0);
        setSelectedReminders([]);
        setSelectedRepeat([]);
        setIsTime(false);
        setDateRepeatEnds('');
        setSelectedLists([]);
        setTaskCreationModalVisible(false);
    };


    const checker = () => {
        isCompleted ? setCompleted(false) : setCompleted(true);
    }

    const flagColor = ['black', 'blue', 'orange', 'red'];

    return (
        <SafeAreaView style={styles.container}>
            <Modal
                visible={isTaskCreationModalVisible}
                transparent={true}
                animationType='slide'
            >
                <Modal
                visible={isCalendarModalVisible}
                transparent={true}
                animationType="slide"
            >
                <TouchableWithoutFeedback onPress={toggleCalendarModal}>
                    <View style={{ flex: 1 }}>
                    </View>
                </TouchableWithoutFeedback>
                    <View style={{ height: modalHeight, paddingRight: 20, paddingLeft: 20, backgroundColor: 'white', borderTopRightRadius: 20, borderTopLeftRadius: 20}}>
                        <ScheduleMenu
                            setCalendarModalVisible={setCalendarModalVisible}
                            selectedDate={selectedDate}
                            setSelectedDate={setSelectedDate}
                            isTime={isTime}
                            setIsTime={setIsTime}
                            selectedReminders={selectedReminders}
                            setSelectedReminders={setSelectedReminders}
                            selectedRepeat={selectedRepeat}
                            setSelectedRepeat={setSelectedRepeat}
                            dateRepeatEnds={dateRepeatEnds}
                            setDateRepeatEnds={setDateRepeatEnds}
                        />
                    </View>
                </Modal>
                <Modal
                visible={isListModalVisible}
                transparent={true}
                animationType='slide'
            >
                <TouchableWithoutFeedback onPress={toggleListModal}>
                    <View style={{ flex: 1}}>
                    </View>
                </TouchableWithoutFeedback>
                    <ListModal
                        selectedLists={selectedLists}
                        setSelectedLists={setSelectedLists}
                        listItems={listItems}
                        setListModalVisible={setListModalVisible}
                    />
                </Modal>
                <TouchableWithoutFeedback onPress={closeTaskCreationModal}>
                    <View style={{ flex: 1 }}>
                    </View>
                </TouchableWithoutFeedback>
                <Animated.View style={{height: animatedHeight, ...styles.taskCreationContainer}}>
                    <View>
                        <View style={styles.inputWrapper}>
                            <TouchableOpacity
                                style={isCompleted ? styles.checkedbox : styles.uncheckedbox}
                                onPress={checker}
                            />
                            <TextInput
                                ref={textTaskInputRef}
                                style={styles.inputTask}
                                onChangeText={text => setNewTask(text)}
                                value={newTask}
                                placeholder={'Please type here…'}
                                autoCorrect={false}
                            />
                            <Button
                                style={styles.submitButton}
                                title="go"
                                onPress={handleSubmitHelper}
                            />
                        </View>
                        <View style={styles.descriptionWrapper}>
                            <TextInput
                                style={styles.inputDescription}
                                onChangeText={text => setNewDescription(text)}
                                value={newDescription}
                                placeholder={'Description…'}
                            />
                        </View>
                        <View style={styles.detailsWrapper}>
                            <TouchableHighlight
                                style={styles.submitButton}
                                onPress={toggleCalendarModal}
                            >
                                <View style={styles.iconContainer}>
                                    <Icon
                                        name="calendar"
                                        size={28}
                                        color={'black'}
                                    />
                                </View>
                            </TouchableHighlight>
                            <TouchableHighlight
                                style={styles.submitButton}
                                onPress={toggleListModal}
                            >
                                <View style={styles.iconContainer}>
                                    <Ionicons name="list-outline" size={28} color="black" />
                                </View>
                            </TouchableHighlight>
                             <TouchableHighlight
                                style={styles.submitButton}
                                onPress={() => {setShowPriority(!showPriority)}}
                            >
                                <View style={styles.iconContainer}>
                                    {!showPriority ? (<Icon
                                        name="flag"
                                        size={28}
                                        color={flagColor[selectedPriority]}
                                    />)
                                    : (<Feather name="x-circle" size={28} color={'black'}/>)}
                                </View>
                            </TouchableHighlight>
                            {showPriority && (<View style={styles.priorityContainer}>
                                <TouchableHighlight onPress={() => {selectedPriority == 1 ? setSelectedPriority(0) : setSelectedPriority(1)}} style={[selectedPriority == 1 ? {width: 75, ...styles.selectedPriorityButton} : {width: 60}, styles.priorityButtonLow]}>
                                    <View style={styles.priorityButtonContainer}>
                                        <Icon
                                            name="flag"
                                            size={16}
                                            color={'blue'}
                                        />
                                        <Text style={styles.priorityText}>Low</Text>
                                        {selectedPriority == 1 && <Feather name="x" size={16} color={'black'}/>}
                                    </View>
                                </TouchableHighlight>
                                <TouchableHighlight onPress={() => {selectedPriority == 2 ? setSelectedPriority(0) : setSelectedPriority(2)}} style={[selectedPriority == 2 ? {width: 80, ...styles.selectedPriorityButton} : {width: 65}, styles.priorityButtonMed]}>
                                    <View style={styles.priorityButtonContainer}>
                                        <Icon
                                            name="flag"
                                            size={16}
                                            color={'orange'}
                                        />
                                        <Text style={styles.priorityText}>Med</Text>
                                        {selectedPriority == 2 && <Feather name="x" size={16} color={'black'}/>}
                                    </View>
                                </TouchableHighlight>
                                <TouchableHighlight onPress={() => {selectedPriority == 3 ? setSelectedPriority(0) : setSelectedPriority(3)}} style={[selectedPriority == 3 ? {width: 85, ...styles.selectedPriorityButton} : {width: 70}, styles.priorityButtonHigh]}>
                                    <View style={styles.priorityButtonContainer}>
                                        <Icon
                                            name="flag"
                                            size={16}
                                            color={'red'}
                                        />
                                        <Text style={styles.priorityText}>High</Text>
                                        {selectedPriority == 3 && <Feather name="x" size={16} color={'black'}/>}
                                    </View>
                                </TouchableHighlight>
                            </View>)}
                        </View>
                    </View>
                </Animated.View>
            </Modal>
            <View style={styles.bottomBar}>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={openTaskCreatonModal}>
                        <Ionicons name="add-circle-outline" size={72} color='black'/>
                    </TouchableOpacity>
                </View>
                <View style={styles.navBar}>
                    <NavBar navigation={nav} style={styles.navBarContainer}></NavBar>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0, //temporary
        left: 0,
        right: 0,
    },
    writeTaskWrapper: {
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    buttonContainer: {
        position: 'absolute',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        right: 16,
        bottom: 32,
    },
    taskCustomization: {
        backgroundColor: '#FFF',
        borderColor: '#C0C0C0',
        borderWidth: 1,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
    },
    taskCreationContainer: {
        backgroundColor: 'white',
    },
    inputWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#C0C0C0',
    },
    inputTask: {
        paddingVertical: 15,
        paddingHorizontal: 15,
        width: '80%',
    },
    submitButton: {

    },
    folderButton: {
        width: 60,
        flex: 0,
    },
    addTaskButtonWrapper: {
        width: 60,
        height: 60,
        backgroundColor: '#FFF',
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: '#C0C0C0',
        borderWidth: 1,
        marginRight: 20,
    },
    addTaskText: {
        fontSize: 48,
    },
    checkedbox: {
        width: 24,
        height: 24,
        opacity: 0.4,
        backgroundColor: '#55BCF6',
        borderRadius: 5,
        marginLeft: 15,
    },
    uncheckedbox: {
        width: 24,
        height: 24,
        opacity: 0.4,
        backgroundColor: 'grey',
        borderRadius: 5,
        marginLeft: 15,
    },
    inputDescription: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        width: '100%',
    },
    detailsWrapper: {
        marginHorizontal: 5,
        flexDirection: 'row',
        justifyContent: 'left',
        alignItems: 'center',

    },
    iconContainer: {
        padding: 10

    },
    menuContainer: {
        width: 300,
    },
    listsMenu: {
        backgroundColor: 'transparent',
    },
    listsMenuScroll: {
        position: 'absolute',
        backgroundColor: 'white',
        borderColor: 'grey',
        borderWidth: 1,
        bottom: 90, // change
        width: 200,
        borderRadius: 5,
        maxHeight: 150,
    },
    listsMenuSelect: {
        flex: .55,
        paddingTop: 10,
        backgroundColor: 'white',
        borderColor: 'grey',
        borderWidth: 1,
        borderRadius: 5,
    },
    multiSelectBox: {
        margin: 0,
        padding: 5,
    },
    listModal: {

    },
    priorityWrapper: {
        flexDirection: "row",
        alignItems: 'center',
        paddingVertical: 2,
    },
    flagSmall: {
        paddingRight: 20,
    },
    flagText: {
        fontSize: 18,
    },
    priorityContainer: {
        paddingLeft: 0,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        flex: 1,
        verticalAlign: 'center',
        rowGap: 10,
    },
    selectedPriorityButton: {
        backgroundColor: "yellow",
    },
    priorityButtonLow: {
        height: 30,
        marginRight: 5,
        borderWidth: 1,
        borderRadius: 15,
        justifyContent: 'center'
    },
    priorityButtonMed: {
        height: 30,
        marginRight: 5,
        borderWidth: 1,
        borderRadius: 15,
        justifyContent: 'center'
    },
    priorityButtonHigh: {
        height: 30,
        borderWidth: 1,
        borderRadius: 15,
        justifyContent: 'center'
    },
    priorityButtonContainer: {
        flexDirection: 'row',
        alignSelf: 'center',
        alignItems: 'center'
    },
    priorityText: {
        marginLeft: 5,
        marginRight: 2,
    },
    customItem: {
        margin: 0,
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    chip: {
        backgroundColor: 'lightgray',
        borderRadius: 10,
        padding: 5,
        margin: 5,
    },
    chipText: {
        fontSize: 14,
    },
    titleText: {
        fontSize: 18,
    },
    navBar: {
        position: 'absolute',
        width: '100%',
        bottom: 0,
    }
})

export default TaskCreation;