import React, { createContext, useContext, useState, useRef } from 'react';
import { StyleSheet, TextInput, Text, View, Button, Keyboard, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import Task from '../components/Task'
import TaskCreation from '../components/TaskCreation'

const TaskListScreen = () => {
    
    const [taskItems, setTaskItems] = useState([]);
    const [completedTaskItems, setCompletedTaskItems] = useState([]);
    
    const handleSubmit = (newTask) => {
        console.log(newTask);
        if (newTask.length !== 0) {
            setTaskItems([...taskItems, newTask]);
        }
    }

    const completeTask = (index) => {
        let itemsCopy = [...taskItems];
        let deletedItem = taskItems[index];
        itemsCopy.splice(index, 1);
        setTaskItems(itemsCopy);
        setCompletedTaskItems([...completedTaskItems, deletedItem])
    }

    return (
        <View style={styles.container}>
            <View style={styles.tasksContainer}>
                <Text style={styles.sectionTitle}>Tasks</Text>
                <View style={styles.tasks}>
                {   
                    taskItems.map((item, index) => {
                        return(
                            <TouchableOpacity key={index} onPress={() => completeTask(index)}>
                                <Task text={item} />
                            </TouchableOpacity>
                        )
                    })
                }
                </View>
                <Text style={styles.sectionTitle}>Completed</Text>
                <View style={styles.tasks}>
                {   
                    completedTaskItems.map((item, index) => {
                        return(
                            <Task key={index} text={item} />
                        )
                    })
                }
                </View>
            </View>
            <TaskCreation callSubmitHandler={handleSubmit} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tasksContainer: {
        paddingTop: 80,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    tasks: {
        backgroundColor: '#FFF',
        marginTop: 5,
        borderRadius: 5,
        marginBottom: 30,
    },
})
export default TaskListScreen;