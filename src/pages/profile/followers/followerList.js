/* eslint-disable react-hooks/exhaustive-deps,react-native/no-inline-styles */
// noinspection DuplicatedCode

import React, {useEffect, useState} from 'react';
import {FlatList, View} from 'react-native';
import {lottie} from '../../../index';
import Follower from './follower';
import LottieView from 'lottie-react-native';
import {queries} from '../../../schema';
import {useTheme} from '../../../context/ThemeContext';
import {SearchListStyles} from '../../../system/styles/searchStyle';
import {useIsFocused} from '@react-navigation/native';
import apolloLib from '../../../lib/apolloLib';
import logger from '../../../lib/logger';
import {useSession} from "../../../context/SessionContext";

function FollowerList({onPress, user, profileId}) {
    const session = useSession();
    const {theme} = useTheme();
    const styles = SearchListStyles(theme);
    const limit = 15;
    const order = 'asc';
    const [followers, setFollowers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [endReached, setEndReached] = useState(false);
    const isFocused = useIsFocused();

    useEffect(() => {
        if (user && profileId) {
            setFollowers([]);
            setLoading(false);
            setEndReached(false);
        }
        if (isFocused)
            fetchFollowers();
    }, [isFocused]);

    const fetchFollowers = (prev = [], startAt = '') => {
        setLoading(true);
        apolloLib.client(session)
            .query({
                fetchPolicy: 'no-cache',
                query: queries.getFollowers,
                variables: {
                    uid: user.uid,
                    profileId: profileId,
                    startAt: startAt,
                    limit: limit,
                    order: order,
                },
            })
            .then(({data, error}) => {
                setLoading(false);
                const {getFollowers} = data
                const {followerData} = getFollowers || []
                if (followerData && followerData?.length > 0) {
                    setFollowers([...prev, ...followerData]);
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
        <View style={styles.container2}>
            {loading && (
                <View
                    style={
                        followers?.length > 0
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
            {!loading && followers && followers.length === 0 ? (
                <LottieView source={lottie.empty} autoPlay loop style={styles.lottie}/>
            ) : (
                <FlatList
                    style={{flex: 1, width: theme.width}}
                    contentContainerStyle={{paddingBottom: 10}}
                    data={followers}
                    renderItem={item => {
                        return (
                            <Follower
                                follower={item}
                                user={user}
                                profileId={profileId}
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
                                let a = followers[followers.length - 1].uid;
                                fetchFollowers(followers, a);
                            }
                        } catch (e) {
                        }
                    }}
                />
            )}
        </View>
    );
}

export default FollowerList;
