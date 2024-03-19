import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, TextInput, Text, View, TouchableOpacity, Button, TouchableHighlight, ScrollView, TouchableWithoutFeedback, SafeAreaView, Keyboard, Dimensions } from 'react-native';
import { KeyboardAccessoryView } from 'react-native-keyboard-accessory';
import Icon from 'react-native-vector-icons/FontAwesome';
import { MenuProvider, Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import Modal from "react-native-modal";
import CustomDropDown from './CustomDropDown';
import ScheduleBuilder from './ScheduleBuilder';
import ScheduleMenu from './ScheduleMenu';



const TaskCreation = forwardRef(( props, ref) => {
    const {callSubmitHandler} = props;
    const [newTask, setNewTask] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [showTextInput, setShowTextInput] = useState(false);
    const textTaskInputRef = useRef(null);
    const [completedCreateTask, setCompletedCreateTask] = useState(false);
    const [isCalendarModalVisible, setCalendarModalVisible] = useState(false);
    const [isListModalVisible, setListModalVisible] = useState(false);
    const screenHeight = Dimensions.get('window').height;
    const screenWidth = Dimensions.get('window').width;
    const modalHeight = screenHeight * 0.7;

    const [selectedItems, setSelectedItems] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');

    const [openFolders, setOpenFolders] = useState([]);

    const [selectedOption, setSelectedOption] = useState(null);

    const [time, setTime] = useState(new Date()) //change this eventually

    const handleTimeChange = (newTime) => {
        setTime(newTime);
        console.log(time);
    }

    const toggleFolder = (index) => {
      if (openFolders.includes(index)) {
        setOpenFolders(openFolders.filter((item) => item !== index));
      } else {
        setOpenFolders([...openFolders, index]);
      }
    };

    const menuOptions = [
        { text: 'High Priority', icon: 'flag', color: 'red' },
        { text: 'Medium Priority', icon: 'flag', color: '#FF4500' },
        { text: 'Low Priority', icon: 'flag', color: 'orange' },
        { text: 'No Priority', icon: 'flag', color: '#FFD700' }
      ];

      const handleOptionSelect = (index) => {
        setSelectedOption(index);
        // Perform other actions based on the selected option if needed
      };

    const handleDateSelect = (date) => {
        setSelectedDate(date.dateString);
      };


    const toggleSelection = (mainIndex, subIndex) => {
        const isSelected = selectedItems.some((item) => item.mainIndex === mainIndex && item.subIndex === subIndex);
        if (isSelected) {
        setSelectedItems(selectedItems.filter((item) => !(item.mainIndex === mainIndex && item.subIndex === subIndex)));
        } else {
        setSelectedItems([...selectedItems, { mainIndex, subIndex }]);
        }
    };

    const options = [
        { label: '', subrows: [{ label: 'Subrow 1.1' }, { label: 'Subrow 1.2' }] },
        { label: 'Item 2', subrows: [{ label: 'Subrow 2.1' }, { label: 'Subrow 2.2' }] },
        { label: '', subrows: [{ label: 'Subrow 3.1' }, { label: 'Subrow 3.2' }] },
      ];

    const toggleCalendarModal = () => {
        setCalendarModalVisible(!isCalendarModalVisible);
    };

    const toggleListModal = () => {
        setListModalVisible(!isListModalVisible);
    };

    //handles error
    useImperativeHandle(ref, () => ({
        closeKeyboard() {
            setShowTextInput(false);
        }
    }))

    const handleAddTask = () => {
        setShowTextInput(true);
        setTimeout(() => {
            textTaskInputRef?.current?.focus();
        }, 100);
    };

    const handleSubmitHelper = () => {
        callSubmitHandler(newTask, completedCreateTask); // add newDescription, 
        setNewTask('');
        setShowTextInput(false);
        setCompletedCreateTask(false);
    };


    const checker = () => {
        completedCreateTask ? setCompletedCreateTask(false) : setCompletedCreateTask(true);
    }

    return (
            <View style={styles.container}>
                <Modal 
                    isVisible={isCalendarModalVisible} 
                    onBackdropPress={toggleCalendarModal} 
                    style={{ justifyContent: 'flex-end', margin: 0 }} 
                    propagateSwipe
                >
                    <View style={{ backgroundColor: 'white', padding: 20, height: modalHeight }}>
                    <ScrollView>
                        <ScheduleBuilder selectedDate={selectedDate} handleDateSelect={handleDateSelect} />
                        <ScheduleMenu handleTimeChange={handleTimeChange} time={time} />
                    </ScrollView>
                    </View>
                </Modal>
                <Modal 
                    isVisible={isListModalVisible} 
                    onBackdropPress={toggleListModal} 
                    style={{ justifyContent: 'flex-end', margin: 0}} 
                    propagateSwipe
                >
                    <CustomDropDown 
                    options={options} 
                    selectedItems={selectedItems} 
                    toggleSelection={toggleSelection} 
                    openFolders={openFolders}
                    toggleFolder={toggleFolder} />
                </Modal>
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
                        <TouchableWithoutFeedback>
                            <View>
                            <View style={styles.inputWrapper}>
                                <TouchableOpacity 
                                    style={ completedCreateTask ? styles.checkedbox : styles.uncheckedbox } 
                                    onPress={checker}
                                />
                                <TextInput
                                    ref={textTaskInputRef}
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
                        
                            <View style={styles.detailsWrapper}>
                                <TouchableHighlight
                                    style={styles.submitButton}
                                    onPress={toggleCalendarModal}
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
                                    <MenuTrigger style={styles.submitButton}>
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
                                        {menuOptions.map((option, index) => (
                                        <TouchableOpacity key={index} onPress={() => handleOptionSelect(index)}>
                                            <View style={[styles.priorityWrapper, selectedOption === index && styles.selectedOption]}>
                                                <Icon name={option.icon} size={20} color={option.color} style={styles.flagSmall} />
                                                <Text style={styles.flagText}>{option.text}</Text>
                                            </View>
                                        </TouchableOpacity>))}
                                        </View>
                                    </MenuOptions>
                                </Menu>
                                <Menu>
                                    <MenuTrigger style={styles.submitButton}>
                                        <View style={styles.iconContainer}>
                                            <Icon
                                                name="folder"
                                                size={28}
                                                color={'black'}
                                            />
                                        </View>
                                    </MenuTrigger>
                                    <MenuOptions style={styles.listsMenu}>
                                        <View style={styles.listsMenuScroll}>
                                            <TouchableHighlight
                                                style={styles.submitButton}
                                                onPress={toggleListModal}
                                            >
                                                <View>
                                                    <Text style={styles.titleText}>Select Lists</Text>
                                                </View>
                                            </TouchableHighlight>
                                            <View style={styles.chipsContainer}>
                                                {selectedItems.map((item, index) => (
                                                <TouchableOpacity key={index} onPress={() => toggleSelection(item.mainIndex, item.subIndex)}>
                                                    <View style={styles.chip}>
                                                        <Text style={styles.chipText}>{options[item.mainIndex].subrows[item.subIndex].label}</Text>
                                                    </View>
                                                </TouchableOpacity>
                                                ))}
                                            </View>
                                        </View>
                                    </MenuOptions>
                                </Menu>
                            </View>
                            </View>
                        </TouchableWithoutFeedback>
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
        position: 'absolute',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        right: 16,
        bottom: 32,
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
    listsMenuSelect: {
        flex: .55,
        paddingTop: 10,
        backgroundColor: 'white',
        borderColor: 'grey',
        borderWidth: 1,
        borderRadius: 5,
    },
    multiSelectBox: {
        margin: 0,
        padding: 5,
    },
    listModal: {
        
    },
    priorityWrapper: {
        flexDirection: "row",
        alignItems: 'center',
        paddingVertical: 2,
    },
    selectedOption: {
        backgroundColor: "yellow",
    },
    flagSmall: {
        paddingRight: 20,
    },
    flagText: {
        fontSize: 18,
    },
    customItem: {
        margin: 0,
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
      },
      chip: {
        backgroundColor: 'lightgray',
        borderRadius: 10,
        padding: 5,
        margin: 5,
      },
      chipText: {
        fontSize: 14,
      },
      titleText: {
        fontSize: 18,
      }
})

export default TaskCreation;