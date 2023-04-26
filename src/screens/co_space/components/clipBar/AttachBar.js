import React, {useEffect} from 'react';
import {
    Keyboard,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableHighlight,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import {Avatar} from 'react-native-elements';
import {clipBarIco} from '../../../../utilities/assets';
import DocumentPicker from 'react-native-document-picker';
import ImagePicker from 'react-native-image-crop-picker';
import {useTheme} from '../../../../context/ThemeContext';
import logger from '../../../../lib/logger';
import path from 'react-native-path';
import config from '../../../../constant/config';
import Toast from 'react-native-simple-toast';
import {strings} from '../../../../constant/strings';
import scale from '../../../../utilities/scale';

export default function AttachBar({
                                      onDismiss,
                                      visibility,
                                      onAttach,
                                      fileCount,
                                  }) {
    const {theme, width, height} = useTheme();
    const {colors} = theme;
    const styles = BarModelStyles(theme, width, height);
    useEffect(() => {
        Keyboard.dismiss();
    }, []);

    const parseFile = (type, file, isFormat2 = false) => {
        try {
            if (isFormat2 === true) {
                return {
                    name: path.parse(file.path).base,
                    type: type,
                    path: file.path,
                    size: file.size,
                    mime: file.mime,
                };
            } else {
                return {
                    name: file.name,
                    type,
                    path: String(file.uri),
                    size: file.size,
                    mime: file.type,
                };
            }
        } catch (e) {
            logger.e(e);
            return {};
        }
    };

    const handleCamera = () => {
        ImagePicker.openCamera({})
            .then(image => {
                onDismiss(true);
                onAttach([image].map(file => parseFile('photo', file, true)));
            })
            .catch(logger.e);
    };

    const handleGallery = () => {
        if (Platform.OS === 'ios') {
            ImagePicker.openPicker({
                mediaType: 'photo',
                multiple: true,
                maxFiles: fileCount,
            })
                .then(files => {
                    if (files.length <= fileCount) {
                        onDismiss(true);
                        onAttach(files.map(file => parseFile('photo', file, true)));
                    } else {
                        Toast.show(strings.file_limit_reached);
                        onDismiss(true);
                        onAttach(
                            files
                                .slice(0, fileCount)
                                .map(file => parseFile('photo', file, true)),
                        );
                    }
                })
                .catch(err => {
                    logger.e(err);
                    onDismiss(true);
                });
        } else {
            DocumentPicker.pickMultiple({
                type: [DocumentPicker.types.images],
            })
                .then(files => {
                    if (files.length <= fileCount) {
                        onDismiss(true);
                        onAttach(files.map(file => parseFile('photo', file)));
                    } else {
                        Toast.show(strings.file_limit_reached);
                        onDismiss(true);
                        onAttach(
                            files.slice(0, fileCount).map(file => parseFile('photo', file)),
                        );
                    }
                })
                .catch(err => {
                    logger.e(err);
                    onDismiss(true);
                });
        }
    };

    const handleVideo = () => {
        if (Platform.OS === 'ios') {
            ImagePicker.openPicker({
                mediaType: 'video',
                multiple: true,
                maxFiles: fileCount,
            })
                .then(files => {
                    if (files.length <= fileCount) {
                        onDismiss(true);
                        onAttach(files.map(file => parseFile('video', file, true)));
                    } else {
                        Toast.show(strings.file_limit_reached);
                        onDismiss(true);
                        onAttach(
                            files
                                .slice(0, fileCount)
                                .map(file => parseFile('video', file, true)),
                        );
                    }
                })
                .catch(err => {
                    logger.e(err);
                    onDismiss(true);
                });
        } else {
            DocumentPicker.pickMultiple({
                type: [DocumentPicker.types.video],
            })
                .then(files => {
                    if (files.length <= fileCount) {
                        onDismiss(true);
                        onAttach(files.map(file => parseFile('video', file)));
                    } else {
                        Toast.show(strings.file_limit_reached);
                        onDismiss(true);
                        onAttach(
                            files.slice(0, fileCount).map(file => parseFile('video', file)),
                        );
                    }
                })
                .catch(err => {
                    logger.e(err);
                    onDismiss(true);
                });
        }
    };
    const handleFiles = () => {
        DocumentPicker.pickMultiple({
            type: [
                DocumentPicker.types.plainText,
                DocumentPicker.types.audio,
                DocumentPicker.types.pdf,
                DocumentPicker.types.doc,
                DocumentPicker.types.docx,
                DocumentPicker.types.ppt,
                DocumentPicker.types.pptx,
                DocumentPicker.types.xls,
                DocumentPicker.types.xlsx,
            ],
        })
            .then(files => {
                if (files.length <= fileCount) {
                    onDismiss(true);
                    onAttach(files.map(file => parseFile('file', file)));
                } else {
                    Toast.show(strings.file_limit_reached);
                    onDismiss(true);
                    onAttach(
                        files.slice(0, fileCount).map(file => parseFile('file', file)),
                    );
                }
            })
            .catch(err => {
                logger.e(err);
                onDismiss(true);
            });
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
                        <View style={[styles.bar2]}>
                            <Text
                                style={{
                                    fontSize: scale.font.l,
                                    color: colors.secondaryText,
                                    margin: 5,
                                    alignSelf: 'center',
                                }}>{`You can clip up to ${config.fileUpload.maxLimit} ${
                                config.fileUpload.maxLimit > 1 ? 'files' : 'file'
                            } at a time.`}</Text>
                            <View style={{width: '100%', flexDirection: 'row'}}>
                                <View style={styles.actionRound}>
                                    <Avatar
                                        source={clipBarIco.camera}
                                        style={styles.actionButton}
                                        onPress={() => handleCamera()}
                                    />
                                </View>
                                <View style={styles.actionRound}>
                                    <Avatar
                                        source={clipBarIco.gallery}
                                        style={styles.actionButton}
                                        onPress={() => handleGallery()}
                                    />
                                </View>
                                <View style={styles.actionRound}>
                                    <Avatar
                                        source={clipBarIco.video}
                                        style={styles.actionButton}
                                        onPress={() => handleVideo()}
                                    />
                                </View>
                                <View style={styles.actionRound}>
                                    <Avatar
                                        source={clipBarIco.files}
                                        style={styles.actionButton}
                                        onPress={() => handleFiles()}
                                    />
                                </View>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableHighlight>
        </Modal>
    );
}

export const BarModelStyles = ({colors}, width, height) =>
    StyleSheet.create({
        modal: {
            width: width,
            backgroundColor: 'transparent',
            height: height,
        },
        container: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'flex-end',
            backgroundColor: 'transparent',
            paddingBottom: 10,
        },
        bar: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'flex-end',
            backgroundColor: colors.surfaceDark,
            borderRadius: 5,
            minHeight: 60,
            padding: 20,
            shadowColor: colors.surfaceDark,
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 5.84,
            elevation: 5,
        },
        bar2: {
            flex: 1,
            alignItems: 'flex-end',
            backgroundColor: colors.surface,
            borderRadius: 5,
            paddingTop: 10,
            paddingHorizontal: 20,
            paddingBottom: 20,
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
            // backgroundColor: '#fff',
        },
        FilesContainer: {
            backgroundColor: colors.surfaceDark,
            padding: 10,
            borderRadius: 10,
            margin: 5,
        },
        preview: {
            margin: 5,
            height: 60,
            width: 60,
            alignSelf: 'center',
            resizeMode: 'cover',
        },
        action: {
            position: 'absolute',
            top: 0,
            backgroundColor: colors.surfaceDark,
            borderRadius: 50,
            right: 0,
        },
    });
