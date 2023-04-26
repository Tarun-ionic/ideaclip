/* eslint-disable react-hooks/exhaustive-deps,react-native/no-inline-styles */
// noinspection JSUnresolvedFunction

import React, {useCallback, useEffect, useState} from 'react';

import {useSession} from 'context/SessionContext';
import {SafeScreenView} from 'index';
import {useBackHandler} from 'utilities/helper';
import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import {ClipProvider} from 'context/ClipContext';
import {FlatList, View} from 'react-native';
import {useTheme} from 'context/ThemeContext';
import ClipStyles from 'system/styles/clipStyles';
import apolloLib from '../../lib/apolloLib';
import {queries} from 'schema';
import PostView from '../co_space/components/postView';
import {Subheading} from 'react-native-paper';
import {logger} from '../../index';
import {clipTypes} from '../../utilities/constant';
import AppBar from '../components/toolbar/appBar';
import {ProgressLoader} from '../../system/ui/components';
import {navigationReset} from "../../utilities/helper";

export default function Reported() {
    const routes = useRoute();
    const {spaceType} = routes.params;
    const session = useSession();
    const {user} = session;
    const navigation = useNavigation();
    const {theme, width} = useTheme();
    const {colors} = theme;
    const styles = ClipStyles(theme, width);
    const isFocused = useIsFocused();
    const [state, setState] = useState({clips: [], isLoading: true});

    useEffect(() => {
        if (isFocused) {
            getReportedClips();
        }
    }, [isFocused]);

    useBackHandler(() => {
        onBackPress();
        return true;
    }, []);

    const onBackPress = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigationReset(navigation, 'PersonalSpace', {goBack: false, user});
        }
    };

    const manageClip = async (_clips, isHistory) => {
        let newClips = isHistory ? [...state.clips, ..._clips] : [..._clips];
        setState(prev => ({...prev, clips: newClips, isLoading: false}));
    };

    const getReportedClips = (isHistory = false) => {
        let startAt = '';
        if (isHistory) {
            startAt = state.clips[state.clips?.length - 1]?.id;
            setState(pre => ({...pre, isLoading: true}));
        } else {
            setState(pre => ({...pre, clips: [], isLoading: true}));
        }

        apolloLib.client(session)
            .query({
                fetchPolicy: 'no-cache',
                query:
                    spaceType === clipTypes.announcement
                        ? queries.anReportedClips
                        : queries.reportedClips,
                variables: {
                    startAt: startAt,
                    bid: user.uid,
                    limit: 10,
                    order: 'desc',
                },
            })
            .then(({data}) => {
                const {reportedClips, anReportedClips} = data;
                if (Array.isArray(reportedClips)) {
                    manageClip(reportedClips, isHistory).then();
                } else if (Array.isArray(anReportedClips)) {
                    manageClip(anReportedClips, isHistory).then();
                }
            })
            .catch(error => {
                logger.e('reporting', 'getReportedClips', error);
            });
    };

    const fetchMore = () => {
        if (state.clips?.length >= 10 && !state.isLoading) {
            getReportedClips(true);
        }
    };

    const redirect = item => {
        navigation.push('ReportedClip', {clip: item, spaceType});
    };

    const clipRender = useCallback(
        ({item}) => {
            return <PostView clip={item} onPress={redirect} reported={true}/>;
        },
        [state],
    );

    return (
        <SafeScreenView secondary translucent>
            <View
                style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: colors.surface,
                }}>
                <AppBar
                    title={
                        spaceType === clipTypes.announcement
                            ? 'Reported News & Asks Clips'
                            : 'Reported Co-space Clips'
                    }
                    onBackPress={onBackPress}
                />
                {!state.isLoading && state.clips.length === 0 && (
                    <Subheading
                        style={{
                            alignSelf: 'center',
                            padding: 10,
                            color: colors.textPrimaryDark,
                        }}>
                        No clips found{' '}
                    </Subheading>
                )}
                {state.isLoading && state.clips.length === 0 && (
                    <ProgressLoader
                        visible={state.isLoading && state.clips.length === 0}
                    />
                    // <LottieView source={lottie.common} loop autoPlay autoSize />
                )}
                <ClipProvider>
                    <FlatList
                        contentContainerStyle={styles.containerStyle}
                        data={state.clips}
                        renderItem={clipRender}
                        keyExtractor={item => item.id}
                        scrollEnabled={true}
                        initialNumToRender={5}
                        maxToRenderPerBatch={10}
                        windowSize={10}
                        removeClippedSubviews={true}
                        updateCellsBatchingPeriod={100}
                        onEndReachedThreshold={0.5}
                        onEndReached={fetchMore}
                    />
                </ClipProvider>
            </View>
        </SafeScreenView>
    );
}
