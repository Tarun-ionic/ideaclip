/* eslint-disable react-hooks/exhaustive-deps,react-native/no-inline-styles */
// noinspection JSUnresolvedFunction

import React, {useEffect, useMemo, useState} from 'react';
import {Text, View} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import {placeHolders} from 'utilities/assets';
import ReactionBar from './clip/ReactionBar';
import ContentViewer from './clip/ContentViewer';
import {useTheme} from 'context/ThemeContext';
import {cacheFile, Time2String} from '../../../lib/storage';
import ClipStyles from 'system/styles/clipStyles';
import ImageIcon from 'screens/components/utility/imageIcon';
import {useClip} from 'context/ClipContext';
import {useAlert} from 'context/AlertContext';
import {strings} from 'constant/strings';
import logger from '../../../lib/logger';
import ActionMenu from '../../../components/popup/ActionMenu';
import LinearGradient from 'react-native-linear-gradient';
import MinClip from './minClip';
import {useNavigation} from '@react-navigation/native';
import {useSession} from '../../../context/SessionContext';
import onShare from '../../components/utility/share';
import {awesomeTag, clipTypes} from '../../../utilities/constant';
import {loadPopup, onTrigger} from '../../../utilities/helper';
import Toast from 'react-native-simple-toast';
import scale from '../../../utilities/scale';
import {IconButton} from 'react-native-paper';
import apolloLib from '../../../lib/apolloLib';
import {queries} from '../../../schema';
import {clipState} from "../../../context/ClipContext";
import RetryBar from "../../../components/bars/RetryBar";
import AlertPopup from "../../components/utility/alertPopup";

export default function ClipBubble({
                                       color,
                                       item,
                                       viewer,
                                       threading,
                                       arrow,
                                       spaceInfo,
                                       setNotify,
                                       disableAction,
                                       blockAction,
                                       setAlertVisibility,
                                       setAlertCancellable,
                                       setAlertMessage,
                                       setAlertButtons,
                                       setAlertType,
                                       clearAlert,
                                       updateStatus,
                                       flip = false,
                                   }) {
    const alert = useAlert();
    const navigation = useNavigation();
    const {theme, width} = useTheme();
    const {ReportClip, blockClip, userBlockClip, updateAwesomeBadge, onUpdateClip, mapClip} = useClip();
    const {colors} = theme;
    const clipWidth = (width * 0.75)
    const styles = ClipStyles({colors, clipWidth}, width);
    const [clipData, setClipData] = useState(item);
    const [avatar, setAvatar] = useState(placeHolders.avatar);
    const [avatarThread, setAvatarThread] = useState(placeHolders.avatar);
    const session = useSession();
    const {user} = session;


    clipData.parentThread = clipData.parentThread?.id
        ? clipData.parentThread
        : clipData?.parentThread;

    useEffect(() => {

        let mount = true;
        if (clipData?.user?.profileImage) {
            if (clipData?.user?.profileImageB64) {
                setAvatar({uri: clipData?.user?.profileImageB64});
            } else {
                cacheFile(clipData?.user?.profileImage, 'dp')
                    .then(path => {
                        if (mount) {
                            setAvatar({uri: path});
                        }
                    })
                    .catch(error => logger.e('clip avatar', error));
            }
        }
        if (clipData?.parentThread?.user?.profileImage) {
            if (clipData?.parentThread?.user?.profileImageB64) {
                setAvatarThread({uri: clipData?.parentThread?.user?.profileImageB64});
            } else {
                cacheFile(clipData?.parentThread?.user?.profileImage, 'dp')
                    .then(path => {
                        if (mount) {
                            setAvatarThread({uri: path});
                        }
                    })
                    .catch(error => logger.e('clip parentThread avatar', error));
            }
        }

        return () => (mount = false);
    }, []);

    const profileNavigation = () => {
        navigation.push('PersonalSpace', {
            user,
            profile: clipData?.user,
            goBack: true,
        });
    };

    useEffect(() => {
        if (JSON.stringify(item) !== JSON.stringify(clipData)) {
            setClipData(item);
        }
    }, [item]);

    // warning
    const initReport = () => {
        if (clipData.uid !== user.uid) {
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
                        String(reason + otherText).trim().length === 0
                            ? Toast.show(strings.report_reason_placeholder)
                            : ReportClip(clipData, reason, otherText, ({data}) => {
                                if (data) {
                                    Toast.show(strings.reportingCompleted);
                                    dataSetter({...clipData, isReported: true});

                                } else {
                                    Toast.show(strings.reportingFailed);
                                }
                            });
                    }
                }
            ])
            loadPopup(setAlertVisibility, true)

        }
    };

    const initDelete = () => {
        setAlertType('alert')
        setAlertMessage(strings.remove_clip_message_co_space)
        setAlertButtons([
            {
                label: strings.cancel, callback: () => {
                    clearAlert()
                }
            },
            {
                label: strings.ok, callback: () => {
                    clearAlert()
                    blockClip(clipData.rid, {
                        uid: user.uid,
                        isOwner: clipData.rid !== user.uid,
                        clipId: clipData.id,
                        isBlocked: false,
                        isDeleted: true,
                    },null,()=>{
                        Toast.show(strings.removingCompleted)
                    });
                    dataSetter({...clipData, isDeleted: true, isBlocked: false});

                }
            },
        ])
        loadPopup(setAlertVisibility, true)

    };

    const initBlock = () => {
        setAlertType('alert')
        setAlertMessage(clipData.rid === user.uid ? strings.hide_all_clip_message : strings.block_clip_message)
        setAlertButtons([
            {
                label: strings.cancel, callback: () => {
                    clearAlert()
                }
            },
            {
                label: strings.ok, callback: () => {
                    clearAlert()
                    if (clipData.rid === user.uid) {
                        blockClip(clipData.rid, {
                            uid: user.uid,
                            isOwner: clipData.rid !== user.uid,
                            clipId: clipData.id,
                            isBlocked: true,
                            isDeleted: false,
                        },null,()=>{
                            Toast.show(strings.hidingCompletedAll )
                        });
                    } else {
                        userBlockClip(clipData.rid, {
                            uid: user.uid,
                            orgId: clipData.rid,
                            clipId: clipData.id,
                            reason: '',
                        },null,()=>{
                            Toast.show(strings.hidingCompleted)
                        });
                    }
                    dataSetter({...clipData, isDeleted: false, isBlocked: true});

                }
            },
        ])
        loadPopup(setAlertVisibility, true)

    };

    const updateBadge = type => {
        const variables = {id: clipData.id, awesomeBadge: type};
        updateAwesomeBadge(variables, ({data}) => {
            if (!data) {
                return false;
            }
            const {clipEdit, anClipEdit} = data;
            const _clip = {...clipData, badgeAdded: anClipEdit ? anClipEdit.badgeAdded : clipEdit.badgeAdded}
            dataSetter(_clip)
        });
    };

    const checkAdditz = () => {
        apolloLib.client(session)
            .query({
                fetchPolicy: 'no-cache',
                query:
                    spaceInfo.spaceType === clipTypes.announcement
                        ? queries.anClip
                        : queries.clip,
                variables: {
                    id: clipData.id,
                    uid: user.uid,
                },
            })
            .then(({data}) => {
                if (spaceInfo.spaceType === clipTypes.announcement) {
                    if (data?.anClip?.isBlocked || data?.anClip?.isDeleted) {
                        threading(null);
                        Toast.show('This clip was removed');
                    } else {
                        threading({...clipData, avatar});
                    }
                } else {
                    if (data?.clip?.isBlocked || data?.clip?.isDeleted) {
                        threading(null);
                        Toast.show('This clip was removed');
                    } else {
                        threading({...clipData, avatar});
                    }
                }
            })
            .catch(err => {
                logger.e('err ', err);
                Toast.show('Unable to check clip status. Please try again later.');
            });
    };

    const menuItems = [];
    menuItems.push({
        label: strings.additz,
        callback: () => {
            checkAdditz();
        },
    });
    menuItems.push({
        label: 'Invite Idean',
        callback: onShare,
    });

    if (clipData.rid === user.uid) {
        if (clipData.badgeAdded === awesomeTag.def) {
            menuItems.push({
                label: 'Remove awesome badge',
                callback: () => updateBadge(''),
            });
        } else {
            menuItems.push({
                label: 'Give awesome badge',
                callback: () => updateBadge(awesomeTag.def),
            });
        }
    }

    if (clipData.uid === user.uid) {
        menuItems.push({label: 'Remove', callback: initDelete});
    } else {
        menuItems.push({label: clipData.rid === user.uid ? 'Hide from All' : 'Hide', callback: initBlock});
        if (clipData.rid !== user.uid) {
            if (clipData?.isReported) {
                menuItems.push({
                    label: 'Reported',
                    callback: () => {
                        Toast.show(strings.alreadyReported);
                    },
                });
            } else {
                menuItems.push({label: 'Report', callback: initReport});
            }
        }
    }

    const dataSetter = (clip) => {
        onTrigger(updateStatus,clip)
        mapClip([clip], false)
    }

    const contentView = useMemo(() => {
        if (!clipData?.isBlocked && !clipData?.isDeleted && !clipData?.isArchived && !clipData?.isReported) {
            return (
                <>
                    {!flip ? (
                        !(disableAction || blockAction) ? (
                            <View style={styles.actionMenuView}>
                                <ActionMenu
                                    items={menuItems}
                                    color={viewer ? colors.clipText : colors.clipTextSecondary}
                                />
                            </View>
                        ) : (
                            <View style={styles.actionMenuView}>
                                <IconButton
                                    style={{marginTop: -5, padding: 0}}
                                    color={viewer ? colors.clipText : colors.clipTextSecondary}
                                    icon={'dots-horizontal'}
                                    onPress={() => {
                                        console.log("blockAction ", blockAction)
                                        console.log("disableAction ", disableAction)
                                        alert({
                                            message: blockAction ? strings.userAccessDenied : strings.collabAlertMessage,
                                            buttons: [
                                                {label: strings.ok, callback: () => alert.clear()},
                                            ],
                                            autoDismiss: false,
                                            cancellable: false,
                                        })
                                    }
                                    }
                                />
                            </View>
                        )
                    ) : (
                        <></>
                    )}
                    <MinClip
                        onPress={() =>
                            onTrigger(setNotify, {
                                id: clipData.parentThread.id,
                                loader: false,
                                index: -1,
                            })
                        }
                        visibility={clipData.parentThread && clipData.parentThread.user}
                        name={clipData.parentThread?.user?.displayName || ''}
                        text={
                            clipData.parentThread?.isArchived
                                ? 'Clip archived'
                                : clipData.parentThread?.isDeleted
                                ? 'Clip removed'
                                : clipData.parentThread?.isReported
                                    ? 'Clip reported'
                                    : clipData.parentThread?.isBlocked
                                        ? 'Clip hidden'
                                        : clipData.parentThread?.text || ''
                        }
                        imageUri={avatarThread}
                    />
                    <ContentViewer
                        clip={clipData}
                        viewer={viewer}
                        clipWidth={clipWidth}
                        disableAction={flip ? false : disableAction}
                        blockAction={flip ? false : blockAction}
                        flip={flip}
                    />
                    <ReactionBar
                        disableAction={disableAction}
                        blockAction={blockAction}
                        setter={dataSetter}
                        viewer={viewer}
                        style={{flex: 1}}
                        clip={clipData}
                        user={user}
                        spaceInfo={spaceInfo}
                        flip={flip}
                    />
                </>
            );
        } else {
            return (
                <MinClip
                    secondary
                    viewer={viewer}
                    visibility={true}
                    text={
                        clipData.isArchived
                            ? 'Clip archived'
                            : !viewer && clipData.isDeleted
                            ? 'Clip removed'
                            : clipData.isBlocked
                                ? 'Clip hidden'
                                : clipData.isReported
                                    ? 'Clip reported' : 'Clip removed'
                    }
                    threading={false}
                    removedClip={true}
                />
            );
        }
    }, [clipData]);


    return (
        <View 
            style={[
                styles.messageBubble,
                viewer ? styles.viewerBubble : styles.not_viewerBubble,
            ]}>
            <View style={styles.avatarBubble}>
                <ImageIcon
                    size={40}
                    source={avatar}
                    style={{
                        opacity: viewer ? 1 : 0,
                        backgroundColor: colors.surfaceAccent,
                    }}
                    onPress={() => {
                        if (viewer) {
                            profileNavigation();
                        }
                    }}
                />
                <View style={styles.labelContainerBubbleShrink}>
                    <Text
                        style={[styles.labelBubble, {textAlign: viewer ? 'left' : 'right'}]}
                        onPress={() => {
                            profileNavigation();
                        }}>
                        {clipData?.user?.displayName}
                    </Text>
                    <Text
                        style={[styles.timeBubble, {textAlign: viewer ? 'left' : 'right'}]}>
                        {Time2String(clipData)}
                    </Text>
                </View>
                <ImageIcon
                    size={40}
                    source={avatar}
                    style={{
                        opacity: viewer ? 0 : 1,
                        backgroundColor: colors.surfaceAccent,
                    }}
                    onPress={() => {
                        if (!viewer) {
                            profileNavigation();
                        }
                    }}
                />
            </View>

            <LinearGradient
                colors={
                    color
                        ? [color, color]
                        : viewer
                        ? colors.clipGradiantSecondary
                        : colors.clipGradiantPrimary
                }
                style={[
                    styles.cloudBubble,
                    {
                        backgroundColor: viewer
                            ? colors.clipSurface
                            : colors.clipSurfaceSecondary,
                    },
                ]}>
                {!arrow && (
                    <View
                        style={[
                            styles.arrow_containerBubble,
                            viewer
                                ? styles.arrow_left_containerBubble
                                : styles.arrow_right_containerBubble,
                        ]}>
                        <Svg
                            style={
                                viewer ? styles.arrow_leftBubble : styles.arrow_rightBubble
                            }
                            width={scale.ms(50, 0.5)}
                            height={scale.ms(50, 0.5)}
                            viewBox="0 0 210 297"
                            enable-background="new 32.485 17.5 15.515 17.5">
                            <Path
                                d={
                                    viewer
                                        ? 'M 164.04706,51.791817 27.527421,9.3394213 128.47182,145.41547 164.747,145.07381 Z'
                                        : 'M 28.227365,51.791817 164.747,9.3394213 63.802601,145.41547 27.527421,145.07381 Z'
                                }
                                fill={
                                    color
                                        ? color
                                        : viewer
                                        ? colors.clipSurface
                                        : colors.clipSurfaceSecondary
                                }
                                x="0"
                                y="0"
                            />
                        </Svg>
                    </View>
                )}
                {contentView}
            </LinearGradient>
            {!viewer && [clipState.uploadFailed, clipState.sendingFailed].includes(clipData.clipState) &&
            <RetryBar
                position={viewer ? "left" : "right"}
                metaData={clipData}
                clip
                onDelete={initDelete}
                onReSend={onUpdateClip}
            />
            }

        </View>
    );
}
