import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, TextInput, Text, View, Button, TouchableOpacity } from 'react-native';
import { KeyboardAccessoryView } from 'react-native-keyboard-accessory';

const TaskCreation = forwardRef(( props, ref) => {
    const {callSubmitHandler} = props;
    const [newTask, setNewTask] = useState('');
    const [showTextInput, setShowTextInput] = useState(false);
    const textInputRef = useRef(null);

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
            {!showTextInput && (<View style={styles.buttonContainer}>
                <TouchableOpacity onPress={handleAddTask}>
                    <View style={styles.addTaskButtonWrapper}>
                        <Text style={styles.addTaskText}>+</Text>
                    </View>
                </TouchableOpacity>
            </View>)}
            {showTextInput && (
                <KeyboardAccessoryView heightProperty="minHeight" alwaysVisible={true} hideBorder={true} animateOn='all' androidAdjustResize>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            ref={textInputRef}
                            style={styles.input}
                            onChangeText={text => setNewTask(text)}
                            value={newTask}
                            placeholder={'Please type here…'}
                        />
                        <Button style={styles.submitButton} title="go" onPress={handleSubmitHelper}/>
                    </View>
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
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        marginRight: 16,
        marginBottom: 32,
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