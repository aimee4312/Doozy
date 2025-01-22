import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, TextInput, Text, View, TouchableOpacity, Button, TouchableHighlight, TouchableWithoutFeedback, Dimensions } from 'react-native';
import { KeyboardAccessoryView } from 'react-native-keyboard-accessory';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Menu, MenuOptions, MenuTrigger } from 'react-native-popup-menu';
import Swiper from 'react-native-swiper';
import Modal from "react-native-modal";
import CustomDropDown from './CustomDropDown';
import ScheduleMenu from './ScheduleMenu';
import { doc, collection, addDoc, getDocs, runTransaction } from 'firebase/firestore';
import { FIREBASE_AUTH, FIRESTORE_DB, uploadToFirebase } from '../../firebaseConfig';
import NavBar from "../auth/NavigationBar";
import * as ImagePicker from 'expo-image-picker';



const TaskCreation = forwardRef(( props, ref) => {
    const {callSubmitHandler, nav} = props;
    
    const textTaskInputRef = useRef(null);
    
    const [newTask, setNewTask] = useState(''); // Task Name
    const [newDescription, setNewDescription] = useState(''); // Task Description
    const [selectedLists, setSelectedLists] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [time, setTime] = useState(new Date()) //change this eventually
    const [selectedPriority, setSelectedPriority] = useState(null);
    const [selectedReminders, setSelectedReminders] = useState([]);
    const [selectedRepeat, setSelectedRepeat] = useState([]);
    const [isCompleted, setCompleted] = useState(false);
    const [isTime, setIsTime] = useState(false);
    const [dateRepeatEnds, setDateRepeatEnds] = useState('');
    const [image, setImage] = useState(null);
    
    const [reminderString, setReminderString] = useState("None");
    const [repeatString, setRepeatString] = useState("None");

    const [showTaskCreation, setShowTaskCreation] = useState(false); 
    const [isCalendarModalVisible, setCalendarModalVisible] = useState(false);
    const [isListModalVisible, setListModalVisible] = useState(false);
    

    const [openFolders, setOpenFolders] = useState([]); // maybe move this inside of customdropdown

    const currentUser = FIREBASE_AUTH.currentUser;

    const screenHeight = Dimensions.get('window').height;
    const modalHeight = screenHeight * 0.75;

    const storeTask = async (imageURI) => {
        if (currentUser) {
            const userProfileRef = doc(FIRESTORE_DB, 'Users', currentUser.uid);
            
            const tasksRef = collection(userProfileRef, 'Tasks');
            try {
                await addDoc(tasksRef, {
                    name: newTask,
                    description: newDescription,
                    completed: isCompleted,
                    date: selectedDate,
                    time: isTime ? time : null,
                    priority: selectedPriority,
                    reminders: selectedReminders,
                    repeatEnds: dateRepeatEnds,
                    image: imageURI,
                });
                await runTransaction(FIRESTORE_DB, async (transaction) => {
                    const userProfileDoc = await transaction.get(userProfileRef);
    
                    const userProfileData = userProfileDoc.data();
                    
                    if (isCompleted) {
                        let posts = userProfileData.posts;
                        posts = userProfileData.posts + 1;
                    }

                    transaction.update(userProfileRef, { posts });
                });

            } catch (error) {
                console.error("Error storing task:", error);
            }
        } else {
            console.error("Current user not found.");
        }

    }

    const uploadImage = async () => {
        const { uri } = image;
        const filename = uri.substring(uri.lastIndexOf('/') + 1);
        const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
        setUploading(true);
        setTransferred(0);
        const task = storage()
          .ref(filename)
          .putFile(uploadUri);
        // set progress state
        task.on('state_changed', snapshot => {
          setTransferred(
            Math.round(snapshot.bytesTransferred / snapshot.totalBytes) * 10000
          );
        });
        try {
          await task;
        } catch (e) {
          console.error(e);
        }
        setUploading(false);
        Alert.alert(
          'Photo uploaded!',
          'Your photo has been uploaded to Firebase Cloud Storage!'
        );
        setImage(null);
      };


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
            const uploadResp = await uploadToFirebase(uri, fileName, (progress) =>
                console.log(progress)
            );
            console.log(uploadResp);
            return uploadResp.downloadUrl;
        }
    } catch (e) {
        Alert.alert("Error Uploading Image " + e.message);
    }
    };

    const reminderNoTime = [
        { label: 'On the day (9:00 am)' },
        { label: '1 day early (9:00 am)' },
        { label: '2 day early (9:00 am)' },
        { label: '3 day early (9:00 am)' },
        { label: '1 week early (9:00 am)' }
      ];

      const reminderWithTime = [
        { label: 'On time' },
        { label: '5 minutes early' },
        { label: '30 minutes early' },
        { label: '1 hour early' },
        { label: '1 day early' }
      ];

    const repeat = [
        { label: 'Daily' },
        { label: 'Weekly' },
        { label: 'Monthly' },
        { label: 'Yearly' },
        { label: 'Every weekday' },
    ];
    

    const toggleFolder = (index) => {
      if (openFolders.includes(index)) {
        setOpenFolders(openFolders.filter((item) => item !== index));
      } else {
        setOpenFolders([...openFolders, index]);
      }
    };

    const menuOptions = [
        { text: 'High Priority', icon: 'flag', color: 'red' },
        { text: 'Medium Priority', icon: 'flag', color: '#FF4500' },
        { text: 'Low Priority', icon: 'flag', color: 'orange' },
        { text: 'No Priority', icon: 'flag', color: '#FFD700' }
      ];

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

    //handles error
    useImperativeHandle(ref, () => ({
        closeKeyboard() {
            setShowTaskCreation(false);
        }
    }))

    const handleAddTask = () => {
        setShowTaskCreation(true);
        setTimeout(() => {
            textTaskInputRef?.current?.focus();
        }, 100);
    };

    const handleSubmitHelper = async () => {
        if (newTask.length !== 0) {
            if (isCompleted) {
                console.log("hieefiewof");
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
        callSubmitHandler();
        setNewTask('');
        setNewDescription('');
        setShowTaskCreation(false);
        setCompleted(false);
        setSelectedLists([]);
        setTime(new Date());
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

    return (
            <View style={styles.container}>
                <Modal 
                    isVisible={isCalendarModalVisible} 
                    onBackdropPress={toggleCalendarModal} 
                    style={{ justifyContent: 'flex-end', margin: 0 }} 
                    propagateSwipe
                >
                    <View style={{ backgroundColor: 'white', height: modalHeight, position: 'relative', zIndex: 0}}>
                        <Swiper loop={false}>
                            <View style={{ flex: 1, paddingRight: 20, paddingLeft: 20, flexDirection: 'column' }}>
                                <View style={{ flex: 1 }}>
                                <ScheduleMenu 
                                    isCalendarModalVisible={isCalendarModalVisible}
                                    setCalendarModalVisible={setCalendarModalVisible}
                                    selectedDate={selectedDate}
                                    setSelectedDate={setSelectedDate}
                                    time={time} 
                                    setTime={setTime}
                                    isTime={isTime} 
                                    setIsTime={setIsTime} 
                                    selectedReminders={selectedReminders} 
                                    setSelectedReminders={setSelectedReminders} 
                                    selectedRepeat={selectedRepeat} 
                                    setSelectedRepeat={setSelectedRepeat} 
                                    dateRepeatEnds={dateRepeatEnds} 
                                    setDateRepeatEnds={setDateRepeatEnds} 
                                    reminderString={reminderString} 
                                    setReminderString={setReminderString}
                                    repeatString={repeatString} 
                                    setRepeatString={setRepeatString}
                                    reminderNoTime={reminderNoTime} 
                                    reminderWithTime={reminderWithTime} 
                                    repeat={repeat} 
                                />
                                </View>
                            </View>
                        </Swiper>
                    </View>
                </Modal>
                <Modal 
                    isVisible={isListModalVisible} 
                    onBackdropPress={toggleListModal} 
                    style={{ justifyContent: 'flex-end', margin: 0}} 
                    propagateSwipe
                >
                    <CustomDropDown 
                    options={options} 
                    selectedLists={selectedLists} 
                    toggleSelection={toggleSelection} 
                    openFolders={openFolders}
                    toggleFolder={toggleFolder} />
                </Modal>
                {!showTaskCreation && (<View style={styles.bottomBar}>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity onPress={handleAddTask}>
                            <View style={styles.addTaskButtonWrapper}>
                                <Text style={styles.addTaskText}>+</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.navBar}>
                        <NavBar navigation={nav} style={styles.navBarContainer}></NavBar>
                    </View>
                </View>)}
                {showTaskCreation && (
                    <KeyboardAccessoryView 
                        style={styles.taskCustomization}
                        heightProperty="minHeight" 
                        alwaysVisible={true} 
                        hideBorder={true} 
                        animateOn='all' 
                        androidAdjustResize
                    >     
                        <TouchableWithoutFeedback>
                            <View>
                                <View style={styles.inputWrapper}>
                                    <TouchableOpacity 
                                        style={ isCompleted ? styles.checkedbox : styles.uncheckedbox } 
                                        onPress={checker}
                                    />
                                    <TextInput
                                        ref={textTaskInputRef}
                                        style={styles.inputTask}
                                        onChangeText={text => setNewTask(text)}
                                        value={newTask}
                                        placeholder={'Please type here…'}
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
                                    <Menu>
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
                                    </Menu>
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
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </KeyboardAccessoryView>
                )}
            </View>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column-reverse',
        marginBottom: 0,
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
        flexDirection: 'row',
        justifyContent: 'left',
        alignItems: 'center',
        
    },
    iconContainer: {
        padding: 10,
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