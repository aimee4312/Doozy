import React, { useState } from 'react';
import { View, Modal, TouchableWithoutFeedback, StyleSheet, Text} from 'react-native';
import { Calendar } from 'react-native-calendars';
import Swiper from 'react-native-swiper';

const RepeatEndsModal = ( props ) => {
  const { isVisible, onClose, dateRepeatEnds, setDateRepeatEnds } = props;

  const handleDateSelect = (date) => {
    setDateRepeatEnds(date.dateString);
  };


  return (
    <Modal
        animationType="fade"
        transparent={true}
        visible={isVisible}
        onRequestClose={onClose}
    >
        <TouchableWithoutFeedback onPress={onClose}>
            <View style={styles.overlay}>
                <TouchableWithoutFeedback>
                    <View style={styles.menu}>
                        {/* <Swiper loop={false}> */}
                        {/* <View> */}
                        <Calendar
                            current={dateRepeatEnds}
                            onDayPress={(day) => handleDateSelect(day)}
                            markedDates={{
                            [dateRepeatEnds]: { selected: true, selectedColor: 'blue' }
                            }}
                            style={styles.calendar}
                        />
                        {/* </View> */}
                        {/* <Calendar
                            current={dateRepeatEnds}
                            onDayPress={(day) => handleDateSelect(day)}
                            markedDates={{
                            [dateRepeatEnds]: { selected: true, selectedColor: 'blue' }
                            }}
                            style={styles.calendar}
                        /> */}
                        {/* </Swiper> */}
                    </View>
                </TouchableWithoutFeedback>
            </View>
        </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, .2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    menu: {
        backgroundColor: '#FFFFFF',
      borderRadius: 10,
      elevation: 5,
      position: 'absolute',
      width: 300,
      height: 400,
      flexDirection: 'column',
    },
    calendar: {
        borderRadius: 10,
    }
});

export default RepeatEndsModal;