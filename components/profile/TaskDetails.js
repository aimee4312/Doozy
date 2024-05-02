import React from 'react';
import { View, Text, Image } from 'react-native';

const TaskDetails = ({ route }) => {
  const { task } = route.params;

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Image source={{ uri: task.image }} style={{ width: 200, height: 200 }} />
      <Text>{task.title}</Text>
      <Text>{task.description}</Text>
    </View>
  );
};

export default TaskDetails;
