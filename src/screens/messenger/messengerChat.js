/* eslint-disable react-hooks/exhaustive-deps,no-unused-vars */
/**
 * Messenger chat
 *
 * created by akhi
 * created on 29 may 2021
 * created for ideaclip
 */
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import {useSession} from 'context/SessionContext';
import {useTheme} from 'context/ThemeContext';
import {useBackHandler} from 'utilities/helper';
import {KeyboardAvoidingView, Platform, VirtualizedList} from 'react-native';
import MessageBar from './components/messageBar';
import MessageBubble from './components/messageBubble';
import {cacheFile} from '../../lib/storage';
import {
    chatRoomRef,
    indexer,
    manageConversation,
    messenger2firebase, messengerChatRoomIsMutualChat,
    messengerChatRoomMessagesRef, messengerChatRoomRef,
    messengerUserStateRef,
    ms_status,
    read2firebase,
    resetMessengerCache,
    SendMessage,
    uploadFirebaseMessage,
} from './messengerHelper';
import apolloLib from '../../lib/apolloLib';
import {mutations, queries} from 'schema';
import {useAlert} from 'context/AlertContext';
import MessengerPrivacy from './components/messengerPrivacy';
import {strings} from 'constant/strings';
import FileMessage from './components/fileMessage';
import MessengerProfile from './components/messengerProfile';
import AppBar from '../components/toolbar/appBar';
import {ProgressLoader, SafeScreenView} from '../../index';
import logger from '../../lib/logger';
import {placeHolders} from '../../utilities/assets';
import {displayOrientation, pageTypes} from '../../utilities/constant';
import {ContainerScroll} from '../../system/ui/components';
import {clearCurrentPageData, writePageData,} from '../../services/notificationHelper';
import apiConstant from '../../constant/apiConstant';
import NetInfo from "@react-native-community/netinfo";
import {loadPopup, useDebounce} from "../../utilities/helper";
import Toast from "react-native-simple-toast";
import AlertPopup from "../components/utility/alertPopup";
import database from "@react-native-firebase/database";

export default function MessengerChat() {
    const session = useSession();
    const alert = useAlert();
    const {params} = useRoute();
    const {receiver, notify} = params;
    const navigation = useNavigation();
    const {user} = session
    const {theme, width, orientation} = useTheme();
    const {colors} = theme;
    const isFocused = useIsFocused();
    const messengerRef = useRef();
    const [messenger, setMessenger] = useState({
        firebaseRdRef: null,
        id: '',
        isBlocked: false,
        loading: true,
        isDisabled: false,
        user: receiver,
        blockedBy: '',
        conversations: [],
        fetch: true
    });
    const [avatar, setAvatar] = useState(placeHolders.avatar);
    const [isMutual, setIsMutual] = useState(null);
    const [filePicker, setFilePicker] = useState(false);
    const [receiverStatus, setReceiverStatus] = useState('');
    const [chatId, setChatId] = useState('');
    const [blocked, setIsBlocked] = useState(false);
    const [blockedBy, setBlockedBy] = useState('');
    const [userBlocked, setUserBlocked] = useState(false);
    const [userBlockedBy, setUserBlockedBy] = useState('');
    const [reported, setReported] = useState(false);
    const [reportedLoading, setReportedLoading] = useState(true);

    //alert states
    const [alertVisibility, setAlertVisibility] = useState(false);
    const [alertCancellable, setAlertCancellable] = useState(true);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertButtons, setAlertButtons] = useState([]);
    const [alertType, setAlertType] = useState('');

    //reset alert popup
    const clearAlert = () => {
        setAlertVisibility(false)
        setAlertCancellable(true)
        setAlertMessage('')
        setAlertType('')
        setAlertButtons([])
    }

    let fetching = false;
    const {debounce} = useDebounce()

    useEffect(() => {
        if (isFocused) {
            const unsubscribe = NetInfo.addEventListener(state => {
                if ((state.isConnected && state.isInternetReachable) === false && messenger.id && user.uid) {
                    resetMessengerCache(messenger.id, user.uid, setMessenger).then();
                }
            });
            return () => unsubscribe();
        }
    }, [isFocused, messenger.id]);

    // useEffect( () => {
    //     if (messenger.conversations?.length > 0) {
    //         const getUnreadMessages = messenger.conversations.filter(m => m.status !== ms_status.ms_read)
    //         const unreadMe = getUnreadMessages.filter(m => m.receiverId === user.uid)
    //         console.log("unread me ", unreadMe)
    //         if (unreadMe?.length > 0) {
    //             unreadMe.forEach( (data)=>{
    //                  messenger.firebaseRdRef.child(data.mtId).update({
    //                     status: ms_status.ms_read,
    //                     readOn: database.ServerValue.TIMESTAMP,
    //                 });
    //             })
    //         }
    //     }
    // },[messenger.conversations])

    const firebaseSetMessenger = (firebaseRdRef, chatRoom) =>{
        const {id, isBlocked, userDetails, from} = chatRoom;
        const _messenger = {
            firebaseRdRef,
            id: id,
            isBlocked: isBlocked,
            isDisabled:
                userDetails.status === apiConstant.userStatus.Archived ||
                userDetails.status === apiConstant.userStatus.Disabled,
            user: userDetails,
            creator: from,
            blockedBy: chatRoom.blockedBy,
            loading: false,
            conversations: [],
            fetch: false,
        }
        initFirebaseMessage(_messenger)
        setMessenger(_messenger);
    }

    const firebaseCheck = (firebaseRdRef, chatRoom) => {
        firebaseRdRef.onDisconnect().cancel(error => {
            if (error !== null) setTimeout(() => firebaseCheck(firebaseRdRef, chatRoom), 500);
            else {
                firebaseSetMessenger(firebaseRdRef, chatRoom)
            }
        }).then(()=>{
            firebaseSetMessenger(firebaseRdRef, chatRoom)
        }).catch(()=>{
            setTimeout(() => firebaseCheck(firebaseRdRef, chatRoom), 500);
        })
    }

    useEffect(() => {
        if (chatId?.length > 0) {
            const subscriber = chatRoomRef(chatId).onSnapshot(documentSnapshot => {
                if (documentSnapshot) {
                    const data = documentSnapshot.data();
                    setIsBlocked(data.isBlocked);
                    setBlockedBy(data.blockedBy);
                    if (data.hasOwnProperty('isUserBlocked')) {
                        setUserBlocked(data.isUserBlocked);
                        setUserBlockedBy(data.userBlockedBy);
                    }
                }
            });
            writePageData(pageTypes.chat, chatId);
            return () => subscriber();
        }
    }, [chatId]);

    //setup chat
    const setupChat = chatRoom => {
        const {id} = chatRoom;
        const firebaseRdRef = messengerChatRoomMessagesRef(id);
        firebaseCheck(firebaseRdRef, chatRoom);
    };

    useEffect(() => {
        setBlockedBy(messenger?.blockedBy);
        setIsBlocked(messenger?.isBlocked);
    }, [messenger]);
    // init chat from profile & view
    const initChat = () => {
        setMessenger(m => ({...m, user: {}, loading: true}))
        apolloLib.client(session)
            .mutate({
                fetchPolicy: 'no-cache',
                mutation: mutations.initiateChat,
                variables: {
                    from: user.uid,
                    to: messenger?.user?.uid,
                },
            })
            .then(({data, error}) => {
                const {initiateChat} = data;
                setChatId(initiateChat.id);
                setIsBlocked(initiateChat.isBlocked);
                setBlockedBy(initiateChat.blockedBy);
                if (initiateChat.hasOwnProperty('isUserBlocked')) {
                    setUserBlocked(initiateChat.isUserBlocked);
                    setUserBlockedBy(initiateChat.userBlockedBy);
                }
                if (initiateChat) {
                    setupChat(initiateChat);
                } else if (error) {
                    setTimeout(() => initChat(), 1500)
                }
            })
            .catch((e) => {
                setMessenger(m => ({...m, loading: false}))
                alert(strings.something_went_wrong);
            });
    };

    // init chat from notification
    const checkChat = () => {
        setMessenger(m => ({...m, user: {}, loading: true}))
        apolloLib.client(session)
            .query({
                fetchPolicy: 'no-cache',
                query: queries.getChatroom,
                variables: {
                    from: user.uid,
                    id: notify.navigationId,
                },
            })
            .then(async ({data, error}) => {
                const {getChatroom} = data;
                if (getChatroom) {
                    setChatId(getChatroom.id);
                    await setupChat(getChatroom);
                    setIsBlocked(getChatroom.isBlocked);
                    setBlockedBy(getChatroom.blockedBy);
                    if (getChatroom.hasOwnProperty('isUserBlocked')) {
                        setUserBlocked(getChatroom.isUserBlocked);
                        setUserBlockedBy(getChatroom.userBlockedBy);
                    }
                } else if (error) {
                    alert(strings.something_went_wrong);
                }
            })
            .catch(() => {
                alert(strings.something_went_wrong);
            });
    };

    const timeStampChecker = timestamp => {
        if (timestamp) {
            const time = Math.abs(new Date(timestamp) - new Date()) / 1000;
            if (time < 45) {
                setReceiverStatus('online');
            } else {
                setReceiverStatus('');
            }
        } else {
            setReceiverStatus('');
        }
    };

    //check  status
    const setOnlineState = ref => {
        ref.once('value').then(snapshot => {
            timeStampChecker(snapshot.val());
        });
    };

    // online trigger
    useEffect(() => {
        if (messenger.id !== '') {
             /// user state
            const ref = messengerUserStateRef(messenger?.user?.uid);
            ref.off('child_added');
            ref.off('child_changed');
            ref.on('child_added', async snapshot => {
                timeStampChecker(snapshot.val());
            });
            ref.on('child_changed', async snapshot => {
                timeStampChecker(snapshot.val());
            });

            //time check
            setOnlineState(ref);
            const interval = setInterval(() => {
                setOnlineState(ref);
            }, 30 * 1000);
            return () => {
                ref.off('child_added');
                ref.off('child_changed');
                messenger?.firebaseRdRef && messenger?.firebaseRdRef.off('child_added');
                messenger?.firebaseRdRef && messenger?.firebaseRdRef.off('child_changed');
                clearInterval(interval);
            };
        }
    }, [messenger.id]);

    // initiate chat
    useEffect(() => {
        if (isFocused) {
            if(chatId)
                writePageData(pageTypes.chat, chatId);
            if (notify) {
                notify.navigationId !== messenger.id && checkChat();
            } else {
                initChat();
            }
        } else {
            clearCurrentPageData();
        }
    }, [isFocused, notify]);

    // profile image 
    useEffect(() => {
        let isMounted = true;
        fetchReportedStatus()
        if (messenger.user?.profileImage) {
            if (messenger.user?.profileImageB64) {
                setAvatar({uri: messenger.user?.profileImageB64});
            } else {
                cacheFile(messenger.user?.profileImage, 'dp')
                    .then(path => (isMounted ? setAvatar({uri: path}) : {}))
                    .catch(e => logger.e(e));
            }
        } else {
            setAvatar(placeHolders.avatar)
        }
        return () => {
            isMounted = false;
        };
    }, [messenger.user]);

    const fetchReportedStatus = ()=>{
        if(messenger?.user?.uid) {
            apolloLib.client(session)
                .query({
                    fetchPolicy: 'no-cache',
                    query: queries.getBlockStatus,
                    variables: {
                        id: messenger?.user?.uid,
                        uid: user?.uid,
                    },
                })
                .then(({data}) => {
                    if (!data.profile) {
                        setReported(true);
                        setReportedLoading(false);
                    } else {
                        setReported(
                            data?.profile?.reportStatus ? data?.profile?.reportStatus : false,
                        )
                        setReportedLoading(false);
                    }
                })
                .catch(err => {
                    logger.e(err);
                    setReportedLoading(false);
                });
        }
    }

    const initFirebaseMessage = (_messenger) =>{
        // get chatroom state
        const chatRoomMutualRef = messengerChatRoomIsMutualChat(_messenger?.id);
        chatRoomMutualRef.once('value').then(  snapshot => {
            const snap = snapshot.val();
            snap === null ? setIsMutual(user?.uid === _messenger.creator) : setIsMutual(snap)
        }).catch();


        // get catch
        resetMessengerCache(_messenger.id, user.uid, setMessenger).then();
        _messenger.firebaseRdRef
            .orderByKey()
            .limitToLast(15)
            .once('value')
            .then(async snapshot => {
                const messages = [];
                snapshot.forEach(snap => messages.push(snap.val()));
                if (messages.length > 0) {
                    await indexer(_messenger.id, user.uid, {
                        firstIndex: messages[messages.length - 1].mtId,
                        lastIndex: messages[0].mtId,
                    });
                    await read2firebase(
                        _messenger.firebaseRdRef,
                        _messenger.id,
                        messages,
                        user,
                        _messenger.user,
                        setMessenger,
                    );
                    await manageConversation(
                        _messenger.id,
                        user.uid,
                        messages.reverse(),
                        true,
                        setMessenger,
                        true
                    ).then();
                }

                //fetch from firebase
                _messenger.firebaseRdRef.off('child_added');
                _messenger.firebaseRdRef.off('child_changed');
                _messenger.firebaseRdRef
                    .orderByKey()
                    .limitToLast(1)
                    .on('child_added', async _s => {
                        const message = _s.val();
                        if (message) {
                            await read2firebase(
                                _messenger.firebaseRdRef,
                                _messenger.id,
                                [message],
                                user,
                            );
                            await manageConversation(
                                _messenger.id,
                                user.uid,
                                [message],
                                false,
                                setMessenger,
                            ).then();
                        }
                    });
                _messenger.firebaseRdRef.on('child_changed', async _snapshot => {
                    const message = _snapshot.val();
                    if (message) {
                        console.log("message changed")
                        if(message.status !== ms_status.ms_read && message.receiverId === user.uid) {

                            await read2firebase(
                                _messenger.firebaseRdRef,
                                _messenger.id,
                                [message],
                                user,
                                _messenger.user,
                                setMessenger,
                            );
                        }
                        await manageConversation(
                            _messenger.id,
                            user.uid,
                            [message],
                            false,
                            setMessenger,
                        ).then();
                    }
                });
            });
    }



    useBackHandler(() => {
        onBackPress();
        return true;
    }, []);


    const getHistory = async () => {
        if (!fetching && messenger.firebaseRdRef) {
            fetching = true;
            const index = await indexer(messenger.id, user.uid);
            if (!index.lastIndex) return false;
            messenger.firebaseRdRef
                .orderByKey()
                .limitToLast(15)
                .endAt(index.lastIndex)
                .once('value')
                .then(async snapshot => {
                    fetching = false;
                    const messages = [];
                    snapshot.forEach(snap => messages.push(snap.val()));
                    if (messages.length > 0) {
                        await indexer(messenger.id, user.uid, {
                            firstIndex: index.firstIndex,
                            lastIndex: messages[0].mtId,
                        });
                        const revMessages = messages.reverse();
                        await read2firebase(
                            messenger.firebaseRdRef,
                            messenger.id,
                            messages,
                            user,
                            messenger.user,
                            setMessenger,
                        );
                        await manageConversation(
                            messenger.id,
                            user.uid,
                            revMessages,
                            true,
                            setMessenger,
                        );
                    }
                });
        }
    };

    const onBackPress = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.replace('MessengerUsers');
        }
    };

    const handleSendMessage = ({text, files}) => {
        SendMessage(
            messenger.firebaseRdRef,
            messenger.id,
            user,
            messenger.user,
            setMessenger,
            text,
            files,
        ).then();

        if(isMutual === false && user?.uid !== messenger.creator){
            const chatRoomMutualRef = messengerChatRoomIsMutualChat(messenger?.id);
            chatRoomMutualRef.set(true).then(r => setIsMutual(true) ).catch()
        }

        if (messenger.conversations.length > 0) {
            messengerRef?.current?.scrollToIndex({animated: true, index: 0});
        }
    };

    const EmptyListComponent = useCallback(() => {
        return <></>;
    }, []);

    const ListItemComponent = useCallback(
        ({item}) => {
            const message = item
            if (message.status === ms_status.ms_removed) return null
            const onload = () =>
                messenger2firebase(
                    messenger.firebaseRdRef,
                    messenger.id,
                    message,
                    user,
                    messenger.user,
                    setMessenger,
                )

            const onResend = async () => {
                await uploadFirebaseMessage(
                    messenger.firebaseRdRef,
                    messenger.id,
                    message,
                    user,
                    receiver,
                    setMessenger,
                )
            }

            const onDelete = async () => {
                message.status = ms_status.ms_removed
                await messenger.firebaseRdRef
                    .child(message.mtId)
                    .set(message)
                    .catch(() => message.status = ms_status.ms_failed)
                manageConversation(
                    messenger.id,
                    user.uid,
                    [message],
                    false,
                    setMessenger,
                ).then();
            }

            return (
                <MessageBubble
                    onload={onload}
                    message={message}
                    theme={theme}
                    onReSend={onResend}
                    onDelete={onDelete}
                    position={message.senderId === user.uid ? 'right' : 'left'}
                    color={
                        message.senderId === user.uid
                            ? colors.clipDMPrimary
                            : colors.clipDMSecondary
                    }
                />
            );
        },
        [messenger],
    );

    const gotoNav = () => {
        navigation.push('PersonalSpace', {
            user: user,
            profile: messenger.user,
            goBack: true,
        });
    };

    const menuItems = () => {
        let a = [];
        if (isMutual === true && !userBlocked) {
            if (blocked) {
                if (blockedBy === user.uid) {
                    a.push({
                        label: 'Unblock',
                        callback: () => {
                            updateStatus(false);
                        },
                    });
                }
            } else {
                a.push({
                    label: 'Block',
                    callback: () => {
                        updateStatus(true);
                    },
                });
            }
        }
        if(!reportedLoading){
            if (reported){
                a.push({
                    label: 'User Reported',
                    callback: () => {
                        initReport()
                    },
                });
            } else{
                a.push({
                    label: 'Report User',
                    callback: () => {
                        initReport()
                    },
                });
            }
        }
        return a;
    };
    const initReport = () => {
        if(!reported){
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
                        ReportUser(reason, otherText)
                    }
                }
            ])
            loadPopup(setAlertVisibility, true)
        } else{
            Toast.show("User already reported")
        }
    };

    const ReportUser = (reason, otherText) => {
        setReportedLoading(true)
        const data = {
            reporterId: user?.uid,
            reporteeId: messenger?.user?.uid,
            reason,
            otherText,
        };
        const variables = {data};
        apolloLib.client(session)
            .mutate({
                mutation: mutations.reportUser,
                variables,
            })
            .then(({data, error, loading}) => {
                setReportedLoading(false)
                if (data?.createUserReport) {
                    Toast.show(strings.userReportingCompleted);
                    setReported(true);
                } else {
                    Toast.show(strings.reportingFailed);
                }
                if (error) {
                    Toast.show(strings.reportingFailed);
                }
            })
            .catch(error => {
                setReportedLoading(false)
                Toast.show(strings.reportingFailed);
            });
    };
    const updateStatus = status => {
        apolloLib.client(session)
            .mutate({
                fetchPolicy: 'no-cache',
                mutation: mutations.blockChangeChat,
                variables: {
                    id: messenger.id,
                    uId: user.uid,
                    status: status,
                },
            })
            .then(({data, error}) => {
                const {blockChangeChat} = data;
                if (blockChangeChat) {
                    setMessenger(prev => ({
                        ...prev,
                        isBlocked: blockChangeChat.isBlocked,
                        blockedBy: blockChangeChat.blockedBy,
                    }));
                } else if (error) {
                    alert(strings.something_went_wrong);
                }
            })
            .catch(() => {
                alert(strings.something_went_wrong);
            });
    };

    return (
        <SafeScreenView translucent>
            <AppBar
                navigate={gotoNav}
                onBackPress={onBackPress}
                title={messenger.user?.displayName}
                avatar={avatar}
                showStateStatus={true}
                online={receiverStatus === 'online'}
                menuItems={menuItems()}
            />
            {messenger.loading === true && (
                <ProgressLoader visible={true}/>
            )}

            <KeyboardAvoidingView
                style={{flex: 1}}
                behavior={Platform.OS === 'ios' ? 'padding' : ''}>
                <ContainerScroll disabled={orientation === displayOrientation.portrait}>
                    {messenger.loading === false &&
                    <>
                        {isMutual !== null &&
                        <MessengerProfile
                            messenger={messenger}
                            visibility={isMutual}
                            avatar={avatar}
                            theme={theme}
                            user={user}
                            blocked={blocked}
                        />
                        }

                        <VirtualizedList
                            data={messenger.conversations}
                            getItemCount={() => messenger.conversations.length}
                            getItem={(data, index) => data[index]}
                            contentContainerStyle={{width}}
                            ListEmptyComponent={EmptyListComponent}
                            ref={messengerRef}
                            renderItem={ListItemComponent}
                            keyExtractor={item => item.mtId}
                            scrollEnabled={true}
                            inverted={true}
                            initialNumToRender={5}
                            maxToRenderPerBatch={10}
                            windowSize={10}
                            removeClippedSubviews={true}
                            updateCellsBatchingPeriod={100}
                            onEndReachedThreshold={0.5}
                            onEndReached={getHistory}
                        />
                        {isMutual !== null &&
                            <MessengerPrivacy
                                messenger={messenger}
                                user={user}
                                visibility={isMutual}
                                theme={theme}
                                setter={setMessenger}
                                blocked={blocked}
                                chatBlockedBy={blockedBy === user.uid}
                                userBlocked={userBlocked}
                                userBlockedBy={userBlockedBy === user.uid}
                            />
                        }
                    </>
                    }
                </ContainerScroll>
                {!blocked && !messenger.isDisabled && !userBlocked  && (
                    <>
                        <MessageBar
                            theme={theme}
                            fileAttach={'image'}
                            onSend={(e) => debounce(handleSendMessage(e))}
                            onSelectFilePicker={setFilePicker}
                        />
                        <FileMessage
                            onDismiss={() => setFilePicker(false)}
                            onSend={(e) => debounce(handleSendMessage(e))}
                            theme={theme}
                            visibility={filePicker}
                        />
                    </>
                )}
                {
                    alertVisibility &&
                    <AlertPopup buttons={alertButtons} message={alertMessage} type={alertType} visibility={alertVisibility}
                                onCancel={clearAlert} cancellable={alertCancellable}/>
                }
            </KeyboardAvoidingView>
        </SafeScreenView>
    );
}
