import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AppState, Platform} from 'react-native';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import logger from '../lib/logger';
import {clipTypes} from '../utilities/constant';
import {mutations} from '../schema';
import apolloLib from '../lib/apolloLib';
import {CommonActions} from '@react-navigation/native';

import {
    checkNotificationStatus,
    checkPageActive,
    clearCurrentPageData,
    writeNotificationStatus
} from './notificationHelper';
import {getUserSession} from "../lib/storage";

import notifee, {AndroidStyle, EventType} from '@notifee/react-native';
import {placeHolders} from '../utilities/assets';

const notificationList = []

async function init() {
    await registerNotify();
    await background()
    return messaging().onMessage(async remoteMessage => {
        await showNotification(remoteMessage);
    });
}

async function background() {
    messaging().setBackgroundMessageHandler(async remoteMessage => {
        await showNotification(remoteMessage);
    });

    notifee.onBackgroundEvent(async ({type, detail}) => {
        if (type === EventType.PRESS) {
            logger.d('User pressed the notification.', detail.pressAction.id);
        }
    });
}

async function trigger(navigation) {
    logger.d(" trigger ", navigation)
    const user = await getUserSession();

    if (user && user.uid) {

        messaging().onNotificationOpenedApp(remoteMessage => {
            handleActions(remoteMessage, navigation, user).then();
        });

        messaging()
            .getInitialNotification()
            .then(remoteMessage => {
                if (remoteMessage) {
                    handleActions(remoteMessage.data, navigation, user).then();
                }
            });
        if (Platform.OS === 'ios') {
            PushNotificationIOS.addEventListener(
                'localNotification',
                function (payload) {
                    if (payload) {
                        handleActions(payload.getData(), navigation, user).then();
                    }
                },
            );
        } else {

            notifee.onForegroundEvent(({type, detail}) => {
                switch (type) {
                    case EventType.PRESS:
                        handleActions(detail.notification, navigation, user).then();
                        break;
                }
            });
            notifee.onBackgroundEvent(async ({type, detail}) => {
                if (type === EventType.PRESS) {
                    handleActions(detail.notification, navigation, user).then();
                }
            });

            const initialNotification = await notifee.getInitialNotification();

            if (initialNotification) {
                checkNotificationStatus(initialNotification?.notification?.id, user?.uid)
                    .then(() => {
                        logger.l('notification already opened');
                    })
                    .catch(async () => {
                        writeNotificationStatus(initialNotification?.notification?.id, user?.uid)
                        handleActions(initialNotification.notification, navigation, user).then();
                    }).catch(e => {
                    logger.d("show error ", e)
                })


            }
        }
    }
}

function signOut() {
    if (Platform.OS === 'ios') {
        PushNotificationIOS.removeAllDeliveredNotifications();
    } else {
        notifee.cancelAllNotifications().then();
    }
}

const channels = [
    {
        id: 'collabing',
        name: 'Collabers',
        description: 'Collabers notifications',
        groupId: 'ideaclip',
    },
    {
        id: 'chat',
        name: '1:1 chat',
        description: '1:1 chat notifications',
        groupId: 'ideaclip',
    },
    {
        id: 'personalClip',
        name: 'Idean gallery',
        description: 'Idean gallery notifications',
        groupId: 'ideaclip',
    },
    {
        id: 'clip',
        name: 'Co-space',
        description: 'Co-space clip notifications',
        groupId: 'clip',
    },
    {
        id: 'anClip',
        name: 'News & Asks',
        description: 'News & Asks clip notifications',
        groupId: 'clip',
    },
    {
        id: 'report',
        name: 'Report',
        description: 'Co-space clip reporting notifications',
        groupId: 'clip',
    },
    {
        id: 'anReport',
        name: 'Report',
        description: 'News & Asks clip reporting notifications',
        groupId: 'clip',
    },
    {
        id: 'anBadge',
        name: 'News & Asks Badge',
        description: 'News & Asks clip badge notifications',
        groupId: 'clip',
    },
    {
        id: 'badge',
        name: 'Co-space Badge',
        description: 'Co-space clip badge notifications',
        groupId: 'clip',
    },
    {
        id: 'lovitz',
        name: 'Lovitz',
        description: 'Lovitz notifications',
        groupId: 'lovitz',
    },
];

const channelGroups = [
    {
        id: 'ideaclip',
        name: 'ideaclip',
    },
    {
        id: 'clip',
        name: 'clip',
    },
    {
        id: 'lovitz',
        name: 'lovitz',
    },
];

async function setupChannels() {
    try {
        await notifee.requestPermission()
        channelGroups.forEach(channel => {
            notifee.createChannelGroup({
                ...channel,
            }).then(c => {

            }).catch(e => {
                logger.d("channel err ", e)
            })
        });
        await notifee.createChannelGroup({
            id: 'personal',
            name: 'Personal',
        });
        channels.forEach(channel => {
            notifee.createChannel({
                ...channel,
                importance: 4,
                vibration: true,
                badge: true,
                sound: 'aha',
                vibrationPattern: [200, 400],
            }).then(c => {

            }).catch(e => {
                logger.d("channel err ", e)
            })
        });
        return true;
    } catch (e) {
        logger.d("setting channels failed ", e)
    }
}

async function registerNotify() {
    logger.d("registering notifications")

    try {
        await messaging().registerDeviceForRemoteMessages();
        if (Platform.OS === 'ios') {
            await PushNotificationIOS.requestPermissions();
        } else {
            await setupChannels();
        }

        await messaging()
            .getToken()
            .then(async token => {
                await AsyncStorage.setItem('cloudMessageToken', token);
            });
    } catch (e) {
        logger.d("error registering", e)
    }
}

async function showNotification(remoteMessage) {
    const userSession = await getUserSession();
    logger.d('remoteMessage', userSession.uid);
    if (userSession && userSession.uid && remoteMessage?.data?.userId && remoteMessage?.data?.userId === userSession.uid) {
        if (Platform.OS === 'ios') {
            handleIOSNotifications(remoteMessage);
        } else {
            await handleAndroidNotifications(remoteMessage);
        }
    }
}

async function handleAndroidNotifications(remoteMessage) {
    const {data} = remoteMessage;
    const {body, title, image, type} = data;
    if (AppState.currentState !== 'active') {
        await notifee.displayNotification({
            title: `<span style="color: #ed1c24;">${title}</span>`,
            body,
            data,
            android: {
                smallIcon: 'ic_notification',
                color: '#ed1c24',
                channelId: type,
                sound: 'aha',
                timestamp: Date.now(),
                showTimestamp: true,
                style: {type: AndroidStyle.BIGTEXT, text: body},
                largeIcon: image ? image : placeHolders.avatar, // optional, defaults to 'ic_launcher'.
                circularLargeIcon: true,  // pressAction is needed if you want the notification to open the app when
                                          // pressed
                pressAction: {
                    id: 'open',
                    launchActivity: 'default'
                },
            },
        });
    } else {
        checkPageActive(data.type, data.navigationId, data?.clipType)
            .then(() => {
                logger.l('page is active');
            })
            .catch(async () => {
                await notifee.displayNotification({
                    title: `<span style="color: #ed1c24;">${title}</span>`,
                    body,
                    data,
                    android: {
                        smallIcon: 'ic_notification',
                        color: '#ed1c24',
                        channelId: type,
                        sound: 'aha',
                        timestamp: Date.now(),
                        showTimestamp: true,
                        style: {type: AndroidStyle.BIGTEXT, text: body},
                        largeIcon: image ? image : placeHolders.avatar, // optional, defaults to 'ic_launcher'.
                        circularLargeIcon: true,
                        pressAction: {
                            id: 'open',
                            launchActivity: 'default'
                        },
                    },
                });
            }).catch(e => {
            logger.d("show error ", e)
        })
    }
}

function handleIOSNotifications(remoteMessage) {
    const {messageId, data, notification} = remoteMessage;
    console.log("data ",data)
    let details = {
        body: notification.body,
        title: notification.title,
        id: messageId,
        sound: 'aha.wav',
         category: data.navigationId,
        userInfo: {...data,image:data.image||"https://firebasestorage.googleapis.com/v0/b/ideaclip-app-test-56e4c.appspot.com/o/mail%2Fdefault-avatar.jpg?alt=media&token=65f1760c-44ec-4856-bb0f-0c01bc4ac698"},
    };

    if (AppState.currentState !== 'active') {
        PushNotificationIOS.addNotificationRequest(details);
    } else {
        checkPageActive(data.type, data.navigationId, data?.clipType)
            .then(() => {
                logger.l('page is active');
            })
            .catch(() => {
                console.log("\n\n\n\n notification creating")
                PushNotificationIOS.addNotificationRequest(details);
            });
    }
}

function navigate(navigation, path, data) {
    navigation.dispatch(
        CommonActions.navigate({
            name: path,
            params: data,
        })
    );
}

async function handleActions(notification, navigation, user) {
    clearCurrentPageData();
    const userSession = await getUserSession();
    const {data} = notification;
    const userInfo = data ? data : notification;
    const {navigationId, dataId, type, clipType, notificationId, userId} = userInfo;
    if (user.uid && userSession.uid && userSession.uid === user.uid && !notificationList.find(nid => nid === notificationId)) {
        notificationList.push(notificationId)
        logger.d('remoteMessage action');

        if (user && user.uid && user.uid === userId) {
            apolloLib
                .client()
                .mutate({
                    fetchPolicy: 'no-cache',
                    mutation: mutations.notificationRead,
                    variables: {
                        userId: user.uid,
                        notificationId: notificationId,
                        readStatus: true,
                    },
                })
                .then()
                .catch();
            if (type === 'clip' || type === 'anClip') {
                navigate(navigation, 'ClipCoSpace', {
                    notify: {
                        notifyId: dataId,
                        spaceId: navigationId,
                        spaceType: type === 'clip' ? clipTypes.clip : clipTypes.announcement,
                    },
                    clipId: dataId,
                });
            } else if (type === 'badge' || type === 'anBadge') {
                navigate(navigation, 'ClipCoSpace', {
                    notify: {
                        notifyId: dataId,
                        spaceId: navigationId,
                        spaceType: type === 'badge' ? clipTypes.clip : clipTypes.announcement,
                    },
                    clipId: dataId,
                });
            } else if (type === 'chat') {
                navigate(navigation, 'MessengerChat', {notify: {navigationId}});
            } else if (type === 'personalClip') {
                navigate(navigation, 'IdeanGalleryView', {
                    notifyId: dataId,
                    profileId: navigationId,
                });
            } else if (type === 'collabing') {
                navigate(navigation, 'PersonalSpace', {
                    user: user,
                    profile: {uid: navigationId},
                    goBack: user.uid !== navigationId,
                });
            } else if (type === 'report' || type === 'anReport') {
                navigate(navigation, 'Reported', {
                    spaceType: type === 'report' ? clipTypes.clip : clipTypes.announcement,
                });
            } else if (type === 'lovitz') {
                if (clipType === 'clip' || clipType === 'anClip') {
                    navigate(navigation, 'ClipCoSpace', {
                        notify: {
                            notifyId: dataId,
                            spaceId: navigationId,
                            spaceType: clipType === 'clip' ? clipTypes.clip : clipTypes.announcement,
                        },
                        clipId: dataId,
                    });
                } else {
                    navigate(navigation, 'IdeanGalleryView', {
                        notifyId: dataId,
                        profileId: navigationId,
                    });
                }

            }
        }
    }
}

const notify = {init, signout: signOut, trigger, handleActions, background};
export default notify;

