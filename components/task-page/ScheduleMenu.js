import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableHighlight, Button, TouchableOpacity, SafeAreaView } from 'react-native';
import CustomPopupMenu from './PopUpMenus/CustomPopupMenu';
import TimePopupMenu from './PopUpMenus/TimePopupMenu';
import RepeatEndsModal from './PopUpMenus/RepeatEndsModal';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';

const ScheduleMenu = (props) => {

    const getTodayDate = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return {
            day: today.getDate(),
            month: today.getMonth() + 1,
            year: today.getFullYear(),
            timestamp: today.getTime(),
            dateString: today.toISOString().split('T')[0],
        };
    };
    const { setCalendarModalVisible, selectedDate, setSelectedDate, isTime, setIsTime, selectedReminders, setSelectedReminders, selectedRepeat, setSelectedRepeat, dateRepeatEnds, setDateRepeatEnds } = props;

    const [tempSelectedDate, setTempSelectedDate] = useState(!selectedDate ? getTodayDate() : selectedDate);
    const [tempTime, setTempTime] = useState(isTime ? selectedDate.timestamp : new Date());
    const [tempSelectedReminders, setTempSelectedReminders] = useState(selectedReminders);
    const [tempSelectedRepeat, setTempSelectedRepeat] = useState(selectedRepeat);
    const [isDateRepeatEnds, setIsDateRepeatEnds] = useState(dateRepeatEnds ? true : false);
    const [tempDateRepeatEnds, setTempDateRepeatEnds] = useState(dateRepeatEnds ? dateRepeatEnds : new Date());
    const [reminderString, setReminderString] = useState("");
    const [repeatString, setRepeatString] = useState("");
    const [isTempTime, setIsTempTime] = useState(isTime);

    const [reminderButtonHeight, setReminderButtonHeight] = useState(null);
    const [repeatButtonHeight, setRepeatButtonHeight] = useState(null);
    const [timeButtonHeight, setTimeButtonHeight] = useState(null);
    const [repeatEndsButtonHeight, setRepeatEndsButtonHeight] = useState(null);
    const [isReminderMenuVisible, setIsReminderMenuVisible] = useState(false);
    const [isRepeatMenuVisible, setIsRepeatMenuVisible] = useState(false);
    const [isRepeatEndsModalVisible, setIsRepeatEndsModalVisible] = useState(false);
    const [isTimeMenuVisible, setIsTimeMenuVisible] = useState(false);

    const reminderMenuRef = useRef(null);
    const timeMenuRef = useRef(null);
    const repeatMenuRef = useRef(null);
    const repeatEndsRef = useRef(null);

    // modalHeight: 650
    // cancelDoneHeight: 40
    // calendarHeight: 360
    // menuHeight: 200
    // clearHeight: 20


    const handleDateSelect = (date) => {
        setTempSelectedDate(date);
        if (tempDateRepeatEnds < date.timestamp) {
            setTempDateRepeatEnds(new Date(date.year, date.month - 1, date.day));
        }
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
        if (repeatMenuRef.current) {
            repeatMenuRef.current.measure((x, y, width, height, pageX, pageY) => {
                setRepeatButtonHeight(pageY);
            });
        }
        setIsRepeatMenuVisible(!isRepeatMenuVisible);
    };

    const toggleRepeatEndsModal = () => {
        if (repeatEndsRef.current) {
            repeatEndsRef.current.measure((x, y, width, height, pageX, pageY) => {
                setRepeatEndsButtonHeight(pageY);
            });
        }
        setIsDateRepeatEnds(true);
        setIsRepeatEndsModalVisible(!isRepeatEndsModalVisible);
    };

    const toggleTimeMenu = () => {
        if (!isTempTime) {
            setTempTime(new Date());
        }
        if (timeMenuRef.current) {
            timeMenuRef.current.measure((x, y, width, height, pageX, pageY) => {
                setTimeButtonHeight(pageY);
            });
        }
        setIsTimeMenuVisible(!isTimeMenuVisible);
        if (!isTempTime) {
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
        handleRepeatEndsCancel();
    }

    const handleRepeatEndsCancel = () => {
        setIsDateRepeatEnds(false);
        setTempDateRepeatEnds(new Date());
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
            setReminderString("None");
        }
        else if (tempSelectedReminders.length === 1) {
            setReminderString(isTempTime ? reminderWithTime[tempSelectedReminders[0]].label : reminderNoTime[tempSelectedReminders[0]].label);
        }
        else {
            setReminderString(isTempTime ? reminderWithTime[tempSelectedReminders[0]].label + ",..." : reminderNoTime[tempSelectedReminders[0]].label + ",...");
        }
    }

    const changeRepeatString = () => {
        if (tempSelectedRepeat.length === 0) {
            setRepeatString("None");
        }
        else if (tempSelectedRepeat.length === 1) {
            setRepeatString(repeat[tempSelectedRepeat[0]].label);
        }
        else {
            setRepeatString(repeat[tempSelectedRepeat[0]].label + ",...");
        }
    }

    const reminderNoTime = [
        { label: 'On the day (9:00 am)' },
        { label: '1 day early (9:00 am)' },
        { label: '2 day early (9:00 am)' },
        { label: '3 day early (9:00 am)' },
        { label: '1 week early (9:00 am)' }
    ];

    const reminderWithTime = [
        { label: 'On time' },
        { label: '5 minutes early' },
        { label: '30 minutes early' },
        { label: '1 hour early' },
        { label: '1 day early' }
    ];

    const repeat = [
        { label: 'Daily' },
        { label: 'Weekly' },
        { label: 'Monthly' },
        { label: 'Yearly' },
        { label: 'Every weekday' },
    ];

    const handleSaveChanges = () => {
        const date = new Date(tempSelectedDate.timestamp);
        if (isTempTime) {
            tempSelectedDate.timestamp = new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                tempTime.getHours(),
                tempTime.getMinutes(),
                0,
                0,
            );
        }
        else {
            tempSelectedDate.timestamp = new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                0,
                0,
                0,
                0,
            );
        }
        setSelectedDate(tempSelectedDate);
        setIsTime(isTempTime);
        setSelectedReminders(tempSelectedReminders);
        setSelectedRepeat(tempSelectedRepeat);
        if (isDateRepeatEnds) {
            setDateRepeatEnds(tempDateRepeatEnds);
        }
        setCalendarModalVisible(false);
    }

    const clearData = () => {
        setSelectedDate(null);
        setIsTime(false);
        setSelectedReminders([]);
        setSelectedRepeat([]);
        setDateRepeatEnds(null);
        setCalendarModalVisible(false);
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

    const dateToString = (date) => {
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        const y = date.getFullYear();
        return `${m}/${d}/${y}`;
    }


    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.bigContainer}>
                <View style={{height: 40}}>
                    <View style={styles.saveChanges}>
                        <TouchableOpacity onPress={() => setCalendarModalVisible(false)}>
                            <Ionicons name="chevron-down-outline" size={32} color="black" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleSaveChanges} >
                            <Text style={styles.saveButton}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{height: 360}}>
                    <Calendar
                        current={tempSelectedDate.dateString}
                        onDayPress={(day) => handleDateSelect(day)}
                        markedDates={{
                        [tempSelectedDate.dateString]: { selected: true, selectedColor: 'blue' }
                        }}
                    />
                </View>
                <View style={{height: 200}}>
                    <TouchableHighlight ref={timeMenuRef} onPress={toggleTimeMenu} style={[styles.menuButton, styles.menuTopButton]}>
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
                    <TouchableHighlight ref={reminderMenuRef} onPress={toggleReminderMenu} style={styles.menuButton}>
                        <View style={styles.menuButtonWrapper}>
                            <Text style={styles.menuText}>Reminder</Text>
                            <View style={styles.cancelContainer}>
                                <Text style={styles.menuText}>{reminderString}</Text>
                                {(tempSelectedReminders.length !== 0) && <TouchableOpacity onPress={handleReminderCancel}>
                                    <Text> X</Text>
                                </TouchableOpacity>}
                            </View>
                        </View>
                    </TouchableHighlight>
                    <TouchableHighlight ref={repeatMenuRef} onPress={toggleRepeatMenu} style={[styles.menuButton, (tempSelectedRepeat.length === 0) ? styles.menuBottomButton : null]}>
                        <View style={styles.menuButtonWrapper}>
                            <Text style={styles.menuText}>Repeat</Text>
                            <View style={styles.cancelContainer}>
                                <Text style={styles.menuText}>{repeatString}</Text>
                                {(tempSelectedRepeat.length !== 0) && <TouchableOpacity onPress={handleRepeatCancel}>
                                    <Text> X</Text>
                                </TouchableOpacity>}
                            </View>
                        </View>
                    </TouchableHighlight>
                    {(tempSelectedRepeat.length !== 0) && <TouchableHighlight ref={repeatEndsRef} onPress={toggleRepeatEndsModal} style={[styles.menuButton, styles.menuBottomButton]}>
                        <View style={styles.menuButtonWrapper}>
                            <Text style={styles.menuText}>Repeat Ends</Text>
                            <View style={styles.cancelContainer}>
                                <Text style={styles.menuText}>{!isDateRepeatEnds ? 'Never' : dateToString(tempDateRepeatEnds)}</Text>
                                {isDateRepeatEnds && <TouchableOpacity onPress={handleRepeatEndsCancel}>
                                    <Text> X</Text>
                                </TouchableOpacity>}
                            </View>
                        </View>
                    </TouchableHighlight>}
                </View>
            </View>
            <TouchableOpacity style={{height: 20, ...styles.smallContainer}} onPress={clearData}>
                <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
            <TimePopupMenu isVisible={isTimeMenuVisible} onClose={toggleTimeMenu} time={tempTime} handleTimeChange={handleTimeChange} buttonHeight={timeButtonHeight} />
            <CustomPopupMenu isVisible={isReminderMenuVisible} onClose={toggleReminderMenu} menuOptions={isTempTime ? reminderWithTime : reminderNoTime} selectedOptions={tempSelectedReminders} setSelectedOptions={setTempSelectedReminders} buttonHeight={reminderButtonHeight} />
            <CustomPopupMenu isVisible={isRepeatMenuVisible} onClose={toggleRepeatMenu} menuOptions={repeat} selectedOptions={tempSelectedRepeat} setSelectedOptions={setTempSelectedRepeat} buttonHeight={repeatButtonHeight} />
            <RepeatEndsModal isVisible={isRepeatEndsModalVisible} setIsRepeatEndsModalVisible={setIsRepeatEndsModalVisible} dateRepeatEnds={tempDateRepeatEnds} setDateRepeatEnds={setTempDateRepeatEnds} minimumDate={new Date(tempSelectedDate.year, tempSelectedDate.month - 1, tempSelectedDate.day)} buttonHeight={repeatEndsButtonHeight} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    bigContainer: {
        
    },
    smallContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    clearText: {
        fontSize: 16,
        color: 'red',
    },
    saveChanges: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'

    },
    saveButton: {
        color: 'blue',
        fontWeight: 'bold',
        fontSize: 18
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
        height: 50
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