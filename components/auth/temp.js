import React, { Component, useState } from 'react';
import {
    LayoutAnimation,
    StyleSheet,
    Button,
    View,
    SafeAreaView,
    Text,
    Alert,
    FlatList,
    TouchableOpacity,
    ScrollView,
    style,
} from 'react-native';

let arr = [
    {
      name: '1',
      child: [
        { name: '11', child: [] },
        { name: '22', child: [] },
        { name: '33', child: [] },
      ],
    },
    {
      name: '2',
      child: [
        {
          name: '11',
          child: [
            { name: '11', child: [] },
            { name: '22', child: [] },
            { name: '33', child: [] },
          ],
        },
        { name: '22', child: [] },
        { name: '33', child: [] },
      ],
    },
    { name: '3', child: [] },
    { name: '4', child: [] },
  ];

const List = () => {
    const [active, setActive] = useState(null);
    return (
    <ScrollView
    style={{ marginTop: 50 }}
    contentContainerStyle={styles.container}>
    {arr.map((x, i) => (
        <Item
        key={x.name}
        active={active}
        i={i}
        setActive={setActive}
        child={x.child}
        />
    ))}
    </ScrollView>
    );
}


function Item({ i, active, setActive, child }) {
    const onPress = () => {
      LayoutAnimation.easeInEaseOut();
      setActive(i == active ? null : i);
    };
    const [childActive, setChildActive] = useState(null);
    const open = active == i;
    return (
  <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={1}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text>Header - {i + 1}</Text>
      {child.length ? <Text>{open ? 'close' : 'open'}</Text> : null}
    </View>
    {open &&
      child.map((x, i) => {
        if (x.child.length) {
          return (
            <Item
              key={x}
              active={childActive}
              i={i}
              setActive={setChildActive}
              child={x.child}
            />
          );
        }
        return (
          <Text key={x} style={styles.subItem}>
            - SOME DATA
          </Text>
        );
      })}
  </TouchableOpacity>
  );
  }

  export default List;