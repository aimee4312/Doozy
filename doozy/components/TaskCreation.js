import React, { useState, useRef } from 'react';
import { StyleSheet, TextInput, Text, View, Button, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';

const TaskCreation = ({ callSubmitHandler }) => {

    const [newTask, setNewTask] = useState('');
    const [showTextInput, setShowTextInput] = useState(false);
    const textInputRef = useRef(null);

    const handleAddTask = () => {
        setShowTextInput(true);
        setTimeout(() => {
            textInputRef.current.focus();
        }, 100);

    };

    const handleSubmitHelper = () => {
        callSubmitHandler(newTask);
        setNewTask('');
        setShowTextInput(false);
    };

    return (
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
                        <Button style={styles.submitButton} title="go" onPress={handleSubmitHelper}/>
                    </View>
                )}
            </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
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

export default TaskCreation;