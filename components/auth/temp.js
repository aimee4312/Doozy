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

class List extends Component {
    constructor(props) {
      super(props);
      this.state = {
        data: "",
        dummy: [
          {
            _id: "5e12905eb10fe53808d1ca55",
            name: "WHY NAME EXISTS -_-",
            stage: "Confirmed",
            feedback: {
              _id: "5e12905eb10fe53808d1ca56",
              rating: 1,
              review: "bad bad only bad."
            },
  
            itemDetails: [
              {
                _id: "5e12905eb10fe53808d1ca5a",
                nameXquantity: "Lehsun Adrak x100",
                individualTotal: 155
              },
              {
                _id: "5e12905eb10fe53808d1ca59",
                nameXquantity: "Lehsun x50",
                individualTotal: 25
              },
              {
                _id: "5e12905eb10fe53808d1ca58",
                nameXquantity: "Lehsun Adrak Dhaniya Shimla mirch x Infinity",
                individualTotal: 9969
              }
            ],
  
            __v: 0
          }
        ]
      };
    }
  
  
    render() {
      return (
        <SafeAreaView>
          <ScrollView>
            <FlatList
              data={this.state.dummy}
              renderItem={({ item }) => (
                <View>
                  <Text>{item.name}</Text>
                  <FlatList
                    data={item.itemDetails}
                    renderItem={({ item }) => <Text>{item.nameXquantity}</Text>}
                    keyExtractor={item => item._id}
                  />
                </View>
              )}
              keyExtractor={item => item._id}
            />
          </ScrollView>
        </SafeAreaView>
      );
    }
  }

export default List;