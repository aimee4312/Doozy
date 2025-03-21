import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableHighlight, Button, TouchableOpacity} from 'react-native';
import CustomPopupMenu from './PopUpMenus/CustomPopupMenu';
import TimePopupMenu from './PopUpMenus/TimePopupMenu';
import RepeatEndsModal from './PopUpMenus/RepeatEndsModal';
import ScheduleBuilder from './PopUpMenus/ScheduleBuilder';

const ScheduleMenu = ( props ) => {


    const getTodayDate = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today.toISOString().split('T')[0]; // Returns date in YYYY-MM-DD format
      };
    const {isCalendarModalVisible, setCalendarModalVisible, selectedDate, setSelectedDate, time, setTime, isTime, setIsTime, selectedReminders, setSelectedReminders, selectedRepeat, setSelectedRepeat, dateRepeatEnds, setDateRepeatEnds, reminderString, setReminderString, repeatString, setRepeatString, reminderNoTime, reminderWithTime, repeat} = props;

    const [tempSelectedDate, setTempSelectedDate] = useState(selectedDate == '' ? getTodayDate() : selectedDate);
    const [tempTime, setTempTime] = useState(time);
    const [tempSelectedReminders, setTempSelectedReminders] = useState(selectedReminders);
    const [tempSelectedRepeat, setTempSelectedRepeat] = useState(selectedRepeat);
    const [tempDateRepeatEnds, setTempDateRepeatEnds] = useState(dateRepeatEnds);
    const [tempReminderString, setTempReminderString] = useState(reminderString);
    const [tempRepeatString, setTempRepeatString] = useState(repeatString)

    const [isTempTime, setIsTempTime] = useState(isTime);
    const [reminderButtonHeight, setReminderButtonHeight] = useState(null);
    const [timeButtonHeight, setTimeButtonHeight] = useState(null);
    const [isReminderMenuVisible, setIsReminderMenuVisible] = useState(false);
    const [isRepeatMenuVisible, setIsRepeatMenuVisible] = useState(false);
    const [isRepeatEndsModalVisible, setIsRepeatEndsModalVisible] = useState(false);
    const [isTimeMenuVisible, setIsTimeMenuVisible] = useState(false);

    const reminderMenuRef = useRef(null);
    const timeMenuRef = useRef(null);

    const handleDateSelect = (date) => {
        setTempSelectedDate(date);
      };

  const toggleReminderMenu = () => {
    if (reminderMenuRef.current) {
        reminderMenuRef.current.measure((x, y, width, height, pageX, pageY) => {
            setReminderButtonHeight(pageY);
        });
    }
    setIsReminderMenuVisible(!isReminderMenuVisible);
    
  };

  const toggleRepeatMenu = () => {
    setIsRepeatMenuVisible(!isRepeatMenuVisible);
  };

  const toggleRepeatEndsModal = () => {
    setIsRepeatEndsModalVisible(!isRepeatEndsModalVisible);
  };

  const toggleTimeMenu = () => {
    if (timeMenuRef.current) {
        timeMenuRef.current.measure((x, y, width, height, pageX, pageY) => {
            setTimeButtonHeight(pageY);
        });
    }
    setIsTimeMenuVisible(!isTimeMenuVisible);
    if(!isTempTime) {
        setIsTempTime(true);
        setTempSelectedReminders([0]);
    }
  };

  const handleTimeCancel = () => {
    setIsTempTime(false);
    setTempSelectedReminders([]);
  }

  const handleReminderCancel = () => {
    setTempSelectedReminders([]);
  }

  const handleRepeatCancel = () => {
    setTempSelectedRepeat([]);
    setTempDateRepeatEnds('');
  }

  const handleRepeatEndsCancel = () => {
    setTempDateRepeatEnds('');
  }

  const handleTimeChange = (newTime) => {
    setTempTime(newTime);
}

const handleReminderStringChange = () => {
    changeReminderString();
};

const handleRepeatStringChange = () => {
    changeRepeatString();
};

// Call handleReminderStringChange after selectedReminders state is updated
useEffect(() => {
    handleReminderStringChange();
}, [tempSelectedReminders]);

// Call handleReminderStringChange after selectedReminders state is updated
useEffect(() => {
    handleRepeatStringChange();
}, [tempSelectedRepeat]);

const changeReminderString = () => {
    if (tempSelectedReminders.length === 0) {
        setTempReminderString("None");
    }
    else if (tempSelectedReminders.length === 1) {
        setTempReminderString(isTempTime ? reminderWithTime[tempSelectedReminders[0]].label : reminderNoTime[tempSelectedReminders[0]].label);
    }
    else {
        setTempReminderString(isTempTime ? reminderWithTime[tempSelectedReminders[0]].label + ",..." : reminderNoTime[tempSelectedReminders[0]].label + ",...");
    }
}

const changeRepeatString = () => {
    if (tempSelectedRepeat.length === 0) {
        setTempRepeatString("None");
    }
    else if (tempSelectedRepeat.length === 1) {
        setTempRepeatString(repeat[tempSelectedRepeat[0]].label);
    }
    else {
        setTempRepeatString(repeat[tempSelectedRepeat[0]].label + ",...");
    }
}

    const handleSaveChanges = () => {
        setSelectedDate(tempSelectedDate);
        setTime(tempTime);
        setIsTime(isTempTime);
        setSelectedReminders(tempSelectedReminders);
        setSelectedRepeat(tempSelectedRepeat);
        setDateRepeatEnds(tempDateRepeatEnds);
        setCalendarModalVisible(false);
        setReminderString(tempReminderString);
        setRepeatString(tempRepeatString);
    }


    let hours = tempTime.getHours(); // Get the hours component (0-23)
    const minutes = tempTime.getMinutes(); // Get the minutes component (0-59)
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
            <View>
                <View style={styles.saveChanges}>
                    <Button title='Cancel' onPress={() => setCalendarModalVisible(!isCalendarModalVisible)}/>
                    <Button title='Done' onPress={handleSaveChanges} />
                </View>
            </View>
            <View style={{ flex: .7 }}>
                <ScheduleBuilder selectedDate={tempSelectedDate.dateString} handleDateSelect={handleDateSelect} />
            </View>
            <View style={{ flex: .4 }}>
            <TouchableHighlight ref={timeMenuRef} onPress={toggleTimeMenu} style={[styles.menuButton, styles.menuTopButton]} onLayout={(event) => {
                 const {x, y, width, height} = event.nativeEvent.layout;
                 
            }}>
                <View style={styles.menuButtonWrapper}>
                    <Text style={styles.menuText}>Time</Text>
                    <View style={styles.cancelContainer}>
                        <Text style={styles.menuText}>{isTempTime ? timeString : 'None'}</Text>
                        {isTempTime && <TouchableOpacity onPress={handleTimeCancel}>
                            <Text> X</Text>
                        </TouchableOpacity>}
                    </View>
                </View>
            </TouchableHighlight>
            <TouchableHighlight ref={reminderMenuRef} onPress={toggleReminderMenu} style={styles.menuButton} onLayout={(event) => {
                const {x, y, width, height, pageY} = event.nativeEvent.layout;
                setReminderButtonHeight(height);
                
            }}>
                <View style={styles.menuButtonWrapper}>
                    <Text style={styles.menuText}>Reminder</Text>
                    <View style={styles.cancelContainer}>
                        <Text style={styles.menuText}>{tempReminderString}</Text>
                        {(tempSelectedReminders.length !== 0) && <TouchableOpacity onPress={handleReminderCancel}>
                            <Text> X</Text>
                        </TouchableOpacity>}
                    </View>
                </View>
            </TouchableHighlight>
            <TouchableHighlight onPress={toggleRepeatMenu} style={[styles.menuButton, (tempSelectedRepeat.length === 0) ? styles.menuBottomButton : null]}>
                <View style={styles.menuButtonWrapper}>
                    <Text style={styles.menuText}>Repeat</Text>
                    <View style={styles.cancelContainer}>
                        <Text style={styles.menuText}>{tempRepeatString}</Text>
                        {(tempSelectedRepeat.length !== 0) && <TouchableOpacity onPress={handleRepeatCancel}>
                            <Text> X</Text>
                        </TouchableOpacity>}
                    </View>
                </View>
            </TouchableHighlight>
            {(tempSelectedRepeat.length !== 0) && <TouchableHighlight onPress={toggleRepeatEndsModal} style={[styles.menuButton, styles.menuBottomButton]}>
                <View style={styles.menuButtonWrapper}>
                    <Text style={styles.menuText}>Repeat Ends</Text>
                    <View style={styles.cancelContainer}>
                        <Text style={styles.menuText}>{tempDateRepeatEnds == '' ? 'None' : tempDateRepeatEnds}</Text>
                        {(tempDateRepeatEnds !== '') && <TouchableOpacity onPress={handleRepeatEndsCancel}>
                            <Text> X</Text>
                        </TouchableOpacity>}
                    </View>
                </View>
            </TouchableHighlight>}
            </View>
            <TimePopupMenu isVisible={isTimeMenuVisible} onClose={toggleTimeMenu} time={tempTime} handleTimeChange={handleTimeChange} buttonHeight={timeButtonHeight}/>
            <CustomPopupMenu isVisible={isReminderMenuVisible} onClose={toggleReminderMenu} menuOptions={isTempTime ? reminderWithTime : reminderNoTime} selectedOptions={tempSelectedReminders} setSelectedOptions={setTempSelectedReminders} buttonHeight={reminderButtonHeight}/>
            <CustomPopupMenu isVisible={isRepeatMenuVisible} onClose={toggleRepeatMenu} menuOptions={repeat} selectedOptions={tempSelectedRepeat} setSelectedOptions={setTempSelectedRepeat} buttonHeight={reminderButtonHeight + 50}/>
            <RepeatEndsModal isVisible={isRepeatEndsModalVisible} onClose={toggleRepeatEndsModal} dateRepeatEnds={tempDateRepeatEnds} setDateRepeatEnds={setTempDateRepeatEnds} />
        </View>
        );
  };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
        },
        saveChanges: {
            flexDirection: 'row',
            justifyContent: 'space-between',
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