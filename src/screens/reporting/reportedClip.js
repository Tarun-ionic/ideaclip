/* eslint-disable react-hooks/exhaustive-deps,react-native/no-inline-styles */
import React, {useCallback, useEffect, useState} from 'react';
import {useSession} from 'context/SessionContext';
import {SafeScreenView} from 'index';
import {useBackHandler} from 'utilities/helper';
import {useNavigation, useRoute} from '@react-navigation/native';
import {FlatList, Text, View} from 'react-native';
import {useTheme} from 'context/ThemeContext';
import ClipStyles from 'system/styles/clipStyles';
import apolloLib from '../../lib/apolloLib';
import {mutations, queries} from 'schema';
import {Subheading} from 'react-native-paper';
import {strings} from 'constant/strings';
import UserInfo from 'screens/components/toolbar/userInfo';
import TextViewer from '../components/utility/textViewer';
import Toast from 'react-native-simple-toast';
import {useAlert} from 'context/AlertContext';
import logger from '../../lib/logger';
import PostView from '../co_space/components/postView';
import {clipTypes} from '../../utilities/constant';
import AppBar from '../components/toolbar/appBar';
import scale from '../../utilities/scale';
import {LineView, ProgressLoader} from '../../system/ui/components';

export default function ReportedClip() {
    const session = useSession();
    const {user, organization} = session;
    const navigation = useNavigation();
    const routes = useRoute();
    const alert = useAlert();
    const {clip, spaceType} = routes.params;

    const {theme, width} = useTheme();
    const {colors} = theme;
    const styles = ClipStyles(theme, width);
    const [state, setState] = useState({reportedClip: [], isLoading: true});

    useEffect(() => {
        getReportedClips();
    }, []);

    useBackHandler(() => {
        onBackPress();
        return true;
    }, []);

    const onBackPress = () => {
        navigation.goBack(null);
    };

    const getReportedClips = () => {
        setState(pre => ({...pre, isLoading: true}));
        apolloLib.client(session)
            .query({
                fetchPolicy: 'no-cache',
                query:
                    spaceType === clipTypes.announcement
                        ? queries.anClipReports
                        : queries.clipReports,
                variables: {
                    clipId: clip.id,
                },
            })
            .then(({data}) => {
                const {clipReports, anClipReports} = data;
                if (clipReports) {
                    setState({reportedClip: clipReports, isLoading: false});
                } else if (anClipReports) {
                    setState({reportedClip: anClipReports, isLoading: false});
                } else {
                    setState(pre => ({...pre, isLoading: false}));
                }
            })
            .catch(() => {
                setState(pre => ({...pre, isLoading: false}));
            });
    };

    const initRemove = () => {
        alert({
            message: `${strings.remove_reported_clip_message}${
                spaceType === clipTypes.announcement ? 'News & Asks space' : 'Co-space'
            }?`,
            buttons: [
                {label: strings.cancel},
                {
                    label: strings.ok,
                    callback: () => {
                        removeClip();
                    },
                },
            ],
        });
    };

    // remove clip
    const removeClip = () => {
        const variables = {
            uid: organization.uid,
            isUser: false,
            clipId: clip.id,
            isBlocked: false,
            isDeleted: true,
        };
        apolloLib.client(session)
            .mutate({
                mutation:
                    spaceType === clipTypes.announcement
                        ? mutations.anClipBlock
                        : mutations.clipBlock,
                variables,
            })
            .then(({data, error}) => {
                if (error) {
                    Toast.show(strings.clip_remove_failed);
                } else {
                    Toast.show(strings.clip_remove_success);
                    onBackPress();
                }
                logger.i('data', data);
            })
            .catch(() => {
                Toast.show(strings.clip_remove_failed);
            });
    };

    const actionMenu = [
        {
            label: `Remove from ${
                spaceType === clipTypes.announcement
                    ? 'the News & Asks'
                    : 'the Co-space'
            }`,
            callback: initRemove,
        },
    ];

    const ListHeaderComponent = useCallback(() => {
        return (
            <View>
                <PostView clip={clip} dark/>
                <View style={{width: '95%', alignSelf: 'center'}}>
                    <Text style={styles.subHeading2}>{strings.reporter_list}</Text>
                    <LineView width={'100%'} spacing={5}/>
                </View>
            </View>
        );
    }, [clip]);

    const listItems = useCallback(({item}) => {
        const {userDetails, reason, updatedOn} = item;
        return (
            <View style={[styles.container, styles.reportMessage]}>
                <UserInfo
                    user={userDetails}
                    time={updatedOn}
                    onPress={() => {
                        navigation.push('PersonalSpace', {
                            user,
                            profile: {...userDetails},
                            goBack: true,
                        });
                    }}
                />
                <TextViewer
                    text={reason}
                    viewer={false}
                    textStyle={{fontSize: scale.font.l, color: colors.textPrimaryDark}}
                />
            </View>
        );
    }, []);

    const ListEmptyComponent = useCallback(() => {
        if (state.isLoading) {
            return <ProgressLoader visible={state.isLoading}/>;
        } else {
            return (
                <Subheading
                    style={{
                        alignSelf: 'center',
                        padding: 10,
                        color: colors.textPrimaryDark,
                    }}>
                    Reporter details not found
                </Subheading>
            );
        }
    }, [state.isLoading]);

    return (
        <SafeScreenView translucent>
            <AppBar
                title={
                    spaceType === clipTypes.announcement
                        ? 'Reported News & Asks Clips'
                        : 'Reported Co-space Clips'
                }
                onBackPress={onBackPress}
                menuItems={actionMenu}
            />
            <FlatList
                contentContainerStyle={styles.containerStyle}
                ListEmptyComponent={ListEmptyComponent}
                ListHeaderComponent={ListHeaderComponent}
                data={state.reportedClip}
                renderItem={listItems}
                keyExtractor={item => item.id}
                scrollEnabled={true}
                initialNumToRender={5}
                maxToRenderPerBatch={10}
                windowSize={10}
                removeClippedSubviews={true}
                updateCellsBatchingPeriod={100}
                onEndReachedThreshold={0.5}
            />
        </SafeScreenView>
    );
}
