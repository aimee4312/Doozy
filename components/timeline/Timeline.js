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
          <Text style={styles.taskName}>{item.title}</Text>
          <Text style={styles.taskDescription}>{item.description}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          data={this.state.tasks}
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
  },
  postContainer: {
    marginBottom: 20,
  },
  postImage: {
    width: '100%',
    height: 300,
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
  },
});

export default Timeline;
