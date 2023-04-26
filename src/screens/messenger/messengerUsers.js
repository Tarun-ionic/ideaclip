/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Messenger user view
 *
 * created by akhi
 * created on 29 may 2021
 * created for ideaclip
 */
import React, {useCallback, useEffect, useState} from 'react';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {useSession} from 'context/SessionContext';

import {useTheme} from 'context/ThemeContext';
import {useBackHandler} from 'utilities/helper';
import {strings} from 'constant/strings';
import {FlatList, StyleSheet, Text} from 'react-native';
import UserInfoCard from './components/userInfoCard';
import {logger, ProgressLoader, SafeScreenView} from 'index';
import apolloLib from '../../lib/apolloLib';
import {queries} from 'schema';
import {cacheFile} from '../../lib/storage';
import {userType} from '../../utilities/constant';
import AppBar from '../components/toolbar/appBar';
import {placeHolders} from '../../utilities/assets';

export default function MessengerUsers() {
    const navigation = useNavigation();
    const session = useSession();
    const {user} = session;
    const {theme} = useTheme();
    const isFocused = useIsFocused();
    const styles = style(theme);
    const fetchLimit = 15;

    const [avatar, setAvatar] = useState(placeHolders.avatar);
    const [state, setState] = useState({users: [], fetching: true});

    useEffect(() => {
        let isMounted = true;
        if (user?.profileImage) {
            if (user?.profileImageB64) {
                setAvatar({uri: user?.profileImageB64});
            } else {
                cacheFile(user?.profileImage, 'dp')
                    .then(path => (isMounted ? setAvatar({uri: path}) : {}))
                    .catch(e => logger.e(e));
            }
        } else if (user?.userType !== userType.general) {
            setAvatar(placeHolders.logo);
        }
        return () => (isMounted = false);
    }, [user]);

    useBackHandler(() => {
        onBackPress();
        return true;
    }, []);

    const onBackPress = () => {
        navigation.goBack(null);
    };

    const initMessaging = userInfo => {
        navigation.navigate('MessengerChat', {receiver: userInfo});
    };

    const gotoNav = navParams => {
        navigation.push('PersonalSpace', {...navParams, goBack: true});
    };

    useEffect(() => {
        if (isFocused) {
            fetchUsers();
        }
    }, [isFocused]);

    const fetchUsers = (page = 0) => {
        setState(prev => ({...prev, fetching: true}));
        apolloLib.client(session)
            .query({
                fetchPolicy: 'no-cache',
                query: queries.myChatRooms,
                variables: {
                    from: user.uid,
                    page,
                    limit: fetchLimit,
                },
            })
            .then(({data, error}) => {
                const {myChatRooms} = data;
                if (myChatRooms) {
                    page === 0
                        ? setState({
                            users: myChatRooms.filter(
                                chatRoom => chatRoom && chatRoom.lastMessageOn,
                            ),
                            fetching: false,
                        })
                        : setState(prev => ({
                            users: [
                                ...prev.users,
                                ...myChatRooms.filter(
                                    chatRoom => chatRoom && chatRoom.lastMessageOn,
                                ),
                            ],
                            fetching: false,
                        }));
                } else if (error) {
                    setState(prev => ({...prev, fetching: false}));
                } else {
                    setState(prev => ({...prev, fetching: false}));
                }
            })
            .catch(() => {
                setState(prev => ({...prev, fetching: false}));
            });
    };

    const EmptyListComponent = useCallback(() => {
        if (state.fetching === true) {
            return <ProgressLoader visible={true}/>;
        } else {
            return <Text style={styles.no_chat}>{strings.no_chat_room_user}</Text>;
        }
    }, [state]);

    const setLastMessage = async data => {
        const users = state.users;
        if (users.length === 0) {
            return false;
        }

        const index = users.findIndex(_us => {
            return _us.id === data.messengerId;
        });

        if (index >= 0) {
            users[index] = {...users[index], lastMessageOn: data.time};
        }
        const sortedUsers = users
            .slice()
            .sort((x, y) => {
                const xData = x.lastMessageOn
                    ? new Date(parseFloat(x.lastMessageOn))
                    : new Date('1990-01-01');
                const yData = y.lastMessageOn
                    ? new Date(parseFloat(y.lastMessageOn))
                    : new Date('1990-01-01');
                return yData - xData;
            })
            .filter(_user => _user.lastMessageOn);

        if (
            new Date(parseFloat(users[0].lastMessageOn)) <
            new Date(parseFloat(data.lastMessageOn))
        ) {
            setState(prev => ({...prev, users: sortedUsers}));
        }
    };

    const ListItemComponent = useCallback(
        ({item}) => {
            const {userDetails, id} = item;
            if (item.lastMessageOn) {
                return userDetails ? (
                    <UserInfoCard
                        messengerId={id}
                        user={userDetails}
                        theme={theme}
                        onPress={initMessaging}
                        gotoNav={gotoNav}
                        lastMessageTime={setLastMessage}
                    />
                ) : null;
            } else {
                return null;
            }
        },
        [state],
    );

    return (
        <SafeScreenView translucent>
            <AppBar
                onBackPress={onBackPress}
                avatar={avatar}
                title={strings.messenger}
                disableElevation
            />
            <FlatList
                contentContainerStyle={styles.chatUserList}
                ListEmptyComponent={EmptyListComponent}
                data={state.users}
                renderItem={ListItemComponent}
                keyExtractor={item => item.id}
                scrollEnabled={true}
                initialNumToRender={5}
                maxToRenderPerBatch={10}
                windowSize={10}
                removeClippedSubviews={true}
                updateCellsBatchingPeriod={100}
                onEndReachedThreshold={0.5}
                onRefresh={fetchUsers}
                refreshing={false}
                onEndReached={() =>
                    state.users.length % fetchLimit === 0
                        ? fetchUsers(state.users.length / fetchLimit)
                        : {}
                }
            />
        </SafeScreenView>
    );
}

const style = ({colors}) =>
    StyleSheet.create({
        chatUserList: {},
        no_chat: {
            flex: 1,
            color: colors.textPrimaryDark,
            padding: 15,
            textAlign: 'center',
        },
    });
