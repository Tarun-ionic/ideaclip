/* eslint-disable react-hooks/exhaustive-deps */
// noinspection JSUnresolvedFunction

import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import scale from 'utilities/scale';
import {useTheme} from 'context/ThemeContext';
import {useNavigation} from "@react-navigation/native";
import {useMutation} from "@apollo/client";
import {useDebounce} from "../../../utilities/helper";
import {clipTypes} from "../../../utilities/constant";
import {AlertBox, AnimatedTouchable, GradiantButton} from "../../../system/ui/components";
import {logger} from "../../../index";
import {screens} from "../../../utilities/assets";
import {strings} from "../../../constant/strings";
import {mutations} from "../../../schema";

export default function CollabCard({item, _key, user}) {
    const {theme} = useTheme();
    const styles = CollabCardStyles(theme);
    const [collabInfo, setCollabInfo] = useState(item);
    const navigation = useNavigation();
    const [following] = useMutation(mutations.following);
    const [unfollow] = useMutation(mutations.unfollow);
    const {colors} = theme;
    const {debounce} = useDebounce();
    const initState = {invite: false,collab:false,showAlert:false}
    const [state, setState] = useState(initState)

    const showAlert = () => {
        if (state.invite === true) {
            const message = `Are you looking for "${collabInfo.name.trim()}"${
                collabInfo.address ? ', ' + collabInfo.address + '?' : '.'
            } If yes, then you will be redirected to its Temporary IDEACLIP Co-space.`;
            const config = {
                visibility: true,
                message: message,
                buttons: [
                    {
                        label: strings.cancel,
                        callback: () => {
                            setState(initState)
                        },
                    },
                    {
                        label: strings.ok,
                        callback: () => {
                            navigation.push('coSpaceSplash', {
                                spaceInfo: {
                                    displayName: collabInfo.name,
                                    profileImage: collabInfo.logo,
                                    spaceId: collabInfo.place_id,
                                    spaceType: clipTypes.clip,
                                },
                                locationInfo: collabInfo,
                            });
                            setState(initState)
                        },
                    },
                ],
                autoDismiss: true,
                cancellable: false,
            }
            return (<AlertBox config={config}/>)
        } else if (state.collab === true) {
            const message = `You will now be redirected to its Business/Charity/NFP SPACE.`;
            const config = {
                visibility: true,
                message: message,
                buttons: [
                    {
                        label: strings.cancel,
                        callback: () => {
                            setState(initState)
                        },
                    },
                    {
                        label: strings.ok,
                        callback: () => {
                            changeFollow()
                            setCollabInfo(org => ({...org, isFollower: true}));
                            setState(initState)
                        },
                    },
                ],
                autoDismiss: true,
                cancellable: false,
            }
            return (<AlertBox config={config}/>)
        } else return null

    }

    const changeFollow = () => {
        if (collabInfo.isFollower) {
            if (user.uid !== collabInfo.bid) {
                navigation.replace('PersonalSpace', {goBack: true, user: user, profile: {uid: collabInfo.bid}})
            } else {
                directToPersonalSpace()
            }
        } else {
            following({
                variables: {
                    profileId: collabInfo.bid,
                    data: {
                        uid: user.uid,
                        followStatus: true,
                        notificationStatus: true,
                        displayName: user.userName,
                    },
                },
            })
            .then(() => {
                if (user.uid !== collabInfo.bid) {
                    navigation.replace('PersonalSpace', {goBack: true, user: user, profile: {uid: collabInfo.bid}})
                } else {
                    directToPersonalSpace()
                }
                setCollabInfo(org => ({...org, isFollower: true}));
            })
            .catch(()=>{
                setCollabInfo(org => ({...org, isFollower: false}));
            });
        }
    };

    const directToPersonalSpace = () => {
        debounce(navigation.replace('PersonalSpace', {goBack: false, user}));
    }

    const handleInvite = () => {
        debounce(setState(sa => ({...sa, invite: true, showAlert: true})))
    }

    const HandleFollow = () => {
        debounce(setState(sa => ({...sa, collab: true, showAlert: true})))
    }


    const navigator = () => {
        if (collabInfo?.member_organisation && collabInfo.displayName?.length > 0) {
            HandleFollow()
        } else if (!collabInfo?.member_organisation) {
            if (state.invite === false) {
                handleInvite()
            }
        } else {
            handleInvite()
        }
    }

    const handleNavigation = () => {
        debounce(navigator)
    }

    const viewButton = () => {
        if (
            collabInfo?.member_organisation &&
            collabInfo.displayName?.length > 0
        ) {
            if (user.uid !== collabInfo.bid) {
                if (collabInfo.isFollower) {
                    return (
                        <GradiantButton
                            style={{minWidth: 100}}
                            cornerRadius={5}
                            labelStyle={{color: '#fff'}}
                            locations={[0.6, 0.83]}
                            colors={[colors.customLBlue, colors.customLBlue]}
                            label={strings.Collabing}
                            onPress={HandleFollow}
                        />
                    );
                }else if (state.collab) {
                    return (
                        <GradiantButton
                            style={{minWidth: 100}}
                            cornerRadius={5}
                            labelStyle={{color: '#fff'}}
                            locations={[0.6, 0.83]}
                            colors={[colors.customLBlue, colors.customLBlue]}
                            label={strings.Collabing}
                        />
                    );
                } else {
                    return (
                        <GradiantButton
                            style={{minWidth: 100}}
                            cornerRadius={5}
                            labelStyle={{color: '#476172'}}
                            locations={[0.6, 0.83]}
                            rightIco={screens.collab_search}
                            colors={['#e3fbfd', '#e3fbfd']}
                            label={strings.Collab}
                            onPress={HandleFollow}
                        />
                    );
                }
            } else {
                return (
                    <GradiantButton
                        style={{minWidth: 100}}
                        cornerRadius={5}
                        labelStyle={{color: '#fff'}}
                        locations={[0.6, 0.83]}
                        colors={[colors.customLBlue, colors.customLBlue]}
                        label={strings.mySpace}
                        onPress={directToPersonalSpace}
                    />
                );
            }
        } else if (!collabInfo?.member_organisation) {
            if (state.invite === true) {
                return (
                    <GradiantButton
                        style={{minWidth: 100}}
                        cornerRadius={5}
                        labelStyle={{color: '#ffffff'}}
                        locations={[0.6, 0.83]}
                        colors={['#e5030f', '#841d78']}
                        label={'Inviting'}
                    />
                );
            } else {
                return (
                    <GradiantButton
                        style={{minWidth: 100}}
                        cornerRadius={5}
                        labelStyle={{color: '#dd1a1e'}}
                        rightIco={screens.invite_search}
                        colors={['#ffdae2', '#ffdae2']}
                        label={'Invite'}
                        onPress={handleInvite}
                    />
                );
            }
        } else {
            return (
                <GradiantButton
                    style={{minWidth: 100}}
                    cornerRadius={5}
                    labelStyle={{color: '#ffffff'}}
                    locations={[0.6, 0.83]}
                    colors={['#e5030f', '#841d78']}
                    label={'Invited'}
                    onPress={handleInvite}
                />
            );
        }
    }


    return (
        <View style={styles.card}>
            <AnimatedTouchable style={styles.info} onPress={handleNavigation}>
                <Text numberOfLines={1} style={styles.infoTitle}>
                    {collabInfo?.name}
                </Text>
            </AnimatedTouchable>
            {showAlert()}
            {viewButton()}
        </View>
    );
}

const CollabCardStyles = ({colors}) =>
    StyleSheet.create({
        card: {
            flexDirection: 'row',
            backgroundColor: colors.surfaceDark,
            flex: 1,
            padding: 5,
            minHeight: 50,
        },
        cardInfo: {
            flexDirection: 'row',
            flex: 1,
        },
        organization: {
            flexDirection: 'row',
            flex: 1,
            marginHorizontal: 2,
        },
        avatar: {
            backgroundColor: colors.surfaceAccent,
            borderRadius: 50,
            width: 40,
            height: 40,
            padding: 2,
            alignItems: 'center',
            alignContent: 'center',
            overflow: 'hidden',
        },
        avatarImage: {
            margin: 7,
            width: 23,
            height: 23,
            resizeMode: 'contain',
        },
        avatarFill: {
            width: 40,
            height: 40,
            resizeMode: 'cover',
        },
        info: {
            flexDirection: 'column',
            flex: 1,
            marginLeft: 5,
            alignSelf: 'center',
            alignContent: 'center',
        },

        infoTitle: {
            marginLeft: 10,

            fontSize: scale.font.l,
            paddingEnd: 15,
            color: colors.textPrimaryDark,
        },
        subTitle: {
            marginLeft: 10,
            fontSize: scale.font.s,
            paddingEnd: 15,
            color: colors.textPrimaryDark,
        },
        actionBlock: {
            flexDirection: 'row',
            padding: 5,
            marginRight: 10,
        },
        actionText: {
            flexDirection: 'row',
            marginLeft: 5,
            color: 'black',
            fontSize: scale.font.xxl,
        },
        noRecord: {
            flexDirection: 'row',
            marginLeft: 5,
            textAlign: 'center',
            fontSize: scale.font.xxl,
            padding: 5,
            marginTop: 4,
            marginBottom: 2,
            backgroundColor: colors.surface,
            color: colors.textPrimaryDark,
        },
        lineStyle: {
            height: 1,
            borderWidth: 0.8,
            width: '95%',
            padding: 0,
            alignSelf: 'center',
            borderColor: colors.secondaryDark,
            marginStart: 10,
            marginEnd: 10,
        },
        lottie_sm: {
            height: 50,
            width: 50,
            alignSelf: 'center',
        },
        unRead: {
            position: 'absolute',
            backgroundColor: colors.secondaryAccent,
            width: 10,
            height: 10,
            top: 7.5,
            right: 7.5,
            zIndex: 5,
            borderRadius: 50,
        },
    });
