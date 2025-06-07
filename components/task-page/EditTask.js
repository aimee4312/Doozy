import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Keyboard, TextInput, Dimensions, TouchableWithoutFeedback, Animated, TouchableOpacity, ScrollView, Modal } from 'react-native';
import ScheduleMenu from './ScheduleMenu';
import ListModal from './PopUpMenus/ListModal';
import { Ionicons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/FontAwesome';
import { FIREBASE_AUTH, FIRESTORE_DB, uploadToFirebase} from '../../firebaseConfig';
import { writeBatch, doc, collection, increment, arrayRemove, arrayUnion } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from "expo-notifications";

const EditTask = (props) => {
    const { task, listItems, setEditTaskVisible, configureNotifications, scheduleNotifications, cancelNotifications, addImage, isRepeatingTask} = props;

    const priorityRef = useRef(null);

    const [editedTaskName, setEditedTaskName] = useState(task ? task.name : null);
    const [editedDescription, setEditedDescription] = useState(task ? task.description : null);
    const [isComplete, setComplete] = useState(false);

    const [priorityYPosition, setPriorityYPosition] = useState(0);

    const [isCalendarModalVisible, setCalendarModalVisible] = useState(false);
    const [isListModalVisible, setListModalVisible] = useState(false);
    const [isPriorityModalVisible, setPriorityModalVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState(task.completeByDate);
    const [isTime, setIsTime] = useState(task ? task.isCompletionTime : null);
    const [selectedReminders, setSelectedReminders] = useState(task ? task.reminders : null);
    const [selectedRepeat, setSelectedRepeat] = useState(task ? task.repeat : null)
    const [dateRepeatEnds, setDateRepeatEnds] = useState(task ? task.repeatEnds : null);
    const [selectedPriority, setSelectedPriority] = useState(task ? task.priority : null);
    const [selectedLists, setSelectedLists] = useState(task ? task.listIds : null)

    const currentUser = FIREBASE_AUTH.currentUser;

    const screenHeight = Dimensions.get('window').height;
    const defaultHeight = screenHeight * 0.5;
    const scheduleMenuHeight = 700;
    const maxHeight = screenHeight * 0.9;

    const animatedHeight = useRef(new Animated.Value(defaultHeight)).current;

    const flagColor = ['black', 'blue', 'orange', 'red'];

    useEffect(() => {
        const willShowSub = Keyboard.addListener('keyboardWillShow', (e) => {
            Animated.timing(animatedHeight, {
                toValue: Math.min(defaultHeight + e.endCoordinates.height, maxHeight),
                duration: e.duration,
                useNativeDriver: false
            }).start();
        });

        const willHideSub = Keyboard.addListener('keyboardWillHide', (e) => {
            Animated.timing(animatedHeight, {
                toValue: defaultHeight,
                duration: e.duration,
                useNativeDriver: false
            }).start();
        });

        return () => {
            willShowSub.remove();
            willHideSub.remove();
        };
    }, []);

    const saveChanges = async () => {
        const batch = writeBatch(FIRESTORE_DB);
        const userProfileRef = doc(FIRESTORE_DB, 'Users', currentUser.uid);
        const tasksRef = collection(userProfileRef, 'Tasks');
        const postsRef = collection(FIRESTORE_DB, 'Posts');
        const taskRef = doc(tasksRef, task.id);
        try {
            if (!isComplete) {
                batch.update(taskRef, {
                    name: editedTaskName,
                    description: editedDescription,
                    completeByDate: selectedDate,
                    isCompletionTime: isTime,
                    priority: selectedPriority,
                    reminders: selectedReminders,
                    repeat: selectedRepeat,
                    repeatEnds: dateRepeatEnds,
                    listIds: selectedLists,
                });
                // see which listIds were removed and go into each list and remove the taskid from the lists
                // see which listIds were added and go into each list and add the taskid to the lists
                const listsToRemoveFrom = task.listIds.filter(item => !selectedLists.includes(item));
                const liststoAddTo = selectedLists.filter(item => !task.listIds.includes(item));
                let listRef;
                listsToRemoveFrom.forEach((list) => {
                    listRef = doc(userProfileRef, 'Lists', list);
                    batch.update(listRef, {taskIds: arrayRemove(task.id)});
                });
                liststoAddTo.forEach((list) => {
                    listRef = doc(userProfileRef, 'Lists', list);
                    batch.update(listRef, {taskIds: arrayUnion(task.id)});
                })
                await cancelNotifications(task.notificationIds);

                if (selectedReminders.length !== 0) {
                    if (await configureNotifications()) {
                        const tempNotifIds = await scheduleNotifications(selectedReminders, selectedDate, isTime, editedTaskName);
                        batch.update(taskRef, {notificationIds: tempNotifIds});
                    }
                }
            }
            else {
                const postRef = doc(postsRef);
                batch.set(postRef, {
                    userId: currentUser.uid,
                    name: editedTaskName,
                    description: editedDescription,
                    timePosted: new Date(),
                    timeTaskCreated: task.timeTaskCreated,
                    completeByDate: selectedDate,
                    isCompletionTime: isTime,
                    priority: selectedPriority,
                    reminders: selectedReminders,
                    repeat: selectedRepeat,
                    repeatEnds: dateRepeatEnds,
                    listIds: selectedLists,
                    parentTaskID: null
                })
                // remove task id from every list in original array
                // add post id to every list in new array
                let listRef;
                task.listIds.forEach((list) => {
                    listRef = doc(userProfileRef, 'Lists', list);
                    batch.update(listRef, {taskIds: arrayRemove(task.id)});
                })

                selectedLists.forEach((list) => {
                    listRef = doc(userProfileRef, 'Lists', list);
                    batch.update(listRef, {postIds: arrayUnion(postRef.id)});
                })

                const imageURI = await addImage(); // delete image if error occurs
                if (!imageURI) {
                    return; // make error
                }

                await cancelNotifications(task.notificationIds);
                const taskRef = doc(tasksRef, task.id);
                const newCompleteByDate = isRepeatingTask(selectedDate.timestamp, dateRepeatEnds, selectedRepeat);
                if (newCompleteByDate) {
                    batch.update(taskRef, {completeByDate: newCompleteByDate, childCounter: increment(1), currentChild: task.childCounter + 1});
                    batch.update(postRef, {parentTaskID: task.id, childNumber: task.childCounter});
                    if (selectedReminders.length !== 0) {
                        if (await configureNotifications()) {
                            const tempNotifIds = await scheduleNotifications(selectedReminders, newCompleteByDate, isTime, editedTaskName);
                            batch.update(taskRef, {notificationIds: tempNotifIds});
                        }
                    }
                }
                else {
                    batch.delete(taskRef);
                    batch.update(userProfileRef, { tasks: increment(-1) });
                }
                
                batch.update(postRef, { image: imageURI });
                batch.update(userProfileRef, { posts: increment(1) });
            } 
            await batch.commit();
            setEditTaskVisible(false);
        } catch (error) {
            console.error("Error posting post:", error);
        }
    }

    const getDateString = (timestamp) => {
        return timestamp.toLocaleDateString();
      }
    
    const getTimeString = (timestamp) => {
    return timestamp.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
    });
    }

    const openPriorityModal = () => { // set a timeout
        Keyboard.dismiss();
        priorityRef.current?.measure((x, y, width, height, pageX, pageY) => {
            setPriorityYPosition(pageY);
        });
        setPriorityModalVisible(true);
    }

    return (
        <View style={{ flex: 1 }}>
            <Modal
                visible={isCalendarModalVisible}
                transparent={true}
                animationType="slide"
            >
                <TouchableWithoutFeedback onPress={() => setCalendarModalVisible(false)}>
                    <View style={{ flex: 1 }} />
                </TouchableWithoutFeedback>
                <View style={{ height: scheduleMenuHeight, paddingRight: 20, paddingLeft: 20, backgroundColor: 'white', }}>
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
                <TouchableWithoutFeedback onPress={() => setListModalVisible(false)}>
                    <View style={{ flex: 1}} />
                </TouchableWithoutFeedback>
                <ListModal
                    selectedLists={selectedLists}
                    setSelectedLists={setSelectedLists}
                    listItems={listItems}
                    setListModalVisible={setListModalVisible}
                />
            </Modal>
            <Modal
                visible={isPriorityModalVisible}
                transparent={true}
                animationType='fade'
            >
                <TouchableWithoutFeedback onPress={() => setPriorityModalVisible(false)}>
                    <View style={styles.priorityContainer}>
                        <TouchableWithoutFeedback>
                            <View style={{top: priorityYPosition + 30, ...styles.priorityButtonContainer}}>
                                <TouchableOpacity onPress={() => {setSelectedPriority(0)}} style={[selectedPriority == 0 ? styles.selectedPriorityButton : {}, styles.priorityButtons]}>
                                    <Text style={styles.priorityText}>No Priority</Text>
                                    <Icon name="flag" size={16} color={'black'} />
                                </TouchableOpacity>
                                <View style={styles.divider} />
                                <TouchableOpacity onPress={() => {setSelectedPriority(1)}} style={[selectedPriority == 1 ? styles.selectedPriorityButton : {}, styles.priorityButtons]}>
                                    <Text style={styles.priorityText}>Low Priority</Text>
                                    <Icon name="flag" size={16} color={'blue'} />
                                </TouchableOpacity>
                                <View style={styles.divider} />
                                <TouchableOpacity onPress={() => {setSelectedPriority(2)}} style={[selectedPriority == 2 ? styles.selectedPriorityButton : {}, styles.priorityButtons]}>
                                    <Text style={styles.priorityText}>Medium Priority</Text>
                                    <Icon name="flag" size={16} color={'orange'} />
                                </TouchableOpacity>
                                <View style={styles.divider} />
                                <TouchableOpacity onPress={() => {setSelectedPriority(3)}} style={[selectedPriority == 3 ? styles.selectedPriorityButton : {}, styles.priorityButtons]}>
                                    <Text style={styles.priorityText}>High Priority</Text>
                                    <Icon name="flag" size={16} color={'red'} />
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
            <TouchableWithoutFeedback onPress={() => setEditTaskVisible(false)}>
                <View style={{ flex: 1 }} />
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <Animated.View style={[styles.modalContainer, { height: animatedHeight }]}>
                    <View style={styles.rowOneView}>
                        <TouchableOpacity onPress={() => setEditTaskVisible(false)} style={{width: 45}}>
                            <Ionicons name="chevron-down-outline" size={32} color="black" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setListModalVisible(true)} style={styles.listButton}>
                            <Text style={styles.listPicker}>{selectedLists.length == 0 ? "No Lists Selected" : listItems.find(item => item.id == selectedLists[0]).name + (selectedLists.length == 1 ? "" : ", ...")}</Text>
                            <Ionicons name="chevron-down-outline" size={18} color="black" />
                        </TouchableOpacity>
                        <TouchableOpacity style={{width: 45}} onPress={() => saveChanges()}>
                            {isComplete ? (<Text style={styles.save}>Post</Text>) : (<Text style={styles.save}>Save</Text>)}
                        </TouchableOpacity>
                    </View>
                    <View style={styles.rowTwoView}>
                        <TouchableOpacity style={ isComplete ? styles.checkedbox : styles.uncheckedbox } onPress={() => setComplete(!isComplete)} />
                        <TouchableOpacity style={styles.dateContainer} onPress={() => {setCalendarModalVisible(true)}}>
                            <Text>Due Date:</Text>
                            {isTime ? (
                                <Text style={styles.timePicker}>{getDateString(selectedDate.timestamp)}, {getTimeString(selectedDate.timestamp)}</Text>
                                ) : selectedDate ? (
                                <Text style={styles.timePicker}>{getDateString(selectedDate.timestamp)}</Text>
                                ) : (
                                <Text style={styles.timePicker}>No time set</Text>
                                )
                            }
                        </TouchableOpacity>
                        <TouchableOpacity ref={priorityRef} onPress={openPriorityModal} style={{width: 24}}>
                            <Icon
                                name="flag"
                                size={24}
                                color={flagColor[selectedPriority]}
                            />
                        </TouchableOpacity>
                    </View>
                    <ScrollView>
                        <View style={styles.taskNameContainer}>
                            <TextInput
                                onChangeText={text => setEditedTaskName(text)}
                                value={editedTaskName}
                                placeholder="Task Name..."
                                style={styles.taskNameInput}
                            />
                        </View>
                        <View style={styles.descriptionContainer}>
                            <TextInput
                                onChangeText={text => setEditedDescription(text)}
                                value={editedDescription}
                                placeholder="Description..."
                                style={styles.descriptionInput}
                            />
                        </View>
                    </ScrollView>
                    <View style={styles.trashContainer}>
                        <TouchableOpacity style={styles.trashButton}>
                            <Ionicons name="trash-outline" size={32} color="red" />
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </TouchableWithoutFeedback>
        </View>
    );
};

const styles = StyleSheet.create({
    priorityContainer: {
        flex: 1,
    },
    priorityButtonContainer: {
        height: 160,
        backgroundColor: 'white',
        width: 150,
        borderWidth: 1,
        borderRadius: 15,
        flexDirection: 'column',
        justifyContent: 'space-around',
        right: 20,
        position: 'absolute',
        overflow: 'hidden'
    },
    selectedPriorityButton: {
        backgroundColor: 'yellow',
    },
    priorityButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 39,
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        width: '100%',
    },
    modalContainer: {
        backgroundColor: 'white',
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
    rowOneView: {
        height: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    listButton: {
        flexDirection: 'row',
        alignItems: 'center',
        maxWidth: 200
    },
    save: {
        fontSize: 18,
        textAlign: 'center',
        color: 'blue',
        fontWeight: 'bold'
    },
    listPicker: {
        textAlign: 'center',
        fontSize: 18,
        height: 20,
    },
    rowTwoView: {
        height: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    checkedbox: {
        width: 24,
        height: 24,
        opacity: 0.4,
        backgroundColor: '#55BCF6',
        borderRadius: 5,
    },
    uncheckedbox: {
        width: 24,
        height: 24,
        opacity: 0.4,
        backgroundColor: 'grey',
        borderRadius: 5,
    },
    dateContainer: {
        flexDirection: 'column',
        alignItems: 'center'
    },
    timePicker: {
        textAlign: 'center',
    },
    taskNameContainer: {
        marginTop: 15,
        marginBottom: 10,
    },
    taskNameInput: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    descriptionContainer: {
        marginTop: 10,
    },
    descriptionInput: {
        fontSize: 16,
    },
    taskText: {
        fontSize: 16
    },
    trashContainer: {
        marginBottom: 30,
    },
    trashButton: {
        alignSelf: 'center',
        width: 30,
    },
});

export default EditTask;
