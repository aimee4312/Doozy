import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Keyboard, Dimensions, FlatList, Animated, TextInput, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, doc, setDoc } from 'firebase/firestore';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../../firebaseConfig';

const ListModal = (props) => {

  const { selectedLists, setSelectedLists, listItems } = props;

  const currentUser = FIREBASE_AUTH.currentUser;

  const [showAddList, setShowAddList] = useState(false);
  const [listInputText, setListInputText] = useState("");
  const addListInputRef = useRef(null);

  const screenHeight = Dimensions.get('window').height;
  const modalHeight = screenHeight * 0.55;
  const maxHeight = screenHeight * 0.9;

  const [flatListHeight, setFlatListHeight] = useState(modalHeight - 80)

  const animatedHeight = useRef(new Animated.Value(modalHeight)).current;

  useEffect(() => {
    const willShowSub = Keyboard.addListener('keyboardWillShow', (e) => {
      setFlatListHeight(maxHeight - e.endCoordinates.height - 50);
      Animated.timing(animatedHeight, {
        toValue: maxHeight,
        duration: e.duration,
        useNativeDriver: false
      }).start();
    });

    const willHideSub = Keyboard.addListener('keyboardWillHide', (e) => {
      setShowAddList(false);
      setFlatListHeight(modalHeight - 80);
      Animated.timing(animatedHeight, {
        toValue: modalHeight,
        duration: e.duration,
        useNativeDriver: false
      }).start();
    });

    return () => {
      willShowSub.remove();
      willHideSub.remove();
    };
  }, []);

  const handleListPress = (currId) => {
    if (selectedLists.includes(currId)) {
      let filteredList = selectedLists.filter(id => id !== currId);
      setSelectedLists(filteredList);
    }
    else {
      setSelectedLists([...selectedLists, currId]);
    }
  }

  const handleAddListPress = () => {
    setShowAddList(true);
  }

  const addList = async() => {
    try {
      const listRef = doc(collection(FIRESTORE_DB, 'Users', currentUser.uid, 'Lists'));
      await setDoc(listRef, {name: listInputText, taskIds: [], postIds: []});
      setSelectedLists([...selectedLists, listRef.id]);
      setListInputText("");
      setShowAddList(false);
    } catch (error){
      console.error("Error creating list:", error);
    }

  }

  const renderList = ({ item }) => (
    <TouchableOpacity onPress={() => { handleListPress(item.id) }} style={{ ...(selectedLists.includes(item.id) ? styles.listContainerSelected : {}), ...styles.listContainer }}>
      <View style={styles.nameContainer}>
        <Ionicons name="list-outline" size={18} color="black" />
        <Text style={styles.listName}>{item.name}</Text>
      </View>
      <Text style={styles.taskNumber}>{item.taskIds.length}</Text>
    </TouchableOpacity>
  );

  return (
    <Animated.View style={{ height: animatedHeight, backgroundColor: 'white', ...styles.container }}>
        <View style={{height: flatListHeight, ...styles.flatList}}>
          <FlatList
            data={listItems}
            renderItem={renderList}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={true}
          />
        </View>
        {showAddList ? (<View style={styles.addListInputContainer}>
          <TextInput
            ref={addListInputRef}
            onChangeText={text => setListInputText(text)}
            value={listInputText}
            placeholder="Enter list name..."
            style={styles.addListInput}
            autoFocus={true}
          />
          <TouchableOpacity onPress={addList} style={styles.saveListButton}>
            <Ionicons name="add-circle-outline" size={28} color='black'/>
          </TouchableOpacity>
        </View>)
        : (<TouchableOpacity onPress={handleAddListPress} style={styles.addListButton}>
        <Ionicons name="add-circle-outline" size={28} color='black' />
        <Text style={styles.addListText}>Add List</Text>
      </TouchableOpacity>)}
    </Animated.View>
  );
};

export default ListModal;

const styles = {
  container: {
    flexDirection: 'column',
  },
  topContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start'
  },
  flatList: {
  },
  addListInputContainer: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderColor: 'C0C0C0',
    },
  addListInput: {
    fontSize: 18,
    paddingHorizontal: 15,
  },
  saveListButton: {
    marginRight: 15,
  },
  addListButton: {
    alignSelf: 'center',
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    margin: 15,
  },
  addListText: {
    fontSize: 18,
    marginLeft: 5,
    fontWeight: 'bold'
  },
  listContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 20,
    height: 50,
    borderBottomWidth: 1,
  },
  listContainerSelected: {
    backgroundColor: '#ffe066',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listName: {
    paddingLeft: 10,
    fontSize: 18
  },
  taskNumber: {

  },
};