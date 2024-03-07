import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, TextInput, Text, View, Button, TouchableOpacity, TouchableHighlight, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { KeyboardAccessoryView } from 'react-native-keyboard-accessory';
import Icon from 'react-native-vector-icons/FontAwesome';
import { MenuProvider } from 'react-native-popup-menu';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';

const TaskCreation = forwardRef(( props, ref) => {
    const {callSubmitHandler} = props;
    const [newTask, setNewTask] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [showTextInput, setShowTextInput] = useState(false);
    const textInputRef = useRef(null);
    const [completedCreateTask, setCompletedCreateTask] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

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
        callSubmitHandler(newTask, completedCreateTask); // add newDescription, 
        setNewTask('');
        setShowTextInput(false);
        setCompletedCreateTask(false);
    };

    const handlePress = () => {
        setIsFocused(true);
    };
    
    const handleBlur = () => {
        setIsFocused(false);
    };

    const checker = () => {
        completedCreateTask ? setCompletedCreateTask(false) : setCompletedCreateTask(true);
    }

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
                    <KeyboardAccessoryView 
                        style={styles.taskCustomization}
                        heightProperty="minHeight" 
                        alwaysVisible={true} 
                        hideBorder={true} 
                        animateOn='all' 
                        androidAdjustResize
                    >
                        <MenuProvider>
                            <View style={styles.inputWrapper}>
                                <TouchableOpacity 
                                    style={ completedCreateTask ? styles.checkedbox : styles.uncheckedbox } 
                                    onPress={checker}
                                />
                                <TextInput
                                    ref={textInputRef}
                                    onFocus={handlePress}
                                    onBlur={handleBlur}
                                    style={styles.inputTask}
                                    onChangeText={text => setNewTask(text)}
                                    value={newTask}
                                    placeholder={'Please type here…'}
                                />
                                <Button 
                                    style={styles.submitButton} 
                                    title="go" 
                                    onPress={handleSubmitHelper}
                                />
                            </View>
                            <View style={styles.descriptionWrapper}>
                                <TextInput
                                    style={styles.inputDescription}
                                    onChangeText={text => setNewDescription(text)}
                                    value={newDescription}
                                    placeholder={'Description…'}
                                />
                            </View>
                            <TouchableWithoutFeedback onPress={handlePress}>
                                <View style={styles.detailsWrapper}>
                                    <TouchableHighlight 
                                        style={styles.submitButton}
                                    >
                                        <View style={styles.iconContainer}>
                                            <Icon
                                                name="calendar"
                                                size={28}
                                                color={'black'}
                                            />
                                        </View>
                                    </TouchableHighlight>
                                    <TouchableHighlight 
                                        style={styles.submitButton}
                                    >
                                        <View style={styles.iconContainer}>
                                            <Icon
                                                name="flag"
                                                size={28}
                                                color={'black'}
                                            />
                                        </View>
                                    </TouchableHighlight>
                                    <Menu>
                                        <MenuTrigger 
                                            style={styles.submitButton}
                                        >
                                            <View style={styles.iconContainer}>
                                                <Icon
                                                    name="folder"
                                                    size={28}
                                                    color={'black'}
                                                />
                                            </View>
                                        </MenuTrigger>
                                        
                                        <MenuOptions style={styles.listsMenu}>
                                            <ScrollView style={styles.listsMenuScroll}>
                                                <MenuOption text="List 1" />
                                                <MenuOption text="List 2" />
                                                <MenuOption text="List 1" />
                                                <MenuOption text="List 2" />
                                                <MenuOption text="List 1" />
                                                <MenuOption text="List 2" />
                                            </ScrollView>
                                        </MenuOptions>
                                    </Menu>
                                </View>
                            </TouchableWithoutFeedback>
                        </MenuProvider>
                    </KeyboardAccessoryView>
                )}
            </View>
    );
});

const styles = StyleSheet.create({
    touchable: {
        marginVertical: 300,
    },
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
    taskCustomization: {
        backgroundColor: '#FFF',
        borderColor: '#C0C0C0',
        borderWidth: 1,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
    },
    inputWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#C0C0C0',
    },
    inputTask: {
        paddingVertical: 15,
        paddingHorizontal: 15,
        width: '80%',
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
    checkedbox: {
        width: 24,
        height: 24,
        opacity: 0.4,
        backgroundColor: '#55BCF6',
        borderRadius: 5,
        marginLeft: 15,
    },
    uncheckedbox: {
        width: 24,
        height: 24,
        opacity: 0.4,
        backgroundColor: 'grey',
        borderRadius: 5,
        marginLeft: 15,
    },
    inputDescription: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        width: '100%',
    },
    detailsWrapper: {
        flexDirection: 'row',
        justifyContent: 'left',
        alignItems: 'center',
    },
    iconContainer: {
        padding: 10,
    },
    listsMenu: {
        marginTop: -120,
        height: 70,
    },
    listsMenuScroll: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#C0C0C0',
    }
})

export default TaskCreation;