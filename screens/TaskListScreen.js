import React, { createContext, useContext, useState, useRef, forwardRef } from 'react';
import { StyleSheet, TextInput, Text, View, Button, Keyboard, KeyboardAvoidingView, Platform, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import Task from '../components/task-page/Task'
import TaskCreation from '../components/task-page/TaskCreation'

const TaskListScreen = () => {
    
    const [taskItems, setTaskItems] = useState([]);
    const [completedTaskItems, setCompletedTaskItems] = useState([]);
    const [showTaskTitle, setShowTaskTitle] = useState(false);
    const [showCompletedTitle, setShowCompletedTitle] = useState(false);
    const childRef = useRef();
    
    const handleSubmit = (newTask) => {
        if (newTask.length !== 0) {
            setTaskItems([...taskItems, newTask]);
            setShowTaskTitle(true);
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

    const DismissKeyboard = ({ children }) => (
        <TouchableWithoutFeedback onPress={() => childRef.current.closeKeyboard()}>
            {children}
        </TouchableWithoutFeedback>
        );

    return (
        <DismissKeyboard>
            <View style={styles.container}>
                {showTaskTitle && <View style={styles.tasksContainer}>
                    <Text style={styles.sectionTitle}>Tasks</Text>
                    <View style={styles.tasks}>
                    {   
                        taskItems.map((item, index) => {
                            return(
                                <View key={index}>
                                    <Task text={item} tick={completeTask} i={index} complete={false} />
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
                                    <Task text={item} tick={completeTask} i={index} complete={true} />
                                </View>
                            )
                        })
                    }
                    </View>
                </View>}
                <TaskCreation ref={childRef} callSubmitHandler={handleSubmit} />
            </View>
        </DismissKeyboard>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 80,
        paddingHorizontal: 20,
    },
    tasksContainer: {
        paddingBottom: 20,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    tasks: {
        backgroundColor: '#FFF',
        marginTop: 5,
        borderRadius: 5,
    },
})
export default TaskListScreen;