import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Keyboard, TextInput, Dimensions, TouchableWithoutFeedback, Animated, TouchableOpacity, ScrollView, Modal } from 'react-native';
import ScheduleMenu from './ScheduleMenu';
import ListModal from './PopUpMenus/ListModal';
import { Ionicons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/FontAwesome';
import { FIREBASE_AUTH, FIRESTORE_DB, uploadToFirebase} from '../../firebaseConfig';
import { writeBatch, doc, collection, increment, arrayRemove, arrayUnion } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';

const EditTask = (props) => {
    const { task, listItems, setEditTaskVisible } = props;
    const [editedTaskName, setEditedTaskName] = useState(task ? task.name : null);
    const [editedDescription, setEditedDescription] = useState(task ? task.description : null);
    const [isComplete, setComplete] = useState(false);

    const [isCalendarModalVisible, setCalendarModalVisible] = useState(false);
    const [isListModalVisible, setListModalVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState(() => {
        if (task.completeByDate && task.completeByDate.timestamp) {
            const millis = task.completeByDate.timestamp.seconds * 1000 + Math.floor(task.completeByDate.timestamp.nanoseconds / 1e6);
            return {
                ...task.completeByDate,
                timestamp: new Date(millis)
            };
        } else {
            return null;
        }
    });
    const [isTime, setIsTime] = useState(task ? task.isCompletionTime : null);
    const [selectedReminders, setSelectedReminders] = useState(task ? task.reminders : null);
    const [selectedRepeat, setSelectedRepeat] = useState(task ? task.repeat : null)
    const [dateRepeatEnds, setDateRepeatEnds] = useState(task ? task.repeatEnds : null);
    const [selectedPriority, setSelectedPriority] = useState(task ? task.priority : null);
    const [selectedLists, setSelectedLists] = useState(task ? task.listIds : null)

    const currentUser = FIREBASE_AUTH.currentUser;

    const screenHeight = Dimensions.get('window').height;
    const defaultHeight = screenHeight * 0.5;
    const scheduleMenuHeight = screenHeight * 0.75;
    const maxHeight = screenHeight * 0.9;

    const animatedHeight = useRef(new Animated.Value(defaultHeight)).current;

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
            }
            else {
                const imageURI = await addImage()
                const postRef = doc(postsRef);
                batch.set(postRef, {
                    userId: currentUser.uid,
                    name: editedTaskName,
                    description: editedDescription,
                    timePosted: new Date(),
                    image: imageURI,
                    completeByDate: selectedDate,
                    isCompletionTime: isTime,
                    priority: selectedPriority,
                    reminders: selectedReminders,
                    repeat: selectedRepeat,
                    repeatEnds: dateRepeatEnds,
                    listIds: selectedLists,
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

                batch.update(userProfileRef, { posts: increment(1) });
                batch.update(userProfileRef, {tasks: increment(-1)});
                batch.delete(taskRef);
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
                    />
                </Modal>
            <TouchableWithoutFeedback onPress={() => setEditTaskVisible(false)}>
                <View style={{ flex: 1 }} />
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <Animated.View style={[styles.modalContainer, { height: animatedHeight }]}>
                    <View style={styles.rowOneView}>
                        <TouchableOpacity style={{width: 45}}>
                            <Ionicons name="chevron-down-outline" size={32} color="black" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setListModalVisible(true)}>
                            <Text style={styles.listPicker}>Main List</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{width: 45}} onPress={() => saveChanges()}>
                            {isComplete ? (<Text style={styles.done}>Post</Text>) : (<Text style={styles.done}>Done</Text>)}
                        </TouchableOpacity>
                    </View>
                    <View style={styles.rowTwoView}>
                        <TouchableOpacity style={ isComplete ? styles.checkedbox : styles.uncheckedbox } onPress={() => setComplete(!isComplete)} />
                        <TouchableOpacity onPress={() => {setCalendarModalVisible(true)}}>
                            {isTime ? (
                                <Text style={styles.timePicker}>{getDateString(selectedDate.timestamp)}, {getTimeString(selectedDate.timestamp)}</Text>
                                ) : selectedDate ? (
                                <Text style={styles.timePicker}>{getDateString(selectedDate.timestamp)}</Text>
                                ) : (
                                <Text style={styles.timePicker}>No time set</Text>
                                )
                            }
                        </TouchableOpacity>
                        <TouchableOpacity style={{width: 24}}>
                            <Icon
                                name="flag"
                                size={24}
                                color={'black'}
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
    done: {
        fontSize: 18,
        textAlign: 'center',
    },
    listPicker: {
        textAlign: 'center',
        fontSize: 18
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
