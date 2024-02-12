import React, { useState, useRef } from 'react';
import { StyleSheet, TextInput, Text, View, Button, Keyboard, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import Task from '../components/Task'

const TaskListScreen = () => {
    const [newTask, setNewTask] = useState('');
    const [taskItems, setTaskItems] = useState([]);
    const [completedTaskItems, setCompletedTaskItems] = useState([]);
    const [showTextInput, setShowTextInput] = useState(false);
    const textInputRef = useRef(null);

    const handleAddTask = () => {
        setShowTextInput(true);
        setTimeout(() => {
            textInputRef.current.focus();
        }, 100);

    };
    
    const handleSubmit = () => {
        setTaskItems([...taskItems, newTask]);
        setNewTask(null);
        setShowTextInput(false);
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
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.writeTaskWrapper}
                >
                {!showTextInput && (
                    <TouchableOpacity onPress={handleAddTask}>
                        <View style={styles.addTaskButtonWrapper}>
                            <Text style={styles.addTaskText}>+</Text>
                        </View>
                    </TouchableOpacity>
                )}
                {showTextInput && (
                    <View style={styles.inputWrapper}>
                        <TextInput
                            ref={textInputRef}
                            style={styles.input}
                            placeholder="Type something..."
                            value={newTask}
                            onChangeText={text => setNewTask(text)}
                        />
                        <Button style={styles.submitButton} title="go" onPress={() => handleSubmit()}/>
                    </View>
                )}
            </KeyboardAvoidingView>
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
    writeTaskWrapper: {
        position: 'absolute',
        width: '100%',
        bottom: 40,
        flexDirection: 'row-reverse',
        alignItems: 'center',
    },
    inputWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: 10,
        backgroundColor: '#FFF',
        borderColor: '#C0C0C0',
        borderWidth: 1,
        borderRadius: 5,
    },
    input: {
        paddingVertical: 15,
        paddingHorizontal: 15,
        width: '90%',
    },
    submitButton: {
        
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
})
export default TaskListScreen;