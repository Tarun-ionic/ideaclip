/* eslint-disable react-hooks/exhaustive-deps,react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {useLazyQuery} from '@apollo/client';
import {FlatList, View} from 'react-native';
import {lottie} from '../../../index';
import NotifyItem from './notifyItem';
import LottieView from 'lottie-react-native';
import {queries} from '../../../schema';
import {useTheme} from '../../../context/ThemeContext';
import {SearchListStyles} from '../../../system/styles/searchStyle';

function NotifyList({onPress, uid, lovitz = false}) {
    const {theme} = useTheme();
    const styles = SearchListStyles(theme);
    const limit = 20;
    const order = 'desc';
    const [notifications, setNotifications] = useState([]);
    const [execute, {loading, data, fetchMore}] = useLazyQuery(lovitz ? queries.notifyLovitz : queries.notify, {
        fetchPolicy: 'no-cache',
    });
    useEffect(() => {
        if (uid) {
            execute({variables: {uid, startAt: '', limit, order}});
        }
    }, [uid]);

    useEffect(() => {
        if (data && data.notify && data.notify.length > 0) {
            setNotifications(data.notify);
        }
    }, [data]);

    return (
        <View style={styles.container}>
            {!loading && notifications.length === 0 && (
                <LottieView source={lottie.no_notify} autoPlay loop/>
            )}
            <FlatList
                contentContainerStyle={{paddingBottom: 50}}
                data={notifications}
                renderItem={item => {
                    return <NotifyItem notification={item} uid={uid} onPress={onPress} lovitz={lovitz}/>;
                }}
                keyExtractor={(item, index) => {
                    return `${index}`;
                }}
                scrollEnabled={true}
                onEndReachedThreshold={2}
                onEndReached={() => {
                    try {
                        if (notifications && notifications.length >= 20) {
                            fetchMore({
                                variables: {
                                    uid,
                                    startAt: notifications[notifications.length - 1].id,
                                    limit,
                                    order,
                                },
                            }).then(newPage => {
                                setNotifications([...notifications, ...newPage.data.notify]);
                            });
                        }
                    } catch (e) {
                    }
                }}
            />
            {loading ||
            (data && (
                <LottieView
                    source={lottie.loader}
                    autoPlay
                    loop
                    style={styles.lottie_sm}
                />
            ))}
        </View>
    );
}

export default NotifyList;
