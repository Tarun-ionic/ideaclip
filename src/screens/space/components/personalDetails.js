/* eslint-disable react-hooks/exhaustive-deps,react-native/no-inline-styles */
// noinspection JSUnresolvedFunction

import React, {useEffect, useRef, useState} from 'react';
import {fonts, placeHolders, screens} from 'utilities/assets';
import {
    Image,
    Platform,
    Pressable,
    ScrollView, StatusBar,
    StyleSheet,
    Text,
    TextInput, TouchableHighlight,
    TouchableOpacity,
    View,
} from 'react-native';
import scale from 'utilities/scale';
import {Avatar} from "../../../components";
import {useTheme} from 'context/ThemeContext';
import {strings} from 'constant/strings';
import {GradiantButton} from 'system/ui/components';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {profileData, userType} from '../../../utilities/constant';
import apolloLib from '../../../lib/apolloLib';
import {mutations, queries} from '../../../schema';
import logger from '../../../lib/logger';
import Toast from 'react-native-simple-toast';
import {useMutation} from '@apollo/client';
import {useSession} from '../../../context/SessionContext';
import {collab, uncollab} from '../../../utilities/collab';
import {LineView, ProgressLoader} from '../../../system/ui/components';
import onShare from '../../components/utility/share';
import Popover, {PopoverPlacement} from 'react-native-popover-view';
import EmojiText from '../../components/utility/emojiText';
import {useAlert} from '../../../context/AlertContext';
import {compareObjects, onTrigger} from '../../../utilities/helper';
import LottieView from 'lottie-react-native';
import {icons, lottie, personalSpaceIcons} from '../../../utilities/assets';
import storage from '@react-native-firebase/storage';
import {profileRef} from "../../messenger/messengerHelper";
import Tooltip from 'react-native-walkthrough-tooltip';
import TextTicker from 'react-native-text-ticker'

export default function PersonalDetails({
                                            profile,
                                            refreshFollow,
                                            setCheckUser,
                                            onClickProfile = () => {
                                            },
                                            showCollab = false,
                                            status = true,
                                            refresh
                                        }) {
    const navigation = useNavigation();
    const {theme} = useTheme();
    const {colors} = theme;
    const alert = useAlert();
    const session = useSession();
    const {user} = session;
    const styles = SpaceStyle(theme);
    const [logo, setAvatar] = useState(placeHolders.avatar);
    const [profileInfo, setProfileInfo] = useState({...profileData, followStatus: null,blockStatus:null});
    const [introEdit, setIntroEdit] = useState(false);
    const [introEditText, setIntroEditText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [lovitzCount, setLovitzCount] = useState(-1);
    const [lovitzPrevCount, setLovitzPrevCount] = useState(-1);
    const [updateIntro] = useMutation(mutations.updateIntro);
    const isFocused = useIsFocused();
    const animation = useRef()
    const popups = {
        title:"titlePopup",
        clips:"myInsights"
    }
    const [show,setShow] = useState('')
    const [titleIcon,setTitleIcon] = useState(screens.titles)
    const [mostTitle,setMostTitle] = useState("No titles")

    const iconAssets = personalSpaceIcons(theme.dark)

    useEffect(() => {
        if (!compareObjects(profileInfo, profile)) {
            setProfileInfo(s => ({...s, followStatus: null,blockStatus:null, ...profile}));
        }
    }, [profile])

    useEffect(() => {
        if (isFocused && profileInfo?.uid){
                updateProfile();
            }
    }, [isFocused, profileInfo]);


    useEffect(() => {
        if (profileInfo?.uid) {
            const subscriber = profileRef(profileInfo.uid).onSnapshot(documentSnapshot => {
                if (documentSnapshot) {
                    const data = documentSnapshot.data();
                    setLovitzCount(data?.totalLovitz ?? 0)
                }
            });
            return () => subscriber();
        }
    }, [profileInfo]);

    useEffect(() => {
        if (lovitzCount > -1) {
            if (lovitzPrevCount < lovitzCount) {
                if (lovitzPrevCount > -1)
                    animation.current.play()
            }
            setLovitzPrevCount(lovitzCount ?? 0)
        }
    }, [lovitzCount]);
  
    useEffect(() => {
        if (profileInfo.profileImage) {
            if (!profileInfo.profileImage.includes('://')) {
                storage()
                    .ref(profileInfo.profileImage)
                    .getDownloadURL()
                    .then(url => {
                        setAvatar({uri: url});
                    })
                    .catch(err => {
                        setAvatar({uri: profileInfo.profileImage});
                    });
            } else {
                setAvatar({uri: profileInfo.profileImage});
            }
        } else {
            setAvatar(
                profileInfo.userType === userType.general
                    ? placeHolders.avatar
                    : placeHolders.logo,
            );
        }
        getTitle()
    }, [profileInfo]);

    const addProfileData = (data) => {
        let newData = {
            ...data,
            motto: data.userType === userType.general ? data.lifeMotto : data.slogan,
            clipCount: data.clipCount || 0,
            followingCount: data.followingCount || 0,
            followersCount: data.followersCount || 0,
        };
        const newUser = {...profileInfo, ...newData}
        if(!compareObjects(profileInfo, newUser)){
            session.update(newUser,false)
            onTrigger(setCheckUser, newUser);
            setProfileInfo(newUser);
        }
    };
    const updateProfile = () => {
        apolloLib.client(session)
            .query({
                fetchPolicy: 'no-cache',
                query: queries.getProfile,
                variables: {
                    id: profile.uid,
                    uid: user.uid,
                },
            })
            .then(({data}) => {
                if (!data.profile) {
                    return false;
                }
                const {userProfile} = data.profile;
                if (
                    data?.profile?.titleCount?.details &&
                    data?.profile?.titleCount?.details?.length > 0
                ) {
                    let titleList = data?.profile?.titleCount?.details.sort(
                        (a, b) => b.count - a.count,
                    );
                    let profileResult = {
                        ...data.profile,
                        titleCount: {
                            ...data.profile.titleCount,
                            details: titleList,
                        },
                        state: userProfile.state,
                        slogan: userProfile.slogan,
                        lifeMotto:
                            userProfile.lifeMotto != null ? userProfile.lifeMotto : '',
                        suburb: userProfile.suburb,
                        stateShort: userProfile.stateShort,
                        countryCode: userProfile.countryCode,
                    };
                    addProfileData(profileResult);
                } else {
                    let profileResult = {
                        ...data.profile,
                        state: userProfile.state,
                        slogan: userProfile.slogan,
                        lifeMotto:
                            userProfile.lifeMotto != null ? userProfile.lifeMotto : '',
                        suburb: userProfile.suburb,
                        stateShort: userProfile.stateShort,
                        countryCode: userProfile.countryCode,
                    };
                    addProfileData(profileResult);
                }
            })
            .catch(err => {
                logger.e(err);
            });
    };

    const getTitle = () => {
        let title = '';
        let count = 0;
        let index=0
        let i = 0;
        if (profileInfo.titleCount?.total > 0) {
            for (i in profileInfo.titleCount?.details) {
                if (profileInfo.titleCount?.details[i].count > count) {
                    title = profileInfo.titleCount?.details[i].name;
                    count = profileInfo.titleCount?.details[i].count;
                    index = i
                }
            }
        }
        if(profileInfo.titleCount?.details[index]?.iconB64){
            setTitleIcon({uri:profileInfo.titleCount?.details[index]?.iconB64})
        } else if(profileInfo.titleCount?.details[index]?.iconFile){
            storage()
                .ref(profileInfo.titleCount?.details[index]?.iconFile)
                .getDownloadURL()
                .then(url => {
                    setTitleIcon({uri: url});
                })
                .catch(err => {
                    setTitleIcon(screens.titles);
                });
        } else{
            setTitleIcon(screens.titles);
        }
        setMostTitle(title);
    };


    const manageCollab = () => {
        if (status) {
            if (profileInfo.blockStatus === true) {
                return false;
            }
            setIsLoading(true);
            if (profileInfo.followStatus) {
                uncollab(user.uid, profileInfo.uid, session)
                    .then(refreshCollab)
                    .catch(() => {
                        Toast.show('Failed to update collab status. Please try again later.');
                        setIsLoading(false);
                    });
            } else {
                collab(
                    {
                        uid: user.uid,
                        followStatus: true,
                        notificationStatus: true,
                        displayName: user.displayName,
                    },
                    profileInfo.uid,
                    session
                )
                    .then(refreshCollab)
                    .catch(() => {
                        Toast.show('Failed to update collab status. Please try again later.');
                        setIsLoading(false);
                    });
            }
        }
    };

    const refreshCollab = () => {
        refreshFollow(user.uid, profileInfo.uid);
        updateProfile();
        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
    };

    const redirect2Chat = () => {
        if (user && user.uid === profileInfo.uid) {
            navigation.navigate('MessengerUsers');
        } else {
            navigation.navigate('MessengerChat', {
                receiver: {
                    uid: profileInfo.uid,
                    displayName: profileInfo.displayName,
                    profileImage: profileInfo.profileImage,
                },
            });
        }
    };

    const saveIntro = () =>{
        setIsLoading(true);
            updateIntro({
                variables: {
                    uid: profileInfo.uid,
                    intro: introEditText,
                },
            })
            .then(() => {
                Toast.show('Intro updated successfully');
                const userData = {
                    ...profileInfo,
                    intro: introEditText,
                }
                session.update(userData)
                setProfileInfo(userData);
                setIntroEdit(false);
                setIsLoading(false);
            })
            .catch(() => {
                Toast.show(
                    'Failed to update intro. Please try again later.',
                );
                // alert(strings.profile_update_failed)
                setIsLoading(false);
            });
    }

    return (
        <View>
            <View style={styles.personalSpace}>
                <View style={styles.primaryContainer}>
                    <Avatar size={80} source={logo} containerStyle={(showCollab && user.uid === profile.uid) ? {
                        borderColor: colors.profileOutline,
                        borderWidth: 0.5,
                        borderRadius: 80,
                        padding: 2
                    } : {}} onPress={onClickProfile}/>
                </View>
                <View style={styles.secondaryContainer}>
                    <View style={styles.iconCountContainer}>


                        <View     style={styles.iconContainerCenter}>
                        <Tooltip
                            isVisible={show === popups.clips}
                            childContentSpacing={0}
                            contentStyle={{backgroundColor:colors.titlePopupBackground}}
                            closeOnContentInteraction={false}
                            allowChildInteraction={true}
                            closeOnChildInteraction={false}
                            content={
                                            <View style={{alignSelf:'center',justifyContent:'center',alignItems:'center',marginVertical:10,marginHorizontal:5}}>
                                                <Text style={styles.clipsPopupText}>
                                                    {'Woo-hoo!\nYour shared Fan\nInsights rock!'}
                                                </Text>
                                            </View>
                            }
                            placement="bottom"
                            showChildInTooltip={false}
                            onClose={() => {setShow('')}}
                            disableShadow={true}
                            topAdjustment={Platform.OS === 'android' ? -StatusBar.currentHeight : 0}
                        >
                        <TouchableOpacity style={[styles.iconContainerCenter,{width:'100%'}]} onPress={()=>{
                            if (user.uid===profile.uid) {
                                setShow(popups.clips)
                            }
                        }}>
                            <Text style={styles.iconContainerTitle}>
                                {profileInfo.clipCount}
                            </Text>
                            <Image style={styles.iconContainerImage} source={screens.insights}/>
                            <Text
                                style={styles.iconContainerSubTitle}
                                numberOfLines={1}
                                adjustsFontSizeToFit>
                                {strings.myInsights}
                            </Text>
                        </TouchableOpacity>
                        </Tooltip>
                        </View>

                        <View     style={styles.iconContainerCenter}>
                        {/*{profileInfo?.titleCount?.total > 0 &&*/}
                        {/*((!profileInfo.blockStatus && profileInfo.followStatus) ||*/}
                        {/*    profileInfo.uid === user.uid) ? (*/}

                                <Tooltip
                                    isVisible={show === popups.title}
                                    childContentSpacing={0}
                                    contentStyle={{backgroundColor:colors.titlePopupBackground}}
                                    closeOnContentInteraction={false}
                                    allowChildInteraction={true}
                                    closeOnChildInteraction={false}
                                    content={

                                         <View style={{maxWidth:scale.ms(200)}}>
                                        <Text style={ styles.myTitleLabel}>
                                           Title Awarded:
                                        </Text>
                                             <View style={{
                                                 height: 0.5,
                                                 backgroundColor: colors.titlePopupText,
                                                 width: '100%',
                                                 justifyContent: 'center',
                                                 alignSelf: 'center'}}/>
                                        {profileInfo?.titleCount?.details &&
                                        profileInfo?.titleCount?.details.map((title, tIndex) => {
                                            return (
                                                <View
                                                    key={`tIndex-${tIndex}`}
                                                    style={styles.myTitleView}>
                                                    <Text numberOfLines={1} style={styles.myTitleLabel}>
                                                        {title.name}{' '}
                                                    </Text>
                                                    <Text style={styles.myTitleCount}>
                                                        {title.count > 250 ? '250+' : title.count}
                                                    </Text>
                                                </View>
                                            );
                                        })}
                                         </View>
                                            }
                                    placement="bottom"
                                    showChildInTooltip={false}
                                    onClose={() => {setShow('')}}
                                    disableShadow={true}
                                    topAdjustment={Platform.OS === 'android' ? -StatusBar.currentHeight : 0}
                                >
                                    <TouchableOpacity style={[styles.iconContainerCenter,{width:'100%'}]} onPress={()=>{
                                        if(profileInfo?.titleCount?.total > 0 &&
                                        ((!profileInfo.blockStatus  && profileInfo.followStatus) ||
                                            profileInfo.uid === user.uid) ) {
                                            setShow(popups.title)
                                        } else{ {
                                                if (status) {
                                                    if (
                                                        profileInfo.uid !== user.uid &&
                                                        profileInfo?.titleCount?.total > 0
                                                    ) {
                                                        if(profileInfo.blockStatus){
                                                            alert(strings.userAccessDenied);
                                                        }else if (!profileInfo.followStatus) {
                                                            alert(strings.collabFirst);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }}>
                                        <Text style={styles.iconContainerTitle} numberOfLines={1}>
                                            {profileInfo?.titleCount?.total > 0
                                                ? mostTitle
                                                : 'No titles'}
                                        </Text>
                                        <Image
                                            style={styles.iconContainerImage}
                                            source={profileInfo?.titleCount?.total > 0 ? titleIcon : screens.titles}
                                        />
                                        <Text
                                            style={styles.iconContainerSubTitle}
                                            numberOfLines={1}
                                            adjustsFontSizeToFit>
                                            {strings.Title}
                                        </Text>
                                    </TouchableOpacity>
                                </Tooltip>


                            {/*// <Popover*/}
                            {/*//     placement={PopoverPlacement.RIGHT}*/}
                            {/*//     from={*/}
                            {/*//         <TouchableOpacity style={styles.iconContainerCenter}>*/}
                            {/*//             <Text style={styles.iconContainerTitle} numberOfLines={1}>*/}
                            {/*//                 {profileInfo?.titleCount?.total > 0*/}
                            {/*//                     ? getTitle()*/}
                            {/*//                     : 'No titles'}*/}
                            {/*//             </Text>*/}
                            {/*//             <Image*/}
                            {/*//                 style={styles.iconContainerImage}*/}
                            {/*//                 source={screens.titles}*/}
                            {/*//             />*/}
                            {/*//             <Text*/}
                            {/*//                 style={styles.iconContainerSubTitle}*/}
                            {/*//                 numberOfLines={1}*/}
                            {/*//                 adjustsFontSizeToFit>*/}
                            {/*//                 {strings.Title}*/}
                            {/*//             </Text>*/}
                            {/*//         </TouchableOpacity>*/}
                            {/*//     }*/}
                            {/*//     popoverStyle={{*/}
                            {/*//         width: 200,*/}
                            {/*//         maxHeight: 150,*/}
                            {/*//         backgroundColor: '#e4fcfa',*/}
                            {/*//     }}*/}
                            {/*//     arrowShift={-1}>*/}
                            {/*//     <ScrollView*/}
                            {/*//         scrollEnabled={true}*/}
                            {/*//         style={{maxHeight: 145, paddingBottom: 5}}>*/}
                            {/*//         {profileInfo?.titleCount?.details &&*/}
                            {/*//         profileInfo?.titleCount?.details.map((title, tIndex) => {*/}
                            {/*//             return (*/}
                            {/*//                 <View*/}
                            {/*//                     key={`tIndex-${tIndex}`}*/}
                            {/*//                     style={styles.myTitleView}>*/}
                            {/*//                     <Text numberOfLines={1} style={styles.myTitleLabel}>*/}
                            {/*//                         {title.name}{' '}*/}
                            {/*//                     </Text>*/}
                            {/*//                     <Text style={styles.myTitleCount}>*/}
                            {/*//                         {title.count > 250 ? '250+' : title.count}*/}
                            {/*//                     </Text>*/}
                            {/*//                 </View>*/}
                            {/*//             );*/}
                            {/*//         })}*/}
                            {/*//     </ScrollView>*/}
                            {/*// </Popover>*/}
                        {/*) : (*/}
                        {/*    <TouchableOpacity*/}
                        {/*        style={styles.iconContainerCenter}*/}
                        {/*        onPress={() => {*/}
                        {/*            if (status) {*/}
                        {/*                if (*/}
                        {/*                    profileInfo.uid !== user.uid &&*/}
                        {/*                    profileInfo?.titleCount?.total > 0*/}
                        {/*                ) {*/}
                        {/*                    if (profileInfo.blockStatus) {*/}
                        {/*                        alert(strings.collabPending);*/}
                        {/*                    } else if (!profileInfo.followStatus) {*/}
                        {/*                        alert(strings.collabFirst);*/}
                        {/*                    }*/}
                        {/*                }*/}
                        {/*            }*/}
                        {/*        }}>*/}
                        {/*        <Text style={styles.iconContainerTitle} numberOfLines={1}>*/}
                        {/*            {profileInfo?.titleCount?.total > 0*/}
                        {/*                ? getTitle()*/}
                        {/*                : 'No titles'}*/}
                        {/*        </Text>*/}
                        {/*        <Image*/}
                        {/*            style={styles.iconContainerImage}*/}
                        {/*            source={screens.titles}*/}
                        {/*        />*/}
                        {/*        <Text*/}
                        {/*            style={styles.iconContainerSubTitle}*/}
                        {/*            numberOfLines={1}*/}
                        {/*            adjustsFontSizeToFit>*/}
                        {/*            {strings.Title}*/}
                        {/*        </Text>*/}
                        {/*    </TouchableOpacity>*/}
                        {/*)}*/}
                        </View>

                        <TouchableOpacity
                            style={styles.iconContainerCenter}
                            onPress={() => {
                                if (status) {
                                    if(profileInfo.blockStatus && profileInfo.uid !== user.uid){
                                        alert(strings.userAccessDenied);
                                    } else if (
                                        !profileInfo.followStatus &&
                                        profileInfo.uid !== user.uid
                                    ) {
                                        alert(strings.collabFirst);
                                    } else {
                                        if (
                                            profileInfo.followingCount &&
                                            profileInfo.followingCount > 0
                                        ) {
                                            navigation.push('Following', {
                                                user,
                                                profileId: profile.uid,
                                            });
                                        }
                                    }
                                }
                            }}>
                            <Text style={styles.iconContainerTitle}>
                                {profileInfo.followingCount}
                            </Text>
                            <Image
                                style={styles.iconContainerImage}
                                source={screens.collabing}
                            />
                            <Text
                                style={styles.iconContainerSubTitle}
                                numberOfLines={1}
                                adjustsFontSizeToFit>
                                {strings.Collabing}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.iconContainerCenter}
                            onPress={() => {
                                if (status) {
                                    if(profileInfo.blockStatus && profileInfo.uid !== user.uid){
                                        alert(strings.userAccessDenied);
                                    }  else if (
                                        !profileInfo.followStatus &&
                                        profileInfo.uid !== user.uid
                                    ) {
                                        alert(strings.collabFirst);
                                    } else {
                                        if (
                                            profileInfo.followersCount &&
                                            profileInfo.followersCount > 0
                                        ) {
                                            navigation.push('Followers', {
                                                user,
                                                profileId: profile.uid,
                                            });
                                        }
                                    }
                                }
                            }}>
                            <Text style={styles.iconContainerTitle}>
                                {profileInfo.followersCount}
                            </Text>
                            <Image
                                style={styles.iconContainerImage}
                                source={screens.collaber}
                            />
                            <Text
                                style={styles.iconContainerSubTitle}
                                numberOfLines={1}
                                adjustsFontSizeToFit>
                                {strings.Collaber}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View style={styles.personalSpaceSecondary}>
                <View style={styles.personalDetails}>
                    {/*<Text style={styles.businessName}>{profileInfo.displayName}</Text>*/}
                    {profileInfo.motto !== '' && profileInfo.motto !== null && (
                        <Text style={styles.taglines} numberOfLines={2}>
                            {profileInfo.motto}
                        </Text>
                    )}
                    <Text style={styles.suburbView}>
                        {profileInfo.suburb}
                        {profileInfo.countryCode !== 'AU'
                            ? profileInfo.state != null
                                ? profileInfo.suburb
                                    ? `, ${profileInfo.state}`
                                    : `${profileInfo.state}`
                                : ''
                            : profileInfo.stateShort != null
                                ? profileInfo.suburb
                                    ? `, ${profileInfo.stateShort}`
                                    : `${profileInfo.stateShort}`
                                : ''}
                    </Text>
                </View>

                <View style={{flex: 1}}>
                    <View style={[styles.personalMoto]}>
                        {introEdit ? (
                            <View style={{width: '100%'}}>
                                <TextInput
                                    autoFocus={true}
                                    multiline={true}
                                    maxLength={75}
                                    style={[
                                        styles.motoDetailView,
                                        {
                                            borderWidth: 1,
                                            borderRadius: 5,
                                            borderColor: colors.textPrimary,
                                            padding: 5,
                                            fontSize: scale.font.xs,
                                        },
                                    ]}
                                    onChangeText={text => {
                                        setIntroEditText(text);
                                    }}>
                                    {introEditText}
                                </TextInput>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: 10,
                                    }}>
                                    <TouchableOpacity
                                        style={{
                                            borderColor: colors.secondaryBorder,
                                            borderRadius: 5,
                                            borderWidth: 1,
                                            padding: 5,
                                        }}
                                        onPress={() => {
                                            setIntroEdit(false);
                                        }}>
                                        <Text style={{color: colors.textPrimary}}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={{
                                            marginLeft: 10,
                                            borderColor: colors.secondaryBorder,
                                            borderRadius: 5,
                                            borderWidth: 1,
                                            padding: 5,
                                        }}
                                        onPress={saveIntro}>
                                        <Text style={{color: colors.textPrimary}}>Save</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <EmojiText numberOfLines={3} style={styles.introView}>
                                {profileInfo.intro
                                    ? profileInfo.intro
                                    : user && user.uid === profileInfo.uid
                                        ? 'Add an intro here.'
                                        : ''}
                            </EmojiText>
                        )}
                        {user && user.uid === profile.uid && !introEdit && (
                            <Pressable
                                onPress={() => {
                                    setIntroEditText(profileInfo.intro);
                                    setIntroEdit(true);
                                }}
                                style={{
                                    alignSelf: 'flex-end',
                                    padding: 2,
                                    justifyContent: 'center',
                                }}>
                                <Image
                                    source={icons.pen}
                                    style={{tintColor: colors.textPrimary}}
                                    height={18}
                                    width={18}
                                    resizeMode="contain"
                                />
                            </Pressable>
                        )}
                    </View>


                </View>
            </View>
            <View style={{flexDirection: "row", marginHorizontal: 15, justifyContent: 'center'}}>
                <View style={styles.personalDetails}>
                    <Pressable style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}
                               onPress={() => {
                                   if (status) {
                                       if (user.uid === profileInfo.uid) {
                                           navigation?.navigate('Notification', {lovitz: true})
                                       }
                                   }
                               }}>


                        <LottieView
                            source={theme.dark ? lottie.lovitzDark : lottie.lovitzLight}
                            style={{height: 40, alignSelf: 'center', backgroundColor: colors.surfaceDark}}
                            autoPlay={false}
                            loop={false}
                            ref={animation}
                        />
                        <Text onPress={() => {
                            if (status) {
                                if (user.uid === profileInfo.uid) {
                                    navigation?.navigate('Notification', {lovitz: true})
                                }
                            }
                        }}
                              adjustsFontSizeToFit={true}
                              numberOfLines={1}
                              style={{
                                  color: colors.lovitzRealTimeCount,
                                  marginLeft: 5,
                                  fontSize: 18,
                              }}>{lovitzCount >= 0 ? lovitzCount : 0}</Text>
                    </Pressable>
                </View>
                <View style={{flex: 1, alignSelf: "center", flexDirection: "row"}}>
                    {profileInfo?.uid && profileInfo.blockStatus != null ? (
                                profileInfo.blockStatus?(
                                    <View style={styles.blueButtonRow}>
                                        <Text>This SPACE is not accessible.</Text>
                                    </View>
                                ):
                                    (
                                        profileInfo.followStatus != null && (
                                            <View style={styles.blueButtonRow}>
                                                <GradiantButton
                                                    cornerRadius={5}
                                                    colors={[colors.chatButton, colors.chatButton]}
                                                    iconSize={35}
                                                    labelStyle={{
                                                        fontSize: scale.font.s,
                                                        color: colors.chatButtonText,
                                                        paddingHorizontal: 5,
                                                    }}
                                                    borderStyle={theme.dark?{borderWidth:1,borderColor:colors.darkModeBorder}:{}}
                                                    height={scale.ms(30)}
                                                    style={{width: '50%'}}
                                                    label={Platform.OS === 'ios' ? '1 : 1' : '1:1'}
                                                    leftIco={iconAssets.chat}
                                                    // leftIco={screens.chat2}
                                                    onPress={() => {
                                                        if (status) {
                                                            if (user.uid === profileInfo.uid) {
                                                                redirect2Chat();
                                                            } else {
                                                                if(profileInfo.blockStatus){
                                                                    alert(strings.userAccessDenied);
                                                                }else {
                                                                    if (profileInfo.followStatus) {
                                                                        redirect2Chat();
                                                                    } else {
                                                                        alert(strings.collabFirst);
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }}
                                                />

                                                {profileInfo.uid !== user.uid && (
                                                    <GradiantButton
                                                        cornerRadius={5}
                                                        colors={
                                                            status ?
                                                                    profileInfo.followStatus
                                                                        ? [colors.collabingButton, colors.collabingButton]
                                                                        : [colors.customNGreen, colors.customNGreen]
                                                                :
                                                                ['#808080', '#808080']
                                                        }
                                                        labelStyle={status ? {
                                                            fontSize: scale.font.s,
                                                            color:
                                                                profileInfo.followStatus
                                                                    ? colors.collabingButtonText
                                                                    : colors.customDBlue,
                                                            paddingHorizontal: 5,
                                                        } : {
                                                            fontSize: scale.font.s,
                                                            color: '#FFF',
                                                            paddingHorizontal: 5,
                                                        }}
                                                        height={scale.ms(30)}
                                                        label={
                                                            profileInfo.followStatus
                                                                    ? 'Collabing'
                                                                    : 'Collab Now'
                                                        }
                                                        borderStyle={ profileInfo.blockStatus ? {}: profileInfo.followStatus?theme.dark?{borderWidth:1,borderColor:colors.darkModeBorder}:{}:{}}
                                                        style={{width: '50%'}}
                                                        onPress={manageCollab}
                                                    />
                                                )}
                                                {profileInfo.uid === user.uid && (
                                                    <GradiantButton
                                                        cornerRadius={5}
                                                        colors={[colors.inviteButton, colors.inviteButton]}
                                                        iconSize={20}
                                                        labelStyle={{
                                                            fontSize: scale.font.s,
                                                            color: colors.inviteButtonText,
                                                            paddingHorizontal: 5,
                                                        }}
                                                        height={scale.ms(30)}
                                                        label={'Invite'}
                                                        borderStyle={theme.dark?{borderWidth:1,borderColor:colors.darkModeBorder}:{}}
                                                        leftIco={iconAssets.invite}
                                                        // leftIco={screens.invite}
                                                        style={{width: '50%'}}
                                                        onPress={onShare}
                                                    />
                                                )}

                        </View>
                                        )
                                    )
                        )
                        : (
                        <View style={[styles.blueButtonRow, {alignItems: 'center', justifyContent: 'center'}]}>
                            <LottieView
                                source={lottie.loader}
                                style={{margin: 10, height: 25, alignSelf: 'center'}}
                                autoPlay
                                loop
                            />
                        </View>
                    )}
                </View>

            </View>

            <ProgressLoader visible={isLoading}/>
        </View>
    );
}

const SpaceStyle = ({colors}) => {
    return StyleSheet.create({
        personalSpace: {
            flexDirection: 'row',
            paddingTop: 10,
            paddingHorizontal: 10,
            width: '100%',
        },
        personalSpaceSecondary: {
            flexDirection: 'row',
            paddingHorizontal: 10,
            width: '100%',
        },
        primaryContainer: {
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: '35%',
        },
        secondaryContainer: {
            flexDirection: 'column',
            flex: 1,
        },
        iconCountContainer: {flexDirection: 'row', width: '100%'},
        iconContainerCenter: {
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: '25%',
        },
        iconContainerImage: {
            marginVertical: 10,
            width: scale.ms(25),
            height: scale.ms(25),
            resizeMode: 'contain',
        },
        iconContainerTitle: {fontSize: scale.font.xs, color: colors.textPrimary},
        iconContainerSubTitle: {fontSize: scale.font.xs, color: colors.textPrimary},
        personalDetails: {
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
            paddingHorizontal: 10,
            paddingVertical: 10,
            width: '35%',
            marginRight: '2%'
        },
        businessName: {fontSize: scale.font.l, color: colors.textPrimaryDark},
        taglines: {
            fontSize: scale.font.l,
            // fontFamily: fonts.ShadowsIntoLight,
            color: colors.textPrimary,
            textAlign: 'center',
            width: '100%',
            fontStyle:'italic'
        },
        suburbView: {fontSize: scale.font.xs, color: colors.textPrimary},
        personalMoto: {
            flexDirection: 'row',
            paddingTop: 10,
            paddingBottom: 10,
            marginLeft: 10,
            marginRight: 5,
            color: colors.textPrimary,
        },
        motoDetailView: {
            color: colors.textPrimary,
            fontSize: scale.font.xxs,
            width: '95%',
            minHeight: 10,
            maxHeight: 60,
        },
        introView: {
            color: colors.textPrimary,
            fontSize: scale.font.xs,
            width: '95%',
            minHeight: 10,
            maxHeight: 60,
        },
        actionIcon: {
            alignSelf: 'flex-end',
        },
        myTitleCount: {
            // color: '#945860',
            color: colors.titlePopupText,
            marginEnd: 5,
            alignSelf:'flex-end',
            fontSize: scale.font.l,
        },
        myTitleLabel: {
            flex:1,
            color: colors.titlePopupText,
            marginStart: 5,
            fontSize: scale.font.l,
        },
        clipsPopupText: {
            color: colors.titlePopupText,
            fontSize: scale.font.l,
            textAlignVertical:'center',
            alignSelf:'center'
        },
        myTitleView: {
            flexDirection: 'row',
            width: '100%',
            justifyContent:'space-between',
            marginVertical: 3,
        },
        blueButtonRow: {
            width: '100%',
            flexDirection: 'row',
            paddingRight: 20,
            paddingLeft: 10,
        },
    });
};
