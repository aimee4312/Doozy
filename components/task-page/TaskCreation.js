import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, TextInput, Text, View, Button, TouchableOpacity, TouchableHighlight, ScrollView, TouchableWithoutFeedback, SafeAreaView, Keyboard } from 'react-native';
import { KeyboardAccessoryView } from 'react-native-keyboard-accessory';
import Icon from 'react-native-vector-icons/FontAwesome';
import { MenuProvider } from 'react-native-popup-menu';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {Modalize} from 'react-native-modalize';


const TaskCreation = forwardRef(( props, ref) => {
    const {callSubmitHandler} = props;
    const [newTask, setNewTask] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [showTextInput, setShowTextInput] = useState(false);
    const textInputRef = useRef(null);
    const [completedCreateTask, setCompletedCreateTask] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const modalRef = useRef(null);
    const openModal = () => {modalRef?.current?.open();}


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

    const checker = () => {
        completedCreateTask ? setCompletedCreateTask(false) : setCompletedCreateTask(true);
    }

    const handleCalendarOpen = () => {
        
        Keyboard.dismiss();
        setShowTextInput(false);
        setTimeout(() => {
            openModal();
        }, 100);
    }


    return (
        <MenuProvider>
            <View style={styles.container}>
                
                {!showTextInput && (<View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={handleAddTask}>
                        <View style={styles.addTaskButtonWrapper}>
                            <Text style={styles.addTaskText}>+</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                )}
                {showTextInput && (
                    <KeyboardAccessoryView 
                        style={styles.taskCustomization}
                        heightProperty="minHeight" 
                        alwaysVisible={true} 
                        hideBorder={true} 
                        animateOn='all' 
                        androidAdjustResize
                    >
                            <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.container}>
                    <Modalize ref={modalRef} modalHeight={200}>
                                                <View style={{padding: 20}}>
                                                    <Text style={{fontSize: 22, fontWeight: 'bold', lineHeight: 34}}>
                                                    {'This is a modal'}
                                                    </Text>
                                                    <Text>
                                                    {
                                                        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed et euismod nisl. Nulla facilisi. Aenean et mi volutpat, iaculis libero non, luctus quam. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Curabitur euismod dapibus metus, eget egestas quam ullamcorper eu.'
                                                    }
                                                    </Text>
                                                </View>
                                            </Modalize>
                                            </SafeAreaView>
                                            </GestureHandlerRootView>
                            <View style={styles.inputWrapper}>
                                
                                <TouchableOpacity 
                                    style={ completedCreateTask ? styles.checkedbox : styles.uncheckedbox } 
                                    onPress={checker}
                                />
                                <TextInput
                                    ref={textInputRef}
                                    onFocus={handlePress}
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
                                        onPress={openModal}
                                    >
                                        <View style={styles.iconContainer}>
                                            <Icon
                                                name="calendar"
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
                                            name="flag"
                                            size={28}
                                            color={'black'}
                                        />
                                    </View>
                                </MenuTrigger>
                                
                                <MenuOptions style={styles.listsMenu}>
                                    <View style={styles.listsMenuScroll}>
                                        <MenuOption>
                                        <View style={styles.priorityWrapper}>
                                            <Icon
                                                name="flag"
                                                size={20}
                                                color={'black'}
                                                style={styles.flagSmall}
                                            />
                                            <Text style={styles.flagText}>High Priority</Text>
                                        </View>
                                        </MenuOption>
                                        <MenuOption>
                                        <View style={styles.priorityWrapper}>
                                            <Icon
                                                name="flag"
                                                size={20}
                                                color={'black'}
                                                style={styles.flagSmall}
                                            />
                                            <Text style={styles.flagText}>Medium Priority</Text>
                                        </View>
                                        </MenuOption>
                                        <MenuOption>
                                        <View style={styles.priorityWrapper}>
                                            <Icon
                                                name="flag"
                                                size={20}
                                                color={'black'}
                                                style={styles.flagSmall}
                                            />
                                            <Text style={styles.flagText}>Low Priority</Text>
                                        </View>
                                        </MenuOption>
                                        <MenuOption>
                                        <View style={styles.priorityWrapper}>
                                            <Icon
                                                name="flag"
                                                size={20}
                                                color={'black'}
                                                style={styles.flagSmall}
                                            />
                                            <Text style={styles.flagText}>No Priority</Text>
                                        </View>
                                        </MenuOption>
                                    </View>
                                </MenuOptions>
                            </Menu>
                                    <Menu style={styles.menuContainer}>
                                        <MenuTrigger 
                                            style={styles.folderButton}
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
                                            <KeyboardAwareScrollView  
                                                keyboardShouldPersistTaps={'handled'} 
                                                style={styles.listsMenuScroll} 
                                                enableOnAndroid={true}
                                            >
                                                <MenuOption text="List 1" />
                                                <MenuOption text="List 2" />
                                                <MenuOption text="List 1" />
                                                <MenuOption text="List 2" />
                                                <MenuOption text="List 1" />
                                                <MenuOption text="List 2" />
                                            </KeyboardAwareScrollView>
                                        </MenuOptions>
                                    </Menu>
                                </View>
                            </TouchableWithoutFeedback>
                    </KeyboardAccessoryView>
                )}
            </View>
        </MenuProvider>
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
    folderButton: {
        width: 60,
        flex: 0,
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
    menuContainer: {
        width: 300,
    },
    listsMenu: {
        backgroundColor: 'transparent',
        width: 200,
    },
    listsMenuScroll: {
        position: 'absolute',
        backgroundColor: 'white',
        borderColor: 'grey',
        borderWidth: 1,
        bottom: 0,
        width: 200,
        borderRadius: 5,
        maxHeight: 150,
    },
    priorityWrapper: {
        flexDirection: "row",
        alignItems: 'center',
        paddingVertical: 2,
    },
    flagSmall: {
        paddingRight: 20,
    },
    flagText: {
        fontSize: 18,
    }
})

export default TaskCreation;