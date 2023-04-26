/* eslint-disable react-hooks/exhaustive-deps,react-native/no-inline-styles */
// noinspection DuplicatedCode

import React, {useEffect, useState} from 'react';
import {FlatList, View} from 'react-native';
import {lottie} from '../../../index';
import Following from './following';
import LottieView from 'lottie-react-native';
import {queries} from '../../../schema';
import {useTheme} from '../../../context/ThemeContext';
import {SearchListStyles} from '../../../system/styles/searchStyle';
import {useIsFocused} from '@react-navigation/native';
import apolloLib from '../../../lib/apolloLib';
import logger from '../../../lib/logger';
import {useSession} from "../../../context/SessionContext";

function FollowingList({onPress, user, profileId}) {
    const session = useSession();
    const {theme} = useTheme();
    const styles = SearchListStyles(theme);
    const limit = 15;
    const order = 'asc';
    const [following, setFollowing] = useState([]);
    const [loading, setLoading] = useState(false);
    const [endReached, setEndReached] = useState(false);
    const isFocused = useIsFocused();

    useEffect(() => {
        if (user && profileId) {
            setFollowing([]);
            setLoading(false);
            setEndReached(false);
        }
        if (isFocused)
            fetchFollowing();
    }, [isFocused]);

    const fetchFollowing = (prev = [], startAt = '') => {
        setLoading(true);
        apolloLib.client(session)
            .query({
                fetchPolicy: 'no-cache',
                query: queries.getFollowing,
                variables: {
                    uid: user.uid,
                    profileId: profileId,
                    startAt: startAt,
                    limit: limit,
                    order: order,
                },
            })
            .then(({data, error}) => {
                const {getFollowing} = data
                const {followingData} = getFollowing || []
                if (followingData && followingData?.length > 0) {
                    setFollowing([...prev, ...followingData]);
                } else {
                    setEndReached(true);
                }

                setLoading(false);
            })
            .catch(err => {
                setEndReached(true);
                setLoading(false);
                logger.e(err);
            });
    };

    return (
        <View style={styles.container2}>
            {loading && (
                <View
                    style={
                        following?.length > 0
                            ? styles.loader_container_bottom
                            : styles.loader_container_top
                    }>
                    <LottieView
                        source={lottie.loader}
                        autoPlay
                        loop
                        style={[styles.lottie_pagination]}
                    />
                </View>
            )}
            {!loading && following && following.length === 0 ? (
                <LottieView source={lottie.empty} autoPlay loop style={styles.lottie}/>
            ) : (
                <FlatList
                    style={{flex: 1, width: theme.width}}
                    contentContainerStyle={{paddingBottom: 10}}
                    data={following}
                    renderItem={item => {
                        return (
                            <Following
                                follower={item}
                                user={user}
                                onPress={onPress}
                                profileId={profileId}
                                visitProfile={onPress}
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
                                let a = following[following.length - 1].uid;
                                fetchFollowing(following, a);
                            }
                        } catch (e) {
                        }
                    }}
                />
            )}
        </View>
    );
}

export default FollowingList;
