/* eslint-disable radix */
import React, {useEffect, useState} from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import scale from 'utilities/scale';
import {lovitzIcons, screens} from '../../../../utilities/assets';
import {mutations} from '../../../../schema';
import logger from '../../../../lib/logger';
import {useTheme} from '../../../../context/ThemeContext';
import {awesomeTag, clipTypes} from '../../../../utilities/constant';
import UserTitleBadge from '../userTitleBadge';
import {useAlert} from '../../../../context/AlertContext';
import {strings} from '../../../../constant/strings';
import RecentLovitz from '../../../components/utility/recentLovitz';
import Toast from 'react-native-simple-toast';
import {useNavigation} from '@react-navigation/native';
import LovitzIcon from "../../../components/utility/lovitzIcon";
import apollo from "../../../../lib/apolloLib";

export default function ReactionBar({
                                        viewer,
                                        setter,
                                        clip,
                                        user,
                                        spaceInfo,
                                        disableAction,
                                        blockAction,
                                        flip = false,
                                    }) {
    const {theme} = useTheme();
    const styles = reactionStyles(theme, viewer);
    const [addTitleView, setAddTitleView] = useState(false);
    const [lovitzLoader, setLovitzLoader] = useState(false);
    const [clipData, setClipData] = useState(clip);
    const reactCount = parseInt(clipData.reactionCount) || 0;
    const alert = useAlert();
    const navigation = useNavigation();

    useEffect(() => {
        if (JSON.stringify(clip) !== JSON.stringify(clipData)) {
            setClipData(clip);
        }
    }, [clip]);

    const removeLovitz = async () => {
        if (clipData.latestReaction.length > 0) {
            return clipData.latestReaction.reduce((result, lovits) => {
                if (lovits?.userDetails?.uid !== user.uid) {
                    result.push(lovits);
                }
                return result;
            }, []);
        } else {
            return clipData.latestReaction;
        }
    };

    const addLovitz = async () => {
        let reactions = clipData.latestReaction || [];
        let index = reactions.findIndex(l => l.userDetails.uid === user.uid)
        if (index < 0) {
            reactions.unshift({
                userDetails: {
                    uid: user.uid,
                    profileImageB64: user.profileImageB64,
                    profileImage: user.profileImage,
                },
            });
        } else {
            reactions.splice(index, 1)
            reactions.unshift({
                userDetails: {
                    uid: user.uid,
                    profileImageB64: user.profileImageB64,
                    profileImage: user.profileImage,
                },
            });
        }

        return reactions
    };

    const updateReactions = () => {
        if (disableAction || blockAction) {
            if (!flip) {
                alert({
                    message: blockAction? strings.userAccessDenied : strings.collabAlertMessage,
                    buttons: [{label: strings.ok, callback: () => alert.clear()}],
                    autoDismiss: false,
                    cancellable: false,
                });
            }
            return false;
        }

        setLovitzLoader(true)
        const type = clipData?.myReaction?.type === 'lovitz' ? '' : 'lovitz';
        const variables = {
            uid: user.uid,
            ownerId: clipData?.uid,
            clipId: clipData?.id,
            type,
            isActive: type !== '',
        };
        apollo.client().mutate({
            fetchPolicy: 'no-cache',
            variables,
            mutation: spaceInfo.spaceType === clipTypes.announcement
                ? mutations.anReaction
                : mutations.reaction,
        }).then(async ({data}) => {
            setLovitzLoader(false)
            if (!data) {
                Toast.show('Lovitz update failed');
            } else {
                const count =
                    type === ''
                        ? (reactCount ? reactCount : 1) - 1
                        : (reactCount ? reactCount : 0) + 1;
                let latestReaction = []
                if (type === '') {
                    await removeLovitz().then(res => {
                        latestReaction = [...res]
                    });
                } else {
                    await addLovitz().then(res => {
                        latestReaction = [...res]
                    });
                }
                setter({...clipData, latestReaction, myReaction: {type}, reactionCount: count});
            }
        })
            .catch((e) => {
                logger.e(e)
                Toast.show('Lovitz update failed');
            });
    };

    return (
        <>
            <View style={styles.rectBarAction}>
                <Pressable
                    style={styles.labelContentView}
                    onPress={() => {
                        if (disableAction || blockAction) {
                            if (!flip) {
                                alert({
                                    message: blockAction? strings.userAccessDenied : strings.collabAlertMessage,
                                    buttons: [{label: strings.ok, callback: () => alert.clear()}],
                                    autoDismiss: false,
                                    cancellable: false,
                                });
                            }
                        } else {
                            setAddTitleView(true);
                        }
                    }}>
                    <View style={styles.emotion_min}>
                        <Image style={styles.emotion_min} source={screens.titles}/>
                    </View>
                    {clipData?.myTitle?.title?.name &&
                    clipData?.myTitle?.title?.name.trim().length > 0 && (
                        <Text
                            style={[
                                styles.labelTextBar,
                                clipData?.myTitle?.uid === user.uid && styles.myTitle,
                            ]}
                            numberOfLines={1}>
                            {clipData?.myTitle?.title?.name}
                        </Text>
                    )}
                </Pressable>

                {clipData.badgeAdded === awesomeTag.def && (
                    <View style={styles.labelContentView}>
                        <View style={styles.emotion_min}>
                            <Image style={styles.emotion_min} source={screens.badge_ico}/>
                        </View>
                        <Text style={styles.labelTextBar} numberOfLines={1}>
                            {'Awesome!'}
                        </Text>
                    </View>
                )}

                {addTitleView && !(disableAction || blockAction) && (
                    <UserTitleBadge
                        clip={clipData}
                        spaceInfo={spaceInfo}
                        setter={setter}
                        userId={user.uid}
                        onDismiss={setAddTitleView}
                    />
                )}
            </View>
            <View style={styles.rectBarAction}>
                {clipData.reactionCount > 0 && (
                    <View style={styles.labelNoMargin}>
                        {clipData?.latestReaction?.length > 0 &&
                        <RecentLovitz
                            size={20}
                            rounded={false}
                            source={clipData.latestReaction || []}
                            onPress={() => {
                                if (disableAction || blockAction) {
                                    if (!flip) {
                                        alert({
                                            message: blockAction? strings.userAccessDenied : strings.collabAlertMessage,
                                            buttons: [{label: strings.ok, callback: () => alert.clear()}],
                                            autoDismiss: false,
                                            cancellable: false,
                                        });
                                    }
                                } else {
                                    if (clipData.reactionCount > 0) {
                                        navigation.push('LovitzList', {
                                            id: clipData.id,
                                            type: 'clips',
                                            clipType: spaceInfo.spaceType,
                                        });
                                    } else {
                                        Toast.show('No lovitz.');
                                    }
                                }
                            }}
                            style={{borderWidth: 1, borderColor: '#fff'}}
                        />
                        }
                    </View>
                )}
                <View style={styles.labelNoMargin}>
                    <LovitzIcon
                        source={clipData?.myReaction?.type === 'lovitz' ? viewer ? lovitzIcons.pink : lovitzIcons.red : lovitzIcons.white}
                        style={styles.emotion_min} containerStyle={[styles.emotion_min, {
                        alignItems: 'center',
                        justifyContent: 'center'
                    }]}
                        loaderStyle={{height: 20}}
                        onClick={updateReactions}
                        loading={lovitzLoader}
                    />
                    <Text style={styles.labelLovitzBar} onPress={updateReactions}>
                        {clipData.reactionCount > 0
                            ? clipData.reactionCount > 99
                                ? '99+'
                                : clipData.reactionCount
                            : ''}
                    </Text>
                </View>
            </View>
        </>
    );
}
const reactionStyles = ({colors}, viewer) =>
    StyleSheet.create({
        wrapper: {
            flex: 1,
            flexDirection: 'row',
            alignContent: 'center',
            alignItems: 'flex-end',
        },
        container: {
            overflow: 'hidden',
            marginBottom: 10,
            borderRadius: 50,
            width: 40,
            height: 40,
            marginHorizontal: 5,
            backgroundColor: '#c6b7bf',
            alignContent: 'center',
            alignItems: 'center',
        },
        wrap: {
            position: 'relative',
            width: 50,
            alignContent: 'flex-end',
            alignItems: 'center',
        },
        popup: {
            position: 'absolute',
            bottom: 0,
            left: 0,
        },
        bar: {
            flex: 1,
            flexDirection: 'row',
            backgroundColor: '#fff',
            borderRadius: 5,
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 5.84,
            elevation: 5,
            padding: 10,
        },
        emotion: {
            height: 40,
            width: 40,
            borderRadius: 50,
            backgroundColor: '#efefef',
        },
        emotion_min: {
            height: 20,
            width: 20,
            resizeMode: 'contain',
            borderRadius: 50,
            overflow: 'hidden',
        },
        actions: {
            height: 20,
            width: 20,
            resizeMode: 'contain',
        },
        action_min: {
            width: 10,
            height: 10,
            alignSelf: 'center',
            alignContent: 'center',
            margin: 5,
            resizeMode: 'contain',
        },
        labelTextBar: {
            width: '100%',
            paddingHorizontal: 5,
            fontSize: scale.font.s,
            color: viewer ? colors.clipTextAccent : colors.clipTextSecondary,
            alignSelf: 'center',
            justifyContent: 'center',
        },
        myTitle: {
            color: viewer ? colors.titleReceiver : colors.titleSender,
        },
        labelLovitzBar: {
            paddingHorizontal: 5,
            fontSize: scale.font.s,
            color: viewer ? colors.lovitzReceiver : colors.lovitzSender,
            alignSelf: 'center',
            textAlignVertical:'center',
            justifyContent: 'center',
        },
        labelContentView: {
            flexDirection: 'row',
            marginEnd: 10,
            paddingHorizontal: 5,
            flexGrow: 0,
            flexShrink: 1,
            flexBasis: 'auto',
        },
        rectBarAction: {
            flex: 2,
            paddingHorizontal: 15,
            paddingBottom: 10,
            flexDirection: 'row',
        },
        labelNoMargin: {
            flexDirection: 'row',
            marginEnd: 10,
            paddingHorizontal: 5,
            flex: 1,
            alignItems:'center',
        },
    });
