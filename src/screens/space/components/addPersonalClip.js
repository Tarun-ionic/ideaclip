/* eslint-disable react-native/no-inline-styles */
// noinspection JSUnresolvedVariable

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
    Image,
    ImageBackground,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet, Text,
    View,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {Appbar} from 'react-native-paper';
import ImagePicker from 'react-native-image-crop-picker';
import path from 'react-native-path';
import PropTypes from 'prop-types';
import ClipAttachBar from './clipAttachBar';
import {Avatar} from 'react-native-elements';
import {clipBarIco, screens} from '../../../utilities/assets';
import DocumentPicker from 'react-native-document-picker';
import logger from '../../../lib/logger';
import VideoPlayer from 'react-native-video-player';
import {useTheme} from '../../../context/ThemeContext';
import {createThumbnail} from 'react-native-create-thumbnail';
import CreatePersonalClipModal from '../../../components/ideanGallery/createPersonalClip';
import {useSession} from '../../../context/SessionContext';
import config from "../../../constant/config";
import Toast from "react-native-simple-toast";
import {strings} from "../../../constant/strings";
import AttachPreview from "./attachPreview";
import {ProgressLoader} from "../../../system/ui/components";
import {checkSize} from "../../../utilities/helper";
import {cacheClips} from "./ideanGalleryHelper";
import {getUniqId} from "../../../lib/storage";
import {useMutation} from "@apollo/client";
import {mutations} from "../../../schema";
import {cacheClipFiles} from "../../../utilities/fileUploader";

export default function AddPersonalClip({
                                            visibility,
                                            onDismiss,
                                            onSend,
                                            theme,
                                        }) {
    const isIphoneX = DeviceInfo.hasNotch();
    const [state, setState] = useState({
        file: {},
        isPublish: false,
        text: '',
        // text: '#Title: \n#Date: \n#Description: ',
        allFiles: []
    });
    const [attached, setAtached] = useState(false);
    const session = useSession();
    const {user} = session;
    const {colors} = theme;
    const {width} = useTheme();
    const styles = style(width, colors);
    const [thumb, setThumb] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const [addPersonalClip] = useMutation(mutations.createPersonalClip);
    useEffect(() => {
        if (state.file && state.file?.type === 'video') {
            createThumbnail({
                url: state.file.path,
                timeStamp: 10000,
            })
                .then(response => {
                    setThumb({uri: response.path});
                })
                .catch();
        } else if (state.file && state.file?.type === 'audio') {
            setThumb(screens.audioThumb);
        }
    }, [state.file]);
    const getThumb = async (item) => {
        let response = await createThumbnail({
            url: item,
            timeStamp: 10000,
        })
        return response.path
    }
    const handleCameraCrop = () => {
        setAtached(true);
        setIsLoading(true);
        // setState({file: {}});
        ImagePicker.openCamera({
            mediaType: 'photo',
            multiple: false,
            width: 600,
            height: 600,
            cropping: true,
        })
            .then(handleImageFile)
            .catch(() => {
                // setState({file: {}});
                // setAtached(false);
                setIsLoading(false);
                // onDismiss('camera error');
            });
    };
    const handleGalleryCrop = () => {
        setAtached(true);
        setIsLoading(true);
        // setState({file: {}});
        ImagePicker.openPicker({
            mediaType: 'photo',
            multiple: false,
        })
            .then((image)=>{
                ImagePicker.openCropper({
                    path: image.path,
                    width: 600,
                    height: 600,
                }).then(handleImageFile);     
            })
            .catch(() => {
                // setState({file: {}});
                // setAtached(false);
                setIsLoading(false);
                // onDismiss('gallery error');
            });
    };
    const handleImageFile = async file => {
        const mappedFiles = {
            name: path.parse(file.path).base,
            type: 'photo',
            path: file.path,
            size: file.size,
            mime: file.mime,
            width: file.width,
            height: file.height,
        };
        // setState({file: mappedFiles});
        saveFiles([mappedFiles])
    };

    const handleGalleryVideo = async () => {
        setAtached(true);
        setIsLoading(true);
        let fileCount = config.fileUpload.maxLimit - state.allFiles.length
        if (Platform.OS === 'ios') {
            ImagePicker.openPicker({
                mediaType: 'video',
                multiple: true,
                maxFiles: fileCount
            })
                .then(async files => {
                    const mappedFiles = await Promise.all(files?.map(async file => {
                            return {
                                name: path.parse(file.path).base,
                                type: 'video',
                                path: file.path,
                                size: file.size,
                                mime: file.mime,
                                width: file.width,
                                height: file.height,
                                thumb: await getThumb(file.path)
                            }
                        })
                    )
                    if (files.length <= fileCount) {
                        saveFiles(mappedFiles)
                    } else {
                        Toast.show(strings.file_limit_reached);
                        saveFiles(mappedFiles)
                    }
                })
                .catch(() => {
                    setIsLoading(false);
                    // onDismiss('video error');
                });
        } else {
            try {
                const files = await DocumentPicker.pickMultiple({
                    type: [DocumentPicker.types.video],
                });
                if (files.length > 0) {
                    const mappedFiles = await Promise.all(files?.map(async file => {
                        return {
                            name: file.name,
                            type: 'video',
                            path: String(file.uri),
                            size: file.size,
                            thumb: await getThumb(String(file.uri))
                        }
                    }))
                    if (files.length > fileCount) {
                        Toast.show(strings.file_limit_reached);
                    }
                    saveFiles(mappedFiles)
                }
            } catch (err) {
                logger.e(err);
                setIsLoading(false);
            }
        }
    };

    const saveFiles = (mappedFiles) => {
        let fileCount = config.fileUpload.maxLimit - state.allFiles.length
        if (!state.file?.path) {
            setState(s => {
                return {
                    ...s,
                    allFiles: s.allFiles.concat(mappedFiles.slice(0, fileCount)), file: mappedFiles[0]
                }
            });
        } else {
            setState(s => {
                return {
                    ...s,
                    allFiles: s.allFiles.concat(mappedFiles.slice(0, fileCount))
                }
            });
        }
        setIsLoading(false);

    }

    const handleGalleryAudio = async () => {
        setAtached(true);
        setIsLoading(true);
        let fileCount = config.fileUpload.maxLimit - state.allFiles.length
        try {
            const files = await DocumentPicker.pickMultiple({
                type: [DocumentPicker.types.audio],
            });
            if (files.length > 0) {
                const mappedFiles = files?.map(file => {
                    return {
                        name: file.name,
                        type: 'audio',
                        path: String(file.uri),
                        size: file.size,
                    }
                })
                if (files.length > fileCount) {
                    Toast.show(strings.file_limit_reached);
                }
                saveFiles(mappedFiles)
            }
        } catch (err) {
            logger.e(err);
            // setState({file: {}});
            // setAtached(false);
            setIsLoading(false);
            // onDismiss('audio error');
        }
    };

    const publishPost = async publishData => {
        setIsLoading(true)
        let allFiles = await Promise.all(state.allFiles.map(async file => {
            let cachedFile = await cacheClipFiles(
                user?.uid,
                file.path,
                file.type,
                file.name,
            )
            return {...file, ...cachedFile}
        }))

        let a = {...state, ...publishData, id: getUniqId(), allFiles: allFiles}

        let clip = {
            id: a.id,
            uid: user.uid,
            text: a.text,
            type: a.type,
            isPrivate: a.isPrivate,
            duration: a.duration,
            isDeleted: false,
            isPublished: false,
        };
        addPersonalClip({
            fetchPolicy: 'no-cache',
            variables: {
                ...clip,
            },
        })
            .then(async ({data: {personalClipCreate}}) => {
                let clip = {...personalClipCreate, ...a}
                await cacheClips([clip], user)
                onSend(a);
                setState({file: {}, isPublish: false, text: ''});
                // setState({file: {}, isPublish: false, text: '#Title: \n#Date: \n#Description: '});
                setAtached(false);
                onDismiss('sending dismiss');
                setIsLoading(false)
            })
            .catch((err) => {
                Toast.show('Failed to create clip. Please try again.');
                setIsLoading(false)
            });
    };

    const handleSend = ({text}) => {
        if (state.allFiles?.length > 0) {
            if (checkSize(state.allFiles, config.fileSize.ideanGallery)) {
                Toast.show(strings.fileSizeExceed);
            } else {
                setState(s => ({...s, text, isPublish: true}));
            }
        } else {
            Toast.show(strings.attachFile);
        }
    };
    const filePreview = useCallback(() => {
        return (<View><AttachPreview files={state.allFiles} onRemove={onRemoveFiles}/>
        </View>)
    }, [state.allFiles]);

    const onRemoveFiles = id => {
        const files = [...state.allFiles];
        files.splice(id, 1);
        if (id === 0) {
            if (files.length > 0) {
                setState(s => {
                    return {
                        ...s, allFiles: files, file: files[0]
                    }
                });
            } else {
                setState(s => {
                    return {
                        ...s, allFiles: files, file: {}
                    }
                });
            }
        } else {
            setState(s => {
                return {
                    ...s, allFiles: files
                }
            });
        }
    };
    return (
        <Modal
            transparent={true}
            onRequestClose={() => {
                setState({file: {}});
                setAtached(false);
                onDismiss('modal dismiss');
            }}
            visible={visibility}>
            <CreatePersonalClipModal
                visibility={state.isPublish}
                cUserType={session?.user?.userType}
                onPost={publishPost}
                onDismiss={() => setState(s => ({...s, isPublish: false}))}
            />

            <KeyboardAvoidingView
                style={{flex: 1}}
                behavior={Platform.OS === 'ios' ? 'padding' : ''}>
                <View
                    style={[
                        styles.model,
                        Platform.OS === 'ios' && isIphoneX ? styles.modelIos : {},
                    ]}>
                    <Appbar.BackAction
                        color={'white'}
                        onPress={() => {
                            setState({file: {}});
                            setAtached(false);
                            onDismiss('back dismiss');
                        }}
                    />
                    <View
                        style={styles.container}
                        onTouchEnd={() => {
                            Keyboard.dismiss();
                        }}>
                        <FlatList data={state.allFiles}
                                  horizontal={true}
                                  snapToAlignment={"center"}
                                  style={{flex: 1}}
                                  contentContainerStyle={{alignSelf: "center"}}
                                  decelerationRate={"fast"}
                                  snapToInterval={width}
                                  ListEmptyComponent={()=>{
                                      return( <Image
                                          style={{width: width/2, height: width/2, resizeMode: 'contain',alignSelf:'center'}}
                                          source={screens.ideanGalleryDefaultAttach}
                                      />)
                                  }}
                                  renderItem={({item, index}) => {
                                      return (
                                          <>
                                              {item && item?.type === 'audio' ? (
                                                  <View
                                                      style={{
                                                          width: width,
                                                          height: width,
                                                      }}>
                                                      <ImageBackground
                                                          source={screens.audioThumb}
                                                          style={{width: '100%', height: '100%'}}
                                                          resizeMode={'contain'}>
                                                          <VideoPlayer
                                                              video={{
                                                                  uri: item?.path,
                                                              }}
                                                              resizeMode="contain"
                                                              videoHeight={width}
                                                              videoWidth={width}
                                                              thumbnail={screens.audioThumb}
                                                              playInBackground={false}
                                                              playWhenInactive={false}
                                                              customPlayButton={screens.customPlay}
                                                          />
                                                      </ImageBackground>
                                                  </View>
                                              ) : item && item?.type === 'video' ? (
                                                  <View style={{width: width, height: width}}>
                                                      <VideoPlayer
                                                          video={{
                                                              uri: item?.path,
                                                          }}
                                                          resizeMode="contain"
                                                          videoWidth={width}
                                                          videoHeight={width}
                                                          thumbnail={{uri: item.thumb}}
                                                          playInBackground={false}
                                                          playWhenInactive={false}
                                                          customPlayButton={screens.customPlay}
                                                      />
                                                  </View>
                                              ) : (
                                                  <Image
                                                      style={{width: width, height: width, resizeMode: 'contain'}}
                                                      source={{uri: item?.path}}
                                                  />
                                              )}
                                          </>
                                      )
                                  }}/>

                    </View>
                    {filePreview()}
                    {attached ?
                        <>
                            <ClipAttachBar text={state.text} onChangeText={(t) => {
                                setState(s => {
                                    return {
                                        ...s, text: t
                                    }
                                })
                            }} theme={theme} onSend={handleSend} setAttached={() => {
                                if (state.allFiles.length >= config.fileUpload.maxLimit) {
                                    Toast.show(strings.file_limit_reached);
                                } else
                                    setAtached(false)
                            }}/>
                        </>
                        :
                        <>
                            <View style={styles.bar2}>
                                <Text style={{
                                    color: colors.secondaryDark,
                                    textAlign: 'center'
                                }}>{strings.single_upload_crop}</Text>
                            </View>
                            <View style={styles.bar}>
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
                                        source={clipBarIco.video}
                                        style={styles.actionButton}
                                        onPress={() => handleGalleryVideo()}
                                    />
                                </View>
                                <View style={styles.actionRound}>
                                    <Avatar
                                        source={clipBarIco.audio}
                                        style={styles.actionButton}
                                        onPress={() => {
                                            handleGalleryAudio().then();
                                        }}
                                    />
                                </View>
                            </View>
                        </>
                    }
                </View>
                <ProgressLoader visible={isLoading}/>

            </KeyboardAvoidingView>

        </Modal>
    );
}

AddPersonalClip.propTypes = {
    onDismiss: PropTypes.func,
    theme: PropTypes.object,
    visibility: PropTypes.bool,
};

const style = (width, colors) =>
    StyleSheet.create({
        modal: {
            flex: 1,
            width: width,
            backgroundColor: 'transparent',
        },
        modal1: {
            // flex: 1,
            width: width,
            backgroundColor: 'transparent',
        },
        attachContainer: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'flex-end',
            backgroundColor: 'transparent',
        },
        bar: {
            // flex: 1,
            flexDirection: 'row',
            alignItems: 'flex-end',
            backgroundColor: colors.surface,
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
        bar2: {
            alignItems: 'center',
            backgroundColor: colors.surface,
            borderRadius: 5,
            minHeight: 40,
            padding: 10,
            marginBottom: 5,
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
        model: {
            backgroundColor: 'black',
            flex: 3,
            flexDirection: 'column',
            width: '100%',
            height: '100%',
        },
        modelIos: {
            marginTop: 44,
        },
        container: {flex: 1, justifyContent: 'center', alignItems: 'center', alignSelf: "center"},
        listView: {
            zIndex: 20,
            flex: 1,
            height: 60,
            position: 'absolute',
            bottom: 0,
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
    });
