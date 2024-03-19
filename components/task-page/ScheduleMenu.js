import React, { useState } from 'react';
import { View, TouchableHighlight, Text, StyleSheet} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const ScheduleMenu = ( props ) => {

    const {handleTimeChange, time} = props;

    const onChange = (event, newTime) => {
        if (newTime !== undefined) {
            handleTimeChange(newTime);
        }
    };


    return (
        <View style={styles.container}>
            
            
            <TouchableHighlight style={styles.menuButton}>
                <View style={styles.menuButtonWrapper}>
                <Text style={styles.menuText}>Time</Text>
                <DateTimePicker mode="time" value={time} onChange={onChange} />
                </View>
            </TouchableHighlight>
            <TouchableHighlight style={styles.menuButton}>
                <Text style={styles.menuText}>Reminder</Text>
            </TouchableHighlight>
            <TouchableHighlight style={styles.menuButton}>
                <Text style={styles.menuText}>Repeat</Text>
            </TouchableHighlight>
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
            padding: 10,
        },
        menuButtonWrapper: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        menuText: {
            fontSize: 16
        },
    });
  
  export default ScheduleMenu;