/* eslint-disable react-hooks/exhaustive-deps,react-native/no-inline-styles */
// noinspection BadExpressionStatementJS

import {Image, Keyboard, Pressable, View} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import ClipBubble from './clipBubble';
import {queries} from 'schema';
import {useClip} from 'context/ClipContext';
import apolloLib from '../../../lib/apolloLib';
import {useSession} from 'context/SessionContext';
import {clipTypes} from 'utilities/constant';
import {ProgressLoader} from '../../../system/ui/components';
import {FlatList} from 'react-native-bidirectional-infinite-scroll';
import {icons} from '../../../utilities/assets';
import sortClips, {cacheClips, clearCacheClips, getCacheClips} from "./coSpaceHelper";
import {clipContentType} from "../../../utilities/constant";
import PollViewer from "../../../components/poll/PollViewer";
import AlertPopup from "../../components/utility/alertPopup";
import TempMessage from "./TempMessage";

export default function CoSpaceRediectView({
                                                isTemp=false,
                                               spaceInfo,
                                               threading,
                                               disabled = false,
                                               blocked = false,
                                               initClip = {},
                                               viewLatest = () => {
                                               },
                                               redirectToClip = () => {
                                               },
                                           }) {
    const session = useSession();
    const {user} = session;
    const {clipData, mapClip} = useClip();
    const [state, setState] = useState({loading: false, firstClip: false, clips: []})
    const [enableScroll, setEnableScroll] = useState(false)
    const reference = useRef();

    const [alertVisibility, setAlertVisibility] = useState(false);
    const [alertCancellable, setAlertCancellable] = useState(true);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertButtons, setAlertButtons] = useState([]);
    const [alertType, setAlertType] = useState('');

    const clearAlert = () => {
        setAlertVisibility(false)
        setAlertCancellable(true)
        setAlertMessage('')
        setAlertType('')
        setAlertButtons([])
    }
    const getTopClips = () => {
        return new Promise(resolve => {
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
                        startAt: initClip?.id ?? '',
                        limit: 5,
                        order: 'desc',
                    },
                })
                .then(({data}) => {
                    const _clips =
                        spaceInfo.spaceType === clipTypes.announcement
                            ? data.anClips
                            : data.clips;
                    if (Array.isArray(_clips) && _clips.length > 0) resolve(_clips)
                    else resolve([])

                }).catch(() => {
                resolve([])
            })

        })
    }

    const getBottomClips = () => {
        return new Promise(resolve => {
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
                        startAt: initClip?.id ?? '',
                        limit: 5,
                        order: 'asc',
                    },
                })
                .then(({data}) => {
                    const _clips =
                        spaceInfo.spaceType === clipTypes.announcement
                            ? data.anClips
                            : data.clips;
                    if (Array.isArray(_clips) && _clips.length > 0) resolve(_clips)
                    else resolve([])
                }).catch(() => {
                resolve([])
            });

        })
    }


    const getRedirectClips = async () => {
        await clearCacheClips(spaceInfo.spaceType + initClip?.id, spaceInfo.spaceId, user)
        let _clips = await getTopClips();
        if (_clips.length > 0) {
            _clips = await sortClips([initClip], _clips, true)
        } else {
            const _clips2 = await getBottomClips()
            _clips = await sortClips([initClip], _clips2, false)
        }
        setTimeout(async () => {
            const index = _clips.findIndex(_clip => {
                return _clip.id === initClip.id;
            });
            await saveData({clips: _clips, firstClip: true, loading: false, scrollIndex: index < 0 ? 0 : index})
        }, 100)
    }

    useEffect(() => {
        (async () => getRedirectClips())()
        setState(s => ({clips: s.clips, firstClip: false, loading: true}))
    }, [initClip])

    useEffect(() => {
        if (state.firstClip === true) {
            reference?.current?.scrollToIndex({index: state.scrollIndex, animated: false});
            setState(s => ({...s, firstClip: false}));
        }
    }, [state.firstClip]);


    const paginateUp = () => {
        return new Promise((resolve) => {
            if (!enableScroll) resolve(false)
            else {
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
                            startAt: state.clips[state.clips.length - 1]?.id ?? '',
                            limit: 5,
                            order: 'desc',
                        },
                    })
                    .then(async ({data}) => {
                        const newClips =
                            spaceInfo.spaceType === clipTypes.announcement
                                ? data.anClips
                                : data.clips;
                        if (Array.isArray(newClips) && newClips.length > 0) {
                            const _clips = await sortClips(state.clips, newClips, true)
                            await saveData({clips:_clips})
                            resolve(true)
                        }
                    }).catch(() => {
                    resolve(true)
                })
            }
        })
    };

    const paginateDown = () => {
        return new Promise((resolve) => {
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
                        startAt: state.clips[0]?.id ?? '',
                        limit: 5,
                        order: 'asc',
                    },
                })
                .then(async ({data}) => {
                    const newClips =
                        spaceInfo.spaceType === clipTypes.announcement
                            ? data.anClips?.reverse()
                            : data.clips?.reverse();
                    if (Array.isArray(newClips) && newClips.length > 0) {
                        const _clips = await sortClips(state.clips, newClips, false)
                        await saveData({clips:_clips})
                    }
                    resolve(false)
                }).catch(() => {
                resolve(true)
            })
        });
    };

    const saveData = async (params) => {
        if(Array.isArray(params?.clips)) {
            await cacheClips(
                spaceInfo.spaceType + initClip?.id,
                spaceInfo.spaceId,
                params?.clips,
                user,
            );
        }
        setState(s=>({...s,...params}))
    }

    const updateClip =   (clip) => {
        getCacheClips(spaceInfo.spaceType+initClip?.id, spaceInfo.spaceId, user).then(async (clips) => {
            const index = clips.findIndex(_clip => _clip?.id === clip?.id);
            if (index >= 0) {
                clips[index] = clip;
            }
            await cacheClips(
                spaceInfo.spaceType + initClip?.id,
                spaceInfo.spaceId,
                clips,
                user,
            );
            setState(s => ({...s, clips: clips}))
        })
    };

    const clipRedirectRender =         ({item, index}) => {
            if (item?.clipContentType === clipContentType.poll) {
                return <PollViewer item={item} spaceInfo={spaceInfo} index={index}
                                   isViewer={item.uid ? item.uid !== user.uid : false}/>
            } else return (
                <ClipBubble
                    index={index}
                    item={item}
                    viewer={item.uid ? item.uid !== user.uid : false}
                    spaceInfo={spaceInfo}
                    threading={threading}
                    setNotify={() => {
                        redirectToClip(item.parentThread.id)
                    }}
                    disableAction={disabled}
                    blockAction={blocked}
                    updateStatus={updateClip}
                    setAlertVisibility={setAlertVisibility}
                    setAlertCancellable={setAlertCancellable}
                    setAlertMessage={setAlertMessage}
                    setAlertButtons={setAlertButtons}
                    setAlertType={setAlertType}
                    clearAlert={clearAlert}
                />)
        }

    return (
        <View style={{flex: 1}} onTouchStart={() => Keyboard.dismiss()}>
            <TempMessage isTemp={isTemp} isEmpty={false}/>
            {state.loading && (
                <ProgressLoader visible={true}/>
            )}

            <FlatList
                ref={reference}
                data={state.clips}
                keyExtractor={item => item.id}
                renderItem={clipRedirectRender}
                onTouchStart={() => {
                    !enableScroll && setEnableScroll(true)
                }}
                inverted
                onStartReached={paginateDown} // required, should return a promise
                onEndReached={paginateUp} // required, should return a promise
                onEndReachedThreshold={0}
                showDefaultLoadingIndicators={true} // optional
                activityIndicatorColor={'black'} // optional
                onScrollToIndexFailed={info => {
                    if (reference.current) {
                        const offset = info.averageItemLength * info.index;
                        reference.current?.scrollToOffset({offset, animated: false});
                        setTimeout(() => {
                            reference?.current?.scrollToIndex({index: info.index, animated: false,});
                        }, 500);
                    }
                }}
            />
            <Pressable
                style={{position: 'absolute', zIndex: 100, right: 10, bottom: 10}}
                onPress={() => {
                    viewLatest();
                }}>
                <View style={{borderRadius: 20, flex: 1}}>
                    <Image
                        source={icons.downArrow}
                        style={{margin: 10, alignSelf: 'center'}}
                        width={30}
                        height={30}
                    />
                </View>
            </Pressable>
            {
                alertVisibility &&
                <AlertPopup buttons={alertButtons} message={alertMessage} type={alertType} visibility={alertVisibility}
                            onCancel={clearAlert} cancellable={alertCancellable}/>
            }
        </View>
    );
}
