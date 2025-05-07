import React, { useState, useEffect } from 'react';
import { Image, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { FIREBASE_AUTH, FIRESTORE_DB, uploadToFirebase, FIREBASE_STORAGE} from '../../firebaseConfig';
import { doc, updateDoc, getDoc, writeBatch, getDocs, collection, deleteDoc } from 'firebase/firestore';
import { getReferenceFromUrl, ref, getStorage, deleteObject } from 'firebase/storage'


export default function UploadImage({ refreshing }) {
    const [image, setImage] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const currentUser = FIREBASE_AUTH.currentUser;

    useEffect(() => {
        fetchUserProfile();
    }, [refreshing, image]);

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

    function getStoragePathFromUrl(url) {
        // Extract the part after '/o/' and before '?'
        const match = url.match(/\/o\/([^?]+)/);
        if (!match) return null;
        // URL-decode the path
        return decodeURIComponent(match[1]);
      }

    const addImage = async () => {
        try {
            let _image = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (_image.assets && !_image.cancelled) {
                const { uri } = _image.assets[0];
                const fileName = uri.split('/').pop();
                console.log(fileName);
                const uploadResp = await uploadToFirebase(uri, `profilePics/${fileName}`, (progress) =>
                    console.log(progress)
                );
                await updateProfilePicture(uploadResp.downloadUrl);
            }
        } catch (e) {
            Alert.alert("Error Uploading Image " + e.message);
        }
    };


    const updateProfilePicture = async (downloadUrl) => {
        if (currentUser) {
            const userProfileRef = doc(FIRESTORE_DB, 'Users', currentUser.uid);
            const userFriendsRef = collection(FIRESTORE_DB, 'Requests', currentUser.uid, 'AllFriends');
            const userFriendsReqRef = collection(FIRESTORE_DB, 'Requests', currentUser.uid, 'SentRequests');
            try { //I have to update it in Users, for each AllFriends/AllFriends/currentUserId, for each ownRequests/FriendRequests/currentUserId
                if (!downloadUrl) {
                    throw new Error("Image Not Found");
                }
                const batch = writeBatch(FIRESTORE_DB);
                const userSnapshot = await getDoc(userProfileRef);
                let prevProfilePic = ''
                if (userSnapshot) {
                    prevProfilePic = userSnapshot.data().profilePic;
                }
                batch.update(userProfileRef, {
                    profilePic: downloadUrl,
                });
                // update profile pic on each friend's allFriends
                if (userFriendsRef) {
                    const AllFriendsSnapshot = await getDocs(userFriendsRef);
                    AllFriendsSnapshot.forEach((friendDoc) => {
                        const friendId = friendDoc.id
                        const friendDataRef = doc(FIRESTORE_DB, 'Requests', friendId, 'AllFriends', currentUser.uid);
                        if (!friendDataRef) {
                            throw new Error("Friends are not mutual");
                        }
                        batch.update(friendDataRef, {
                            profilePic: downloadUrl,
                        });
                    })
                }
                if (userFriendsReqRef) {
                    const ReqFriendsSnapshot = await getDocs(userFriendsReqRef);
                    ReqFriendsSnapshot.forEach((reqFriendDoc) => {
                        const reqFriendId = reqFriendDoc.id;
                        console.log(reqFriendId);
                        const reqFriendDataRef = doc(FIRESTORE_DB, 'Requests', reqFriendId, 'FriendRequests', currentUser.uid);
                        if (!reqFriendDataRef) {
                            throw new Error("Friends are not mutually requested");
                        }
                        batch.update(reqFriendDataRef, {
                            profilePic: downloadUrl,
                        });
                    })
                }
                await batch.commit()
                const storagePath = getStoragePathFromUrl(prevProfilePic);
                const profilePicRef = ref(getStorage(), storagePath);
                deleteObject(profilePicRef);
                setImage(downloadUrl);
                // update profile pic on each SentRequests
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