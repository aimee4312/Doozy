import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableHighlight} from 'react-native';
import CustomPopupMenu from './CustomPopupMenu';
import TimePopupMenu from './TimePopupMenu';

const ScheduleMenu = ( props ) => {

    const {handleTimeChange, time, selectedReminders, handleReminderSelect} = props;

    const [buttonHeight, setButtonHeight] = useState(null);
    const [timeButtonHeight, setTimeButtonHeight] = useState(null);
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [isTimeMenuVisible, setIsTimeMenuVisible] = useState(false);

  const toggleMenu = () => {
    setIsMenuVisible(!isMenuVisible);
  };

  const toggleTimeMenu = () => {
    setIsTimeMenuVisible(!isTimeMenuVisible);
  };


    const reminderOptions = [
        { label: 'On the day (9:00 am)' },
        { label: '1 day early (9:00 am)' },
        { label: '2 day early (9:00 am)' },
        { label: '3 day early (9:00 am)' },
        { label: '1 week early (9:00 am)' }
      ];


    return (
        <View style={styles.container}>
            <TouchableHighlight onPress={toggleTimeMenu} style={styles.menuButton} onLayout={(event) => {
                event.target.measure((x, y, width, height, pageX, pageY) => {
                setTimeButtonHeight(pageY);
                })
            }}>
                <View style={styles.menuButtonWrapper}>
                    <Text style={styles.menuText}>Time</Text>
                    <Text style={styles.menuText}>Toggle</Text>
                </View>
            </TouchableHighlight>
            <TouchableHighlight onPress={toggleMenu} style={styles.menuButton} onLayout={(event) => {
                event.target.measure((x, y, width, height, pageX, pageY) => {
                setButtonHeight(pageY);
                })
            }}>
                <View style={styles.menuButtonWrapper}>
                    <Text style={styles.menuText}>Reminder</Text>
                    <Text style={styles.menuText}>Toggle</Text>
                </View>
            </TouchableHighlight>
            <View style={styles.menuButton}>
                <Text style={styles.menuText}>Repeat</Text>
            </View>
            <CustomPopupMenu isVisible={isMenuVisible} onClose={toggleMenu} reminderOptions={reminderOptions} selectedReminders={selectedReminders} handleReminderSelect={handleReminderSelect} buttonHeight={buttonHeight}/>
            <TimePopupMenu isVisible={isTimeMenuVisible} onClose={toggleTimeMenu} time={time} handleTimeChange={handleTimeChange} buttonHeight={timeButtonHeight}/>
        </View>
        );
  };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: "lightgray",
            borderRadius: 5,
            borderColor: 'gray',
            borderWidth: 1,
        },
        menuButton: {
            padding: 15,
        },
        buttonReminder: {
            backgroundColor: '#cccccc',
            borderRadius: 5,
        },
        menuButtonWrapper: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        menuText: {
            fontSize: 16
        },
        selectedReminders: {
            backgroundColor: "yellow",
        },
        listsMenu: {
            backgroundColor: 'transparent',
            zIndex: 1000,
        },
    });
  
  export default ScheduleMenu;