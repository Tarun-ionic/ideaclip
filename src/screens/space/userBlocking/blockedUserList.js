/* eslint-disable react-hooks/exhaustive-deps,react-native/no-inline-styles */
// noinspection DuplicatedCode

import React, {useEffect, useState} from 'react';
import {FlatList, Text, View} from 'react-native';
import {lottie, SafeScreenView} from '../../../index';
import LottieView from 'lottie-react-native';
import {queries} from '../../../schema';
import {useTheme} from '../../../context/ThemeContext';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import apolloLib from '../../../lib/apolloLib';
import logger from '../../../lib/logger';
import {useSession} from "../../../context/SessionContext";
import {UserListStyle} from "./userListStyle";
import BlockedUserCard from './blockedUserCard';
import AppBar from '../../components/toolbar/appBar';
import { useBackHandler } from '../../../utilities/helper';

function BlockedUserList() {
    const navigation = useNavigation()
    const session = useSession();
    const {user} = session;
    const {theme} = useTheme();
    const styles = UserListStyle(theme)
    const limit = 15;
    const order = 'asc';
    const [userList, setUserList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [endReached, setEndReached] = useState(false);
    const isFocused = useIsFocused();
   useBackHandler(() => {
        onBackPress();
        return true;
    }, [isFocused]);
    const onBackPress = () => {
        navigation.push('PersonalSpace', {goBack: false, user})
    };

    useEffect(() => {
        if (isFocused){
            if (user) {
                setUserList([]);
                setLoading(false);
                setEndReached(false);
                fetchUserList();
            }
        }
    }, [isFocused]);
    const onPress = item => {
        navigation.push('PersonalSpace', {
            user,
            profile: {...item.details},
            goBack: true,
        });
    };

    const fetchUserList = (prev = [], startAt = '') => {
        console.log("fetching")
        setLoading(true);
        apolloLib.client(session)
            .query({
                fetchPolicy: 'no-cache',
                query: queries.getBlockedUsers,
                variables: {
                    uid: user.uid,
                    startAt: startAt,
                    limit: limit,
                    order: order,
                },
            })
            .then(({data, error}) => {
                setLoading(false);
                const {getBlockedUsers} = data
                // console.log("blocked users ",getBlockedUsers)
                if (getBlockedUsers && getBlockedUsers?.length > 0) {
                    setUserList([...prev, ...getBlockedUsers]);
                    console.log("setting data")
                } else {
                    setEndReached(true);
                }
                if (error) {
                    logger.e("err ", error)
                }
            })
            .catch(err => {
                setEndReached(true);
                setLoading(false);
                logger.e(err);
            });
    };
    return (
        <SafeScreenView translucent>
            <AppBar title={'Blocked Users'} onBackPress={onBackPress}/>
            <View style={styles.container2}>
            {loading && (
                <View
                    style={
                        userList?.length > 0
                            ? styles.loader_container_bottom
                            : styles.loader_container_top
                    }>
                    <LottieView
                        source={lottie.loader}
                        autoPlay
                        loop
                        style={styles.lottie_pagination}
                    />
                      
                </View>
            )}
            {!loading && userList && userList.length === 0 ? (
            <View>
            <LottieView source={lottie.empty} autoPlay loop style={styles.lottie}/>
              <Text style={styles.subtext}>You haven't blocked any users.</Text>
        </View>
        
            ) : (
                <FlatList
                    style={{flex: 1, width: theme.width}}
                    contentContainerStyle={{paddingBottom: 10}}
                    data={userList}
                    renderItem={({item}) => {
                        return (
                            <BlockedUserCard
                                item={{...item}}
                                user={user}
                                onPress={onPress}
                                />
                        );
                    }}
                    keyExtractor={(item, index) => {
                        return `${index}`;
                    }}
                    scrollEnabled={true}
                    onEndReachedThreshold={15}
                    onEndReached={() => {
                        try {
                            if (!endReached) {
                                let a = userList[userList.length - 1].id;
                                fetchUserList(userList, a);
                            }
                        } catch (e) {
                        }
                    }}
                />
            )}
        </View>
        </SafeScreenView>
        
    );
}

export default BlockedUserList;
