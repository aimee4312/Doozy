import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableHighlight, Button, TouchableOpacity} from 'react-native';
import CustomPopupMenu from './CustomPopupMenu';
import TimePopupMenu from './TimePopupMenu';
import RepeatEndsModal from './RepeatEndsModal';

const ScheduleMenu = ( props ) => {

    const {handleTimeChange, time, isTime, setIsTime, selectedReminders, setSelectedReminders, selectedRepeat, setSelectedRepeat, dateRepeatEnds, setDateRepeatEnds, reminderString, repeatString, reminderNoTime, reminderWithTime, repeat} = props;

    const [reminderButtonHeight, setReminderButtonHeight] = useState(null);
    const [timeButtonHeight, setTimeButtonHeight] = useState(null);
    const [isReminderMenuVisible, setIsReminderMenuVisible] = useState(false);
    const [isRepeatMenuVisible, setIsRepeatMenuVisible] = useState(false);
    const [isRepeatEndsModalVisible, setIsRepeatEndsModalVisible] = useState(false);
    const [isTimeMenuVisible, setIsTimeMenuVisible] = useState(false);

  const toggleReminderMenu = () => {
    setIsReminderMenuVisible(!isReminderMenuVisible);
  };

  const toggleRepeatMenu = () => {
    setIsRepeatMenuVisible(!isRepeatMenuVisible);
  };

  const toggleRepeatEndsModal = () => {
    setIsRepeatEndsModalVisible(!isRepeatEndsModalVisible);
  };

  const toggleTimeMenu = () => {
    setIsTimeMenuVisible(!isTimeMenuVisible);
    if(!isTime) {
        setIsTime(true);
        setSelectedReminders([0]);
    }
  };

  const handleTimeCancel = () => {
    setIsTime(false);
    setSelectedReminders([]);
  }

  const handleReminderCancel = () => {
    setSelectedReminders([]);
  }

  const handleRepeatCancel = () => {
    setSelectedRepeat([]);
  }


    let hours = time.getHours(); // Get the hours component (0-23)
    const minutes = time.getMinutes(); // Get the minutes component (0-59)
    let period = 'AM'; // Default period is AM

    // Adjust hours to 12-hour format and determine AM/PM
    if (hours >= 12) {
        period = 'PM';
    }
    if (hours > 12) {
        hours -= 12;
    }

    // Handle midnight (0 hours) and noon (12 hours)
    if (hours === 0) {
        hours = 12;
    }

    // Format the hours and minutes to ensure they are always two digits (e.g., '01' instead of '1')
    const formattedHours = hours < 10 ? '0' + hours : hours;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

// Construct the time string in 'hh:mm AM/PM' format
    const timeString = `${formattedHours}:${formattedMinutes} ${period}`;


    return (
        <View style={styles.container}>
            <TouchableHighlight onPress={toggleTimeMenu} style={[styles.menuButton, styles.menuTopButton]} onLayout={(event) => {
                event.target.measure((x, y, width, height, pageX, pageY) => {
                setTimeButtonHeight(pageY);
                })
            }}>
                <View style={styles.menuButtonWrapper}>
                    <Text style={styles.menuText}>Time</Text>
                    <View style={styles.cancelContainer}>
                        <Text style={styles.menuText}>{isTime ? timeString : 'None'}</Text>
                        {isTime && <TouchableOpacity onPress={handleTimeCancel}>
                            <Text> X</Text>
                        </TouchableOpacity>}
                    </View>
                </View>
            </TouchableHighlight>
            <TouchableHighlight onPress={toggleReminderMenu} style={styles.menuButton} onLayout={(event) => {
                event.target.measure((x, y, width, height, pageX, pageY) => {
                setReminderButtonHeight(pageY);
                })
            }}>
                <View style={styles.menuButtonWrapper}>
                    <Text style={styles.menuText}>Reminder</Text>
                    <View style={styles.cancelContainer}>
                        <Text style={styles.menuText}>{reminderString}</Text>
                        {(selectedReminders.length !== 0) && <TouchableOpacity onPress={handleReminderCancel}>
                            <Text> X</Text>
                        </TouchableOpacity>}
                    </View>
                </View>
            </TouchableHighlight>
            <TouchableHighlight onPress={toggleRepeatMenu} style={[styles.menuButton, (selectedRepeat.length === 0) ? styles.menuBottomButton : null]}>
                <View style={styles.menuButtonWrapper}>
                    <Text style={styles.menuText}>Repeat</Text>
                    <View style={styles.cancelContainer}>
                        <Text style={styles.menuText}>{repeatString}</Text>
                        {(selectedRepeat.length !== 0) && <TouchableOpacity onPress={handleRepeatCancel}>
                            <Text> X</Text>
                        </TouchableOpacity>}
                    </View>
                </View>
            </TouchableHighlight>
            {(selectedRepeat.length !== 0) && <TouchableHighlight onPress={toggleRepeatEndsModal} style={[styles.menuButton, styles.menuBottomButton]}>
                <View style={styles.menuButtonWrapper}>
                    <Text style={styles.menuText}>Repeat Ends</Text>
                    <View style={styles.cancelContainer}>
                        <Text style={styles.menuText}>{repeatString}</Text>
                        {(selectedRepeat.length !== 0) && <TouchableOpacity onPress={handleRepeatCancel}>
                            <Text> X</Text>
                        </TouchableOpacity>}
                    </View>
                </View>
            </TouchableHighlight>}
            <TimePopupMenu isVisible={isTimeMenuVisible} onClose={toggleTimeMenu} time={time} handleTimeChange={handleTimeChange} buttonHeight={timeButtonHeight}/>
            <CustomPopupMenu isVisible={isReminderMenuVisible} onClose={toggleReminderMenu} menuOptions={isTime ? reminderWithTime : reminderNoTime} selectedOptions={selectedReminders} setSelectedOptions={setSelectedReminders} buttonHeight={reminderButtonHeight}/>
            <CustomPopupMenu isVisible={isRepeatMenuVisible} onClose={toggleRepeatMenu} menuOptions={repeat} selectedOptions={selectedRepeat} setSelectedOptions={setSelectedRepeat} buttonHeight={reminderButtonHeight + 50}/>
            <RepeatEndsModal isVisible={isRepeatEndsModalVisible} onClose={toggleRepeatEndsModal} dateRepeatEnds={dateRepeatEnds} setDateRepeatEnds={setDateRepeatEnds} />
        </View>
        );
  };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
        },
        menuTopButton: {
            borderTopLeftRadius: 5,
            borderTopRightRadius: 5,
            borderTopWidth: 1,
        },
        menuBottomButton: {
            borderBottomLeftRadius: 5,
            borderBottomRightRadius: 5,
            borderBottomWidth: 1,
        },
        menuButton: {
            padding: 15,
            backgroundColor: "lightgray",
            borderColor: 'gray',
            borderLeftWidth: 1,
            borderRightWidth: 1,
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
        cancelContainer: {
            flexDirection: 'row',
            alignItems: 'center'
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