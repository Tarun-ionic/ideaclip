import React, { useEffect, useRef, useState} from 'react';
import {FlatList,  Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import {useTheme} from "../../context/ThemeContext";
import {useSession} from "../../context/SessionContext";
import {useAlert} from "../../context/AlertContext";
import {useNavigation, useRoute} from "@react-navigation/native";
import storage from "@react-native-firebase/storage";
import {pcTypes, toggleState, userType, viewWidth} from "../../utilities/constant";
import {lovitzIcons, placeHolders} from "../../utilities/assets";
import SystemSetting from "react-native-system-setting";
import {strings} from "../../constant/strings";
import apolloLib from "../../lib/apolloLib";
import {mutations, queries} from "../../schema";
import {loadPopup, navigationReset, onTrigger, showFlash, useBackHandler} from "../../utilities/helper";
import logger from "../../lib/logger";
import Toast from "react-native-simple-toast";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {Icon} from "react-native-elements";
import scale from "../../utilities/scale";
import ImageIcon from "../components/utility/imageIcon";
import ActionMenu from "../../components/popup/ActionMenu";
import {ContainerScroll, GradiantButton, LineView, ScreenLoader} from "../../system/ui/components";
import RenderClipMedia from "./components/renderClipMedia";
import RecentLovitz from "../components/utility/recentLovitz";
import LovitzIcon from "../components/utility/lovitzIcon";
import {Time2String} from "../../lib/storage";
import config from "../../constant/config";
import IdeanGalleryText from "../components/utility/ideanGalleryText";
import {SafeScreenView} from "../../index";
import {CopyText} from "../components/utility/share";
import apiConstant from "../../constant/apiConstant";

export default function IdeanGalleryView() {
    const route = useRoute();
    const alert = useAlert();
    const navigation = useNavigation();
    const {
        clip,
        deleteClip=(item, index)=>{
            apolloLib.client(session)
                .mutate({
                    fetchPolicy: 'no-cache',
                    mutation: mutations.deletePersonalClip,
                    variables: {
                        id: item.id,
                        uid: user.uid,
                        isDeleted: true,
                    },
                })
                .then(({data, error}) => {
                    if (data) {
                        Toast.show(strings.removingCompleted);
                    }
                    if (error) {
                        alert('Failed to delete clip. Please try again later.');
                    }
                })
                .catch(() => {
                    alert('Failed to delete clip. Please try again later.');
                });
        },
        hideClip=(item, index, callBack)=>{
            apolloLib.client(session)
                .mutate({
                    fetchPolicy: 'no-cache',
                    mutation: mutations.hidePersonalClip,
                    variables: {
                        id: user.uid,
                        data: {
                            id: item.id,
                            uid: item.uid,
                            text: item.text,
                        },
                    },
                })
                .then(({data, error}) => {
                    if (data) {
                        if (!callBack)
                            Toast.show(strings.hidingCompleted);
                    }
                    onTrigger(callBack, !error);
                    if (error) {
                        alert('Failed to hide clip. Please try again later.');
                    }
                })
                .catch(() => {
                    onTrigger(callBack, false);
                    alert('Failed to hide clip. Please try again later.');
                });
        },
        profile,
        following,
        index, ReportUGC=(item, reason, otherText, index)=>{
            const type = apiConstant.spaceTypes.ideanGallery;
            const data = {
                uid: user?.uid,
                clipId: item?.id,
                chatRoomId: '',
                ownerId: item?.uid,
                reason,
                otherText,
                ownerType: item?.userType,
            };
            const variables = {data, type};
            apolloLib.client(session)
                .mutate({
                    mutation: mutations.reportUGC,
                    variables,
                })
                .then(({data, error, loading}) => {
                    if (data) {
                        hideClip(item, index, isSuccess => {
                            isSuccess
                                ? Toast.show(strings.reportingCompleted)
                                : Toast.show(strings.reportingFailed);
                        });
                    } else {
                        Toast.show(strings.reportingFailed);
                    }
                    if (error) {
                        Toast.show(strings.reportingFailed);
                    }
                })
                .catch(error => {
                    Toast.show(strings.reportingFailed);
                });
        },
        disabled = false,
        notifyId = null,
        profileId = null,
        onClipChange = () => {
        }
    } = route?.params || {};

    const {theme, width, height} = useTheme();
    const {colors} = theme;
    const styles = SpaceStyle(theme, width, height);
    const session = useSession();
    const {user} = session;
    const [state, setState] = useState({
        galleryClip: clip || {},
        avatar: null,
        isEdit: false,
        fetching: false
    });
    const {galleryClip, avatar, isEdit, fetching} = state
    const [newText, setNewText] = useState(galleryClip?.text || '');
    const [mediaConfig, setMediaConfig] = useState({index:0,volume:0});
    // const [scrollable, setScrollable] = useState(true);

    const backPressHandler = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigationReset(navigation, 'PersonalSpace', {goBack: false, user});
        }
    };
    useBackHandler(() => {
        backPressHandler();
        return true;
    }, []);


    const onViewRefBlownUp = useRef((viewableItems) => {
        setMediaConfig({index:viewableItems?.viewableItems[0]?.index ,volume: 0})
    })
    const viewConfigRef = useRef({viewAreaCoveragePercentThreshold: 50})
    useEffect(() => {
        if (JSON.stringify(clip) !== JSON.stringify(state.galleryClip)) {
            setState(s => ({...s, galleryClip: clip}));
        }
    }, [clip]);

    useEffect(() => {
        let mount = true;
        if (galleryClip && Object.keys(galleryClip).length > 0) {
            const defAvatar = galleryClip?.userDetails.userType === userType.general ? placeHolders.avatar : placeHolders.logo;
            if (galleryClip?.userDetails) {
                if (galleryClip?.userDetails.profileImageB64) {
                    setState(s => ({...s, avatar: {uri: galleryClip?.userDetails?.profileImageB64}}));
                } else {
                    if (galleryClip?.userDetails.profileImage) {
                        if (!galleryClip?.userDetails.profileImage.includes('://')) {
                            storage()
                                .ref(galleryClip?.userDetails.profileImage)
                                .getDownloadURL()
                                .then(url => {
                                    setState(s => ({...s, avatar: {uri: url}}));
                                })
                                .catch(err => {
                                    setState(s => ({...s, avatar: defAvatar}));
                                });
                        } else {
                            setState(s => ({...s, avatar: {uri:galleryClip?.userDetails.profileImage}}));
                        }
                    } else {
                        setState(s => ({...s, avatar: defAvatar}));
                    }
                }
            }
        }

        return () => (mount = false);
    }, [galleryClip]);


    useEffect(() => {
        const volumeListener = SystemSetting.addVolumeListener((data) => {
            setMediaConfig(s=>({...s,volume: data?.music != null ? data?.music : data?.value || 0}))
        })
        return () => {
            SystemSetting.removeListener(volumeListener)
            
        };
    }, [])

    const getData = () => {
        setState(s => ({...s, fetching: true}))
        apolloLib.client(session)
            .query({
                fetchPolicy: 'no-cache',
                query: queries.getIdeanGalleryClip,
                variables: {
                    id: notifyId,
                    uId: user.uid,
                    profileId: profileId,
                },
            })
            .then(({data, error}) => {
                const {personalClip} = data;
                if (personalClip && personalClip.isPrivate !== true && personalClip.isDeleted !== true)
                    setState(s => ({...s, galleryClip: personalClip, fetching: false}))
                else backPressHandler()

                if (error) {
                    backPressHandler()
                    logger.e(error);
                }
            })
            .catch(err => {
                backPressHandler()
                logger.e(err);
            });
    }

    useEffect(() => {
        if (notifyId) getData()
    }, [notifyId])

    useEffect(() => {
        if (disabled) {
            setMediaConfig({index: -1,volume: 0})
        }
    }, [disabled]);

    const menuItems = [];

    const initDelete = () => {
        alert({
            message: strings.confirm_clip_delete,
            buttons: [
                {label: strings.cancel},
                {
                    label: strings.ok, callback: () => {
                        deleteClip(galleryClip, index)
                        setMediaConfig({index: -1,volume: 0})
                        backPressHandler()
                    }
                },
            ],
        });
    };

    const initHide = () => {
        alert({
            message: strings.confirm_clip_hide,
            buttons: [
                {label: strings.cancel},
                {
                    label: strings.ok, callback: () => {
                        hideClip(galleryClip, index)
                        setMediaConfig({index: -1,volume: 0})
                        backPressHandler()
                    }
                },
            ],
        });
    };

    const initReport = () => {
        alert({
            title: strings.report,
            type: 'report',
            autoDismiss: false,
            cancellable: false,
            message: strings.report,
            buttons: [
                {
                    label: strings.cancel, callback: () => {
                        alert.clear()
                    }
                },
                {
                    label: strings.submit,
                    callback: (reason, otherText) => {
                        ReportUGC && ReportUGC(galleryClip, reason, otherText, index);
                        setTimeout(() => {
                            setMediaConfig({index: -1,volume: 0})
                            backPressHandler()
                        }, 500)

                    },
                },
            ],
        });
    };

    const changeType = () => {
        let newType =
            galleryClip?.type === pcTypes.myDiary ? pcTypes.personalClip : galleryClip?.type;
        let isPrivate = galleryClip?.isPrivate === true ? false : galleryClip?.type !== pcTypes.myDiary;
        apolloLib
            .client(session)
            .mutate({
                fetchPolicy: 'no-cache',
                mutation: mutations.changeMyDiaryMode,
                variables: {
                    id: galleryClip?.id,
                    uid: user.uid,
                    isPrivate,
                    type: newType,
                },
            })
            .then(() => {
                Toast.show(isPrivate?"The Clip is now available for Private View.":"The Clip is now available for PUBLIC View.")
                setState(s => ({...s, galleryClip: {...s.galleryClip, type: newType, isPrivate: isPrivate}}))
                onClipChange({...galleryClip, type: newType, isPrivate: isPrivate}, index)
            });
    };

    if (galleryClip?.uid === user.uid) {
        menuItems.push({
            label: 'Remove',
            callback: () => {
                loadPopup(initDelete)
            },
        });
        menuItems.push({
            label: 'Edit Text',
            callback: () => {
                setNewText(galleryClip.text)
                setState(s => ({...s, isEdit: true}))
            },
        });
        menuItems.push({
            label: "'My diary'",
            state: galleryClip?.isPrivate ? toggleState.on : toggleState.off,
            callback: () => {
                changeType()
            },
        });
    } else {
        menuItems.push({
            label: 'Hide',
            callback: () => {
                loadPopup(initHide)
            },
        });
        menuItems.push({
            label: 'Report',
            callback: () => {
                loadPopup(initReport)
            },
        });
    }


    const removeLovitz = async () => {
        if (Array.isArray(galleryClip.lovitsLatest)) {
            if (galleryClip.lovitsLatest.length > 0) {
                return galleryClip.lovitsLatest.reduce((result, lovits) => {
                    if (lovits?.userDetails?.uid !== user.uid) {
                        result.push(lovits);
                    }
                    return result;
                }, []);
            } else {
                return galleryClip.lovitsLatest;
            }
        } else return [];
    };

    const addLovitz = async () => {
        if (Array.isArray(galleryClip.lovitsLatest)) {
            const lovitsLatest = [...galleryClip.lovitsLatest];
            const index = lovitsLatest.findIndex(l => l.userDetails.uid === user.uid)
            if (index < 0) {
                lovitsLatest.unshift({
                    userDetails: {
                        uid: user.uid,
                        profileImageB64: user.profileImageB64,
                        profileImage: user.profileImage,
                    },
                });
            } else {
                lovitsLatest.splice(index, 1)
                lovitsLatest.unshift({
                    userDetails: {
                        uid: user.uid,
                        profileImageB64: user.profileImageB64,
                        profileImage: user.profileImage,
                    },
                });
            }
            return lovitsLatest;
        } else return [
            {
                userDetails: {
                    uid: user.uid,
                    profileImageB64: user.profileImageB64,
                    profileImage: user.profileImage,
                },
            }
        ]
    };

    const lovitzCallback = () => {
        setState(s => ({...s, lovitzLoader: true}))
        const love = !galleryClip.isLoved;
        const editedClip = {...galleryClip}

        apolloLib
            .client(session)
            .mutate({
                fetchPolicy: 'no-cache',
                mutation: mutations.personalClipLike,
                variables: {
                    id: galleryClip?.id,
                    uId: user.uid,
                    profileId: galleryClip?.uid,
                    isLoved: love,
                },
            })
            .then(async () => {
                if (!love && galleryClip.lovitsCount > 0) {
                    await removeLovitz().then(res => {
                        editedClip.lovitsLatest = res
                    });
                    editedClip.lovitsCount = galleryClip.lovitsCount - 1
                } else {
                    await addLovitz()
                        .then(res => {
                            editedClip.lovitsLatest = res
                        })
                        .catch(err => {
                            logger.e(err);
                        });
                    editedClip.lovitsCount = galleryClip.lovitsCount + 1
                }
                editedClip.isLoved = love
                onClipChange(editedClip, index)
                setState(s => ({...s, galleryClip: editedClip, isLoved: love, lovitzLoader: false}))

            })
            .catch(err => {
                setState(s => ({...s, lovitzLoader: false}))
                logger.e(err);
            });
    };


    const onBackPress = () => {
        setMediaConfig({index: -1,volume: 0})
        backPressHandler()
    };
    const editClip = () => {
        setState(s => ({...s, galleryClip: {...s.galleryClip, text: newText}, isEdit: false}))
        const text = galleryClip.text
        apolloLib.client(session)
            .mutate({
                fetchPolicy: 'no-cache',
                mutation: mutations.editPersonalClipText,
                variables: {
                    id: galleryClip?.id,
                    uid: galleryClip?.uid,
                    text: newText,
                },
            })
            .then(({data, error}) => {
                if (data && data?.personalClipEditText && data?.personalClipEditText?.id) {
                    onClipChange({...galleryClip, text: newText}, index)
                    Toast.show("Clip updated successfully")
                }
                if (error) {
                    setState(s => ({...s, galleryClip: {...s.galleryClip, text: text}}))
                    alert('Failed to update clip. Please try again later.');
                }
            })
            .catch(() => {
                setState(s => ({...s, galleryClip: {...s.galleryClip, text: text}}))
                alert('Failed to update clip. Please try again later.');
            });
    };

    const getSubTittle = () => {
        let _sub = `${galleryClip?.userDetails?.userProfile?.suburb}`
        if (galleryClip?.userDetails?.userProfile?.countryCode !== 'AU' && galleryClip?.userDetails?.userProfile?.state != null) {
            _sub += galleryClip?.userDetails?.userProfile?.suburb ? `, ${galleryClip?.userDetails?.userProfile?.state}` : `${galleryClip?.userDetails?.userProfile?.state}`
        } else if (galleryClip?.userDetails?.userProfile?.stateShort != null) {
            _sub += galleryClip?.userDetails?.userProfile?.suburb ? `, ${galleryClip?.userDetails?.userProfile?.stateShort}` : `${galleryClip?.userDetails?.userProfile?.stateShort}`
        }
        return _sub?.trim()
    }
    const subTitle = getSubTittle()

    const redirect2PersonalSpace = () => {
        navigation.push('PersonalSpace', {
            user,
            profile: {uid: galleryClip?.uid, userType: galleryClip?.userType},
            goBack: true,
        });
    }

    const lovitzIcon = () => {
        if (theme.dark) {
            return galleryClip.isLoved ? lovitzIcons.pink : lovitzIcons.white
        } else {
            return galleryClip.isLoved ? lovitzIcons.red : lovitzIcons.grey
        }
    };

    const onClickRecentLovitz = () => {
        if (user.uid === profile?.uid || user.uid === profileId || galleryClip?.userDetails?.followStatus === true) {
            if (galleryClip.lovitsCount > 0) {
                navigation.push('LovitzList', {
                    id: galleryClip?.id,
                    type: 'ideanGallery',
                    profileId: galleryClip?.uid,
                });
            } else {
                Toast.show('No lovitz.');
            }
        }
    }

    const handleLovitzClick = () => {
        if (user.uid === profile?.uid || user.uid === profileId || galleryClip?.userDetails?.followStatus === true) {
            lovitzCallback();
        }
    };

    const renderClip = ({item,index}) => {
        return (
            <RenderClipMedia
                key={index}
                item={{mediafile: item?.mediafile, mediaType: item?.mediaType}}
                play={mediaConfig.index === index}
                currentlyPlayingVolume={mediaConfig.volume}
                // scrollChange={setScrollable}
            />
        )
    }


    return (
        <SafeScreenView
            translucent
            colors={['#e50012', '#0359a7']}
            locations={[0.4, 0.9]}>
            <View style={styles.topBar}>
                <View
                    style={styles.topBarRow}>
                    <TouchableOpacity
                        style={styles.toBarBackButton}
                        onPress={onBackPress}>
                        <Icon
                            color={colors.secondaryDark}
                            name="chevron-left"
                            size={scale.icon.s}
                            type="font-awesome-5"
                            onPress={onBackPress}
                        />
                    </TouchableOpacity>

                    <Pressable
                        style={styles.cardInfo}
                        onPress={redirect2PersonalSpace}>
                        {galleryClip?.userDetails && (
                            <>
                                <View style={styles.avatar}>
                                    <ImageIcon
                                        source={avatar}
                                        onPress={redirect2PersonalSpace}
                                    />
                                </View>
                                <View style={styles.info}>
                                    <Text numberOfLines={1} style={styles.infoTitle}>
                                        {galleryClip?.userDetails?.displayName}
                                    </Text>
                                    {subTitle.length > 0 &&
                                    <Text numberOfLines={1} style={styles.infoTitle}>
                                        {subTitle}
                                    </Text>
                                    }
                                </View>
                            </>
                        )}
                    </Pressable>
                    <View style={styles.actionMenuView2}>
                        <ActionMenu items={menuItems} color={'#999898'}/>
                    </View>
                </View>
            </View>
            {/*<LineView spacing={0} width={"100%"}/>*/}
            {fetching === true && <ScreenLoader visible={fetching}/>}
            {galleryClip && Object.keys(galleryClip).length > 0 &&
            <ContainerScroll>
                <KeyboardAwareScrollView
                    style={styles.keyboardScroll}
                    keyboardShouldPersistTaps="never"
                    nestedScrollEnabled={true}>

                    <View
                        style={styles.contentRow}>
                        {showFlash(galleryClip, width, galleryClip?.isMultiple === true ? 35 : 25, 25,true)}
                        {galleryClip?.isMultiple === true ?
                            <FlatList
                                data={galleryClip?.mediaFiles}
                                horizontal={true}
                                snapToAlignment={"center"}
                                style={{flex: 1}}
                                // scrollEnabled={scrollable}
                                onViewableItemsChanged={onViewRefBlownUp.current}
                                viewabilityConfig={viewConfigRef.current}
                                contentContainerStyle={{alignSelf: "center"}}
                                decelerationRate={"fast"}
                                snapToInterval={width}
                                renderItem={renderClip}/>
                            : renderClip({item: galleryClip, index: 0})
                        }

                    </View>


                    <View style={styles.pagination}>
                        {galleryClip?.isMultiple &&
                        <View
                            style={styles.paginationItem}>
                            {galleryClip?.mediaFiles && galleryClip?.mediaFiles?.map((file, index) => {
                                return <Text key={index}
                                             style={mediaConfig.index === index ? styles.paginationActive : styles.paginationDisabled}>{index + 1}</Text>
                            })
                            }

                        </View>
                        }
                        <View
                            style={styles.lovitzRow}>
                            {galleryClip.lovitsCount > 0 && (
                                <RecentLovitz
                                    size={20}
                                    rounded={false}
                                    source={galleryClip.lovitsLatest || []}
                                    onPress={onClickRecentLovitz}
                                    containerStyle={styles.lovitzContainer}
                                    style={styles.lovitzItem}
                                />
                            )}

                            <View
                                style={styles.lovitzCountView}>
                                <LovitzIcon
                                    source={lovitzIcon()}
                                    style={styles.lovitsIco}
                                    containerStyle={styles.lovitzContainerView}
                                    loaderStyle={{height: 30}}
                                    onClick={handleLovitzClick}
                                    loading={state.lovitzLoader}
                                />
                                <Text style={styles.lovitzCountLabel}>
                                    {galleryClip.lovitsCount > 0 ? galleryClip.lovitsCount : ''}
                                </Text>
                            </View>
                        </View>
                        <View
                            style={[
                                styles.statusContainer,
                                styles.status_right,
                            ]}>
                            <Text style={styles.timeStamp}>{Time2String(galleryClip?.updatedOn)}</Text>
                        </View>
                        {isEdit ?
                            <View style={{marginVertical: 10, flex: 1}}>
                                <TextInput style={{
                                    flex: 1,
                                    width: "100%",
                                    padding: 5,
                                    marginTop: 5,
                                    color: colors.textPrimary,
                                    fontSize: 17
                                }} multiline={true}
                                           maxLength={config.textLimit.ideanGallery}
                                           value={newText}
                                           onChangeText={(t) => {
                                               setNewText(t)
                                           }}/>
                            </View>
                            :
                            <View style={{marginVertical: 10, flex: 1}}>
                                <Pressable onLongPress={() => CopyText(galleryClip?.text)}>
                                    <IdeanGalleryText viewer={theme.dark} ignoreShowMore={true}
                                                      text={galleryClip?.text}/>
                                </Pressable>
                            </View>
                        }

                    </View>

                    {isEdit &&
                    <View style={{
                        justifyContent: 'flex-end'
                    }}>
                        <GradiantButton
                            cornerRadius={15}
                            colors={['#b128f0', '#3e0de1']}
                            iconSize={35}
                            labelStyle={{
                                fontSize: scale.font.s,
                                color: '#fff',
                                paddingHorizontal: 5,
                            }}
                            height={scale.ms(30)}
                            label={strings.save}
                            style={{flex: 1, alignSelf: 'center', marginBottom: 10}}
                            onPress={editClip}
                        />

                    </View>
                    }
                </KeyboardAwareScrollView>
            </ContainerScroll>
            }
        </SafeScreenView>
    );
}

const SpaceStyle = ({colors}, width, height) => {
    const imageSize = height * 0.14;
    const photoIconSize = imageSize * 0.27;

    return StyleSheet.create({
        timeStamp: {
            fontSize: scale.font.xs,
            color: colors.textPrimaryDark,
            paddingHorizontal: 5,
        },
        statusContainer: {
            marginTop: 20,
            flexDirection: 'row',
            flex: 1,
            padding: 3,
        },
        status_left: {
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
        },
        status_right: {
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
        },
        keyboardScroll: {
            flex: 1,
            width: '100%',
            backgroundColor: colors.surfaceDark
        },
        lottie: {
            width: 50,
            height: 50,
        },
        imageBlock: {},
        addButton: {
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
            opacity: 0.8,
            marginTop: 10,
            width: photoIconSize,
            height: photoIconSize,
            borderRadius: photoIconSize,
        },
        actionMenuView: {
            position: 'relative',
            height: 20,
            right: 0,
            alignSelf: 'flex-end',
            top: -3,
            zIndex: 20,
        },
        actionMenuView2: {
            alignSelf: 'flex-end',
        },
        overlayButtons: {
            zIndex: 2,
            position: 'absolute',
            right: 10,
            top: 0,
        },
        lovitsIco: {
            width: 25,
            height: 25,
            resizeMode: 'contain',
        },
        midGrayLine: {
            height: 0.5,
            backgroundColor: colors.primary,
            width: '90%',
            justifyContent: 'center',
            alignSelf: 'center',
            marginVertical: 10,
        },
        dotView: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignSelf: 'center',
            alignItems: 'center',
            alignContent: 'center',
        },
        cardInfo: {
            flexDirection: 'row',
            flex: 1,
            alignItems: 'center',
        },
        avatar: {
            backgroundColor: colors.surfaceAccent,
            borderRadius: 50,
            alignItems: 'center',
            alignContent: 'center',
            overflow: 'hidden',
        },
        info: {
            flexDirection: 'column',
            flex: 1,
            marginLeft: 5,
            alignSelf: 'center',
            textAlignVertical: 'center',
            alignContent: 'center',
        },
        infoTitle: {
            marginLeft: 10,
            fontSize: scale.font.l,
            paddingEnd: 15,
            textAlignVertical: 'center',
            color: colors.textPrimaryDark,
        },
        topBar: {marginTop: 10,marginHorizontal:10, padding: 1},
        topBarRow: {flexDirection: 'row'},
        toBarBackButton: {justifyContent: 'center', marginRight: 10},
        contentRow: {
            marginTop: 10,
            width: width,
            height: width,
        },
        pagination: {margin: 15, flexGrow: 1},
        paginationItem: {
            flexDirection: 'row',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center'
        },
        paginationActive: {
            marginVertical: 5,
            marginHorizontal: 10,
            color: colors.secondary,
            textDecorationLine: 'underline'
        },
        paginationDisabled: {
            marginVertical: 5,
            marginHorizontal: 10,
            color: colors.textPrimary
        },
        lovitzRow: {flexDirection: 'row', width: '100%', alignItems: 'center'},
        lovitzContainer: {padding: 10, marginHorizontal: 5},
        lovitzItem: {borderWidth: 1, borderColor: '#fff'},
        lovitzCountView: {
            marginHorizontal: 5,
            marginTop: 5,
            flexDirection: 'row',
            minWidth: 45,
            alignSelf: 'flex-end',
            justifyContent: 'flex-end',
            flex: 1,
        },
        lovitzContainerView: {
            width: 30,
            height: 30,
            alignItems: 'center',
            justifyContent: 'center',
        },
        lovitzCountLabel: {marginLeft: 5, color: colors.secondaryDark, alignSelf: 'center', fontSize: scale.font.l}

    });
};
