import React, { useState, useEffect } from 'react';
import { Image, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../firebaseConfig';
import { doc, updateDoc, getDoc } from 'firebase/firestore';


export default function UploadImage() {
    const [image, setImage] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const currentUser = FIREBASE_AUTH.currentUser;

    useEffect(() => {
        fetchUserProfile();
    }, [userProfile]);

    const fetchUserProfile = async () => {
        if (currentUser) {
            const userProfileRef = doc(FIRESTORE_DB, 'Users', currentUser.uid);

            try {
                const docSnapshot = await getDoc(userProfileRef);
                if (docSnapshot.exists()) {
                    setUserProfile(docSnapshot.data());
                    setImage(docSnapshot.data().profilePic);
                }
            } catch (error) {
                console.error('Error fetching user profile: ', error);
            }
        }
    };

    const addImage = async () => {
        let _image = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
        console.log(JSON.stringify(_image));
        if (!_image.cancelled) {
            setImage(_image.assets[0].uri);
            updateProfilePicture(_image.assets[0].uri);
        }
    };

    const updateProfilePicture = async (uri) => {
        if (currentUser) {
            const userProfileRef = doc(FIRESTORE_DB, 'Users', currentUser.uid);

            try {
                await updateDoc(userProfileRef, {
                    profilePic: uri,
                });
                console.log('Profile picture updated successfully!');
            } catch (error) {
                console.error('Error updating profile picture: ', error);
            }
        }
    };
    return (
        <View style={imageUploaderStyles.container}>
            {
                image && <Image source={{ uri: userProfile.profilePic }} style={{ width: 200, height: 200 }} />
            }
            <View style={imageUploaderStyles.uploadBtnContainer}>
                <TouchableOpacity onPress={addImage} style={imageUploaderStyles.uploadBtn} >
                    <Text>{image ? 'Edit' : 'Upload'} Image</Text>
                    <AntDesign name="camera" size={20} color="black" />
                </TouchableOpacity>
            </View>
        </View>
    );
}
const imageUploaderStyles = StyleSheet.create({
    container: {
        elevation: 2,
        height: 100,
        width: 100,
        backgroundColor: '#efefef',
        position: 'relative',
        borderRadius: 999,
        overflow: 'hidden',
        marginBottom: 20,
        marginTop: 0,
    },
    uploadBtnContainer: {
        opacity: 0.7,
        position: 'absolute',
        right: 0,
        bottom: 0,
        backgroundColor: 'lightgrey',
        width: '100%',
        height: '45%',
    },
    uploadBtn: {
        display: 'flex',
        alignItems: "center",
        justifyContent: 'center'
    }
})