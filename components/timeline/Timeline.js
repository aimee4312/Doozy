import React, { Component } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../firebaseConfig';
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

class Timeline extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tasks: []
    };
  }
  
  componentDidMount() {
    const currentUser = FIREBASE_AUTH.currentUser;

    if (currentUser) {
      const tasksRef = collection(FIRESTORE_DB, 'Users', currentUser.uid, 'Tasks');

      getDocs(tasksRef)
        .then((querySnapshot) => {
          const tasks = [];
          querySnapshot.forEach((doc) => {
            tasks.push({ id: doc.id, ...doc.data() });
          });
          this.setState({ tasks });
        })
        .catch((error) => {
          console.error("Error fetching tasks: ", error);
        });
    }
  }

  handlePostPress = (userId) => {
    // this.props.navigation.navigate('userProfile', { userId });
    console.log('Clicked on post. Owner ID:', userId);
  };

  renderTask = ({ item }) => (
    <TouchableOpacity onPress={() => this.handlePostPress(item.ownerId)}>
      <View style={styles.postContainer}>
        <Image source={{ uri: item.image }} style={styles.postImage} />
        <View style={styles.taskInfo}>
          <View style={styles.titleContainer}>
            <Text style={styles.taskName}>{item.name}</Text>
            <Text style={styles.taskDate}>{item.date}</Text>
          </View>
          <Text style={styles.taskDescription}>{item.description}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  render() {
    const { tasks } = this.state;
    const completedTasks = tasks.filter(task => task.completed);
  
    return (
      <View style={styles.container}>
        <FlatList
          data={completedTasks}
          renderItem={this.renderTask}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>
    );
  }
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingHorizontal: 10,
  },
  postContainer: {
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  taskInfo: {
    padding: 10,
  },
  taskName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  taskDescription: {
    fontSize: 16,
    marginTop: 5,
  },
  taskDate: {
    fontSize: 14,
    color: '#888',
  },
});

export default Timeline;
