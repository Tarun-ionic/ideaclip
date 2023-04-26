/* eslint-disable react-hooks/exhaustive-deps */
// noinspection JSUnresolvedVariable

/**
 * user info card
 * for show user information  on  listing
 *
 * created by akhi
 * created on 29 may 2021
 * created for ideaclip
 */
import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import scale from 'utilities/scale';
import {cacheFile, Time2String} from '../../../lib/storage';

import {placeHolders} from 'utilities/assets';
import {onTrigger} from 'utilities/helper';
import {logger} from 'index';
import ImageIcon from '../../components/utility/imageIcon';
import {messengerChatRoomMessagesRef, messengerUserStateRef,} from '../messengerHelper';
import {useSession} from '../../../context/SessionContext';

export default function UserInfoCard({
                                         user,
                                         messengerId,
                                         theme,
                                         onPress,
                                         gotoNav,
                                         showStateStatus = true,
                                         lastMessageTime,
                                     }) {
    const styles = style(theme);
    const session = useSession();
    const currentUser = session?.user;
    const [avatar, setAvatar] = useState(placeHolders.avatar);
    const [onlineState, setOnlineState] = useState('');
    const [lastMessage, setLastMessage] = useState({});

    useEffect(() => {
        let isMounted = true;
        if (user?.profileImage) {
            if (user?.profileImageB64) {
                isMounted && setAvatar({uri: user?.profileImageB64});
            } else {
                cacheFile(user?.profileImage, 'dp')
                    .then(path => (isMounted ? setAvatar({uri: path}) : {}))
                    .catch(e => logger.e(e));
            }
        }
        return () => (isMounted = false);
    }, []);

    const stateCalculator = timestamp => {
        if (timestamp) {
            const time = Math.abs(new Date(timestamp) - new Date()) / 1000;
            if (time < 45) {
                setOnlineState('online');
            } else {
                setOnlineState('');
            }
        } else {
            setOnlineState('');
        }
    };

    //check  status
    const checkOnlineState = ref => {
        ref.once('value').then(snapshot => {
            stateCalculator(snapshot.val());
        });
    };

    const firebaseCheck = (firebaseRdRef) => {
        firebaseRdRef.onDisconnect().cancel(error => {
            if (error !== null) setTimeout(() => firebaseCheck(firebaseRdRef), 500);
            else {
                firebaseRdRef.off('child_added');
                firebaseRdRef
                    .orderByKey()
                    .limitToLast(1)
                    .on('child_added', async snapshot => {
                        const message = snapshot.val();
                        if (message) {
                            onTrigger(lastMessageTime, {
                                time: message.createdOn.toString(),
                                messengerId,
                            });
                            setLastMessage({
                                isCurrentUser: message.senderId === user.uid,
                                message: message.text === '' ? 'New photo message' : message.text,
                                time: Time2String(message.createdOn.toString()),
                            });
                        }
                    })
            }
        }).then()
    }

    useEffect(() => {
        //fetch from firebase
        const firebaseRdRef = messengerChatRoomMessagesRef(messengerId);
        firebaseCheck(firebaseRdRef)
        return () => {
            firebaseRdRef.off('child_added');
        };
    }, [user]);

    // online trigger
    useEffect(() => {
        if (!showStateStatus) {
            return false;
        }
        const userStateRef = messengerUserStateRef(user.uid);
        userStateRef.off('child_added');
        userStateRef.off('child_changed');
        userStateRef.on('child_added', async snapshot => {
            stateCalculator(snapshot.val());
        });
        userStateRef.on('child_changed', async snapshot => {
            stateCalculator(snapshot.val());
        });

        //time check
        checkOnlineState(userStateRef);
        const interval = setInterval(() => {
            checkOnlineState(userStateRef);
        }, 10 * 1000);
        return () => {
            userStateRef.off('child_added');
            userStateRef.off('child_changed');
            clearInterval(interval);
        };
    }, [user]);

    const handlePress = () => {
        onTrigger(onPress, user);
    };

    return (
        <Pressable style={styles.userCardOverlay} onPress={handlePress}>
            <View style={styles.userCard}>
                <View>
                    <ImageIcon
                        onPress={() =>
                            onTrigger(gotoNav, {user: currentUser, profile: user})
                        }
                        source={avatar}
                        style={styles.avatar}
                        size={40}
                    />
                    {showStateStatus && (
                        <View
                            style={[
                                styles.status,
                                onlineState === 'online' ? styles.online : styles.offline,
                            ]}
                        />
                    )}
                </View>
                <View style={styles.userInfo}>
                    <Text style={styles.userDisplayName}>{user?.displayName}</Text>
                    {lastMessage && Object.keys(lastMessage).length > 1 && (
                        <View style={{flex: 1}}>
                            <Text style={styles.userLastChat} numberOfLines={1}>
                                {lastMessage?.isCurrentUser ? '' : 'You: '}
                                {lastMessage?.message}{' '}
                            </Text>
                            <Text style={styles.userLastChatTime} numberOfLines={1}>
                                {lastMessage?.time}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </Pressable>
    );
}

UserInfoCard.propTypes = {
    user: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
    onPress: PropTypes.func,
};

const style = ({colors}) =>
    StyleSheet.create({
        userCardOverlay: {
            paddingHorizontal: 5,
            paddingTop: 5,
        },
        userCard: {
            flexDirection: 'row',
            elevation: 0,
            padding: 10,
            borderRadius: 5,
            backgroundColor: colors.surfaceDark,
            alignItems: 'center',
        },
        avatar: {
            flex: 1,
        },
        userInfo: {
            flex: 1,
            flexDirection: 'column',
            marginStart: 10,
            alignSelf: 'center',
            fontSize: scale.font.s,
        },
        userDisplayName: {
            fontWeight: 'bold',
            fontSize: scale.font.l,
            color: colors.textPrimaryDark,
        },
        userLastChat: {
            flex: 1,
            fontSize: scale.font.s,
            color: colors.textPrimaryDark,
        },
        userLastChatTime: {
            fontSize: scale.font.xs,
            color: colors.textPrimaryDark,
        },
        status: {
            width: 13,
            height: 13,
            position: 'absolute',
            borderRadius: 50,
            borderWidth: 0.5,
            bottom: 0,
            right: 0,
        },
        online: {
            backgroundColor: 'green',
            borderColor: 'white',
        },
        offline: {
            backgroundColor: 'white',
            borderColor: '#9c9797',
        },
    });
