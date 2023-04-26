/* eslint-disable react-hooks/exhaustive-deps,react-native/no-inline-styles */
// noinspection BadExpressionStatementJS

import {Keyboard, View, VirtualizedList} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import logger from '../../../lib/logger';
import ClipBubble from './clipBubble';
import {queries} from 'schema';
import {useClip} from 'context/ClipContext';
import apolloLib from '../../../lib/apolloLib';
import {getCacheClips} from './coSpaceHelper';
import {useSession} from 'context/SessionContext';
import {clipTypes} from 'utilities/constant';
import {ContentLoader, MiniLoader, ProgressLoader, ScreenLoader} from '../../../system/ui/components';
import database from "@react-native-firebase/database";
import {clipContentType} from "../../../utilities/constant";
import PollViewer from "../../../components/poll/PollViewer";
import TempMessage from "./TempMessage";
import NetInfo from "@react-native-community/netinfo";
import {useIsFocused} from "@react-navigation/native";
import AlertPopup from '../../components/utility/alertPopup';
import {useDebounce} from "../../../utilities/helper";

export default function CoSpaceClipList({
                                            spaceInfo,
                                            threading,
                                            disabled = false,
                                            blocked = false,
                                            visible = true,
                                            isTemp = false,
                                            redirectToClip = () => {
                                            },
                                            newClipAdded = false,
                                            setNewClipAdded = false
                                        }) {
    const session = useSession();
    const listRef = useRef();
    const {user} = session;
    const {clipData, mapClip, firstIndex, manageClipStatus} = useClip();
    const isFocused = useIsFocused();
    const [state, setState] = useState({loading: false, loadingHistory: false, isHistory: true, emptyList: isTemp})
    const {loading, isHistory, emptyList, loadingHistory} = state


    const [alertVisibility, setAlertVisibility] = useState(false);
    const [alertCancellable, setAlertCancellable] = useState(true);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertButtons, setAlertButtons] = useState([]);
    const [alertType, setAlertType] = useState('');
    const {debounce} = useDebounce()
    const scroller = async () => {
        try {
            listRef?.current?.scrollToIndex({
                index: 0,
                viewOffset: 10,
                viewPosition: 0,
                animated: false,
            });
            listRef.current?.scrollToOffset({offset: 0});
            setNewClipAdded(false)
        } catch {
        }
    }
    useEffect(() => {
        if (newClipAdded === true)
            scroller().then()
    }, [newClipAdded])

    useEffect(() => {
        if (isFocused) {
            const unsubscribe = NetInfo.addEventListener(state => {
                if ((state.isConnected && state.isInternetReachable) === false) {
                    mapClip(clipData, false, true)
                }
            });
            return () => unsubscribe();
        }
    }, [isFocused]);


    useEffect(() => {
        async function getCache() {
            await getCacheClips(spaceInfo.spaceType, spaceInfo.spaceId, user)
                .then(clips => mapClip(clips, false, true))
                .catch(logger.e);

        }

        const clipCache = () => getCache();
        const clipFetch = () => fetchMore();

        const ref = database().ref(`/${spaceInfo.spaceType}/${spaceInfo.spaceId}`);
        ref.off('child_added');
        ref.off('child_changed');
        ref.off('child_removed');
        ref
            .orderByChild('createdOn/_seconds')
            .limitToLast(1)
            .on('child_added', snapshot => {
                if (snapshot.val() && !loading) {
                    fetchMore().then();
                }
            });

        ref.on('child_changed', handleClipStatus);
        ref.on('child_removed', handleClipRemoved);

        return () => {
            clipCache();
            clipFetch();
            ref.off('child_added');
            ref.off('child_removed');
            ref.off('child_changed');
        };
    }, []);

    const handleClipRemoved = snapshot => {
        const clip = snapshot.val();
        if (clip) {
            manageClipStatus(
                spaceInfo.spaceId,
                clip.id,
                false,
                true,
                false,
                false,
            );
        }
    }

    const handleClipStatus = snapshot => {
        const clip = snapshot.val();
        if (clip && (clip.isBlocked || clip.isDeleted || clip.isArchived || clip.isReported)) {
            manageClipStatus(
                spaceInfo.spaceId,
                clip.id,
                clip?.isBlocked || false,
                clip?.isDeleted || false,
                clip?.isArchived || false,
                clip?.isReported || false,
            );
        }
    };
    const clearAlert = () => {
        setAlertVisibility(false)
        setAlertCancellable(true)
        setAlertMessage('')
        setAlertType('')
        setAlertButtons([])
    }
    const fetchMore = async () => {
        if (!loading) {
            setState(s => ({...s, loading: true}))
            await apolloLib.client(session)
                .query({
                    fetchPolicy: 'no-cache',
                    query:
                        spaceInfo.spaceType === clipTypes.announcement
                            ? queries.anClips
                            : queries.clips,
                    variables: {
                        bid: spaceInfo.spaceId,
                        uid: user.uid,
                        startAt: '',
                        limit: 15,
                        order: 'desc',
                    },
                })
                .then(async ({data}) => {
                    const clips =
                        spaceInfo.spaceType === clipTypes.announcement
                            ? data.anClips
                            : data.clips;
                    if (Array.isArray(clips)) {
                        if (clips.length > 0) {
                            setState(s => ({...s, loading: false, emptyList: false}))
                            await mapClip(clips, false,);
                        } else {
                            setState(s => ({...s, loading: false, emptyList: true}))
                        }
                    } else setState(s => ({...s, loading: false, emptyList: true}))
                })
                .catch(() => {
                    setState(s => ({...s, loading: false, emptyList: false}))
                });
        }
    };
    const fetchHistory = () => {

        if (!loadingHistory && isHistory && clipData.length >= 10) {
            setState(s => ({...s, loadingHistory: true}))
            apolloLib.client(session)
                .query({
                    fetchPolicy: 'no-cache',
                    query:
                        spaceInfo.spaceType === clipTypes.announcement
                            ? queries.anClips
                            : queries.clips,
                    variables: {
                        bid: spaceInfo.spaceId,
                        uid: user.uid,
                        //startAt: notify.id ? notify.id : firstIndex,
                        startAt: firstIndex,
                        limit: 15,
                        order: 'desc',
                    },
                })
                .then(async ({data}) => {
                    const clips =
                        spaceInfo.spaceType === clipTypes.announcement
                            ? data.anClips
                            : data.clips;
                    if (Array.isArray(clips) && clips.length > 0) {
                        setState(s => ({...s, loadingHistory: false}))
                        await mapClip(clips, true);
                    } else {
                        setState(s => ({...s, loadingHistory: false, isHistory: false}))
                    }
                })
                .catch(() => {
                    setState(s => ({...s, loadingHistory: false}))
                });
        }

    };

    const clipRender = useCallback(
        ({item, index}) => {
            if (item?.clipContentType === clipContentType.poll) {
                return <PollViewer item={item} spaceInfo={spaceInfo} index={index}
                                   isViewer={item.uid ? item.uid !== user.uid : false}/>
            } else return (
                <ClipBubble
                    index={index}
                    item={item}
                    setAlertVisibility={setAlertVisibility}
                    setAlertCancellable={setAlertCancellable}
                    setAlertMessage={setAlertMessage}
                    setAlertButtons={setAlertButtons}
                    setAlertType={setAlertType}
                    clearAlert={clearAlert}
                    viewer={item.uid ? item.uid !== user.uid : false}
                    spaceInfo={spaceInfo}
                    threading={threading}
                    setNotify={() => {
                        redirectToClip(item.parentThread.id)
                    }}
                    disableAction={disabled}
                    blockAction={blocked}
                />)
        },
        [clipData],
    );

    if (loading && clipData.length === 0) {
        return (
            <View style={{width: '100%', height: '100%'}}>
                <ProgressLoader visible={true}/>
            </View>
        );
    }

    const onScrollFailed = info => {
        if (listRef.current) {
            const offset = info.index === 0 ? 0 : info.averageItemLength * info.index;
            listRef.current?.scrollToOffset({offset});
            setTimeout(() => {
                try {
                    listRef?.current?.scrollToIndex({
                        index: info.index,
                        viewOffset: 10,
                        viewPosition: 0,
                        animated: true,
                    });
                } catch {
                }
            }, 100);
        }
    }

    return (
        <View style={[{flex: 1}, !visible && {display: 'none'}]} onTouchStart={() => {
            if (!alertVisibility)
                Keyboard.dismiss()
        }}>
            <TempMessage isTemp={isTemp} isEmpty={emptyList} />
            {loadingHistory === true && <MiniLoader visible={loadingHistory}/>}
            {clipData.length > 0 &&
            <VirtualizedList
                ref={listRef}
                data={clipData}
                getItemCount={() => clipData.length}
                getItem={(data, index) => data[index]}
                renderItem={clipRender}
                keyExtractor={item => item.id}
                inverted={true}
                scrollEnabled={true}
                initialNumToRender={10}
                onEndReachedThreshold={5}
                renderToHardwareTextureAndroid={true}
                shouldRasterizeIOS={true}
                decelerationRate={"normal"}
                removeClippedSubviews={true}
                extraData={clipData.length}
                updateCellsBatchingPeriod={150}
                onEndReached={() => debounce(fetchHistory)}
                keyboardShouldPersistTaps="always"
                keyboardDismissMode="none"
                initialScrollIndex={0}
                windowSize={10}
                onScrollToIndexFailed={onScrollFailed}
            />
            }
            {
                alertVisibility &&
                <AlertPopup buttons={alertButtons} message={alertMessage} type={alertType} visibility={alertVisibility}
                            onCancel={clearAlert} cancellable={alertCancellable}/>
            }
        </View>
    );
}
