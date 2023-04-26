import logger from '../../lib/logger';
import database from '@react-native-firebase/database';
import ImageResizer from 'react-native-image-resizer';
import path from 'react-native-path';
import {cacheFile, copyCacheFile, getUniqId} from '../../lib/storage';
import * as RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import storage from '@react-native-firebase/storage';
import MultiFileUpload from '../../utilities/multiFileUpload';
import config from '../../constant/config';
import firestore from '@react-native-firebase/firestore';
import NetInfo from "@react-native-community/netinfo";

const prefix = '@messenger';

export const ms_status = {
    ms_pending: 'ms_pending',
    ms_sending: 'ms_sending',
    ms_created: 'ms_created',
    ms_send: 'ms_send',
    ms_failed: 'ms_failed',
    ms_delivered: 'ms_delivered',
    ms_read: 'ms_read',
    ms_upload: 'ms_upload',
    ms_upload_failed: 'ms_upload_failed',
    ms_uploading: 'ms_uploading',
    ms_removed: 'ms_removed',
};

export function messengerChatRoomRef(chatRoomId) {
    return database().ref('messenger').child(chatRoomId);
}

export function messengerChatRoomIsMutualChat(chatRoomId) {
    return database().ref('messenger').child(chatRoomId).child("isMutual");
}

export function messengerChatRoomMessagesRef(chatRoomId) {
    return database().ref('messenger').child(chatRoomId).child('messages');
}

export function chatRoomRef(chatRoomId) {
    return firestore().collection('chatRooms').doc(chatRoomId);
}

export function profileRef(userId) {
    return firestore().collection('userList').doc(userId);
}

export function messengerUserStateRef(userId) {
    return database().ref('messengerUserState').child(userId);
}

async function MessengerCache(messengerId, userToken = '', messages = []) {
    const indexes = [];
    for (const message of messages) {
        indexes.push(message.mtId);
    }
    await AsyncStorage.setItem(
        `${prefix}_${userToken}_${messengerId}:index`,
        JSON.stringify(indexes),
    ).catch(logger.e);
    await Promise.all(
        messages.map(async message => {
            await AsyncStorage.setItem(
                `${prefix}_${userToken}_${messengerId}:${message.mtId}`,
                JSON.stringify(message),
            ).catch(logger.e);
        }),
    );
}

// handle index
export async function indexer(messengerId, userToken = '', dataIndex = {}) {
    if (dataIndex && Object.keys(dataIndex).length > 0) {
        await AsyncStorage.setItem(
            `${prefix}_${userToken}_${messengerId}_index:index`,
            JSON.stringify(dataIndex),
        ).catch(logger.e);
    }
    const rawData = await AsyncStorage.getItem(
        `${prefix}_${userToken}_${messengerId}_index:index`,
    ).catch(logger.e);
    try {
        if (rawData) {
            return JSON.parse(rawData);
        } else {
            return {firstIndex: '', lastIndex: ''};
        }
    } catch (e) {
        return {firstIndex: '', lastIndex: ''};
    }
}

async function getMessengerCache(messengerId, userToken = '') {
    try {
        const raw_indexes = await AsyncStorage.getItem(
            `${prefix}_${userToken}_${messengerId}:index`,
        );
        if (!raw_indexes) {
            return [];
        }
        const indexes = JSON.parse(raw_indexes);
        if (!Array.isArray(indexes)) {
            return [];
        }
        return Promise.all(
            indexes.map(async index => {
                const rawData = await AsyncStorage.getItem(
                    `${prefix}_${userToken}_${messengerId}:${index}`,
                ).catch(logger.e);
                return JSON.parse(rawData);
            }),
        );
    } catch (e) {
        return [];
    }
}

//send message
export async function SendMessage(
    firebaseRdRef,
    messengerId,
    user,
    receiver,
    setter,
    text = '',
    files = [],
) {
    let medias = [];
    if (files.length > 0) {
        medias = await fileMapper(files);
    }
    const messageRef = firebaseRdRef.push();
    const message = {
        mtId: messageRef ? messageRef.key : '',
        senderId: user.uid,
        receiverId: receiver.uid,
        text: text,
        status: messageRef ? ms_status.ms_created : ms_status.ms_pending,
        createdOn: firestore.Timestamp.now().toDate().getTime(),
    };
    if (medias.length > 0) {
        message.files = medias;
        message.status = ms_status.ms_upload;
    }
    return manageConversation(messengerId, user.uid, [message], false, setter)
}

//  file mapper
async function fileMapper(files) {
    return Promise.all(
        files.map(async file => {
            const filepath = await copyCacheFile(
                file.path,
                'messenger',
                'files',
                file.name,
            );

            const mediaThumb =
                path.extname(filepath).toLowerCase().trim() === '.gif' &&
                file.size < config.thumbnail.maxSize
                    ? filepath
                    : await ImageResizer.createResizedImage(
                    filepath,
                    config.thumbnail.maxWidth,
                    config.thumbnail.maxHeight,
                    config.thumbnail.format,
                    config.thumbnail.quality,
                    0,
                    `${RNFS.CachesDirectoryPath}/messenger/`,
                    true,
                    {onlyScaleDown: true, mode: 'contain'},
                    )
                        .then(response => response.uri)
                        .catch(logger.e);

            let thumbnail;
            if (config.thumbnail.base64 === true) {
                const ex = path.extname(mediaThumb).toLowerCase();
                const extension = ex.replace('.', '');
                thumbnail = await RNFS.readFile(mediaThumb, 'base64').then(
                    resp => `data:image/${extension};base64,${resp}`,
                );
            }
            return {
                id: `${file.type}${getUniqId()}`,
                mediaPath: filepath,
                mediaName: path.basename(filepath),
                mediaType: file.type,
                mediaThumb,
                thumbnail,
                mediaLabel: file.name,
                mediaSize: String(file.size),
            };
        }),
    );
}

// reset cache

export async function resetMessengerCache(
    messengerId,
    userToken = '',
    setter = null,
    maxIndex = 20,
) {
    try {
        const raw_indexes = await AsyncStorage.getItem(
            `${prefix}_${userToken}_${messengerId}:index`,
        );
        const indexes = JSON.parse(raw_indexes) || [];
        if (Array.isArray(indexes)) {
            await AsyncStorage.setItem(
                `${prefix}_${userToken}_${messengerId}:index`,
                JSON.stringify(indexes.slice(0, maxIndex)),
            ).catch(logger.e);
        }
    } catch (e) {
    }
    await manageConversation(messengerId, userToken, [], false, setter, true);
}

// manage conversation
export async function manageConversation(
    messengerId,
    userToken,
    messages,
    isHistory,
    setter,
    initial = false
) {
    await getMessengerCache(messengerId, userToken)
        .then(async pm => {
            const prev_messages = await pm.filter(p => p && p.mtId);
            if (Array.isArray(messages) && messages.length > 0) {
                const conversations = await reFormatMessages(
                    prev_messages,
                    messages,
                    isHistory,
                    initial
                );
                await conversations.sort((x, y) => y.createdOn - x.createdOn);
                if (Array.isArray(conversations) && conversations.length > 0) {
                    await MessengerCache(messengerId, userToken, conversations);
                    setter(s => ({...s, conversations: conversations, fetch: false}));
                } else {
                    await MessengerCache(messengerId, userToken, []);
                    setter(s => ({...s, conversations: [], fetch: false}));
                }
            } else {
                //await prev_messages.sort((x, y) => y.createdOn - x.createdOn);
                setter(s => ({...s, conversations: prev_messages, fetch: false}));
            }
        })
        .catch(logger.e);
}

// reformat messages
async function reFormatMessages(prev_messages, messages, isHistory = false, initial = false) {
    if (messages.length === 0) {
        return prev_messages;
    }
    const lastIndex = messages[messages.length - 1].mtId;
    await Promise.all(
        messages.map(async (_message, mi) => {
            const message = {..._message}
            if (initial === true) {
                if (message.status === ms_status.ms_sending) message.status = ms_status.ms_failed
                else if (message.status === ms_status.ms_uploading) message.status = ms_status.ms_upload_failed
            }

            if (message.files && Array.isArray(message.files)) {
                message.files = await Promise.all(
                    message.files.map(async file => {
                        let mediaUri = file.mediaPath;
                        if (file.mediaPath && !file.mediaPath.includes('://')) {
                            mediaUri = await storage().ref(file.mediaPath).getDownloadURL();
                        }
                        if (file.thumbnail && !file.thumbnail.includes('file://')) {
                            return {...file, mediaUri};
                        } else {
                            const thumbPath = file.mediaThumb
                                ? file.mediaThumb
                                : file.mediaPath;

                            return cacheFile(thumbPath, 'message')
                                .then(p => ({
                                    ...file,
                                    thumbnail: p,
                                    mediaUri,
                                }))
                                .catch(() => {
                                    return {...file, mediaUri};
                                });
                        }
                    }),
                );
            } else {
                message.files = [];
            }
            const hi = prev_messages.findIndex(msg => msg.mtId === lastIndex);
            const index = prev_messages.findIndex(msg => msg.mtId === message.mtId);
            if (index >= 0) {
                prev_messages.splice(index, 1, message);
            } else if (isHistory && hi > 0) {
                prev_messages.splice(hi + mi, 0, message);
            } else if (isHistory) {
                prev_messages.push(message);
            } else {
                prev_messages.unshift(message);
            }
        }),
    );
    return prev_messages;
}

//manage firebase updates
export async function read2firebase(
    firebaseRdRef,
    messengerId,
    messages,
    user,
) {
    await Promise.all(
        messages.map(async message => {
            if (user.uid !== message.senderId && message.status === ms_status.ms_send) {
                await firebaseRdRef.child(message.mtId).update({
                    status: ms_status.ms_read,
                    readOn: database.ServerValue.TIMESTAMP,
                });
            }
        }),
    );
}

export async function sendFirebaseMessage(
    firebaseRdRef,
    messengerId,
    message,
    user,
    receiver,
    setter,
) {
    message.status = ms_status.ms_send;
    const timestamp = message.createdOn;
    message.createdOn = firestore.Timestamp.now().toDate().getTime();
    delete message.progress;
    NetInfo.fetch().then(async state => {
        if (state.isConnected && state.isInternetReachable) {
            firebaseRdRef
                .child(message.mtId)
                .set(message)
                .then(async () => {
                    await manageConversation(
                        messengerId,
                        user.uid,
                        [message],
                        false,
                        setter,
                    )
                }).catch(async () => {
                message.createdOn = timestamp;
                message.status = ms_status.ms_failed;
                await manageConversation(
                    messengerId,
                    user.uid,
                    [message],
                    false,
                    setter,
                )
            });

        } else {
            message.createdOn = timestamp;
            message.status = ms_status.ms_failed;
            await manageConversation(
                messengerId,
                user.uid,
                [message],
                false,
                setter,
            )
        }
    });
}

export async function uploadFirebaseMessage(
    firebaseRdRef,
    messengerId,
    message_,
    user,
    receiver,
    setter,
) {
    const message = {...message_};
    message.status = ms_status.ms_uploading;
    await manageConversation(
        messengerId,
        user.uid,
        [message],
        false,
        setter,
    )
    const progressArray = [];
    MultiFileUpload(
        'messenger',
        messengerId,
        message.files,
        async (progress, fileCount, fileIndex) => {
            progressArray[fileIndex] = progress
            let _progress = 90
            progressArray.map(p => {
                _progress = _progress + p
            })
            message.progress = (_progress / (fileCount + 1)) || 0
            await manageConversation(
                messengerId,
                user.uid,
                [message],
                false,
                setter,
            )
        },
    )
        .then(async res => {
            message.status = ms_status.ms_upload_failed;
            message.files = res.medias;
            if (res.failedMedias.length === 0) {
                message.status = ms_status.ms_created;
                await sendFirebaseMessage(
                    firebaseRdRef,
                    messengerId,
                    message,
                    user,
                    receiver,
                    setter,
                )
            } else {
                await manageConversation(
                    messengerId,
                    user.uid,
                    [message],
                    false,
                    setter,
                )
            }
        })
        .catch(async () => {
            message.status = ms_status.ms_upload_failed;
            await manageConversation(
                messengerId,
                user.uid,
                [message],
                false,
                setter,
            )
        });
}

//manage firebase updates
export async function messenger2firebase(
    firebaseRdRef,
    messengerId,
    message,
    user,
    receiver,
    setter,
) {
    // sender
    if (user.uid === message.senderId) {
        if (message.status === ms_status.ms_pending) {
            await SendMessage(
                firebaseRdRef,
                messengerId,
                user,
                setter,
                message.text,
                message.files,
            );
        } else if (message.status === ms_status.ms_created) {
            await sendFirebaseMessage(
                firebaseRdRef,
                messengerId,
                message,
                user,
                receiver,
                setter,
            )
        } else if (message.status === ms_status.ms_upload) {
            await uploadFirebaseMessage(
                firebaseRdRef,
                messengerId,
                message,
                user,
                receiver,
                setter,
            )
        }
    }
}
