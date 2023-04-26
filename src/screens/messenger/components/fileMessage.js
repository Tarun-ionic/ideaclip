/* eslint-disable react-hooks/exhaustive-deps */
/**
 *  Image message
 * image message input and attachments
 *
 * created by akhi
 * created on 30 may 2021
 * created for ideaclip
 */
import React, {useCallback, useEffect, useState} from 'react';
import {
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import {Appbar} from 'react-native-paper';
import FastImage from 'react-native-fast-image';
import MessageBar from './messageBar';
import PropTypes from 'prop-types';
import DeviceInfo from 'react-native-device-info';
import DocumentPicker from 'react-native-document-picker';
import logger from '../../../lib/logger';
import ImagePicker from 'react-native-image-crop-picker';
import path from 'react-native-path';
import config from '../../../constant/config';
import Toast from 'react-native-simple-toast';
import {strings} from '../../../constant/strings';
import {Icon} from 'react-native-elements';
import {checkSize, formatBytes, useDebounce} from "../../../utilities/helper";

export default function FileMessage({visibility, onDismiss, onSend, theme}) {
    const [state, setState] = useState({defFile: {}, files: []});
    const styles = style(theme);
    const {colors} = theme;
    const isIphoneX = DeviceInfo.hasNotch();
    const {debounce} = useDebounce()

    const onClear = () => {
        setState({defFile: {}, files: []});
        onDismiss();
    };

    const sendManager = ({text}) => {
        const sizeCheck = checkSize(state.files, config.fileSize.chat)
        const countCheck = state.files.length <= config.fileUpload.maxLimit
        if (sizeCheck === false && countCheck === true) {
            onSend({text, files: state.files});
            onClear();
        } else {
            Toast.show(strings.file_limit_reached);
        }
    }

    const handleSend = ({text}) => {
        debounce(sendManager({text}))
    };


    const onRemove = (item) => {
        let temp = state.files;
        let index = temp.indexOf(item);
        temp.splice(index, 1);
        if (item === state.defFile) {
            setState(prev => ({
                ...prev,
                files: temp,
                defFile: index > 0 ? temp[index - 1] : temp[0],
            }));
        } else {
            setState(prev => ({...prev, files: temp}));
        }
    }

    const listRender = useCallback(
        ({item}) => {
            const invalid = item.size ? item.size > config.fileSize.chat : false

            return (
                <View>
                    <Pressable
                        onPress={() => setState(prev => ({...prev, defFile: item}))}>
                        <FastImage style={styles.previewImage} source={{uri: item.path}}/>
                    </Pressable>
                    <View style={styles.action}>
                        <Icon
                            name={invalid ? "error" : "cancel"}
                            size={25}
                            color={invalid ? colors.fileErrorCoSpace : colors.secondary}
                            type="material"
                            onPress={() => {
                                onRemove(item)
                            }}
                        />
                    </View>
                    <Text style={{
                        textAlign: "center",
                        margin: 5,
                        color: invalid ? colors.warning : colors.textPrimary
                    }}>{formatBytes(item.size)}</Text>
                </View>
            );
        },
        [state],
    );

    const GalleryManager = () => {
        if (state.files.length >= config.fileUpload.maxLimit) {
            Toast.show(strings.file_limit_reached);
        } else if (Platform.OS === 'ios') {
            ImagePicker.openPicker({
                mediaType: 'photo',
                multiple: true,
                maxFiles: config.fileUpload.maxLimit,
            })
                .then(async files => {
                    await handleImages(files, false);
                })
                .catch(handleError);
        } else {
            DocumentPicker.pickMultiple({
                type: [DocumentPicker.types.images],
            })
                .then(async files => {
                    await handleImages(files, true);
                })
                .catch(handleError);
        }
    }

    const attachGalleryImage = () => {
        debounce(GalleryManager)
    };

    const handleError = err => {
        onClear();
        logger.e(err);
        onDismiss();
    };

    const handleImages = async (files, android = false) => {
        const mappedFiles = await Promise.all(files.map(android ? handleImageAndroid : handleImageIOS),);
        const fileList = mappedFiles.concat(state.files);
        if (fileList.length > 0 && fileList.length <= config.fileUpload.maxLimit) {
            setState({files: fileList, defFile: fileList[0]});
        } else if (fileList.length > config.fileUpload.maxLimit) {
            Toast.show(strings.file_limit_reached);
            const list = fileList.slice(0, config.fileUpload.maxLimit)
            setState({files: list, defFile: list[0]});
        } else {
            onClear();
        }
    };
    const handleImageIOS = (file, index) => ({
        index,
        name: path.parse(file.path).base,
        type: 'image',
        path: file.path,
        size: file.size,
        mime: file.mime,
    });
    const handleImageAndroid = (file, index) => ({
        index,
        name: file?.name,
        type: 'image',
        path: String(file?.uri),
        size: file?.size,
        mime: file?.type,
    });
    useEffect(() => {
        if (visibility === true && state.files.length === 0) {
            onClear();
        }
    }, [state])
    return (
        <Modal
            transparent={true}
            onRequestClose={() => onClear()}
            onShow={() => {
                attachGalleryImage();
            }}
            visible={visibility}>
            {state.defFile?.path && (
                <KeyboardAvoidingView
                    style={{flex: 1}}
                    behavior={Platform.OS === 'ios' ? 'padding' : ''}>
                    <View
                        style={[
                            styles.model,
                            Platform.OS === 'ios' && isIphoneX ? styles.modelIos : {},
                        ]}>
                        <Appbar.BackAction color={'white'} onPress={() => onClear()}/>
                        <View
                            style={styles.container}
                            onTouchEnd={() => {
                                Keyboard.dismiss();
                            }}>
                            <FastImage
                                style={styles.fullView}
                                resizeMode={FastImage.resizeMode.contain}
                                source={{uri: state.defFile.path}}
                            />
                            <View style={styles.listView}>
                                <FlatList
                                    horizontal
                                    scrollEnabled
                                    data={state.files}
                                    renderItem={listRender}
                                    keyExtractor={({index}) => index}
                                />
                                {checkSize(state.files, config.fileSize.chat) &&
                                <Text style={{color: colors.warning, textAlign: 'center'}}>
                                    {strings.fileSizeExceed}
                                </Text>
                                }
                            </View>

                        </View>

                        <MessageBar theme={theme} onSend={handleSend} fileAttach={'image'}
                                    onSelectFilePicker={attachGalleryImage} emptyString={true}/>
                    </View>
                </KeyboardAvoidingView>
            )}
        </Modal>
    );
}

FileMessage.propTypes = {
    onDismiss: PropTypes.func,
    theme: PropTypes.object,
    visibility: PropTypes.bool,
};

const style = ({colors}) =>
    StyleSheet.create({
        model: {
            backgroundColor: 'black',
            flex: 3,
            flexDirection: 'column',
            width: '100%',
            height: '100%',
        },
        container: {flex: 1},
        listView: {
            zIndex: 20,
            flex: 1,
            width: '100%',
            minHeight: 60,
            position: 'absolute',
            backgroundColor: colors.surface,
            borderRadius: 5,
            padding: 5,
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 5.84,
            elevation: 5,
            bottom: 5
        },
        previewImage: {
            margin: 5,
            height: 60,
            width: 60,
            alignSelf: 'center',
            resizeMode: 'cover',
        },
        fullView: {
            width: '100%',
            height: '100%',
            alignItems: 'center',
            alignContent: 'center',
            alignSelf: 'center',
        },
        modelIos: {
            marginTop: 44,
        },
        action: {
            position: 'absolute',
            top: 0,
            backgroundColor: colors.surfaceDark,
            borderRadius: 50,
            right: 0,
        },
    });
