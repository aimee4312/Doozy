import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import CheckedPost from '../../assets/checked-post-sent.svg';
import CheckedTask from '../../assets/checked-task.svg'
import UncheckedTask from '../../assets/unchecked-task.svg';
import colors from '../../theme/colors';
import fonts from '../../theme/fonts';
import { Ionicons } from '@expo/vector-icons';

const Task = (props) => {

    const { text, tick, i, complete, deleteItem, onOpen, onClose, isFirst, isLast, isSelected, hidden} = props;

    const [isOpened, setIsOpened] = useState(false);
    const rowRef = useRef(null);

    const onSwipeOpen = () => {
        if (!isOpened) {
            setIsOpened(true);
            onOpen(rowRef);
        }
    };
    const onSwipeClose = () => {
        if (isOpened) {
            setIsOpened(false);
            onClose(rowRef);
        }
    };

    const checkoff = () => {
        tick(i, complete);
    };

    const deleteItemHelper = () => {
    rowRef.current?.close();
    setTimeout(() => {
        deleteItem(i, complete);
    }, 300);
    };

    const RightActions = ({ onPress }) => {

        return (
            <TouchableOpacity onPress={onPress}>
                <View style={styles.rightAction}>
                    <Ionicons name="trash-outline" size={24} color={colors.button_text} />
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <Swipeable
            ref={rowRef}
            renderRightActions={() => <RightActions onPress={deleteItemHelper} />}
            onSwipeableWillOpen={() => onSwipeOpen(rowRef)}
            onSwipeableWillClose={() => onSwipeClose(rowRef)}
            simultaneousHandlers={rowRef}
        >
            <View style={[styles.item, isFirst && styles.firstTask, isLast && styles.lastTask, isSelected ? styles.selectedItem : styles.nonselectedItem]}>
                <TouchableOpacity style={styles.checkedbox} key={i} onPress={checkoff}>
                    {complete ? (
                        hidden ? (
                        <CheckedTask width={32} height={32} />
                        ) : (
                        <CheckedPost width={32} height={32} />
                        )
                    ):(
                        <UncheckedTask width={32} height={32} />
                    )}
                </TouchableOpacity>
                <Text style={styles.itemText}>{text}</Text>
            </View>
        </Swipeable>
    )
}

const styles = StyleSheet.create({
    item: {
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
    },
    firstTask: {
        borderTopRightRadius: 15,
        borderTopLeftRadius: 15,
    },
    lastTask: {
        borderBottomRightRadius: 15,
        borderBottomLeftRadius: 15,
    },
    selectedItem: {
        backgroundColor: colors.tint,
    },
    nonselectedItem: {
        backgroundColor: colors.surface,
    },
    checkedbox: {
        marginRight: 10,
    },
    itemText: {
        maxWidth: '80%',
        color: colors.primary,
        fontFamily: fonts.regular,
        fontSize: 14,
    },
    rightAction: {
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: 60,
    },
});

export default Task;