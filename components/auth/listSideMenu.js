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

const List = ({ listName }) => {
    return (
        <View style={styles.itemContainer}> 
            <Text style={styles.itemContent}> 
                {listName}
            </Text>
        </View>
    )
}


const Folder = ({ item }) => { 
    const [expanded, setExpanded] = useState(false); 
  
    const toggleExpand = () => { 
        setExpanded(!expanded); 
    }; 

    const renderlist = ({ list }) => ( 
        <List listName={list.name} /> 
    ); 
  
    return ( 
        <View style={styles.itemContainer}> 
            {/* <TouchableOpacity 
                onPress={toggleExpand} 
                style={styles.itemTouchable} 
            >  */}
                <Text style={styles.itemTitle}> 
                    {item.title} 
                </Text> 
            {/* </TouchableOpacity>  */}
            <FlatList 
                    data={item.lists} 
                    renderlist={({item}) => <View style={styles.itemContainer}> 
                                            <Text >  
                                                {item.name} 
                                            </Text> 
                                            </View> }
                    
                    //{renderlist} 
                    keyExtractor={item => item.id} 
                />
                {/* // <Text style={styles.itemContent}> 
                //     {item.content} 
                // </Text>  */}
            
        </View> 
    ); 
}; 

const FolderList = () => { 
    const renderItem = ({ item }) => ( 
        <Folder item={item} /> 
    ); 
  
    return ( 

                <View>
                    <Text style={styles.itemTitle}> 
                        {DATA[0].title} 
                    </Text> 
                    <Text style={styles.itemTitle}> 
                        {DATA[0].lists[0].name} 
                    </Text> 
                    <FlatList 
                        data={DATA[0].lists[0]} 
                        renderlist={({item}) => <Text>
                                                    item.name
                                                </Text>
                                                }
                        
                        //{renderlist} 
                        keyExtractor={item => item.id} 
                    />
                </View>

    ); 
}; 

let DATA = [ 
    { 
        id: 1, 
        title: "Folder 1", 
        lists: [
            {
                id: 1, 
                name: "list1"
            }, 
            {
                id: 2, 
                name: "list2"
            }
        ],
        content: 
            `JavaScript (JS) is the most popular  
            lightweight, interpreted compiled  
            programming language. It can be used  
            for both Client-side as well as  
            Server-side developments. JavaScript  
            also known as a scripting language  
            for web pages.`, 
    }, 
    { 
        id: 2, 
        title: "Folder 2", 
        lists: [
            {id: 1, name: "list1"}, 
            {id: 2, name: "list2"}],
        content: 
            `A Computer Science portal for geeks.  
            It contains well written, well thought  
            and well explained computer science and  
            programming articles`, 
    }, 
    { 
        id: 3, 
        title: "Folder 3", 
        lists: [
            {id: 1, name: "list1"}, 
            {id: 2, name: "list2"}],
        content: 
            `Python is a high-level, general-purpose,  
            and very popular programming language.  
            Python programming language (latest  
            Python 3) is being used in web development,  
            Machine Learning applications, along with 
            all cutting-edge technology in Software  
            Industry.`, 
    }, 
    // ...more items 
]; 


const ListData = () => { 
    
  
    return ( 
        <View style={styles.container}> 
            <FolderList /> 
        </View> 
    ); 
}; 

const styles = StyleSheet.create({ 
    container: { 
        flex: 1, 
        backgroundColor: "#f5f5f5", 
        padding: 20, 
    }, 
    header: { 
        fontSize: 30, 
        fontWeight: "bold", 
        marginBottom: 20, 
        color: "green", 
        textAlign: "center", 
    }, 
    subheader: { 
        fontSize: 20, 
        fontWeight: "bold", 
        marginBottom: 20, 
        textAlign: "center", 
    }, 
    itemContainer: { 
        marginBottom: 15, 
        padding: 10, 
        backgroundColor: "white", 
        borderRadius: 10, 
        elevation: 3, 
    }, 
    itemTouchable: { 
        borderRadius: 10, 
        overflow: "hidden", 
    }, 
    itemTitle: { 
        fontSize: 18, 
        fontWeight: "bold", 
        color: "#333", 
    }, 
    itemContent: { 
        marginTop: 10, 
        fontSize: 14, 
        color: "#666", 
    }, 
}); 
  
export default ListData;


// ------------------------------------------------------------------------------------------------------------------------

// export class List extends Component {
//     render() {
//         return (
//             <View style={styles.container}>
//                 <Button
//                     title="Right button"
//                     onPress={() => Alert.alert('Right button pressed')}
//                 />
//             </View>
//         )
//     }
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center'
//     },
// })

// export default List

// import * as React from 'react';
// import { createDrawerNavigator } from '@react-navigation/drawer';
// import { NavigationContainer } from '@react-navigation/native';

// const Drawer = createDrawerNavigator();

// export default function App() {
//     return (
//         <NavigationContainer>
//             <Drawer.Navigator
//             drawerType="front"
//             initialRouteName="Profile"
//             drawerContentOptions={{
//                 activeTintColor: '#e91e63',
//                 itemStyle: { marginVertical: 10 },
//             }}>

//             </Drawer.Navigator>
//         </NavigationContainer>
//     );
// }