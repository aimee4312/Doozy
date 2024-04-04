import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Dimensions } from 'react-native';

const CustomPopupMenu = ({ isVisible, onClose, reminderOptions, selectedReminders, handleReminderSelect, buttonHeight }) => {

    const totalButtonHeight = Dimensions.get('window').height - (Dimensions.get('window').height * .3 + buttonHeight );
    
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
                    <View style={[styles.menu, { bottom: totalButtonHeight, right: 25}]}>
                        {reminderOptions.map((option, index) => (
                        <TouchableOpacity key={index} onPress={() => handleReminderSelect(index)}>
                            <View style={[styles.priorityWrapper, selectedReminders.includes(index) && styles.selectedReminders]}>
                                <Text style={styles.menuOption}>{option.label}</Text>
                            </View>
                        </TouchableOpacity>))}
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
    paddingHorizontal: 20,
    borderRadius: 10,
    elevation: 5,
    position: 'absolute',
    width: 200,
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

export default CustomPopupMenu;