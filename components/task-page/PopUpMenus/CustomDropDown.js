import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';

const CustomDropDown = (props) => {

  const { options, selectedLists, toggleSelection, openFolders, toggleFolder } = props;

  const screenHeight = Dimensions.get('window').height;
  const modalHeight = screenHeight * 0.55;

  return (
    <View style={{ height: modalHeight, backgroundColor: 'white' }}>
      <ScrollView style={{ height: modalHeight, backgroundColor: 'white' }}>
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
                    <Text style={[styles.subrow, selectedLists.some((item) => item.mainIndex === mainIndex && item.subIndex === subIndex) && styles.selectedSubrow]}>
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