/* eslint-disable react-native/no-inline-styles,react-hooks/exhaustive-deps */
// noinspection JSUnresolvedFunction,JSUnresolvedVariable

import React, {useEffect, useRef, useState} from 'react';
import {SafeScreenView} from '../../index';
import {clipTypes, displayOrientation, userStatus, userType,} from '../../utilities/constant';
import {BackHandler, StatusBar, View} from 'react-native';
import {lottie, screens,lovitzIcons} from '../../utilities/assets';
import PersonalDetails from './components/personalDetails';
import NavBar from './components/navBar';
import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import {useSession} from '../../context/SessionContext';
import {compareObjects, loadPopup, useBackHandler} from '../../utilities/helper';
import {strings} from '../../constant/strings';
import {useAlert} from '../../context/AlertContext';
import {useTheme} from '../../context/ThemeContext';
import {mutations, queries} from '../../schema';
import onShare, {redirect2Messenger} from '../components/utility/share';
import MostLovitsList from '../co_space/components/mostLovitsList';
import {ContainerScroll, IconTitle, LineView} from '../../system/ui/components';
import apolloLib from '../../lib/apolloLib';
import AppBar from '../components/toolbar/appBar';
import logger from '../../lib/logger';
import ProfileActions from './components/profileActions';
import LottieView from 'lottie-react-native';
import {getUserSession} from "../../lib/storage";
import {clearCurrentProfileData, writeProfileData} from '../../services/notificationHelper';
import IdeanGalleryList from './ideanGallery/ideanGalleryListing';
import AlertPopup from '../components/utility/alertPopup';
import Toast from 'react-native-simple-toast';
import {block} from "../../utilities/collab";
import BlockedUserList from "./userBlocking/blockedUserList";

export default function PersonalSpace() {
    const navigation = useNavigation();
    const {orientation,theme} = useTheme();
    const {colors} = theme;
    const session = useSession();
    const alert = useAlert();
    const route = useRoute();
    const {goBack} = route?.params || {};
    const {user} = session;
    const [filePicker, setFilePicker] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const [blocked, setBlocked] = useState(true);
    const [userBlocking, setUserBlocking] = useState(false);
    const [reported, setReported] = useState(false);
    const [following, setFollowing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showCollab, setShowCollab] = useState(true);
    const [status, setStatus] = useState();
    const [checkUser, setCheckUser] = useState({});
    let isMe = checkUser?.uid === user?.uid
    const isFocused = useIsFocused();
    const [scrollToTop,setScrollToTop] = useState(false)
   
    //alert states
    const [alertVisibility, setAlertVisibility] = useState(false);
    const [alertCancellable, setAlertCancellable] = useState(true);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertTitle, setAlertTitle] = useState('');
    const [alertButtons, setAlertButtons] = useState([]);
    const [alertType, setAlertType] = useState('');
   
    //reset alert popup
    const clearAlert = () => {
        setAlertVisibility(false)
        setAlertCancellable(true)
        setAlertMessage('')
        setAlertType('')
        setAlertButtons([])
    }

    //report user
    const initReport = () => {
        if(!reported){
            setAlertCancellable(false)
            setAlertType('report')
            setAlertMessage(strings.report)
            setAlertTitle(strings.reportUser)
            setAlertButtons([
                {
                    label: strings.cancel, callback: () => {
                        clearAlert()
                    }
                },
                {
                    label: strings.submit, callback: (reason, otherText) => {
                        clearAlert()
                        ReportUser(reason, otherText)
                    }
                }
            ])
            loadPopup(setAlertVisibility, true)
        } else{
            Toast.show("User already reported")
        }
    };

    //block user
    const initBlock = () => {
            setAlertCancellable(false)
            setAlertType('alert')
            setAlertMessage(userBlocking?strings.userUnblockMessage:strings.userBlockMessage)
            setAlertButtons([
                {
                    label: strings.cancel, callback: () => {
                        clearAlert()
                    }
                },
                {
                    label: strings.ok, callback: () => {
                        clearAlert()
                        UserBlocking()
                    }
                }
            ])
            loadPopup(setAlertVisibility, true)
    };

    //report clip
    const ReportUser = (reason, otherText) => {
        const data = {
            reporterId: user?.uid,
            reporteeId: checkUser?.uid,
            reason,
            otherText,
        };
        const variables = {data};
        apolloLib.client(session)
            .mutate({
                mutation: mutations.reportUser,
                variables,
            })
            .then(({data, error, loading}) => {
                if (data?.createUserReport) {
                    Toast.show(strings.userReportingCompleted);
                    setReported(true);
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

    const UserBlocking = () => {

        const variables = {profileId:checkUser?.uid,uId:user?.uid};

        block(user?.uid,checkUser?.uid,userBlocking,session)
            .then(status=>{
                if(status != null) {
                    Toast.show(status ? strings.userBlockingCompleted : strings.userUnblockingCompleted);
                    setUserBlocking(status);
                } else{
                    Toast.show(userBlocking?strings.unblockFailed:strings.blockFailed);
                }
            })
            .catch(err=>{
                Toast.show(userBlocking?strings.unblockFailed:strings.blockFailed);
            })
    };

    useBackHandler(() => {
        onBackPress();
        return true;
    }, [isFocused]);


    useEffect(() => {
        if (isFocused && route?.params) {
            const _checkUser = route?.params?.profile ? {...route?.params?.profile} : {...route?.params?.user}
            if (_checkUser?.uid !== checkUser?.uid) {
                isMe = _checkUser?.uid === user?.uid;
                setCheckUser(_checkUser);
                writeProfileData(checkUser.uid, isMe)
                setRefresh(!refresh)
            }
            if (route?.params?.profile?.uid && user?.uid) {
                checkBlockStatus(user.uid, route?.params?.profile.uid);
            }
        } else {
            clearCurrentProfileData(isMe)
        }
    }, [route?.params, isFocused])

    const onBackPress = () => {
        if (goBack) {
            if (navigation.canGoBack()) {
                navigation.goBack();
            } else {
                navigation.replace('PersonalSpace', {goBack: false, user});
            }
        } else {
            alert({
                message: strings.confirm_app_exit,
                buttons: [
                    {label: strings.cancel},
                    {label: strings.ok, callback: () => BackHandler.exitApp()},
                ],
            });
        }
    };

    useEffect(() => {
        StatusBar.setHidden(false);
        if (isMe) {
            user?.uid && session.tokenUpdater(user.uid).then();
            setStatus(userStatus.active)
            if (!compareObjects(checkUser, user))
                setCheckUser(user)
        }
        if (route?.params?.profile) {
            checkBlockStatus(user.uid, route?.params?.profile.uid);
        } else {
            setBlocked(false);
            setUserBlocking(false)
            setFollowing(true);
            setIsLoading(false);
        }
        setRefresh(!refresh)
    }, [user]);

    const checkBlockStatus = (uid, profileId) => {
        if(uid!==profileId) {
            apolloLib.client(session)
                .query({
                    fetchPolicy: 'no-cache',
                    query: queries.getBlockStatus,
                    variables: {
                        id: profileId,
                        uid: uid,
                    },
                })
                .then(({data}) => {
                    if (!data.profile) {
                        setBlocked(true);
                        setUserBlocking(true);
                        setReported(true);
                        setFollowing(false);
                        setIsLoading(false);
                    } else {
                        setStatus(data?.profile?.status)
                        setBlocked(
                            data?.profile?.blockStatus ? data?.profile?.blockStatus : false,
                        );
                        setUserBlocking(
                            data?.profile?.userBlockingStatus ? data?.profile?.userBlockingStatus : false,
                        );
                        setReported(
                            data?.profile?.reportStatus ? data?.profile?.reportStatus : false,
                        )
                        setFollowing(
                            data?.profile?.followStatus ? data?.profile?.followStatus : false,
                        );
                        setIsLoading(false);
                    }
                })
                .catch(err => {
                    logger.e(err);
                    setIsLoading(false);
                });
        } else{
            setBlocked(false);
            setUserBlocking(false)
            setReported(false);
            setFollowing(true);
            setIsLoading(false);
        }
    };

    const getTopData = () => {
        switch (checkUser.userType) {
            case userType.charity:
                return {title: strings.charitySpace, avatar: screens.charity};
            case userType.business:
                return {title: strings.businessSpace, avatar: screens.business};
            case userType.general:
                return {title: strings.userSpace, avatar: screens.general_user};
            default:
                return {title: null, avatar: null};
        }
    };

    const topBarData = getTopData();

    const menuItems = () => {
        let a = [];
        if (
            route?.params?.profile &&
            route?.params?.profile?.uid !== user?.uid
        ) {
            a.push(
                {
                    label: 'Go to my SPACE',
                    callback: () =>
                        navigation.push('PersonalSpace', {goBack: false, user}),
                },
                
                {
                    label: 'Invite Idean',
                    callback: onShare,
                },
                {
                    label: '1:1 Chat',
                    callback: () => {
                        if (route?.params?.profile) {
                            if (user.uid === route?.params?.profile.uid) {
                                redirect2Messenger(navigation, user, checkUser);
                            } else {
                                if(blocked){
                                    alert(strings.userAccessDenied);
                                } else {
                                    if (following) {
                                        redirect2Messenger(navigation, user, checkUser);
                                    } else {
                                        alert(strings.collabFirst);
                                    }
                                }
                            }
                        } else {
                            redirect2Messenger(navigation, user, checkUser);
                        }
                    },
                },
                {
                    label: reported?'User Reported':'Report User',
                    callback:initReport,
                },
                {
                    label: userBlocking ? 'Unblock User':'Block User',
                    callback:initBlock,
                },
            );
        } else {
            a.push({
                label: 'Profile',
                callback: async () => {
                    if (user) {
                        switch (user?.userType) {
                            case userType.business:
                                navigation.push('InitialSetupBusiness', {
                                    user: {...user},
                                    isEdit: true,
                                });
                                break;
                            case userType.charity:
                                navigation.push('InitialSetupCharity', {
                                    user: {...user},
                                    isEdit: true,
                                });
                                break;
                            default:
                                navigation.push('InitialSetup', {
                                    user: {...user},
                                    isEdit: true,
                                });
                        }
                    } else {
                        const userSession = await getUserSession();
                        if (Object.keys(userSession).length > 0)
                            navigation.push('InitialSetup', {
                                user: userSession,
                                isEdit: true,
                            });
                    }
                },
            });
            a.push({
                label: strings.notification,
                callback: () => navigation?.navigate('Notification'),
            });

            if (
                user.userType === userType.business ||
                user.userType === userType.charity
            ) {
                a.push({
                    label: 'Reported Clips (IDEACLIP)',
                    callback: () =>
                        navigation.push('Reported', {spaceType: clipTypes.clip}),
                });
                a.push({
                    label: 'Reported Clips (NEWS & ASKS)',
                    callback: () =>
                        navigation.push('Reported', {spaceType: clipTypes.announcement}),
                });

            }
            a.push({
                label: 'Blocked Users',
                callback: () =>
                    navigation.push('BlockedUsers'),
            });
        }

        a.push(
            {
                label: 'Help',
                callback: () => {
                    navigation.push('Settings', {
                        user: {...user},
                        isUser: false,
                    });
                },
            },
            {
                label: 'Log out',
                callback: () => {
                    session.logout(user.uid)
                },
            },
        );
        return a;
    };

    const ideanGalleryAdder = () => {
        if (checkUser.uid === user.uid) {
            setFilePicker(true);
        }
    };


    const navList = [{
        icon: isMe === true && showCollab === false ? screens.homeSolid : screens.home,
        navigate: (isMe === true && showCollab === false) || isMe === false,
        func: () => navigation.push('PersonalSpace', {goBack: false, user}),
    },
        {
            icon: screens.search,
            func: () => navigation.push('PersonalSearch'),
        },
    ];

    if (checkUser.uid === user.uid) {
        navList.push({
            icon: screens.attach2,
            func: ideanGalleryAdder,
        });
    }

    navList.push({
        icon: screens.rocketColor,
        animationView:true,
        func: () => navigation.push('CollabSpaceSplash'),
    });

    const lovitz = {
        uid: checkUser?.userType === userType.general ? checkUser?.uid : '',
        bid: checkUser?.userType !== userType.general ? checkUser?.uid : '',
    };


    const content = () => {
        return !blocked  ? (
            <ContainerScroll disabled={orientation === displayOrientation.landscape} scrollToTop ={scrollToTop}>
                <ProfileActions profile={checkUser}/>
                <IdeanGalleryList
                   profile={checkUser}
                   refresh={refresh}
                   onPress={ideanGalleryAdder}
                   following={following}
                   showCollab={isMe ? showCollab : false}
                   isCollab={false}
                   attach={filePicker}
                   dismissFilePicker={() => {
                       setFilePicker(false)
                   }}
                   onNewClip={()=>{
                       setScrollToTop(!scrollToTop)
                   }}
                   navigation={navigation}
                />
                <LineView/>
                <IconTitle
                   style={{marginLeft: 15,}}
                   textStyle={{color:colors.mostLovitzHeading}}
                   title={strings.most_lovits_heading
                       // checkUser.userType === userType.general
                       //     ? strings.my_most_lovits_title
                       //     : strings.most_lovits_title
                   }
                   icon={theme.dark?lovitzIcons.grey:lovitzIcons.pink}
                />
                <MostLovitsList
                   uid={lovitz.uid}
                   bid={lovitz.bid}
                   spaceInfo={{...checkUser, spaceId: checkUser.uid}}
                   following={following}
                />
            </ContainerScroll>
        ) : null;
    };
    useEffect(() => {
        if (status === userStatus.archived) {
            alert({
                message: strings.user_archived_message,
                cancellable: false,
                autoDismiss: false,
                buttons: [
                    {
                        label: strings.ok, callback: () => {
                            alert.clear()
                            onBackPress()
                        }
                    },
                ],
            });
        }
    }, [status])

    return (
        <SafeScreenView
            navBarEnabled={true}
            translucent
            colors={['#e50012', '#0359a7']}
            locations={[0.4, 0.9]}>
            {isLoading ? (
                <View
                    style={{
                        width: '100%',
                        height: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                    <LottieView
                        source={lottie.loader}
                        style={{height: 50}}
                        autoPlay
                        loop
                    />
                </View>
            ) : (
                <>
                {console.log("detail",checkUser)}
                    <AppBar
                        title={topBarData.title}
                        subtitle={checkUser.orgName ? `${checkUser.orgName}` : null}
                        username={checkUser.displayName ? `${checkUser.displayName}` : null}
                        onBackPress={goBack ? onBackPress : goBack}
                        avatar={topBarData.avatar}
                        menuItems={menuItems()}
                        profile={true}
                    />
                    <ContainerScroll
                        disabled={orientation === displayOrientation.portrait}>
                        <PersonalDetails
                            setCheckUser={setCheckUser}
                            profile={checkUser}
                            showCollab={showCollab}
                            refreshFollow={checkBlockStatus}
                            onClickProfile={() => {
                                setShowCollab(false);
                            }}
                            refresh={refresh}
                            status={status !== userStatus.archived}
                        />
                        <LineView/>

                        {
                            status && status !== userStatus.archived &&
                            content()}
                    </ContainerScroll>
                    {
                        alertVisibility &&
                        <AlertPopup buttons={alertButtons} titleNew={alertTitle} message={alertMessage} type={alertType} visibility={alertVisibility}
                                    onCancel={clearAlert} cancellable={alertCancellable}/>
                    }
                    <NavBar navList={navList} animated={true}/>
                </>
            )}
        </SafeScreenView>
    );
}
