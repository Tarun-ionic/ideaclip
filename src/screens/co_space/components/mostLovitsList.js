/* eslint-disable react-hooks/exhaustive-deps,react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {FlatList, ScrollView, StyleSheet, Text, View} from 'react-native';
import apolloLib from '../../../lib/apolloLib';
import {queries} from 'schema';
import {ClipProvider} from 'context/ClipContext';
import {useSession} from 'context/SessionContext';
import {clipTypes, dateFilter, userType} from 'utilities/constant';
import MostLovitsClip from './mostLovitsClip';
import ClipBubble from './clipBubble';
import {lottie} from 'utilities/assets';
import LottieView from 'lottie-react-native';
import {useIsFocused} from '@react-navigation/native';
import {useTheme} from '../../../context/ThemeContext'
import AlertPopup from '../../components/utility/alertPopup';
import Toast from "react-native-simple-toast";
import {strings} from "../../../constant/strings";

function MostLovitsList({
                            spaceInfo,
                            userNav,
                            messengerView,
                            uid = '',
                            bid = '',
                            color = '#af00a3',
                            following = false,
                            isCollab = false,
                            flip = false,

                        }) {
    const limit = 20;
    const session = useSession();
    const {theme, height} = useTheme();
    const styles = lovitsStyle(theme, height);
    const {user} = session;
    const [state, setState] = useState({
        posts: [],
        originalPosts: [],
        loader: true,
    });
    const [clicked, setClicked] = useState(false);
    const isFocused = useIsFocused();
    const [alertVisibility, setAlertVisibility] = useState(false);
    const [alertCancellable, setAlertCancellable] = useState(true);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertButtons, setAlertButtons] = useState([]);
    const [alertType, setAlertType] = useState('');
    useEffect(() => {
        if (isFocused) {
            setClicked(false);
            fetch();
        }
    }, [spaceInfo.spaceId, isFocused]);

    const manageClip = async (clips, isHistory) => {
        const _clips = isHistory
            ? [...state.originalPosts, ...clips.filter(clip => clip && clip.id)]
            : clips.filter(clip => clip && clip.id);
        const filteredClips = _clips.filter(
            clip => !clip.isBlocked && !clip.isDeleted && !clip?.isReported && !clip?.isArchived,
        );
        filteredClips.sort((a, b) => a.reactionCount === b.reactionCount ? b.publishedOn - a.publishedOn : b.reactionCount - a.reactionCount)

        setState({posts: filteredClips, originalPosts: _clips, loader: false});
    };

    //fetch posts
    const fetch = (page = 0) => {
        let clipType = '';
        if (spaceInfo?.spaceType === clipTypes.clip) {
            clipType = 'clip';
        } else if (spaceInfo?.spaceType === clipTypes.announcement) {
            clipType = 'anClip';
        }
        if (page === 0 && state.posts.length === 0) {
            setState(() => ({
                posts: [],
                loader: true,
            }));
        } else {
            setState(s => ({...s, loader: true}));
        }

        apolloLib.client(session)
            .query({
                fetchPolicy: 'no-cache',
                query: queries.lovitz,
                variables: {
                    rid: bid,
                    currentUser: user.uid,
                    keyword: '',
                    limit,
                    page,
                    uid,
                    clipType,
                    loveitsSort: true,
                    dateFilter: dateFilter,
                },
            })
            .then(({data}) => {
                const {allClipSearch} = data;
                if (Array.isArray(allClipSearch) && allClipSearch.length > 0) {
                    manageClip(allClipSearch, page !== 0).then();
                } else {
                    if (page !== 0)
                        setState(s => ({...s, loader: false, error: false}));
                    else
                        setState(() => ({
                            posts: [],
                            loader: false,
                        }));
                }
            })
            .catch(() => {
                setState(s => ({...s, loader: false, error: true}));
            });
    };

    const removeClip = ({index, isHide = false}) => {
        let _posts = [...state.posts];
        let post = state.posts[index];
        let _originalClips = [...state.originalPosts];
        let originalClipIndex = _originalClips.indexOf(post);
        _posts.splice(index, 1);
        _originalClips[originalClipIndex].isDeleted = true;
        setState(s => ({...s, posts: _posts, originalPosts: _originalClips}));
        if (isHide) Toast.show(strings.hidingCompleted)
    };

    const clipRender = ({item, index}) => {
        if (item.reactionCount < 1) {
            return null;
        } else if (messengerView) {
            return (
                <ClipBubble
                    key={index}
                    color={color}
                    item={item}
                    viewer={true}
                    disableAction
                    spaceInfo={spaceInfo}
                    flip={true}
                />
            );
        } else {
            return (
                <MostLovitsClip
                    key={index}
                    color={color}
                    clip={item}
                    index={index}
                    userNav={userNav}
                    clicked={clicked}
                    setClicked={() => {
                        setClicked(true);
                    }}
                    style={{marginHorizontal: 25, marginTop: 5}}
                    menu={isCollab && !flip}
                    removeClip={removeClip}
                    setAlertVisibility={setAlertVisibility}
                    setAlertCancellable={setAlertCancellable}
                    setAlertMessage={setAlertMessage}
                    setAlertButtons={setAlertButtons}
                    setAlertType={setAlertType}
                    clearAlert={clearAlert}
                />
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
    const generalUser =
        'Share your #fan insights with your #favourite brands in #COLLAB SPACE by clicking the #Rocket icon below. Your clips will then be shown here in the order of most lovitz you received from other #Collabers.';
    const other =
        '#Fan insights shared by your local ambassadors in your #IDEACLIP Co-space or #News & Asks Co-space will be listed here in the order of most lovitz received from your Collabers. You can explore #Collab SPACE by clicking the #Rocket icon below.';
    const emptyClipText =
        user.userType === userType.general ? generalUser : other;

    const emptyContent = () => {
        if (!state.loader && state.posts.length === 0) {
            if (messengerView) {
                return (
                    <Text style={styles.noItemMessage}>
                        {state.error === true
                            ? 'Network error. Please try again later.'
                            : 'Clips with most lovitz not found'}
                    </Text>
                );
            } else {
                return (
                    <MostLovitsClip
                        color={color}
                        clip={{text: emptyClipText}}
                        empty={true}
                        userNav={userNav}
                        disabled={true}
                        style={{marginHorizontal: 25, marginTop: 5}}
                        type={userType.general}

                    />
                );
            }
        } else {
            return null;
        }
    };

    return (
        <ClipProvider>
            {state.loader && state.posts.length === 0 && (
                <LottieView
                    source={lottie.splash}
                    loop
                    autoPlay
                    style={{height: 75, width: 75, alignSelf: 'center'}}
                />
            )}
            <View style={styles.listView}>
                {flip &&
                <FlatList
                    style={flip ? styles.flipList : styles.list}
                    data={state.posts}
                    renderItem={clipRender}
                    ListEmptyComponent={emptyContent}
                    keyExtractor={item => item.id}
                    scrollEnabled={
                        isCollab ? true : spaceInfo.uid === user.uid ? true : following
                    }
                    nestedScrollEnabled={true}
                    onEndReachedThreshold={0}
                    onEndReached={() => {
                        if (state?.originalPosts && state?.originalPosts?.length >= limit && !state.loader) {
                            fetch(Math.round(state.originalPosts.length / limit));
                        }
                    }}
                />
                }
                {!flip &&
                <ScrollView
                    style={styles.list}
                    scrollEnabled={
                        isCollab ? true : spaceInfo.uid === user.uid ? true : following
                    }
                    nestedScrollEnabled={true}
                    onEndReachedThreshold={0}
                    onMomentumScrollEnd={(event) => {
                        const {layoutMeasurement, contentOffset, contentSize} = event.nativeEvent
                        if(layoutMeasurement.height + contentOffset.y >= contentSize.height - layoutMeasurement.height){
                            if (state?.originalPosts && state?.originalPosts.length >= limit && !state.loader) {
                                fetch(Math.round(state.originalPosts.length / limit));
                            }
                        }
                    }}>
                    {state.posts?.length > 0 ? state.posts?.map((item, index) => clipRender({
                        item,
                        index
                    })) : emptyContent()}
                </ScrollView>
                }
                {state.loader && state.posts.length !== 0 && (
                    <View style={styles.loaderStyle}>
                        <LottieView
                            source={lottie.loader}
                            loop
                            autoPlay
                            style={{height: 25, width: 25}}
                        />
                    </View>
                )}
                {
                    alertVisibility &&
                    <AlertPopup buttons={alertButtons} message={alertMessage} type={alertType}
                                visibility={alertVisibility}
                                onCancel={clearAlert} cancellable={alertCancellable}/>
                }
            </View>
        </ClipProvider>
    );
}

const lovitsStyle = ({colors}, height) =>
    StyleSheet.create({
        listView: {
            flex: 1,
            paddingTop: 5,
            backgroundColor: 'transparent',
        },
        loaderStyle: {
            position: 'absolute',
            bottom: 15,
            alignSelf: 'center',
            backgroundColor: colors.surfaceDark,
            borderRadius: 25,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 3,
        },
        list: {flex: 1, maxHeight: 400, marginBottom: 5},
        flipList: {flex: 1, height},
        noItemMessage: {
            flex: 1,
            color: colors.textPrimaryDark,
            padding: 15,
            textAlign: 'center',
        },
    });
export default React.memo(MostLovitsList);
