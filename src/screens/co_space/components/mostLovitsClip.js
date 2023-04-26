/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {placeHolders, screens} from 'utilities/assets';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import scale from 'utilities/scale';
import {useTheme} from 'context/ThemeContext';
import {onTrigger, TextView} from '../../../index';
import {cacheFile} from '../../../lib/storage';
import logger from '../../../lib/logger';
import ImageIcon from '../../components/utility/imageIcon';
import {useNavigation} from '@react-navigation/native';
import {clipTypes, userType} from '../../../utilities/constant';
import apolloLib from '../../../lib/apolloLib';
import {queries} from '../../../schema';
import {useSession} from 'context/SessionContext';
import ActionMenu from '../../../components/popup/ActionMenu';
import {useClip} from '../../../context/ClipContext';
import {useAlert} from '../../../context/AlertContext';
import {strings} from '../../../constant/strings';
import {loadPopup} from '../../../utilities/helper';

export default function MostLovitsClip({
                                           color,
                                           index = -1,
                                           clip,
                                           userNav,
                                           disabled = false,
                                           style = {},
                                           empty = false,
                                           isCollab = false,
                                           type,
                                           clicked,
                                           setClicked,
                                           menu,
                                           removeClip = null,
                                           setAlertVisibility,
                                           setAlertCancellable,
                                           setAlertMessage,
                                           setAlertButtons,
                                           setAlertType,
                                           clearAlert,
                                       }) {
    const navigation = useNavigation();
    const {theme} = useTheme();
    const styles = SpaceStyle(theme, color);
    const {colors} = theme;
    const [avatar, setAvatar] = useState(placeHolders.avatar);
    const user = clip?.user;
    const {blockClip, userBlockClip} = useClip();

    const session = useSession();
    const currentUser = session?.user;

    useEffect(() => {
        if (user?.profileImage && userNav) {
            if (user?.profileImageB64) {
                setAvatar({uri: user?.profileImageB64});
            } else {
                cacheFile(user?.profileImage, 'dp')
                    .then(path => setAvatar({uri: path}))
                    .catch(logger.e);
            }
        }
    }, [user?.profileImage]);

    const navigate = () => {
        if (clip.rid === currentUser.uid) {
            navigation.push('ClipCoSpace', {
                notify: {
                    notifyId: clip.id,
                    spaceId: clip.rid,
                    spaceType:
                        clip.clipType === 'clip' ? clipTypes.clip : clipTypes.announcement,
                },
                clipId: clip.id,
            });
        } else {
            apolloLib.client(session)
                .query({
                    fetchPolicy: 'no-cache',
                    query: queries.getBlockStatus,
                    variables: {
                        id: clip.rid,
                        uid: currentUser.uid,
                    },
                })
                .then(({data}) => {
                    if (data.profile) {
                        if (data?.profile?.blockStatus === false) {
                            navigation.push('ClipCoSpace', {
                                notify: {
                                    notifyId: clip.id,
                                    spaceId: clip.rid,
                                    spaceType:
                                        clip.clipType === 'clip'
                                            ? clipTypes.clip
                                            : clipTypes.announcement,
                                },
                                clipId: clip.id,
                            });
                        }
                    }
                })
                .catch(err => {
                    logger.e(err);
                });
        }
    };
    const menuItems = [];

    if (menu) {
        if (user.uid === currentUser.uid) {
            menuItems.push({
                label: 'Remove',
                callback: () => initDelete(),
            });
        } else {
            menuItems.push({
                label: 'Hide',
                callback: () => initBlock(),
            });
        }
    }

    const initDelete = () => {
        setAlertType('alert')
        setAlertMessage(strings.remove_clip_message)
        setAlertButtons([
            {
                label: strings.cancel, callback: () => {
                    clearAlert()
                }
            },
            {
                label: strings.ok,
                callback: () => {
                    clearAlert()
                    blockClip(
                        clip.rid,
                        {
                            uid: currentUser.uid,
                            isOwner: clip.rid !== user.uid,
                            clipId: clip.id,
                            isBlocked: false,
                            isDeleted: true,
                        },
                        clip.clipType,
                        handleClipRemove,
                    );
                },
            },
        ])
        loadPopup(setAlertVisibility, true)
    };
    const handleClipRemove = ({data}) => {
        data && onTrigger(removeClip, {index});
    };

    const handleClipHide = ({data}) => {
        data && onTrigger(removeClip, {index, isHide: true});
    };

    const initBlock = () => {
        setAlertType('alert')
        setAlertMessage(strings.block_clip_message)
        setAlertButtons([
            {
                label: strings.cancel, callback: () => {
                    clearAlert()
                }
            },
            {
                label: strings.ok,
                callback: () => {
                    clearAlert()
                    if (clip.rid === currentUser.uid) {
                        blockClip(
                            clip.rid,
                            {
                                uid: currentUser.uid,
                                isOwner: clip.rid !== user.uid,
                                clipId: clip.id,
                                isBlocked: true,
                                isDeleted: false,
                            },
                            clip.clipType,
                            handleClipHide,
                        );
                    } else {
                        userBlockClip(
                            clip.rid,
                            {
                                uid: currentUser.uid,
                                orgId: clip.rid,
                                clipId: clip.id,
                                reason: '',
                            },
                            clip.clipType,
                            handleClipHide,
                        );
                    }
                },
            },
        ])
        loadPopup(setAlertVisibility, true)
    };

    return (
        <Pressable
            style={[styles.mostLovitClip, style]}
            onPress={() => {
                if (!disabled && !clicked) {
                    setClicked();
                    navigate();
                }
            }}>
            {menu && !disabled && (
                <View
                    style={{
                        position: 'relative',
                        height: 20,
                        right: 0,
                        alignSelf: 'flex-end',
                        top: -3,
                        zIndex: 20,
                    }}>
                    <ActionMenu items={menuItems} color={'#FFFFFF'}/>
                </View>
            )}
            <View style={styles.clipWrap}>
                {userNav && !disabled && <ImageIcon size={30} source={avatar}/>}
                <View style={styles.mostLovitClipText}>
                    {disabled ? (
                        // isCollab ? (
                        //     <Text style={{fontSize: scale.font.l, color: colors.clipText}}>
                        //         <Text
                        //             style={{
                        //                 fontSize: scale.font.l,
                        //                 color: colors.textPrimaryAccent,
                        //             }}>
                        //             {'#Fan insights'}
                        //         </Text>
                        //         {' shared by '}
                        //         <Text
                        //             style={{
                        //                 fontSize: scale.font.l,
                        //                 color: colors.textPrimaryAccent,
                        //             }}>
                        //             {'#Local Ambassadors'}
                        //         </Text>
                        //         {
                        //             ' will be listed here in the order of most lovitz received. You can explore '
                        //         }
                        //         <Text
                        //             style={{
                        //                 fontSize: scale.font.l,
                        //                 color: colors.textPrimaryAccent,
                        //             }}>
                        //             {'#IDEACLIP Co-spaces'}
                        //         </Text>
                        //         {
                        //             ' of Businesses and Charities/NFPs further by clicking on any of the  '
                        //         }
                        //         <Text
                        //             style={{
                        //                 fontSize: scale.font.l,
                        //                 color: colors.textPrimaryAccent,
                        //             }}>
                        //             {'#Clips'}
                        //         </Text>
                        //         {' listed here.'}
                        //     </Text>
                        // ) : type === userType.general ? (
                        //     <Text style={{fontSize: scale.font.l, color: colors.clipText}}>
                        //         {'Share your '}
                        //         <Text
                        //             style={{
                        //                 fontSize: scale.font.l,
                        //                 color: colors.textPrimaryAccent,
                        //             }}>
                        //             {'#fan insights'}
                        //         </Text>
                        //         {' with your '}
                        //         <Text
                        //             style={{
                        //                 fontSize: scale.font.l,
                        //                 color: colors.textPrimaryAccent,
                        //             }}>
                        //             {'#favourite brands'}
                        //         </Text>
                        //         {' in '}
                        //         <Text
                        //             style={{
                        //                 fontSize: scale.font.l,
                        //                 color: colors.textPrimaryAccent,
                        //             }}>
                        //             {'#COLLAB SPACE'}
                        //         </Text>
                        //         {' by clicking the '}
                        //         <Text
                        //             style={{
                        //                 fontSize: scale.font.l,
                        //                 color: colors.textPrimaryAccent,
                        //             }}>
                        //             {'#Rocket icon'}
                        //         </Text>
                        //         {
                        //             ' below. Your clips will then be shown here in the order of most lovitz you received from other '
                        //         }
                        //         <Text
                        //             style={{
                        //                 fontSize: scale.font.l,
                        //                 color: colors.textPrimaryAccent,
                        //             }}>
                        //             {'#Collabers'}
                        //         </Text>
                        //         {'.'}
                        //     </Text>
                        // ) : (
                        //     <Text style={{fontSize: scale.font.l, color: colors.clipText}}>
                        //         <Text
                        //             style={{
                        //                 fontSize: scale.font.l,
                        //                 color: colors.textPrimaryAccent,
                        //             }}>
                        //             {'#Fan insights'}
                        //         </Text>
                        //         {' shared by your local ambassadors in your '}
                        //         <Text
                        //             style={{
                        //                 fontSize: scale.font.l,
                        //                 color: colors.textPrimaryAccent,
                        //             }}>
                        //             {'#IDEACLIP Co-space'}
                        //         </Text>
                        //         {' or '}
                        //         <Text
                        //             style={{
                        //                 fontSize: scale.font.l,
                        //                 color: colors.textPrimaryAccent,
                        //             }}>
                        //             {'#News & Asks Co-space'}
                        //         </Text>
                        //         {
                        //             ' will be listed here in the order of most lovitz received from your Collabers. You can explore '
                        //         }
                        //         <Text
                        //             style={{
                        //                 fontSize: scale.font.l,
                        //                 color: colors.textPrimaryAccent,
                        //             }}>
                        //             {'#Collab SPACE'}
                        //         </Text>
                        //         {' by clicking the '}
                        //         <Text
                        //             style={{
                        //                 fontSize: scale.font.l,
                        //                 color: colors.textPrimaryAccent,
                        //             }}>
                        //             {'#Rocket icon'}
                        //         </Text>
                        //         {' below.'}
                        //     </Text>
                        // )
                        <Text style={{fontSize: scale.font.l, color: colors.clipText,minHeight:80}}>
                                {'No '}
                                 <Text
                                    style={{
                                        fontSize: scale.font.l,
                                        color: colors.textPrimaryAccent,
                                    }}>
                                     {'Fan insights'}
                                 </Text>
                                {' shared yet.'}
                                </Text>
                    ) : (
                        <TextView text={clip.text} viewer={true} ignoreShowMore={false} minView={true}/>
                    )}
                </View>
                {!disabled && (
                    <View style={styles.lovitsCountWrap}>

                        <Image source={screens.lovitsWhite} style={styles.lovitsSmallIco}/>
                        <Text style={styles.lovitsCount}>

                            {clip.reactionCount > 250
                                ? `+${clip.reactionCount}`
                                : clip.reactionCount}
                        </Text>
                    </View>
                )}
            </View>
        </Pressable>
    );
}

const SpaceStyle = ({colors}, color) => {
    return StyleSheet.create({
        mostLovitClip: {
            backgroundColor: color ? color : colors.clipSurface,
            color: colors.clipText,
            padding: 5,
            marginHorizontal: 5,
            marginBottom: 5,
            borderRadius: 5,
        },
        mostLovitClipText: {
            fontSize: scale.font.s,
            marginLeft: 5,
            flex: 1,
            color: colors.clipText,
        },
        lovitsSmallIco: {width: 30, height: 25, resizeMode: 'contain', alignSelf: 'center', marginRight: 5},
        lovitsCount: {
            fontSize: scale.font.s,
            color: colors.clipText,
            textAlign: 'right',
            lineHeight: 30,
            textAlignVertical: "center"
        },
        clipWrap: {flexDirection: 'row', padding: 5},
        lovitsCountWrap: {
            display: "flex",
            flexDirection: 'row',
            height: 30,
            alignSelf: 'flex-end'
        }

    });
};
