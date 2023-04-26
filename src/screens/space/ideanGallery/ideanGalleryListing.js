import React, {useEffect, useRef, useState} from 'react';
import {FlatList, Platform, StyleSheet, Text, View, VirtualizedList} from 'react-native';
import LottieView from 'lottie-react-native';
import {strings} from '../../../constant/strings';
import {useSession} from '../../../context/SessionContext';
import {useTheme} from '../../../context/ThemeContext';
import {lottie} from '../../../utilities/assets';
import scale from '../../../utilities/scale';
import SystemSetting from "react-native-system-setting";
import {useIsFocused} from '@react-navigation/native';
import apolloLib from '../../../lib/apolloLib';
import {mutations, queries} from '../../../schema';
import AttachClipCard from '../components/attachClipCard';
import logger from '../../../lib/logger';
import {pcTypes, viewWidth} from '../../../utilities/constant';
import IdeanGalleryClipView from './ideanGalleryClipView';
import AddPersonalClip from '../components/addPersonalClip';
import {parseTempClip} from './ideanGalleryHelper';
import apiConstant from '../../../constant/apiConstant';
import Toast from 'react-native-simple-toast';
import {onTrigger, useDebounce} from '../../../utilities/helper';
export default function IdeanGalleryList({
                                             profile,
                                             refresh,
                                             isCollab = false,
                                             showCollab = true,
                                             following = false,
                                             filters = {},
                                             locInfo = {lat: '', long: '', location: ''},
                                             attach = false,
                                             dismissFilePicker = () => {
                                             },
                                             navigation,
                                             onNewClip=()=>{}
                                         }) {
    const {theme, width} = useTheme();
    const session = useSession();
    const {user} = session;
    const styles = SpaceStyle(theme, width);
    const focused = useIsFocused();
    const list = useRef();
    const {debounce} = useDebounce()

/////////////////////////////////// States ///////////////////////////////////////////////

    const [loading, setLoading] = useState(true);
    const [customFilter, setCustomFilter] = useState(filters);
    const [personalClipsArray, setPersonalClipsArray] = useState(null);
    const [originalClipsArray, setOriginalClipsArray] = useState(null);

    const [currentlyPlayingIndex, setCurrentlyPlayingIndex] = useState(0);
    const [currentlyPlaying, setCurrentlyPlaying] = useState('');

    const [currentlyPlayingVolume, setCurrentlyPlayingVolume] = useState(0)
    const [createPersonalClip, setCreatePersonalClip] = useState(false)
    const [fetching, setFetching] = useState(false)

// list view reference
    const onIdeanViewRef = React.useRef((viewableItems) => {
        if (viewableItems?.viewableItems?.length > 0) {
            setCurrentlyPlaying(viewableItems?.viewableItems?.length > 1 ? viewableItems.viewableItems[1]?.item?.id : viewableItems.viewableItems[0]?.item?.id || '')
            setCurrentlyPlayingIndex(viewableItems?.viewableItems?.length > 1 ? viewableItems.viewableItems[1]?.index : viewableItems.viewableItems[0].index);
            setCurrentlyPlayingVolume(0);
        }
    })
    const ideanViewConfigRef = React.useRef({viewAreaCoveragePercentThreshold: 70})

/////////////////////////////////// Use effects ///////////////////////////////////////////////

// intiate clip creation
    useEffect(() => {
        if (focused) {
            if (attach === true)
                setCreatePersonalClip(attach)
        } else {
            dismissFilePicker()
        }
    }, [attach])

// add volume listener
    useEffect(() => {

        const volumeListener = SystemSetting.addVolumeListener((data) => {
            setCurrentlyPlayingVolume(data.value)
        });
        return () => {
            SystemSetting.removeListener(volumeListener)
        };
    }, [])
    useEffect(()=>{
        console.log("showcollab ",showCollab)
    },[showCollab])

// set new filter
    useEffect(() => {
        if (JSON.stringify(filters) !== JSON.stringify(customFilter)) setCustomFilter(filters)
    }, [filters])

// fetch data
    useEffect(() => {
        if (user) {
            if (isCollab && Object.keys(customFilter).length > 0) {
                setLoading(true)
                apolloLib.client(session)
                    .query({
                        fetchPolicy: 'no-cache',
                        query: queries.getCollabPersonalClipsFiltered,
                        variables: {
                            uId: user.uid,
                            profileId: profile.uid,
                            page: 0,
                            limit: 20,
                            filters: {
                                ethnicCommunities: customFilter.ethnicCommunity,
                                industries: customFilter.industryList,
                                charities: customFilter.activityList,
                                radius: customFilter.radiusIndicator
                                    ? customFilter?.radius.toString()
                                    : '',
                                lat: customFilter.radiusIndicator ? locInfo.lat.toString() : '',
                                long: customFilter.radiusIndicator ? locInfo.long.toString() : '',
                            },
                        },
                    })
                    .then(({data, error}) => {
                        setLoading(false);
                        const {personalClipsLatestFiltered} = data;
                        if (personalClipsLatestFiltered) {
                            setOriginalClipsArray(personalClipsLatestFiltered);
                            let filteredList = personalClipsLatestFiltered.filter(
                                clip =>
                                    clip &&
                                    !clip.isDeleted &&
                                    !clip.isHidden &&
                                    !clip?.isArchived &&
                                    !(clip?.uid !== user.uid && clip?.type === pcTypes.myDiary)
                            );
                            setPersonalClipsArray(filteredList);
                        }
                        if (error) {
                            logger.e(error);
                        }
                    })
                    .catch(err => {
                        logger.e(err);
                    });
            } else if (!isCollab) {
                setLoading(true);
                apolloLib.client(session)
                    .query({
                        fetchPolicy: 'no-cache',
                        query: queries.getPersonalClips,
                        variables: {
                            uId: user.uid,
                            profileId: profile.uid,
                            showCollab: showCollab,
                            page: 0,
                            limit: 10,
                        },
                    })
                    .then(({data, error}) => {
                        setLoading(false);
                        const {personalClips} = data;
                        if (personalClips && Array.isArray(personalClips)) {
                            setOriginalClipsArray(personalClips);
                            const filteredList = personalClips.filter(
                                clip =>
                                    clip &&
                                    !clip.isDeleted &&
                                    !clip.isHidden &&
                                    !clip?.isArchived &&
                                    !(clip?.uid !== user.uid && clip?.type === pcTypes.myDiary)
                            );
                            setPersonalClipsArray(filteredList);
                        }
                        if (error) {
                            logger.e(error);
                        }
                    })
                    .catch(err => {
                        logger.e(err);
                    });
            }
        }
    }, [user, refresh, showCollab, customFilter])


/////////////////////////////////// functions ///////////////////////////////////////////////

// scroll list to index
    const scrollToIndex = (index = 0) => {
        if (index >= 0 && list?.current) {
            list?.current?.scrollToIndex({
                animated: true,
                index: index,
            });
        }
    }

//change clip data
    const onClipChange = (clip, index) => {
        if (isCollab && clip?.isPrivate) {
            let a = [...personalClipsArray];
            a.splice(index, 1)
            setPersonalClipsArray(a);
            if (currentlyPlaying === clip?.id) {
                if (a?.length > 0) {
                    if (a?.length > index)
                        setCurrentlyPlaying(a[index]?.id)
                    else
                        setCurrentlyPlaying(a[index - 1 >= 0 ? index - 1 : 0]?.id)
                }
            }
        } else {
            let a = [...personalClipsArray];
            a[index] = clip;
            setPersonalClipsArray(a);
        }
    }

// add new clip
    const addTempClip = async (data) => {
        const currentArrayIndex = personalClipsArray?.length > 0 ? personalClipsArray.findIndex(c => c.id === data.id) : -1
        if (currentArrayIndex === -1) {
            if (personalClipsArray?.length > 0)
                scrollToIndex(0)
            let parsedClip = await parseTempClip(data, user)
            parsedClip.uploading = true
            let clips = personalClipsArray?.length > 0 ? [...personalClipsArray] : []
            clips.unshift({...parsedClip})
            setPersonalClipsArray(clips)
            onNewClip()
        }
    }

// delete clip
    const deleteClip = (item, index) => {
        apolloLib.client(session)
            .mutate({
                fetchPolicy: 'no-cache',
                mutation: mutations.deletePersonalClip,
                variables: {
                    id: item.id,
                    uid: user.uid,
                    isDeleted: true,
                },
            })
            .then(({data, error}) => {
                if (data) {
                    let a = [...personalClipsArray];
                    a.splice(index, 1);
                    setPersonalClipsArray(a);
                    if (a?.length >= index) {
                        scrollToIndex(index > 0 ? index - 1 : 0)

                    } else {
                        scrollToIndex(0)
                    }
                    // if(currentlyPlaying == item.id)
                    // 	setCurrentlyPlaying(a[index].id)

                    Toast.show(strings.removingCompleted);
                }
                if (error) {
                    alert('Failed to delete clip. Please try again later.');
                }
            })
            .catch(() => {
                alert('Failed to delete clip. Please try again later.');
            });
    };

//hide clip
    const hideClip = (item, index, callBack) => {
        apolloLib.client(session)
            .mutate({
                fetchPolicy: 'no-cache',
                mutation: mutations.hidePersonalClip,
                variables: {
                    id: user.uid,
                    data: {
                        id: item.id,
                        uid: item.uid,
                        text: item.text,
                    },
                },
            })
            .then(({data, error}) => {
                if (data) {
                    let a = [...personalClipsArray];
                    a.splice(index, 1);
                    setPersonalClipsArray(a);
                    if (!callBack)
                        Toast.show(strings.hidingCompleted);
                }
                onTrigger(callBack, !error);
                if (error) {
                    alert('Failed to hide clip. Please try again later.');
                }
            })
            .catch(() => {
                onTrigger(callBack, false);
                alert('Failed to hide clip. Please try again later.');
            });
    };

//report clip
    const ReportUGC = (item, reason, otherText, index) => {
        const type = apiConstant.spaceTypes.ideanGallery;
        const data = {
            uid: user?.uid,
            clipId: item?.id,
            chatRoomId: '',
            ownerId: item?.uid,
            reason,
            otherText,
            ownerType: item?.userType,
        };
        const variables = {data, type};
        apolloLib.client(session)
            .mutate({
                mutation: mutations.reportUGC,
                variables,
            })
            .then(({data, error, loading}) => {
                if (data) {
                    hideClip(item, index, isSuccess => {
                        isSuccess
                            ? Toast.show(strings.reportingCompleted)
                            : Toast.show(strings.reportingFailed);
                    });
                } else {
                    Toast.show(strings.reportingFailed);
                }
                if (error) {
                    Toast.show(strings.reportingFailed);
                }
            })
            .catch(error => {
                Toast.show(strings.reportingFailed);
            });
    };
/////////////////////////////////// Views ///////////////////////////////////////////////

// clip render
    const renderClips = ({item, index}) => {
        return (
            <IdeanGalleryClipView
                key={index}
                item={item}
                index={index}
                profile={profile}
                onClipChange={onClipChange}
                deleteClip={deleteClip}
                hideClip={hideClip}
                ReportUGC={ReportUGC}
                following={following}
                disabled={
                    isCollab
                        ? false
                        : profile.uid === user.uid
                        ? false
                        : !following
                }
                navigation={navigation}
                isFocused={focused}
                session={session}
                user={user}
                active={index === currentlyPlayingIndex && focused}
                currentlyPlayingVolume={currentlyPlayingVolume}
            />
        )
    }


    const onReachEnd = () =>{
        debounce(fetchClip)
    }

    const fetchClip = () =>{
        try {
            if (fetching) return false
            if (isCollab && Object.keys(customFilter).length > 0) {
                if (originalClipsArray?.length >= 20) {
                    setFetching(true)
                    apolloLib.client(session)
                        .query({
                            fetchPolicy: 'no-cache',
                            query: queries.getCollabPersonalClipsFiltered,
                            variables: {
                                uId: user.uid,
                                profileId: profile.uid,
                                page: parseInt(originalClipsArray.length / 20),
                                limit: 20,
                                filters: {
                                    ethnicCommunities: customFilter.ethnicCommunity,
                                    industries: customFilter.industryList,
                                    charities: customFilter.activityList,
                                    radius: customFilter.radiusIndicator
                                        ? customFilter?.radius.toString()
                                        : '',
                                    lat: customFilter.radiusIndicator ? locInfo.lat.toString() : '',
                                    long: customFilter.radiusIndicator ? locInfo.long.toString() : '',
                                },
                            },
                        })
                        .then(({data, error}) => {
                            setLoading(false);
                            const {personalClipsLatestFiltered} = data;
                            if (personalClipsLatestFiltered) {
                                if(personalClipsLatestFiltered.length === 20)  setFetching(false)
                                setOriginalClipsArray([
                                    ...originalClipsArray,
                                    ...personalClipsLatestFiltered,
                                ]);
                                const filteredList = personalClipsLatestFiltered.filter(
                                    clip =>
                                        clip &&
                                        !clip.isDeleted &&
                                        !clip.isHidden &&
                                        !clip?.isArchived &&
                                        !(clip?.uid !== user.uid && clip?.type === pcTypes.myDiary)
                                );

                                setPersonalClipsArray([
                                    ...personalClipsArray,
                                    ...filteredList,
                                ]);


                            }
                            if (error) {
                                logger.e(error);
                            }
                        })
                        .catch(err => {
                            logger.e(err);
                        });
                } else{
                    setCurrentlyPlaying(personalClipsArray[personalClipsArray?.length - 1]?.id)
                }
            } else if (isCollab) {
                if (originalClipsArray?.length >= 20) {
                    setFetching(true)
                    apolloLib.client(session)
                        .query({
                            fetchPolicy: 'no-cache',
                            query: queries.getCollabPersonalClips,
                            variables: {
                                uId: user.uid,
                                profileId: profile.uid,
                                page: parseInt(originalClipsArray.length / 20),
                                limit: 20,
                            },
                        })
                        .then(({data, error}) => {
                            const {personalClipsLatest} = data;
                            if (personalClipsLatest) {
                                if(personalClipsLatest.length === 20)  setFetching(false)
                                setOriginalClipsArray([
                                    ...originalClipsArray,
                                    ...personalClipsLatest,
                                ]);
                                const filteredList = personalClipsLatest.filter(
                                    clip =>
                                        clip &&
                                        !clip.isDeleted &&
                                        !clip.isHidden &&
                                        !clip?.isArchived &&
                                        !(clip?.uid !== user.uid && clip?.type === pcTypes.myDiary)
                                );

                                setPersonalClipsArray([
                                    ...personalClipsArray,
                                    ...filteredList,
                                ]);
                            }
                            if (error) {
                                console.log("api error ",error)
                                logger.e(error);
                            }
                        })
                        .catch(err => {
                            logger.e(err);
                        });
                } else setCurrentlyPlaying(personalClipsArray[personalClipsArray?.length - 1]?.id)
            } else if (originalClipsArray?.length >= 10) {
                setFetching(true)
                apolloLib.client(session)
                    .query({
                        fetchPolicy: 'no-cache',
                        query: queries.getPersonalClips,
                        variables: {
                            uId: user.uid,
                            profileId: profile.uid,
                            showCollab: showCollab,
                            page: parseInt(originalClipsArray.length / 10),
                            limit: 10,
                        },
                    })
                    .then(({data, error}) => {
                        const {personalClips} = data;
                        if (personalClips) {
                            if(personalClips.length === 10)  setFetching(false)
                            setOriginalClipsArray([
                                ...originalClipsArray,
                                ...personalClips,
                            ]);
                            const filteredList = personalClips.filter(
                                clip =>
                                    clip &&
                                    !clip.isDeleted &&
                                    !clip.isHidden &&
                                    !clip?.isArchived &&
                                    !(clip?.uid !== user.uid && clip?.type === pcTypes.myDiary)
                            );
                            filteredList.sort((a, b) => b.updatedOn - a.updatedOn);
                            setPersonalClipsArray([
                                ...personalClipsArray,
                                ...filteredList,
                            ]);
                        }
                        if (error) {
                            logger.e(error);
                        }
                    })
                    .catch(err => {
                        logger.e(err);
                    });
            } else setCurrentlyPlaying(personalClipsArray[personalClipsArray?.length - 1]?.id)
        } catch (e) {
            logger.e(e);
        }
    };


    // main view
    return (
        <View style={{paddingHorizontal: 20}}>
            {loading ? (
                <View style={styles.loaderContainer}>
                    {isCollab ? (
                        <>
                            <LottieView
                                source={lottie.startSearch}
                                style={styles.loaderStyle}
                                autoPlay
                                loop
                            />
                            <Text style={styles.subtext}>
                                {strings.ideanGalleryFilteredSearchInitialMessage}
                            </Text>
                        </>
                    ) : (
                        <LottieView
                            source={lottie.splash}
                            style={styles.loaderStyle}
                            autoPlay
                            loop
                        />
                    )}
                </View>
            ) : personalClipsArray?.length > 0 ?
                <>
                    <VirtualizedList
                        ref={list}
                        data={personalClipsArray}
                        onViewableItemsChanged={onIdeanViewRef.current}
                        viewabilityConfig={ideanViewConfigRef.current}
                        renderItem={renderClips}
                        getItem={(data,index)=>data[index]}
                        getItemCount={()=>personalClipsArray.length}
                        keyExtractor={(item) => item.id}
                        scrollEnabled={
                            isCollab ? true : profile.uid === user.uid ? true : following
                        }
                        horizontal={true}
                        initialNumToRender={6}
                        persistentScrollbar={false}
                        maxToRenderPerBatch={6}
                        windowSize={6}
                        removeClippedSubviews={true}
                        updateCellsBatchingPeriod={100}
                        onEndReachedThreshold={8}
                        onEndReached={onReachEnd}
                    />
                </>
                : isCollab ? (
                    <View style={styles.loaderContainer}>
                        <LottieView
                            source={lottie.searchEmpty}
                            style={styles.loaderStyle}
                            autoPlay
                            loop
                        />
                        <Text style={styles.subtext}>
                            {strings.ideanGalleryFilteredSearchEmptyMessage}
                        </Text>
                    </View>
                ) : (
                    <>
                        <AttachClipCard
                            onPress={() => {
                                if(user?.uid === profile?.uid)
                                    setCreatePersonalClip(true)
                            }}
                            type={profile.userType}
                            isCollab={isCollab}
                        />
                    </>
                )
            }
            {createPersonalClip &&
                <AddPersonalClip
                    onDismiss={() => {
                        setCreatePersonalClip(false)
                        if (attach) dismissFilePicker()
                    }}
                    onSend={addTempClip}
                    theme={theme}
                    visibility={createPersonalClip}
                />
            }
        </View>
    )
}

const SpaceStyle = ({colors}, width) => {
    return StyleSheet.create({
        loaderContainer: {
            width: '100%',
            height: width * viewWidth.ideanGallery,
            alignContent: 'center',
            justifyContent: 'center',
        },
        loaderStyle: {
            height: 50,
            alignSelf: 'center',
        },
        lottie: {
            width: 50,
            height: 50,
        },
        lovitsIco: {
            width: 30,
            height: 25,
            resizeMode: 'contain',
            tintColor: colors.textPrimary,
        },
        dotView: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignSelf: 'center',
            alignItems: 'center',
            alignContent: 'center',
        },
        subtext: {
            fontSize: scale.font.l,
            alignSelf: 'center',
            textAlign: 'center',
            margin: 10,
            color: colors.textPrimaryDark,
        },
    });
};
