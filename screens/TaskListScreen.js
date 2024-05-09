import React, { createContext, useContext, useState, useRef, forwardRef } from 'react';
import { StyleSheet, ScrollView, TextInput, Text, View, Button, Keyboard, KeyboardAvoidingView, Platform, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import Task from '../components/task-page/Task'
import TaskCreation from '../components/task-page/TaskCreation'
import { MenuProvider } from 'react-native-popup-menu';
import NavigationBar from '../components/auth/NavigationBar';

const TaskListScreen = () => {
    
    const [taskItems, setTaskItems] = useState([]);
    const [completedTaskItems, setCompletedTaskItems] = useState([]);
    const [showTaskTitle, setShowTaskTitle] = useState(false);
    const [showCompletedTitle, setShowCompletedTitle] = useState(false);
    const childRef = useRef();
    
    const handleSubmit = (newTask, completedCreateTask) => {
        if (newTask.length !== 0) {
            if (!completedCreateTask) {
                setTaskItems([...taskItems, newTask]);
                setShowTaskTitle(true);
            }
            else {
                setCompletedTaskItems([...completedTaskItems, newTask]);
                setShowCompletedTitle(true);
            }
        }
    }

    const completeTask = (index, complete) => {
        if (!complete) {
            let itemsCopy = [...taskItems];
            let completedItem = taskItems[index];
            itemsCopy.splice(index, 1);
            setTaskItems(itemsCopy);
            setCompletedTaskItems([...completedTaskItems, completedItem]);
            setShowCompletedTitle(true);
            if (itemsCopy.length === 0) {
                setShowTaskTitle(false);
            }
        }
        else {
            let itemsCopy = [...completedTaskItems];
            let incompletedItem = completedTaskItems[index];
            itemsCopy.splice(index, 1);
            setCompletedTaskItems(itemsCopy);
            setTaskItems([...taskItems, incompletedItem]);
            setShowTaskTitle(true);
            if (itemsCopy.length === 0) {
                setShowCompletedTitle(false);
            }
        }
    }

    const deleteItem = (index, complete) => {
        if (!complete) {
            let itemsCopy = [...taskItems];
            itemsCopy.splice(index, 1);
            setTaskItems(itemsCopy);
            if (itemsCopy.length === 0) {
                setShowTaskTitle(false);
            }
        }
        else {
            let itemsCopy = [...completedTaskItems];
            itemsCopy.splice(index, 1);
            setCompletedTaskItems(itemsCopy);
            if (itemsCopy.length === 0) {
                setShowCompletedTitle(false);
            }
        }
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
                {showTaskTitle && <View style={styles.tasksContainer}>
                    <Text style={styles.sectionTitle}>Tasks</Text>
                    <View style={styles.tasks}>
                    {   
                        taskItems.map((item, index) => {
                            return(
                                <View key={index}>
                                    <Task 
                                        text={item} 
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
                {showCompletedTitle && <View style={styles.tasksContainer}>
                    <Text style={styles.sectionTitle}>Completed</Text>
                    <View style={styles.tasks}>
                    {   
                        completedTaskItems.map((item, index) => {
                            return(
                                <View key={index}>
                                    <Task 
                                        text={item} 
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
                <TaskCreation ref={childRef} callSubmitHandler={handleSubmit} />
                <NavigationBar/>
            </View>
            </MenuProvider>
            
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 80,
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