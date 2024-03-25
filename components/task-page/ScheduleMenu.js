import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Button} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import CustomPopupMenu from './CustomPopupMenu';

const ScheduleMenu = ( props ) => {

    const {handleTimeChange, time, selectedReminders, handleReminderSelect} = props;

    const [buttonHeight, setButtonHeight] = useState(null);
    const onChange = (event, newTime) => {
        if (newTime !== undefined) {
            handleTimeChange(newTime);
        }
    };
    const [isMenuVisible, setIsMenuVisible] = useState(false);

  const toggleMenu = () => {
    setIsMenuVisible(!isMenuVisible);
    console.log(buttonHeight)
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
            <View style={styles.menuButton}>
                <View style={styles.menuButtonWrapper}>
                    <Text style={styles.menuText}>Time</Text>
                    <DateTimePicker mode="time" value={time} onChange={onChange} />
                </View>
            </View>
            <View style={styles.menuButton} onLayout={(event) => {
                event.target.measure((x, y, width, height, pageX, pageY) => {
                console.log(pageX)
                console.log(pageY)
                setButtonHeight(pageY);
                })
            }}>
                <View style={styles.menuButtonWrapper}>
                    <Text style={styles.menuText}>Reminder</Text>
                    <View style={styles.buttonReminder} >
                    <Button title="toggle" onPress={toggleMenu}/>
                    
                    </View>
                </View>
            </View>
            <View style={styles.menuButton}>
                <Text style={styles.menuText}>Repeat</Text>
            </View>
            <CustomPopupMenu isVisible={isMenuVisible} onClose={toggleMenu} reminderOptions={reminderOptions} selectedReminders={selectedReminders} handleReminderSelect={handleReminderSelect} buttonHeight={buttonHeight}/>
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