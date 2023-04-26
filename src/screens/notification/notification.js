import React from 'react';
import {StyleSheet} from 'react-native';
import NotifyList from './components/notifyList';
import LottieView from 'lottie-react-native';
import {lottie} from '../../utilities/assets';
import {onTrigger, SafeScreenView} from '../../index';
import {useSession} from '../../context/SessionContext';
import {useBackHandler} from '../../utilities/helper';
import {useNavigation, useRoute} from '@react-navigation/native';
import {clipTypes} from '../../utilities/constant';
import AppBar from '../components/toolbar/appBar';
import apolloLib from '../../lib/apolloLib';
import {mutations, queries} from '../../schema';
import logger from '../../lib/logger';
import {useAlert} from '../../context/AlertContext';
import {strings} from '../../constant/strings';
import Toast from "react-native-simple-toast";
import apiConstant from "../../constant/apiConstant";

export default function Notification() {
    const navigation = useNavigation();
    const session = useSession();
    const {user} = session;
    const alert = useAlert();
    const route = useRoute();
    const {lovitz} = route?.params || {};

    useBackHandler(() => {
        onBackPress();
        return true;
    }, []);

    const onBackPress = () => {
        navigation.goBack(null);
    };
    const checkBlockStatus = (uid, profileId) => {
        return new Promise(async (resolve, reject) => {
            apolloLib.client(session)
                .query({
                    fetchPolicy: 'no-cache',
                    query: queries.getBlockStatus,
                    variables: {
                        id: profileId,
                        uid: uid,
                    },
                })
                .then(({data}) => {
                    if (!data.profile) {
                        reject('no data');
                    } else {
                        resolve({
                            blockStatus: data?.profile?.blockStatus
                                ? data?.profile?.blockStatus
                                : false,
                            followStatus: data?.profile?.followStatus
                                ? data?.profile?.followStatus
                                : false,
                        });
                    }
                })
                .catch(err => {
                    logger.e(err);
                    reject(err);
                });
        });
    };

    const notifyItemHandler = notification => {
        const {orgData, clipId, chatId, notificationType, clipType, orgID} = notification;
        if (notificationType === 'chat') {
            navigation.push('MessengerChat', {
                notify: {navigationId: chatId},
            });
        } else if (notificationType === 'personalClip') {
            navigation.push('IdeanGalleryView', {
                notifyId: clipId,
                profileId: orgID,
            });
        } else if (notificationType === 'collabing') {
            navigation.push('PersonalSpace', {
                user: user,
                profile: orgData,
                goBack: true,
            });
        } else if (
            notificationType === 'clip' ||
            notificationType === 'anClip' ||
            notificationType === 'badge' ||
            notificationType === 'anBadge'
        ) {
            checkBlockStatus(user.uid, orgData.uid).then(
                ({blockStatus, followStatus}) => {
                    if (blockStatus) {
                        alert(strings.userAccessDenied);
                    } else {
                        navigation.push('ClipCoSpace', {
                            notify: {
                                notifyId: clipId,
                                spaceId: orgData?.uid,
                                followStatus: followStatus,
                                spaceType:
                                    notificationType === 'clip'
                                        ? clipTypes.clip
                                        : notificationType === 'anClip'
                                        ? clipTypes.announcement
                                        : notificationType === 'badge'
                                            ? clipTypes.clip
                                            : clipTypes.announcement,
                            },
                            clipId: clipId,
                        });
                    }
                },
            );
        } else if (notificationType === 'report') {
            navigation.push('Reporting', {notify: notification});
        } else if (notificationType === 'lovitz') {
            if (clipType === 'clip' || clipType === 'anClip') {
                checkBlockStatus(user.uid, orgID).then(
                    ({blockStatus, followStatus}) => {
                        if (blockStatus) {
                            alert(strings.userAccessDenied);
                        } else {
                            navigation.push('ClipCoSpace', {
                                notify: {
                                    notifyId: clipId,
                                    spaceId: orgID,
                                    followStatus: followStatus,
                                    spaceType:
                                        clipType === 'clip'
                                            ? clipTypes.clip
                                            : clipTypes.announcement
                                },
                                clipId: clipId,
                            });
                        }
                    },
                );
            } else if (clipType === 'ideanGallery') {
                navigation.navigate('IdeanGalleryView', {
                    notifyId: clipId,
                    profileId: orgID,
                });
            }
        }
    };
    
    return (
        <SafeScreenView translucent>
            <AppBar title={lovitz ? 'Lovitz Notifications' : 'Notifications'} onBackPress={onBackPress}/>
            {user.uid ? (
                <NotifyList onPress={notifyItemHandler} uid={user.uid} lovitz={lovitz}/>
            ) : (
                <LottieView
                    source={lottie.loader}
                    autoPlay
                    loop
                    style={styles.lottie_sm}
                />
            )}
        </SafeScreenView>
    );
}
const styles = StyleSheet.create({
    lottie_sm: {
        height: 150,
        width: 150,
        alignSelf: 'center',
    },
});
