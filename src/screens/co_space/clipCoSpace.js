/* eslint-disable react-hooks/exhaustive-deps */
// noinspection JSUnresolvedFunction,JSUnresolvedVariable

import React, {useCallback, useEffect, useState} from 'react';
import {KeyboardAvoidingView, Platform, View} from 'react-native';
import {screens} from 'utilities/assets';
import CoSpaceClipList from './components/coSpaceClipList';
import {ClipProvider} from 'context/ClipContext';
import {SafeScreenView} from 'index';
import CoSpaceInfo from './components/coSpaceInfo';
import {useBackHandler} from 'utilities/helper';
import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import {useSession} from 'context/SessionContext';
import {strings} from 'constant/strings';
import {useTheme} from '../../context/ThemeContext';
import {clipTypes, pageTypes, userStatus} from '../../utilities/constant';
import ClipInputBar from './components/clipInputBar';
import onShare, {redirect2Messenger} from '../components/utility/share';
import apolloLib from '../../lib/apolloLib';
import {queries} from '../../schema';
import logger from '../../lib/logger';
import AppBar from '../components/toolbar/appBar';
import {useAlert} from '../../context/AlertContext';
import {clearCurrentPageData, writePageData,} from '../../services/notificationHelper';
import CoSpaceRediectView from './components/coSpaceRediectView';
import PollGenerator from '../../components/poll/PollGenerator';
import {ProgressLoader} from "../../system/ui/components";
import {navigationReset} from "../../utilities/helper";
import TempMessage from "./components/TempMessage";
import HeaderMessage from "./components/headerMessage";


export default function ClipCoSpace() {
    const navigation = useNavigation();
    const session = useSession();
    const alert = useAlert();
    const {theme} = useTheme();
    const {user} = session;
    const {params} = useRoute();
    const isFocused = useIsFocused();
    const initSpaceConfig = {
        loading: true,
        space_redirect_id: null,
        space_isTemp: (params?.temporarySpace || false),
        space_status: userStatus.disabled,
        space_redirect: !!params?.notify?.notifyId,
        space_redirect_clip: {},
        space_clipAdded: false
    }
    const initSpaceInfo = params?.notify ? params?.notify : params?.spaceInfo
    const [spaceInfo, setSpaceInfo] = useState({...initSpaceInfo, ...initSpaceConfig});
    const {
        space_isTemp,
        space_status,
        space_redirect,
        space_redirect_clip,
        space_clipAdded,
        space_redirect_id
    } = spaceInfo
    const [threading, setThreading] = useState(null);
    const [showPoll, setShowPoll] = useState(false);
    const [onChange, setOnChange] = useState(null);

    const isDisabled =
        spaceInfo?.uid !== user.uid &&
        (spaceInfo?.followStatus !== true);
    const isBlocked =
        spaceInfo?.uid !== user.uid && ( spaceInfo?.blockStatus === true );
    console.log("isDisabled ",isDisabled)
    console.log("isBlocked ",isBlocked)
    const fetchSpaceInfo = (spaceId, spaceType, notifyId = null) => {
        setSpaceInfo(spi => ({...spi, loading: true, spaceType: null}));
        apolloLib
            .client(session)
            .query({
                fetchPolicy: 'no-cache',
                query: queries.getClipUser,
                variables: {
                    id: spaceId,
                    uid: user.uid,
                },
            })
            .then(({data}) => {
                const {profile} = data;
                if (profile) {
                    if (!profile.displayName?.length > 0) {
                        setSpaceInfo(spi => ({
                            ...spi,
                            ...profile,
                            ...profile.userProfile,
                            displayName: profile.orgName,
                            spaceType,
                            spaceId,
                            space_redirect_id: notifyId,
                            space_isTemp: true,
                            space_status: userStatus.active,
                            loading: false
                        }));
                    } else {
                        setSpaceInfo(spi => ({
                            ...spi,
                            ...profile,
                            ...profile.userProfile,
                            spaceType,
                            spaceId,
                            space_redirect_id: notifyId,
                            space_isTemp: false,
                            space_status: profile?.status,
                            loading: false,
                        }));
                    }
                } else backPressHandler()
            })
            .catch(err => {
                logger.e(err);
                backPressHandler()
            });
    }

    const redirectToClip = id => {
        if (id && id.length > 0) {
            apolloLib
                .client(session)
                .query({
                    fetchPolicy: 'no-cache',
                    query:
                        spaceInfo?.spaceType === clipTypes.clip
                            ? queries.clip
                            : queries.anClip,
                    variables: {
                        id: id,
                        uid: user.uid,
                    },
                })
                .then(({data}) => {
                    const clipData =
                        spaceInfo.spaceType === clipTypes.announcement
                            ? data.anClip
                            : data.clip;
                    if (clipData) {
                        setSpaceInfo(spi => ({
                            ...spi,
                            space_redirect: true,
                            space_clipAdded: false,
                            space_redirect_clip: clipData
                        }))
                    }
                }).catch(() => {

            })
        }
    };

    useEffect(() => {
        const notify = params?.notify
        if (notify && (notify?.spaceId !== spaceInfo.spaceId || notify?.spaceType !== spaceInfo.spaceType)) {
            fetchSpaceInfo(notify?.spaceId, notify?.spaceType, notify?.notifyId)
        } else if (notify && notify?.notifyId) {
            redirectToClip(notify?.notifyId);
        }
    }, [params?.notify]);


    useEffect(() => {
        const notify = params?.notify
        if (notify?.notifyId === space_redirect_id) {
            redirectToClip(space_redirect_id);
        }
    }, [space_redirect_id]);

    useEffect(() => {
        fetchSpaceInfo(spaceInfo.spaceId, spaceInfo.spaceType)
    }, []);

    useEffect(() => {
        if (isFocused) {
            writePageData(
                spaceInfo?.spaceType === clipTypes.clip
                    ? pageTypes.coSpace
                    : pageTypes.news_asks,
                spaceInfo?.spaceId,
            );
        } else if (!isFocused) {
            clearCurrentPageData();
        }
    }, [isFocused, spaceInfo]);


    useBackHandler(() => {
        backPressHandler();
        return true;
    });

    const backPressHandler = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigationReset(navigation, 'PersonalSpace', {goBack: false, user});
        }
    };
    useEffect(() => {
        if (space_status === userStatus.archived) {
            showArchived()
        }
    }, [spaceInfo])

    const showArchived = () => {
        alert({
            message: strings.user_archived_message,
            cancellable: false,
            autoDismiss: false,
            buttons: [
                {
                    label: strings.ok, callback: () => {
                        alert.clear()
                        navigationReset(navigation, 'PersonalSpace', {goBack: false, user});
                    }
                },
            ],
        });
    }
    const gotoChat = () => {
        if (user.uid !== spaceInfo.uid && ( isDisabled === true || isBlocked === true)) {
            alert({
                message: isBlocked? strings.userAccessDenied : strings.collabAlertMessage,
                buttons: [{label: strings.ok, callback: () => alert.clear()}],
                autoDismiss: false,
                cancellable: false,
            });
        } else {
            redirect2Messenger(navigation, user, spaceInfo);
        }
    };

    const handlePoll = () => {
        setShowPoll(true);
    };
    const handleDismissPoll = () => {
        setShowPoll(false);
    };

    const menuItems = [
        {
            label: 'Go to my SPACE',
            callback: () => navigation.push('PersonalSpace', {goBack: false, user}),
        },
    ];

    if (spaceInfo?.spaceType === clipTypes.announcement && user.uid === spaceInfo.uid) {
        menuItems.push({
            label: 'Create a POLL',
            callback: handlePoll,
        });
    }

    menuItems.push({
        label: 'Invite Idean',
        callback: onShare,
    });

    if (space_isTemp === false) {
        menuItems.push({
            label: '1:1 Chat',
            callback: gotoChat,
        });
    }

    const viewLatest = (_space_clipAdded = true) => {
        setSpaceInfo(spi => ({
            ...spi,
            space_redirect: false,
            space_clipAdded: _space_clipAdded,
            space_redirect_clip: {}
        }))
    }

    const renderList = useCallback(() => {
        if (space_redirect === false) {
            return <CoSpaceClipList
                onChange={onChange}
                spaceInfo={spaceInfo}
                threading={setThreading}
                disabled={isDisabled && !space_isTemp}
                blocked={isBlocked && !space_isTemp}
                visible={true}
                redirectToClip={redirectToClip}
                isTemp={space_isTemp}
                newClipAdded={space_clipAdded}
                setNewClipAdded={viewLatest}
            />
        } else if (space_redirect_clip && Object.keys(space_redirect_clip).length > 0 && space_redirect) {
            return <CoSpaceRediectView
                onChange={onChange}
                spaceInfo={spaceInfo}
                threading={setThreading}
                disabled={isDisabled && !space_isTemp}
                blocked={isBlocked && !space_isTemp}
                isTemp={space_isTemp}
                initClip={space_redirect_clip}
                viewLatest={viewLatest}
                redirectToClip={redirectToClip}
            />
        } else return <View style={{flex: 1}}/>

    }, [spaceInfo])

    const spaceName = () => {
        if (clipTypes.announcement === spaceInfo.spaceType)
            return strings.announcement_co_space
        else if (clipTypes.clip === spaceInfo.spaceType)
            return strings.idea_clip_co_space
        else return ''
    }

    return (

        <SafeScreenView
            translucent
            colors={['#881b7e', '#d1094f']}
            locations={[0.4, 0.9]}>
            <AppBar
                menuItems={menuItems}
                coSpace={true}
                icon={screens.co_space_ico}
                onBackPress={backPressHandler}
                title={spaceName()}
                titleStyle={{color: theme.colors.secondaryDark}}
            />

            {spaceInfo.loading === true &&
            <ProgressLoader visible={true}/>
            }
            {spaceInfo.loading === false &&
            <ClipProvider spaceInfo={spaceInfo}>
                {showPoll === true && (
                    <PollGenerator
                        onDismiss={handleDismissPoll}
                        spaceInfo={spaceInfo}
                        visibility={showPoll}
                        onComplete={() => {
                            handleDismissPoll()
                            viewLatest()
                        }}
                    />
                )}


                <CoSpaceInfo
                    spaceInfo={spaceInfo}
                    disabled={isDisabled && !space_isTemp}
                    blocked={isBlocked && !space_isTemp}
                    temporarySpace={space_isTemp}
                />
                {space_status !== userStatus.archived && (
                    <KeyboardAvoidingView
                        style={{flex: 1}}
                        behavior={Platform.OS === 'ios' ? 'padding' : ''}>
                        <HeaderMessage isTemp={space_isTemp} spaceType={spaceInfo.spaceType}/>
                        {renderList()}
                        <ClipInputBar
                            setOnChange={setOnChange}
                            threading={threading}
                            onClearThreading={() => setThreading(null)}
                            spaceInfo={spaceInfo}
                            disabled={isDisabled && !space_isTemp}
                            blocked={isBlocked && !space_isTemp}
                            viewLatest={viewLatest}
                            showArchived={showArchived}
                        />
                    </KeyboardAvoidingView>
                )}
            </ClipProvider>
            }
        </SafeScreenView>
    );
}
