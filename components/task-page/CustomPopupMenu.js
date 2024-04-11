import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Dimensions } from 'react-native';

const CustomPopupMenu = ({ isVisible, onClose, menuOptions, selectedOptions, setSelectedOptions, buttonHeight }) => {

    const totalButtonHeight = Dimensions.get('window').height - (Dimensions.get('window').height * .25 + buttonHeight );
    

    const handleOptionSelect = (index) => {
      // Toggle selection state of the option
      if (selectedOptions.includes(index)) {
          setSelectedOptions(selectedOptions.filter((item) => item !== index));
      } else {
          setSelectedOptions([...selectedOptions, index]);
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
                    <View style={[styles.menu, { bottom: totalButtonHeight, right: 25}]}>
                        {menuOptions.map((option, index) => (
                        <TouchableOpacity key={index} onPress={() => handleOptionSelect(index)}>
                            <View style={[styles.priorityWrapper, selectedOptions.includes(index) && styles.selectedOptions]}>
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
  selectedOptions: {
    backgroundColor: "yellow",
},
priorityWrapper: {
    flexDirection: "row",
    alignItems: 'center',
    paddingVertical: 2,
},
});

export default CustomPopupMenu;