/* eslint-disable react-hooks/rules-of-hooks */
import React, {useEffect} from 'react';
import {Keyboard, Modal, StyleSheet, TouchableHighlight, TouchableWithoutFeedback, View,} from 'react-native';
import {Avatar} from 'react-native-elements';
import {clipBarIco} from 'utilities/assets';

import ImagePicker from 'react-native-image-crop-picker';
import {useTheme} from 'context/ThemeContext';
import {check, openSettings, PERMISSIONS, RESULTS} from "react-native-permissions";
import checkPermission from "../../utilities/permission";
import Toast from "react-native-simple-toast";

export default function attachBar({
                                      onDismiss,
                                      visibility,
                                      changeImage,
                                      removeImage,
                                  }) {
    const {width} = useTheme();
    const styles = styleGen(width);


    useEffect(() => {
        Keyboard.dismiss();
    }, []);

    const handleCameraCrop = () => {
        checkPermission('camera').then(() => {
            ImagePicker.openCamera({
                width: 400,
                height: 400,
                cropping: true,
                cropperCircleOverlay: true,
                useFrontCamera: true,
            }).then(image => {
                changeImage(image);
                onDismiss(true);
            });
        }).catch(error => {
            Toast.show(error)
        })

    };
    const handleGalleryCrop = () => {
        checkPermission('gallery').then(() => {
            ImagePicker.openPicker({
                mediaType: 'photo',
                multiple: false,
            }).then(image => {
                ImagePicker.openCropper({
                    path: image.path,
                    width: 400,
                    height: 400,
                    cropperCircleOverlay: true,
                }).then(image => {
                        changeImage(image);
                }); 
                onDismiss(true);
            });
        }).catch(error => {
            console.log("error ",error)
            Toast.show(error)
        })

    };

    return (
        <Modal
            animationType={'fade'}
            transparent={true}
            visible={visibility}
            onRequestClose={() => {
                onDismiss(true);
            }}>
            <TouchableHighlight
                activeOpacity={1}
                underlayColor="transparent"
                onPress={() => onDismiss(true)}
                style={styles.modal}>
                <View style={[styles.container]}>
                    <TouchableWithoutFeedback>
                        <View style={[styles.bar]}>
                            <View style={styles.actionRound}>
                                <Avatar
                                    source={clipBarIco.camera}
                                    style={styles.actionButton}
                                    onPress={() => handleCameraCrop()}
                                />
                            </View>
                            <View style={styles.actionRound}>
                                <Avatar
                                    source={clipBarIco.gallery}
                                    style={styles.actionButton}
                                    onPress={() => handleGalleryCrop()}
                                />
                            </View>
                            <View style={styles.actionRound}>
                                <Avatar
                                    source={clipBarIco.delete}
                                    style={styles.actionButton}
                                    onPress={() => {
                                        removeImage();
                                        onDismiss(true);
                                    }}
                                />
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableHighlight>
        </Modal>
    );
}

const styleGen = width =>
    StyleSheet.create({
        modal: {
            flex: 1,
            width: width,
            backgroundColor: 'transparent',
        },
        container: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'flex-end',
            backgroundColor: 'transparent',
        },
        bar: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'flex-end',
            backgroundColor: '#fff',
            borderRadius: 5,
            minHeight: 60,
            padding: 20,
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 5.84,
            elevation: 5,
        },
        actionRound: {
            flex: 1,
            alignItems: 'center',
        },
        actionButton: {
            height: 60,
            width: 60,
            padding: 10,
            borderRadius: 50,
            backgroundColor: '#efefef',
        },
    });
