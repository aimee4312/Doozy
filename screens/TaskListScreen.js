import React, { createContext, useContext, useState, useRef, forwardRef, useEffect } from 'react';
import { StyleSheet, ScrollView, Alert, TextInput, Text, View, TouchableOpacity, TouchableWithoutFeedback, Modal, Platform, DynamicColorIOS } from 'react-native';
import Task from '../components/task-page/Task';
import TaskCreation from '../components/task-page/TaskCreation';
import EditTask from '../components/task-page/EditTask';
import ListSelect from '../components/task-page/ListSelect';
import { doc, collection, getDoc, addDoc, getDocs, deleteDoc, updateDoc, runTransaction, writeBatch, increment, query, where, onSnapshot, arrayRemove, arrayUnion, orderBy } from 'firebase/firestore';
import { FIREBASE_AUTH, FIRESTORE_DB, uploadToFirebase } from '../firebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, deleteObject } from "firebase/storage";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Drawer } from 'react-native-drawer-layout';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as Notifications from "expo-notifications";

const TaskListScreen = (props) => {

    const { listId, setListId, order, setOrder } = props;

    const [taskItems, setTaskItems] = useState([]);
    const [completedTaskItems, setCompletedTaskItems] = useState([]);
    const [listItems, setListItems] = useState([]);
    const [isEditTaskVisible, setEditTaskVisible] = useState(false);
    const [editIndex, setEditIndex] = useState();
    const [openDrawer, setOpenDrawer] = useState(false);
    const [sortModalVisible, setSortModalVisible] = useState(false);
    const [userProfile, setUserProfile] = useState();
    const [sortYPosition, setSortYPosition] = useState();
    const unsubscribeRef = useRef();
    const sortRef = useRef(null);
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

    useEffect(() => {
        sortTasks(taskItems);
    }, [order]);

    function fetchTasks() {
        let unsubscribeTasks = () => { };
        let unsubscribeList = () => { };
        let taskIds = [];

        const userProfileRef = doc(FIRESTORE_DB, 'Users', currentUser.uid);
        const tasksRef = collection(userProfileRef, 'Tasks');
        const listRef = doc(userProfileRef, 'Lists', listId);

        try {
            unsubscribeList = onSnapshot(listRef, (listSnap) => {
                taskIds = listSnap.exists() ? listSnap.data().taskIds : [];
                unsubscribeTasks = onSnapshot(tasksRef, (querySnapshotTasks) => {
                    const fetchedTasks = [];
                    querySnapshotTasks.forEach((doc) => {
                        let docData = doc.data();
                        if (!listSnap.exists() || taskIds.includes(doc.id)) {
                            if (docData.completeByDate?.timestamp) {
                                const millisCompleteBy = docData.completeByDate.timestamp.seconds * 1000 + Math.floor(docData.completeByDate.timestamp.nanoseconds / 1e6);
                                docData.completeByDate = {
                                    ...docData.completeByDate,
                                    timestamp: new Date(millisCompleteBy)
                                }
                            }
                            if (docData.repeatEnds) {
                                const millisRepeatEnds = docData.repeatEnds.seconds * 1000 + Math.floor(docData.repeatEnds.nanoseconds / 1e6);
                                docData.repeatEnds = new Date(millisRepeatEnds);
                            }
                            fetchedTasks.push({ id: doc.id, ...docData });
                        }
                    });
                    sortTasks(fetchedTasks);
                })
            })
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }

        return () => { unsubscribeTasks(); unsubscribeList; };
    }

    function fetchPosts() {
        let unsubscribeList = () => { };
        let unsubscribePosts = () => { };
        let postIds = [];

        const postsRef = collection(FIRESTORE_DB, 'Posts');
        const q = query(postsRef, where("userId", "==", currentUser.uid), orderBy('timePosted', 'desc'));
        const listRef = doc(FIRESTORE_DB, 'Users', currentUser.uid, 'Lists', listId);

        try {
            unsubscribeList = onSnapshot(listRef, (listSnap) => {
                postIds = listSnap.exists() ? listSnap.data().postIds : [];
                unsubscribePosts = onSnapshot(q, (querySnapshotPosts) => {
                    const fetchedPosts = [];
                    querySnapshotPosts.forEach((doc) => {
                        let docData = doc.data();
                        if (!listSnap.exists() || postIds.includes(doc.id)) {
                            if (docData.completeByDate?.timestamp) {
                                const millisCompleteBy = docData.completeByDate.timestamp.seconds * 1000 + Math.floor(docData.completeByDate.timestamp.nanoseconds / 1e6);
                                docData.completeByDate = {
                                    ...docData.completeByDate,
                                    timestamp: new Date(millisCompleteBy)
                                }
                            }
                            if (docData.repeatEnds) {
                                const millisRepeatEnds = docData.repeatEnds.seconds * 1000 + Math.floor(docData.repeatEnds.nanoseconds / 1e6);
                                docData.repeatEnds = new Date(millisRepeatEnds);
                            }
                            fetchedPosts.push({ id: doc.id, ...docData });
                        }
                    });
                    setCompletedTaskItems(fetchedPosts);
                })
            })
        } catch (error) {
            console.error("Error fetching posts:", error);
        }
        return () => { unsubscribePosts(); unsubscribeList(); }

    }


    function fetchLists() {
        const userProfileRef = doc(FIRESTORE_DB, 'Users', currentUser.uid);
        const listsRef = collection(userProfileRef, 'Lists');
        queryListsRef = query(listsRef, orderBy('timeListCreated', 'desc'));
        try {
            const unsubscribeLists = onSnapshot(queryListsRef,
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

    const sortTasks = (fetchedTasks) => {
        let sortedFetchedTasks = [];
        if (order == "default") {
            sortedFetchedTasks = fetchedTasks.slice().sort((a, b) => {
                if (!a.completeByDate && b.completeByDate) {
                    return 1
                }
                else if (a.completeByDate && !b.completeByDate) {
                    return -1
                }
                else if ((!a.completeByDate && !b.completeByDate) || (a.completeByDate && b.completeByDate && a.completeByDate.timestamp === b.completeByDate.timestamp)) {
                    if (a.priority - b.priority !== 0) {
                        return b.priority - a.priority;
                    }
                    else {
                        return b.timeTaskCreated - a.timeTaskCreated;
                    }
                }
                else {
                    return a.completeByDate.timestamp - b.completeByDate.timestamp;
                }
            })
        }
        else if (order == "priority") {
            sortedFetchedTasks = fetchedTasks.slice().sort((a, b) => {
                if (a.priority - b.priority !== 0) {
                    return b.priority - a.priority;
                }
                else {
                    return b.timeTaskCreated - a.timeTaskCreated;
                }
            })
        }
        else if (order == "dueDate") {
            sortedFetchedTasks = fetchedTasks.slice().sort((a, b) => {
                if (!a.completeByDate && b.completeByDate) {
                    return 1
                }
                else if (a.completeByDate && !b.completeByDate) {
                    return -1
                }
                else if ((!a.completeByDate && !b.completeByDate) || (a.completeByDate && b.completeByDate && a.completeByDate.timestamp === b.completeByDate.timestamp)) {
                    return b.timeTaskCreated - a.timeTaskCreated;
                }
                else {
                    return a.completeByDate.timestamp - b.completeByDate.timestamp;
                }
            })
        }
        else {
            sortedFetchedTasks = fetchedTasks.slice().sort((a, b) => {
                return a.name.localeCompare(b.name);
            })
        }
        setTaskItems(sortedFetchedTasks);
    }

    const addImage = async () => {
        try {
            let _image = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (_image.assets && !_image.canceled) {
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

    const completeTask = async (index, complete) => { // clean this
        const userProfileRef = doc(FIRESTORE_DB, 'Users', currentUser.uid);
        const tasksRef = collection(userProfileRef, 'Tasks');
        const postsRef = collection(FIRESTORE_DB, 'Posts');
        const listsRef = collection(userProfileRef, 'Lists');
        if (!complete) { // task --> post
            const task = taskItems[index];
            try {
                const batch = writeBatch(FIRESTORE_DB);
                const docId = task.id;
                const listIds = task.listIds;
                const postRef = doc(postsRef);
                batch.set(postRef, { // store post
                    userId: currentUser.uid,
                    name: task.name,
                    description: task.description,
                    timePosted: new Date(),
                    priority: task.priority,
                    reminders: task.reminders,
                    completeByDate: task.completeByDate,
                    isCompletionTime: task.isCompletionTime,
                    listIds: task.listIds,
                    timeTaskCreated: task.timeTaskCreated,
                })

                let listRef;
                listIds.forEach((listId) => { // add post to same lists
                    listRef = doc(listsRef, listId);
                    batch.update(listRef, { postIds: arrayUnion(postRef.id) });
                })

                batch.update(userProfileRef, { posts: increment(1) }); // increment post count

                const imageURI = await addImage(); // add image to post
                if (!imageURI) {
                    return; // make error
                }
                await cancelNotifications(task.notificationIds); // cancel any upcoming notifications

                const taskRef = doc(tasksRef, task.id);
                let newCompleteByDate;
                if (task.completeByDate && (newCompleteByDate = isRepeatingTask(task.completeByDate.timestamp, task.repeatEnds, task.repeat))) {// check if task repeats and return next possible date
                    batch.update(taskRef, {completeByDate: newCompleteByDate}); // set new completebydate, add one to post child counter, should be on its youngest child meaning no child has been uncompleted
                    if (task.reminders.length !== 0) { // schedule notifications
                        if (await configureNotifications()) { 
                            const tempNotifIds = await scheduleNotifications(task.reminders, newCompleteByDate, task.isCompletionTime, task.name);
                            batch.update(taskRef, {notificationIds: tempNotifIds});
                        }
                    }
                }
                else { // if task does not repeat
                    batch.delete(taskRef);
                    batch.update(userProfileRef, { tasks: increment(-1) });
                    listIds.forEach((listId) => { // remove task from lists
                        listRef = doc(listsRef, listId);
                        batch.update(listRef, { taskIds: arrayRemove(docId) });
                    })
                }
                batch.update(postRef, { image: imageURI });
                await batch.commit();

            } catch (error) {
                // add error if image fails
                console.error('Error updating task completion: ', error);
            }
        }
        else {
            const batch = writeBatch(FIRESTORE_DB);
            const post = completedTaskItems[index];
            const docId = post.id;
            const listIds = post.listIds;
            try {
                const postRef = doc(postsRef, docId);
                const taskRef = doc(tasksRef);
                batch.set(taskRef, {
                    name: post.name,
                    description: post.description,
                    priority: post.priority,
                    reminders: post.reminders,
                    completeByDate: post.completeByDate,
                    isCompletionTime: post.isCompletionTime,
                    listIds: post.listIds,
                    timeTaskCreated: post.timeTaskCreated,
                    notificationIds: [],
                });
                let listRef;
                listIds.forEach((listId) => {
                    listRef = doc(listsRef, listId);
                    batch.update(listRef, { postIds: arrayRemove(docId) });
                    batch.update(listRef, { taskIds: arrayUnion(taskRef.id) })
                })
                batch.delete(postRef);
                batch.update(userProfileRef, { posts: increment(-1)});
                if (post.reminders.length !== 0) {
                    if (await configureNotifications()) {
                        const tempNotifIds = await scheduleNotifications(post.reminders, post.completeByDate, post.isCompletionTime, post.name);
                        batch.update(taskRef, {notificationIds: tempNotifIds});
                    }
                }
                const image = post.image;
                if (image) {
                    const imageRef = ref(getStorage(), image);
                    await deleteObject(imageRef);
                }

                await batch.commit();

            } catch (error) {
                console.error('Error updating task completion: ', error);
            }
        }
    }

    const isRepeatingTask = (currDueDate, repeatEnds, selectedRepeat) => {
        if (currDueDate == null || selectedRepeat == null) {
            return 0;
        }
        let flag = 0;
        if (currDueDate >= new Date()) { //completed task on time
            flag = 1;
        }
        while (currDueDate < new Date() || flag === 1) { //completed task late
            if (repeatEnds) {
                console.log(repeatEnds);
                let tempCurrDueDate = currDueDate;
                tempCurrDueDate.setHours(0, 0, 0, 0);
                repeatEnds.setHours(0, 0, 0, 0);
                if (currDueDate > repeatEnds) {
                    return 0;
                }
            }
            if (selectedRepeat == 0) {
                currDueDate.setDate(currDueDate.getDate() + 1);
            }
            else if (selectedRepeat == 1) { 
                currDueDate.setDate(currDueDate.getDate() + 7);
            }
            else if (selectedRepeat == 2) {
                currDueDate.setMonth(currDueDate.getMonth() + 1);
            }
            else if (selectedRepeat == 3) {
                currDueDate.setYear(currDueDate.getYear() + 1);
            }
            else {
                if (currDueDate.getDay() === 5) {
                    currDueDate.setDate(currDueDate.getDate() + 3);
                }
                else if (currDueDate.getDay() === 6) {
                    currDueDate.setDate(currDueDate.getDate() + 2);
                }
                else {
                    currDueDate.setDate(currDueDate.getDate() + 1);
                }
            }
            if (flag === 1) {
                break;
            }
        }
        if (repeatEnds) {
            let tempCurrDueDate = currDueDate;
            tempCurrDueDate.setHours(0, 0, 0, 0);
            repeatEnds.setHours(0, 0, 0, 0);
            if (currDueDate > repeatEnds) {
                return 0;
            }
        }
        return {
            day: currDueDate.getDate(),
            month: currDueDate.getMonth() + 1,
            year: currDueDate.getFullYear(),
            timestamp: currDueDate,
            dateString: currDueDate.toISOString().split('T')[0],
        };
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
                    batch.update(listRef, { postIds: arrayRemove(docId) })
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
                    batch.update(listRef, { taskIds: arrayRemove(docId) })
                });
                batch.update(userProfileRef, { tasks: increment(-1) });
                batch.delete(taskRef);
                await cancelNotifications(taskItems[index].notificationIds);
            }
            await batch.commit();
            closeSwipeCard();
        } catch (error) {
            console.error('Error deleting document: ', error);
        };

    }

    const configureNotifications = async () => {
        const response = await Notifications.requestPermissionsAsync();
        if (!response.granted) {
            console.warn("⚠️ Notification Permissions not granted!");
            return response.granted;
        }
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowBanner: true,
                shouldShowList: true,
                shouldPlaySound: true,
                shouldSetBadge: true,
            }),
        });
        return response.granted;
    }

    const scheduleNotifications = async (selectedReminders, selectedDate, isTime, newTask) => {
        let notificationArray = [];
        if (!isTime) {
            selectedReminders.forEach(reminder => {
                let date = new Date(selectedDate.timestamp.getTime());
                let body;
                date.setHours(9);
                date.setMinutes(0);
                date.setSeconds(0);
                if (reminder == 0) {
                    body = "Today";
                }
                else if (reminder == 1) {
                    date.setDate(selectedDate.timestamp.getDate() - 1);
                    body = "Tomorrow"
                }
                else if (reminder == 2) {
                    date.setDate(selectedDate.timestamp.getDate() - 2);
                    body = "In 2 days";
                }
                else if (reminder == 3) {
                    date.setDate(selectedDate.timestamp.getDate() - 3);
                    body = "In 3 days";
                }
                else {
                    date.setDate(selectedDate.timestamp.getDate() - 7);
                    body = "In 1 week"
                }
                if (date > new Date()) {
                    notificationArray.push({date: date, title: newTask, body: body});
                }
            })
        }
        else {
            selectedReminders.forEach(reminder => {
                let date = new Date(selectedDate.timestamp.getTime());
                const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                let body;
                if (reminder == 0) {
                    body = "Now, " + timeString;
                }
                else if (reminder == 1) {
                    date.setMinutes(selectedDate.timestamp.getMinutes() - 5);
                    body = "In 5 minutes, " + timeString;
                }
                else if (reminder == 2) {
                    date.setMinutes(selectedDate.timestamp.getMinutes() - 30);
                    body = "In 30 minutes, " + timeString;
                }
                else if (reminder == 3) {
                    date.setHours(selectedDate.timestamp.getHours() - 1);
                    body = "in 1 hour, " + timeString;
                }
                else {
                    date.setDate(selectedDate.day - 1);
                    body = "Tomorrow, " + timeString;
                }
                if (date > new Date()) {
                    notificationArray.push({date: date, title: newTask, body: body});
                }
            })
        }
        return await scheduleAllNotifications(notificationArray);
    }

    const scheduleAllNotifications = async (notificationArray) => {
        let notificationIds = [];
        await Promise.all(
            notificationArray.map(async (notification) => {
                const id = await Notifications.scheduleNotificationAsync({
                    content: {
                        title: notification.title,
                        body: notification.body,
                        sound: Platform.OS === 'ios' ? "default" : undefined,
                    },
                    trigger: {
                        type: 'date',
                        date: notification.date,
                        allowWhileIdle: true,
                    },
                })
                notificationIds.push(id);
            })
        )
        return notificationIds
    }

    const cancelNotifications = async (notificationIds) => {
        await notificationIds.forEach(async (notification) => {
            await Notifications.cancelScheduledNotificationAsync(notification)
        })
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
       if (swipedCardRef) swipedCardRef.current?.close();
    }

    const handleTaskPress = (index) => {
        closeSwipeCard();
        setEditIndex(index);
        setEditTaskVisible(true);
    }

    const openSortModal = () => {
        sortRef.current?.measure((x, y, width, height, pageX, pageY) => {
            setSortYPosition(pageY);
        });
        setSortModalVisible(true);
    }

    const testFunction = async () => {
        await Notifications.cancelScheduledNotificationAsync("aee5ac74-2f06-49a2-a5a0-d7d0501ea0fc");
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
                    drawerStyle={{ width: '70%' }}
                >
                    <SafeAreaView style={styles.container}>
                        <Modal
                            visible={isEditTaskVisible}
                            transparent={true}
                            animationType='slide'
                        >
                            <EditTask 
                                task={taskItems[editIndex]} 
                                listItems={listItems} 
                                setEditTaskVisible={setEditTaskVisible} 
                                configureNotifications={configureNotifications} 
                                scheduleNotifications={scheduleNotifications} 
                                cancelNotifications={cancelNotifications} 
                                addImage={addImage}
                                isRepeatingTask={isRepeatingTask}
                            />
                        </ Modal>
                        <Modal
                            visible={sortModalVisible}
                            transparent={true}
                            animationType='fade'
                        >
                            <TouchableWithoutFeedback onPress={() => setSortModalVisible(false)}>
                                <View style={styles.sortContainer}>
                                    <TouchableWithoutFeedback>
                                        <View style={{top: sortYPosition + 40, ...styles.sortButtonContainer}}>
                                            <View style={styles.sortBy}>
                                                <Text style={styles.sortByText}>Sort by:</Text>
                                            </View>
                                            <View style={styles.divider} />
                                            <TouchableOpacity onPress={() => {setOrder("default")}} style={[order == "default" ? styles.selectedSortButton : {}, styles.sortButtons]}>
                                                <MaterialCommunityIcons name="sort" size={16} color="black" />
                                                <Text style={styles.sortText}>Default</Text>
                                            </TouchableOpacity>
                                            <View style={styles.divider} />
                                            <TouchableOpacity onPress={() => {setOrder("dueDate")}} style={[order == "dueDate" ? styles.selectedSortButton : {}, styles.sortButtons]}>
                                                <MaterialCommunityIcons name="sort-calendar-ascending" size={16} color="black" />
                                                <Text style={styles.sortText}>Due Date</Text>
                                            </TouchableOpacity>
                                            <View style={styles.divider} />
                                            <TouchableOpacity onPress={() => {setOrder("priority")}} style={[order == "priority" ? styles.selectedSortButton : {}, styles.sortButtons]}>
                                                <Icon name="flag" size={16} color={'black'} />
                                                <Text style={styles.sortText}>Priority</Text>
                                            </TouchableOpacity>
                                            <View style={styles.divider} />
                                            <TouchableOpacity onPress={() => {setOrder("name")}} style={[order == "name" ? styles.selectedSortButton : {}, styles.sortButtons]}>
                                                <MaterialCommunityIcons name="sort-alphabetical-ascending" size={16} color="black" />
                                                <Text style={styles.sortText}>Name</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </TouchableWithoutFeedback>
                                </View>
                            </TouchableWithoutFeedback>
                        </Modal>
                        <View style={styles.topBorder}>
                            <TouchableOpacity onPress={() => {closeSwipeCard(); setOpenDrawer(true)}}>
                                <Ionicons name="menu" size={32} color="black" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={testFunction}>
                                <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Doozy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity ref={sortRef} onPress={() => {closeSwipeCard(); openSortModal();}}>
                                <MaterialCommunityIcons name="sort" size={32} color="black" />
                            </TouchableOpacity>
                        </View>
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
                        </ScrollView>
                        <TaskCreation 
                            closeSwipeCard={closeSwipeCard} 
                            listItems={listItems} 
                            nav={props.navigation} 
                            configureNotifications={configureNotifications} 
                            scheduleNotifications={scheduleNotifications} 
                            isRepeatingTask={isRepeatingTask}
                        />
                    </SafeAreaView>
                </Drawer>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topBorder: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 20,
        marginBottom: 10
    },
    sortContainer: {
        flex: 1,
    },
    sortButtonContainer: {
        height: 195,
        backgroundColor: 'white',
        width: 150,
        borderWidth: 1,
        borderRadius: 15,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        right: 20,
        position: 'absolute',
        overflow: 'hidden'
    },
    sortBy: {
        height: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginLeft: 10,
    },
    sortByText: {

    },
    selectedSortButton: {
        backgroundColor: 'yellow',
    },
    sortButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        height: 40,
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    sortText: {
        marginLeft: 10,
    },
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        width: '100%',
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