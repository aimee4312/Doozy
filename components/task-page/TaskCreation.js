import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, TextInput, Text, View, Button, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, InputAccessoryView } from 'react-native';

const TaskCreation = forwardRef(( props, ref) => {
    const {callSubmitHandler} = props;
    const [newTask, setNewTask] = useState('');
    const [showTextInput, setShowTextInput] = useState(false);
    const textInputRef = useRef(null);
    const inputAccessoryViewID = 'uniqueID';

    useImperativeHandle(ref, () => ({
        closeKeyboard() {
            setShowTextInput(false);
        }
    }))

    

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
        <View style={styles.container}>
            <View style={styles.buttonContainer}>
                {!showTextInput && (
                    <TouchableOpacity onPress={handleAddTask}>
                        <View style={styles.addTaskButtonWrapper}>
                            <Text style={styles.addTaskText}>+</Text>
                        </View>
                    </TouchableOpacity>
                )}
            </View>
            {showTextInput && (
                <InputAccessoryView>
                    <View style={styles.inputWrapper}>
                    <TextInput
                    ref={textInputRef}
                    style={styles.input}
                    inputAccessoryViewID={inputAccessoryViewID}
                    onChangeText={text => setNewTask(text)}
                    value={newTask}
                    placeholder={'Please type here…'}
                    />
                    <Button style={styles.submitButton} title="go" onPress={handleSubmitHelper}/>
                    </View>
                </InputAccessoryView>
            )}
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column-reverse',
        marginBottom: 16,
    },
    writeTaskWrapper: {
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    buttonContainer: {
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        marginBottom: 16,
        marginRight: 16,
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