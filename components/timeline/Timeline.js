import React, { Component } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, ImageBackground } from 'react-native';
// import { FIREBASE_AUTH, FIRESTORE_DB } from '../../firebaseConfig';
// import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import NavBar from '../auth/NavigationBar';

class Timeline extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tasks: [
        {
          id: 1,
          name: 'Task 1',
          description: 'Description for Task 1',
          date: '2024-05-25',
          image: 'https://via.placeholder.com/150',
          completed: true,
        },
        {
          id: 2,
          name: 'Task 2',
          description: 'Description for Task 2',
          date: '2024-05-26',
          image: 'https://via.placeholder.com/150',
          completed: true,
        },
      ],
    };
  }
  
  // componentDidMount() {
  //   const currentUser = FIREBASE_AUTH.currentUser;

  //   if (currentUser) {
  //     const tasksRef = collection(FIRESTORE_DB, 'Users', currentUser.uid, 'Tasks');

  //     getDocs(tasksRef)
  //       .then((querySnapshot) => {
  //         const tasks = [];
  //         querySnapshot.forEach((doc) => {
  //           tasks.push({ id: doc.id, ...doc.data() });
  //         });
  //         this.setState({ tasks });
  //       })
  //       .catch((error) => {
  //         console.error("Error fetching tasks: ", error);
  //       });
  //   }
  // }

  renderTask = ({ item }) => (
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
  );

  render() {
    const { tasks } = this.state;
    const completedTasks = tasks.filter(task => task.completed);
  
    return (
      <ImageBackground
        source={require('../../assets/background.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.container}>
          <FlatList
            data={completedTasks}
            renderItem={this.renderTask}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ flexGrow: 1 }}
          />
          <NavBar navigation={this.props.navigation} style={styles.navBarContainer}></NavBar>
        </View>
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: 16,
    paddingBottom: 35,
  },
  postContainer: {
    marginLeft: 20,
    marginRight: 20,
    marginTop: 40,
    backgroundColor: 'rgba(249, 249, 249, 0.7)',
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
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
});

export default Timeline;
