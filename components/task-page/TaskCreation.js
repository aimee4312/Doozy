import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, TextInput, Text, View, TouchableOpacity, Button, TouchableHighlight, TouchableWithoutFeedback, Dimensions, Modal, Keyboard, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';

import CustomDropDown from './PopUpMenus/CustomDropDown';
import ScheduleMenu from './ScheduleMenu';
import { doc, collection, addDoc, runTransaction, writeBatch, increment } from 'firebase/firestore';
import { FIREBASE_AUTH, FIRESTORE_DB, uploadToFirebase } from '../../firebaseConfig';
import NavBar from "../auth/NavigationBar";
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';



const TaskCreation = (props) => {
    const { closeSwipeCard, nav } = props;

    const textTaskInputRef = useRef(null);

    const [newTask, setNewTask] = useState(''); // Task Name
    const [newDescription, setNewDescription] = useState(''); // Task Description
    const [selectedLists, setSelectedLists] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedPriority, setSelectedPriority] = useState(0);
    const [selectedReminders, setSelectedReminders] = useState([]);
    const [selectedRepeat, setSelectedRepeat] = useState([]);
    const [isCompleted, setCompleted] = useState(false);
    const [isTime, setIsTime] = useState(false);
    const [dateRepeatEnds, setDateRepeatEnds] = useState('');
    const [image, setImage] = useState(null);
    
    const [showPriority, setShowPriority] = useState(false);
    const [isTaskCreationModalVisible, setTaskCreationModalVisible] = useState(false);
    const [isCalendarModalVisible, setCalendarModalVisible] = useState(false);
    const [isListModalVisible, setListModalVisible] = useState(false);


    const [openFolders, setOpenFolders] = useState([]); // maybe move this inside of customdropdown

    const currentUser = FIREBASE_AUTH.currentUser;

    const screenHeight = Dimensions.get('window').height;
    const modalHeight = screenHeight * 0.75;
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
                });
                batch.update(userProfileRef, { tasks: increment(1) });
            }
            else {
                const postRef = doc(postsRef);
                batch.set(postRef, {
                    userId: currentUser.uid,
                    name: newTask,
                    description: newDescription,
                    timePosted: new Date(),
                    image: imageURI,
                    completeByDate: selectedDate,
                    isCompletionTime: isTime,
                    priority: selectedPriority,
                    reminders: selectedReminders,
                    repeat: selectedRepeat,
                    repeatEnds: dateRepeatEnds,
                })
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


    const toggleFolder = (index) => {
        if (openFolders.includes(index)) {
            setOpenFolders(openFolders.filter((item) => item !== index));
        } else {
            setOpenFolders([...openFolders, index]);
        }
    };

    const handleOptionSelect = (index) => {
        if (selectedPriority === index) {
            setSelectedPriority(null);
        }
        else {
            setSelectedPriority(index);
        }
        // Perform other actions based on the selected option if needed
    };


    const toggleSelection = (mainIndex, subIndex) => {
        const isSelected = selectedLists.some((item) => item.mainIndex === mainIndex && item.subIndex === subIndex);
        if (isSelected) {
            setSelectedLists(selectedLists.filter((item) => !(item.mainIndex === mainIndex && item.subIndex === subIndex)));
        } else {
            setSelectedLists([...selectedLists, { mainIndex, subIndex }]);
        }
    };

    const options = [
        { label: 'School', subrows: [{ label: 'Math' }, { label: 'English' }] },
        { label: 'Errands', subrows: [{ label: 'Chores' }, { label: 'Groceries' }] },
        { label: '', subrows: [{ label: 'Fun Activities' }, { label: 'Self Inprovement' }] },
    ];

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
        }, 100);
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
                    console.
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
        setShowTaskCreation(false);
        setCompleted(false);
        setSelectedLists([]);
        setSelectedDate('');
        setSelectedPriority(null);
        setSelectedReminders([]);
        setSelectedRepeat([]);
        setIsTime(false);
        setDateRepeatEnds('');
    };


    const checker = () => {
        isCompleted ? setCompleted(false) : setCompleted(true);
    }

    const flagColor = ['black', 'blue', 'yellow', 'red'];

    return (
        <View style={styles.container}>
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
                        <View style={{ height: modalHeight, paddingRight: 20, paddingLeft: 20, backgroundColor: 'white', }}>
                            <ScheduleMenu
                                isCalendarModalVisible={isCalendarModalVisible}
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
                        <CustomDropDown
                            options={options}
                            selectedLists={selectedLists}
                            toggleSelection={toggleSelection}
                            openFolders={openFolders}
                            toggleFolder={toggleFolder} />
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
                            {/* <Menu>
                                <MenuTrigger style={styles.submitButton}>
                                    <View style={styles.iconContainer}>
                                        <Icon
                                            name="flag"
                                            size={28}
                                            color={'black'}
                                        />
                                    </View>
                                </MenuTrigger>
                                <MenuOptions style={styles.listsMenu}>
                                    <View style={styles.listsMenuScroll}>
                                        {menuOptions.map((option, index) => (
                                            <TouchableOpacity key={index} onPress={() => handleOptionSelect(index)}>
                                                <View style={[styles.priorityWrapper, selectedPriority === index && styles.selectedPriority]}>
                                                    <Icon name={option.icon} size={20} color={option.color} style={styles.flagSmall} />
                                                    <Text style={styles.flagText}>{option.text}</Text>
                                                </View>
                                            </TouchableOpacity>))}
                                    </View>
                                </MenuOptions>
                            </Menu> */}
                            <TouchableHighlight
                                style={styles.submitButton}
                                onPress={toggleListModal}
                            >
                                <View style={styles.iconContainer}>
                                    <Icon
                                        name="folder"
                                        size={28}
                                        color={'black'}
                                    />
                                </View>
                            </TouchableHighlight>
                             <TouchableHighlight
                                style={styles.submitButton}
                                onPress={() => {setShowPriority(!showPriority); !showPriority ? {} : setSelectedPriority(0)}}
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
                                <TouchableHighlight onPress={() => {setSelectedPriority(1); setShowPriority(false)}} style={styles.priorityButtonLow}>
                                    <View style={styles.priorityButtonContainer}>
                                        <Icon
                                            name="flag"
                                            size={16}
                                            color={'blue'}
                                        />
                                        <Text style={styles.priorityText}>Low</Text>
                                    </View>
                                </TouchableHighlight>
                                <TouchableHighlight onPress={() => {setSelectedPriority(2); setShowPriority(false)}} style={styles.priorityButtonMed}>
                                    <View style={styles.priorityButtonContainer}>
                                        <Icon
                                            name="flag"
                                            size={16}
                                            color={'yellow'}
                                        />
                                        <Text style={styles.priorityText}>Med</Text>
                                    </View>
                                </TouchableHighlight>
                                <TouchableHighlight onPress={() => {setSelectedPriority(3); setShowPriority(false)}} style={styles.priorityButtonHigh}>
                                    <View style={styles.priorityButtonContainer}>
                                        <Icon
                                            name="flag"
                                            size={16}
                                            color={'red'}
                                        />
                                        <Text style={styles.priorityText}>High</Text>
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
                        <View style={styles.addTaskButtonWrapper}>
                            <Text style={styles.addTaskText}>+</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.navBar}>
                    <NavBar navigation={nav} style={styles.navBarContainer}></NavBar>
                </View>
            </View>
        </View>
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
        bottom: 64,
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
    selectedPriority: {
        backgroundColor: "yellow",
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
    priorityButtonLow: {
        width: 60,
        height: 30,
        marginRight: 5,
        borderWidth: 1,
        borderRadius: 15,
        justifyContent: 'center'
    },
    priorityButtonMed: {
        width: 65,
        height: 30,
        marginRight: 5,
        borderWidth: 1,
        borderRadius: 15,
        justifyContent: 'center'
    },
    priorityButtonHigh: {
        width: 70,
        height: 30,
        borderWidth: 1,
        borderRadius: 15,
        justifyContent: 'center'
    },
    priorityButtonContainer: {
        flexDirection: 'row',
        alignSelf: 'center',
    },
    priorityText: {
        marginLeft: 5,
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
        bottom: 34,
    }
})

export default TaskCreation;