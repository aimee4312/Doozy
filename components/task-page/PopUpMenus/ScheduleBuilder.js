import React, { useState } from 'react';
import { View } from 'react-native';
import { Calendar } from 'react-native-calendars';

const ScheduleBuilder = ( props ) => {
  const { selectedDate, handleDateSelect} = props;

  return (
    <View style={{ flex: 1, height: '80%' }}>
      <Calendar
        current={selectedDate}
        onDayPress={(day) => handleDateSelect(day)}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: 'blue' }
        }}
      />
    </View>
  );
};

export default ScheduleBuilder;