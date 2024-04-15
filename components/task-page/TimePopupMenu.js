import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Dimensions } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const TimePopupMenu = ({ isVisible, onClose, time, handleTimeChange, buttonHeight }) => {

    const totalButtonHeight = Dimensions.get('window').height - (Dimensions.get('window').height * .25 + buttonHeight);

    const onChange = (event, newTime) => {
        if (newTime !== undefined) {
            handleTimeChange(newTime);
        }
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
                    <View style={[styles.menu, { bottom: totalButtonHeight, right: 25, overflow: 'hidden'}]}>
                        <DateTimePicker mode="time" value={time} onChange={onChange} display='spinner' style={{flex: 1}}/>
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
    backgroundColor: 'rgba(0, 0, 0, 0)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    backgroundColor: 'grey',
    borderRadius: 10,
    elevation: 5,
    position: 'absolute',
    height: 150,
    width: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuOption: {
    fontSize: 16,
    paddingVertical: 10,
    color: 'white',
  },
  closeButton: {
    fontSize: 16,
    paddingVertical: 10,
    textAlign: 'center',
    color: 'blue',
    marginTop: 10,
  },
  selectedReminders: {
    backgroundColor: "yellow",
},
priorityWrapper: {
    flexDirection: "row",
    alignItems: 'center',
    paddingVertical: 2,
},
});

export default TimePopupMenu;