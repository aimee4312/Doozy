import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

const CustomDropDown = ( props ) => {

    const { options, selectedItems, toggleSelection, openFolders, toggleFolder } = props;

  return (
    <View style={styles.dropdown}>
        <ScrollView>
      {options.map((option, mainIndex) => (
        <View key={mainIndex} style={styles.dropdownItem}>
          {option.label && 
          (
            <TouchableOpacity onPress={() => toggleFolder(mainIndex)}>
              <Text style={styles.mainItem}>{option.label}</Text>
            </TouchableOpacity>)}
          {(openFolders.includes(mainIndex) || !option.label) && (
            <View>
          {option.subrows.map((subrow, subIndex) => (
            <TouchableOpacity key={subIndex} onPress={() => toggleSelection(mainIndex, subIndex)}>
              <Text style={[styles.subrow, selectedItems.some((item) => item.mainIndex === mainIndex && item.subIndex === subIndex) && styles.selectedSubrow]}>
                {subrow.label}
              </Text>
            </TouchableOpacity>
          ))}
          </View>)}
        </View>
      ))}
      </ScrollView>
    </View>
  );
};

export default CustomDropDown;

const styles = {
  dropdown: {
    flex: .55,
    width: '100%',
    marginTop: 20,
    backgroundColor: 'white',
  },
  dropdownItem: {
    marginBottom: 10,
  },
  mainItem: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subrow: {
    fontSize: 16,
    marginLeft: 20, // Adjust indentation as needed
  },
  selectedSubrow: {
    backgroundColor: 'lightblue', // Style for selected subrow
  },
};