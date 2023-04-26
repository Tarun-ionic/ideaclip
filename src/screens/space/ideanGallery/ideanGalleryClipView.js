import React, {useEffect, useState} from 'react';
import {useTheme} from "../../../context/ThemeContext";
import {getThumbPath} from './helper';
import storage from '@react-native-firebase/storage';
import logger from '../../../lib/logger';
import {Image, ScrollView, StyleSheet, TouchableOpacity, View, Text, Pressable, Platform} from 'react-native';
import UserInfo from './userInfo';
import ActionMenu from '../../../components/popup/ActionMenu';
import {compareObjects, loadPopup, showFlash} from '../../../utilities/helper';
import VideoPlayer from '../../../components/ideanGallery/videoPlayer';
import Clipboard from '@react-native-community/clipboard';
import IdeanGalleryText from '../../components/utility/ideanGalleryText';
import {Icon} from 'react-native-elements';
import {icons, screens, lottie} from '../../../utilities/assets';
import LottieView from 'lottie-react-native';
import {getLovitzIcon, removeClip, uploadPersonalClip} from './ideanGalleryHelper';
import SimpleToast from 'react-native-simple-toast';
import {AnimatedCircularProgress} from 'react-native-circular-progress';
import {useMutation} from '@apollo/client';
import {mutations} from '../../../schema';
import AlertPopup from '../../components/utility/alertPopup';
import {strings} from '../../../constant/strings';
import RecentLovitz from '../../components/utility/recentLovitz';
import LovitzIcon from '../../components/utility/lovitzIcon';
import apolloLib from '../../../lib/apolloLib';
import Toast from "react-native-simple-toast";
import {viewWidth} from "../../../utilities/constant";


function IdeanGalleryClipView({
                                  item,
                                  index,
                                  profile,
                                  onClipChange,
                                  deleteClip,
                                  hideClip,
                                  ReportUGC,
                                  following,
                                  disabled = false,
                                  navigation,
                                  isFocused,
                                  session,
                                  user,
                                  active,
                                  currentlyPlayingVolume = 0
                              }) {

// style constants
    const {theme, width} = useTheme();
    const {colors} = theme;
    const contentSize = width * viewWidth.ideanGallery
    const styles = IdeanGalleryViewStyle(theme, contentSize);

// user session data
// const session = useSession();
// const {user} = session;

//media file
    const [image, setImage] = useState(null);
    const [thumb, setThumb] = useState(null);

//prevStates
    const [currentClipId, setCurrentClipId] = useState()
    const [currentMediaName, setCurrentMediaName] = useState('')

// upload states
    const [uploading, setUploading] = useState(false);
    const [uploadingFiles, setUploadingFiles] = useState([]);
    const [uploadingComplete, setUploadingComplete] = useState(false);
    const [progress, setProgress] = useState(0);

//alert states
    const [alertVisibility, setAlertVisibility] = useState(false);
    const [alertCancellable, setAlertCancellable] = useState(true);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertButtons, setAlertButtons] = useState([]);
    const [alertType, setAlertType] = useState('');

//lovitz states
    const [lovitzLatest, setLovitzLatest] = useState(item?.lovitsLatest || []);
    const [lovitzCount, setLovitzCount] = useState(item?.lovitsCount || 0);
    const [lovitzLoader, setLovitzLoader] = useState(false);
    const [isLoved, setIsLoved] = useState(item?.isLoved || false);

    const [muted, setMuted] = useState(true);

//clip publish mutation
    const [updatePersonalClip] = useMutation(mutations.editPersonalClip);

// initiate menu items
    const menuItems = [];

    if (item.uid === user.uid) {
        menuItems.push({
            label: 'Delete',
            callback: () => {
                initDelete()
            },
        });
    } else {
        menuItems.push({
            label: 'Hide',
            callback: () => {
                initHide()
            },
        });
        menuItems.push({
            label: 'Report',
            callback: () => {
                initReport()
            },
        });
    }

///////////////////////////////////////// use effect ////////////////////////////

// initial clip load
    useEffect(() => {
        if (isFocused) {

            //checking for unpublished clip
            if (item?.cache === true && item?.uploading === true) {
                if (!uploading && !uploadingComplete) {
                    setUploading(true)
                    initiateUpload()
                }
            } else {
                setUploading(false)
                setUploadingFiles([])
                setUploadingComplete(false)
                setProgress(0)
            }

            //initiating lovitz
            if (item?.lovitsCount !== lovitzCount) {
                setLovitzCount(item?.lovitsCount || 0)
            }

            if (item?.isLoved !== isLoved) {
                setIsLoved(item?.isLoved || false)
            }

            if (!compareObjects(item?.lovitsLatest, lovitzLatest)) {
                setLovitzLatest(item?.lovitsLatest || [])
            }

            //updating media data
            if (item.mediafile) {
                if (item.mediafile.includes("file://")) {
                    if (item.mediaType === 'photo') {
                        setImage({uri: item.mediafile})
                    } else {
                        setThumb({uri: item?.thumb})
                    }
                } else {
                    if (item.mediaType === 'video') {
                        let thumbPath = getThumbPath(item.mediafile)
                        if (thumbPath) {
                            storage().ref(thumbPath).getDownloadURL()
                                .then(url => {
                                    if (url) {
                                        setThumb({uri: url})
                                    }
                                })
                                .catch(err => {
                                    logger.e(err)
                                })
                        }
                    } else if (item.mediaType === 'audio') {
                        setThumb(screens.audioThumb);
                    } else {
                        storage()
                            .ref(item.mediafile)
                            .getDownloadURL()
                            .then(url => {
                                setImage({uri: url});
                            }).catch(err => {
                            logger.e(err)
                        })
                    }
                }
            }
        } else {
            if (!muted)
                setMuted(true)
        }
    }, [item, isFocused])

//initiate uploading
    useEffect(() => {
        if (uploadingFiles?.length > 0 && !uploadingComplete) {
            uploadFirstFile()
        }
    }, [uploadingFiles])

//initiate clip publishing when upload is complete
    useEffect(() => {
        if (uploadingComplete === true) {
            publishClip()
        }
    }, [uploadingComplete])

    useEffect(() => {
        if (!active) {
            if (!muted) {
                setMuted(true)
            }
        }
    }, [active])

    useEffect(() => {
        if (active) {
            let newState = currentlyPlayingVolume <= 0
            if (muted !== newState)
                setMuted(newState)
        }
    }, [currentlyPlayingVolume])

///////////////////////////////////// functions //////////////////////////////////

//reset alert popup
    const clearAlert = () => {
        setAlertVisibility(false)
        setAlertCancellable(true)
        setAlertMessage('')
        setAlertType('')
        setAlertButtons([])
    }

//report clip
    const initReport = () => {
        setAlertCancellable(false)
        setAlertType('report')
        setAlertMessage(strings.report)
        setAlertButtons([
            {
                label: strings.cancel, callback: () => {
                    clearAlert()
                }
            },
            {
                label: strings.submit, callback: (reason, otherText) => {
                    clearAlert()
                    ReportUGC && ReportUGC(item, reason, otherText, index);
                }
            }
        ])
        loadPopup(setAlertVisibility, true)
    };

//delete clip
    const initDelete = () => {
        try {
            setAlertType('alert')
            setAlertMessage(strings.confirm_clip_delete)
            setAlertButtons([
                {
                    label: strings.cancel, callback: () => {
                        clearAlert()
                    }
                },
                {
                    label: strings.ok, callback: () => {
                        clearAlert()
                        deleteClip(item, index)
                    }
                },
            ])
            loadPopup(setAlertVisibility, true)
        } catch (e) {
            logger.e(e)

        }
    };

//hide clip
    const initHide = () => {
        setAlertType('alert')
        setAlertMessage(strings.confirm_clip_hide)
        setAlertButtons([
            {
                label: strings.cancel, callback: () => {
                    clearAlert()
                }
            },
            {
                label: strings.ok, callback: () => {
                    clearAlert()
                    hideClip(item, index)
                }
            },
        ])
        loadPopup(setAlertVisibility, true)
    };

//initate upload process
    const initiateUpload = async () => {
        let files = await Promise.all(item.mediaFiles.map((file) => {
                return {...file, uploaded: false, storagePath: ''}
            })
        )
        setUploadingFiles(files)
    }

//upload next pending file
    const uploadFirstFile = () => {
        const fileCount = item.mediaFiles.length
        let index = uploadingFiles.findIndex(f => !f.uploaded)
        if (index >= 0) {
            uploadPersonalClip(
                user.uid,
                uploadingFiles[index].mediafile,
                uploadingFiles[index].mediaType,
                uploadingFiles[index].mediaName,
                (progress) => {
                    let currentProgress = 0
                    if (index > 0) {
                        currentProgress = (index) * 100
                    }
                    currentProgress = Math.round(((currentProgress + progress) / (fileCount * 100)) * 100)
                    setProgress(currentProgress)
                }
            ).then((path) => {
                try {
                    let uFiles = [...uploadingFiles]
                    let current = uFiles[index]
                    current.uploaded = true
                    current.storagePath = path
                    uFiles[index] = current
                    setUploadingFiles(uFiles)
                } catch (e) {
                    logger.e(e)
                }
            })
                .catch(err => {
                    setUploading(false)
                    setUploadingComplete(false)
                    SimpleToast.show("Failed to upload clip. Please try again after some time.")
                })
        } else {
            setUploadingComplete(true)
        }
    }

//publish clip
    const publishClip = async () => {
        let clip = {
            id: item.id,
            uid: user.uid,
            mediafile: uploadingFiles[0].storagePath,
            mediaType: uploadingFiles[0].mediaType,
            text: item.text,
            type: item.type,
            isPrivate: item.isPrivate,
            duration: item.duration,
            isDeleted: false,
            isPublished: true,
            isMultiple: uploadingFiles?.length > 1,
            mediaCount: uploadingFiles?.length,
            mediaFiles: await Promise.all(uploadingFiles.map((file, index) => {
                return {
                    mediafile: file.storagePath,
                    mediaType: file.mediaType
                }
            }))
        };
        updatePersonalClip({
            fetchPolicy: 'no-cache',
            variables: {
                ...clip,
            },
        })
            .then(async (res) => {
                if (res) {
                    const {data} = res
                    if (data) {
                        const {personalClipEdit} = data
                        if (personalClipEdit) {
                            SimpleToast.show('Clip uploaded successfully');
                            await removeClip(item, user)
                            onClipChange(personalClipEdit, index)
                        }
                    }
                }
            })
            .catch((err) => {
                logger.e(err)
                setUploading(false)
                setUploadingComplete(false)
                SimpleToast.show('File uploading Failed!');
            });
    }

// open blown up page
    const popIdeanGallery = () => {
        if(!item?.cache)
            navigation.push('IdeanGalleryView', {
                onClipChange,
                clip: item,
                deleteClip,
                hideClip,
                profile,
                following,
                index,
                disabled,
                ReportUGC
            })
    }

    const removeLovitz = async () => {
        if (lovitzLatest?.length > 0) {
            return await lovitzLatest?.filter((lovitz) => lovitz.userDetails.uid !== user.uid)
        } else {
            return []
        }
    }

    const addLovitz = async () => {
        if (lovitzLatest?.length > 0) {
            let current = [...lovitzLatest]
            let index = current?.findIndex(lovitz => lovitz?.userDetails?.uid === user.uid)
            if (index < 0) {
                current.unshift({
                    userDetails: {
                        uid: user.uid,
                        profileImageB64: user.profileImageB64,
                        profileImage: user.profileImage,
                    }
                })
            } else {
                current.splice(index, 1)
                current.unshift({
                    userDetails: {
                        uid: user.uid,
                        profileImageB64: user.profileImageB64,
                        profileImage: user.profileImage,
                    },
                });
            }
            return current
        } else {
            return [{
                userDetails: {
                    uid: user.uid,
                    profileImageB64: user.profileImageB64,
                    profileImage: user.profileImage,
                },
            }]
        }
    }

    const lovitzCallback = () => {
        setLovitzLoader(true);
        const loved = !isLoved
        const editedClip = {...item}

        apolloLib.client(session)
            .mutate({
                fetchPolicy: 'no-cache',
                mutation: mutations.personalClipLike,
                variables: {
                    id: item.id,
                    uId: user.uid,
                    profileId: item.uid,
                    isLoved: loved
                }
            })
            .then(async () => {
                if (!loved) {
                    if (lovitzCount > 0) {
                        await removeLovitz().then(res => {
                            editedClip.lovitsCount = lovitzCount - 1
                            editedClip.lovitsLatest = res
                            setLovitzCount(editedClip.lovitsCount)
                            setLovitzLatest([...res])
                        })
                            .catch(err => {
                                logger.e(err);
                            });
                    }
                } else {
                    await addLovitz()
                        .then(res => {
                            editedClip.lovitsCount = lovitzCount + 1
                            editedClip.lovitsLatest = res
                            setLovitzCount(editedClip.lovitsCount)
                            setLovitzLatest([...res])
                        })
                        .catch(err => {
                            logger.e(err);
                        });
                }
                editedClip.isLoved = loved
                setIsLoved(editedClip.isLoved)
                onClipChange(editedClip, index)
                setLovitzLoader(false)
            })
            .catch(err => {
                setLovitzLoader(false);
                logger.e(err);
            })
    }


///////////////////////////////////// view //////////////////////////////////


    const collabPopup = () => {
        setAlertType('alert')
        setAlertMessage(strings.collabFirst)
        setAlertButtons([

            {
                label: strings.ok, callback: () => {
                    clearAlert()
                }
            },
        ])
        loadPopup(setAlertVisibility, true)
    }

    const showRetryUpload = () => {
        return uploading === true ?
            (<View style={styles.uploadView}>
                    <View style={{
                        borderRadius: 50,
                        backgroundColor: '#000',
                        opacity: 0.8,
                        width: 50,
                        height: 50,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {uploadingComplete ?
                            <LottieView
                                source={lottie.splash}
                                style={styles.loaderStyle}
                                autoPlay
                                loop
                            />
                            :
                            <AnimatedCircularProgress
                                size={30}
                                width={2}
                                fill={progress}
                                rotation={0}
                                tintColor={colors.progressTint}
                                backgroundColor={colors.progressBackground}>
                                {
                                    (_) => (<Text style={{color: colors.progressTint, fontSize: 8}}>
                                            {progress.toFixed(0)}%
                                        </Text>
                                    )
                                }
                            </AnimatedCircularProgress>
                        }
                    </View>
                </View>
            ) : (

                <Pressable style={styles.retryView} onPress={() => {
                    setUploading(true)
                    initiateUpload()
                }}>
                    <Image
                        style={styles.retryImage}
                        source={icons.retry}
                        resizeMode={'contain'}
                        onError={error => logger.e('ImageIcon', error)}
                    />
                </Pressable>
            )
    }

    const showBlownup = () => {
        return (
            <Pressable style={styles.blownUpView} onPress={() => {
                if (user.uid === profile.uid) {
                    if (!item?.cache) popIdeanGallery()
                } else {
                    if (following) {
                        if (!item?.cache) popIdeanGallery()
                    } else {
                        collabPopup()
                    }
                }
            }}>
                <Image
                    style={styles.blownUpImage}
                    source={icons.blownUp}
                    resizeMode={'contain'}
                    onError={error => logger.e('ImageIcon', error)}
                />
            </Pressable>)
    }

    const showUnmute = () => {
        return (<Pressable style={styles.mute}
                           onPress={() => {
                               if (user.uid === profile.uid) {
                                   if (!item?.cache) setMuted(!muted)
                               } else {
                                   if (following) {
                                       if (!item?.cache) setMuted(!muted)
                                   } else {
                                       collabPopup()
                                   }
                               }
                           }}
        >
            <Image
                style={{width: 25, height: 25,}}
                source={muted ? icons.unmute : icons.mute}
                resizeMode={'contain'}
                onError={error => logger.e('ImageIcon', error)}
            />
        </Pressable>)
    };

    const lovitzSection = () => {
        return (
            <View
                style={styles.lovitzRow}
            >
                <RecentLovitz
                    size={20}
                    rounded={false}
                    source={
                        lovitzLatest?.length > 0 ?
                            lovitzLatest
                            :
                            lovitzCount > 0 ?
                                [
                                    {
                                        userDetails: {
                                            profileImageB64: user.profileImageB64,
                                            profileImage: user.profileImage,
                                            uid: user?.uid
                                        }
                                    }
                                ]
                                :
                                []
                    }
                    containerStyle={{alignItems: 'center', marginHorizontal: 5}}
                    style={{borderWidth: 1, borderColor: '#fff'}}
                    onPress={() => {
                        if (user.uid === profile.uid) {
                            if (lovitzCount > 0) {
                                navigation.push('LovitzList', {
                                    id: item.id,
                                    type: 'ideanGallery',
                                    profileId: item.uid,
                                });
                            } else {
                                Toast.show('No lovitz.');
                            }
                        } else {
                            if (following) {
                                if (lovitzCount > 0) {
                                    navigation.push('LovitzList', {
                                        id: item.id,
                                        type: 'ideanGallery',
                                        profileId: item.uid,
                                    });
                                } else {
                                    Toast.show('No lovitz.');
                                }
                            }
                        }
                    }}
                />

                <View
                    style={styles.lovitzCountLayout}
                >
                    <LovitzIcon
                        source={getLovitzIcon(theme.dark, isLoved)}
                        style={styles.lovitzIcon}
                        containerStyle={{
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        loaderStyle={{height: 25}}
                        onClick={() => {
                            if (user.uid === profile.uid) {
                                setLovitzLoader(true)
                                lovitzCallback();
                            } else {
                                if (following) {
                                    setLovitzLoader(true)
                                    lovitzCallback();
                                } else {
                                    collabPopup()
                                }
                            }
                        }}
                        loading={lovitzLoader}
                    />
                    <Text style={{color: colors.secondaryDark, alignSelf: 'center'}}>
                        {lovitzCount > 0 ? lovitzCount : ''}
                    </Text>
                </View>
            </View>
        )
    }

    const renderTop = () => {
        return (
            <View
                style={styles.topSection}
            >
                {/* UserDetails */}
                <UserInfo
                    item={item?.userDetails}
                    user={user}
                    navigation={navigation}
                />
                {/* Menu */}
                {!disabled &&
                <View style={styles.actionMenuView}>
                    <ActionMenu items={menuItems} color={'#999898'}/>
                </View>
                }
            </View>
        )
    }

    const renderMedia = () => {
        return (
            <View
                style={styles.mediaContainer}
            >
                {(item.mediaType === 'video' || item.mediaType === 'audio') &&
                showUnmute()
                }
                {item?.cache === true &&
                showRetryUpload()
                }
                {showFlash(item, contentSize)}
                {(item.mediaType === 'photo' || item.mediaType === null) &&
                <View
                    style={styles.mediaContainer}
                >
                    {image &&
                    <Image
                        source={image}
                        style={styles.imageStyle}
                    />
                    }
                </View>
                }
                {item.mediaType === 'video' && (
                    <View
                        style={styles.mediaContainer}
                    >
                        <VideoPlayer
                            play={active}
                            cached={item?.cache || false}
                            disabled={disabled}
                            source={item.mediafile}
                            thumbnail={thumb}
                            width={(contentSize) - 1}
                            muted={muted}
                            minPlayer={true}
                            onPress={() => {
                                if (user.uid === profile.uid) {
                                    popIdeanGallery()
                                } else {
                                    if (following) {
                                        popIdeanGallery()
                                    } else {
                                        collabPopup()
                                    }
                                }
                            }}
                        />
                    </View>
                )}
                {item.mediaType === 'audio' && (
                    <View
                        style={styles.mediaContainer}
                    >
                        <VideoPlayer
                            play={active}
                            cached={item?.cache || false}
                            disabled={disabled}
                            source={item.mediafile}
                            thumbnail={screens.audioThumb}
                            width={(contentSize) - 1.25}
                            muted={muted}
                            minPlayer={true}
                            onPress={() => {
                                if (user.uid === profile.uid) {
                                    popIdeanGallery()
                                } else {
                                    if (following) {
                                        popIdeanGallery()
                                    } else {
                                        collabPopup()
                                    }
                                }
                            }}
                        />
                    </View>
                )}
                {item?.isMultiple && item?.mediaCount > 1 &&
                <View style={styles.multipleMediaDots}>
                    {[1, 2, 3].map(f => {
                        return (<Icon
                            style={{
                                marginHorizontal: 5,
                                borderRadius: 10
                            }}
                            key={`${f}`}
                            name={"circle"}
                            size={8}
                            color={colors.greyScale}
                            type="fontawesome"
                        />)
                    })
                    }
                </View>
                }
                {(item.mediaType === 'audio' || item.mediaType === 'video') &&
                showBlownup()
                }
            </View>
        )
    }

    const renderBottom = () => {
        return (
            <View
                style={styles.bottomSection}
            >
                {lovitzSection()}
                <ScrollView
                    scrollEnabled={true}
                    nestedScrollEnabled={true}
                    style={{
                        marginBottom: 10,
                    }}
                >
                    <Pressable
                        onLongPress={() => {
                            Clipboard.setString(item.text);
                            Toast.show(strings.copied);
                        }}
                        onPress={() => {

                        }}
                    >
                        <IdeanGalleryText viewer={theme.dark} ignoreShowMore={true}
                                          text={item.text}/>
                    </Pressable>
                </ScrollView>
            </View>
        )
    }

    return (
        <View
            style={{
                margin: 5,
                width: contentSize,
                borderWidth: 0.5,
                borderColor: '#ACABAB'
            }}
        >
            {/* Top section */}
            {renderTop()}

            {/* Media section */}
            <TouchableOpacity
                onPress={() => {
                    if (user.uid === profile.uid) {
                        if (!item?.cache) popIdeanGallery()
                    } else {
                        if (following) {
                            if (!item?.cache) popIdeanGallery()
                        } else {
                            collabPopup()
                        }
                    }
                }}
            >
                {renderMedia()}
            </TouchableOpacity>
            {renderBottom()}
            {
                alertVisibility &&
                <AlertPopup buttons={alertButtons} message={alertMessage} type={alertType} visibility={alertVisibility}
                            onCancel={clearAlert} cancellable={alertCancellable}/>
            }
        </View>
    )

}

const IdeanGalleryViewStyle = ({colors}, size) => {
    return StyleSheet.create({
        topSection: {
            flexDirection: 'row',
            marginVertical: 10,
            marginLeft: 10
        },
        mediaContainer: {
            width: size,
            height: size,
        },
        imageStyle: {
            width: size-1.25,
            height: size,
            resizeMode: 'cover',
        },
        actionMenuView: {
            alignSelf: 'flex-end',
        },
        multipleMediaDots: {
            width: '100%',
            position: 'absolute',
            zIndex: 5,
            bottom: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: "center"
        },
        bottomSection: {
            height: 150,
            flex: 1,
            padding: 5,
        },
        retryImage: {
            width: 25,
            height: 25,
        },
        retryView: {
            position: 'absolute',
            zIndex: 9999,
            right: 10,
            top: 10,
        },
        uploadView: {
            position: 'absolute',
            zIndex: 9999,
            right: 0,
            left: 0,
            top: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
        },
        loaderStyle: {
            height: 50,
            alignSelf: 'center',
        },
        blownUpView: {
            position: 'absolute',
            zIndex: 9999,
            right: 10,
            bottom: 10,
        },
        blownUpImage: {
            width: 20,
            height: 20,
        },
        mute: {
            position: 'absolute',
            zIndex: 9998,
            left: 10,
            top: 10,
        },
        lovitzRow: {
            flexDirection: 'row',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            marginVertical: 15
        },
        lovitzCountLayout: {
            marginHorizontal: 5,
            flexDirection: 'row',
            minWidth: 45,
            alignSelf: 'flex-end',
            justifyContent: 'flex-end',
            flex: 1,
        },
        lovitzIcon: {
            width: 25,
            height: 25,
            marginRight: 10,
            resizeMode: 'contain',
        }
    });
};
export default React.memo(IdeanGalleryClipView, (p, n) => JSON.stringify(p) === JSON.stringify(n));