// noinspection JSUnresolvedFunction

import {Pressable, StyleSheet, Text, View} from 'react-native';
import scale from 'utilities/scale';
import React, {useEffect, useState} from 'react';
import {useTheme} from 'context/ThemeContext';
import {fonts, placeHolders, screens} from 'utilities/assets';
import {cacheFile} from '../../../lib/storage';
import ImageIcon from 'screens/components/utility/imageIcon';
import {logger} from '../../../index';
import {useNavigation} from '@react-navigation/native';
import {userType} from '../../../utilities/constant';
import {LineView} from '../../../system/ui/components';
import {useAlert} from '../../../context/AlertContext';
import {strings} from '../../../constant/strings';
import {useSession} from '../../../context/SessionContext';

export default function CoSpaceInfo({
                                        spaceInfo,
                                        isMostLovits = false,
                                        disabled = false,
                                        blocked = false,
                                        temporarySpace = false,
                                    }) {
    const navigation = useNavigation();
    const {theme, width} = useTheme();
    const styles = infoStyle(theme, width);
    const {user} = useSession();
    const [avatar, setAvatar] = useState(placeHolders.avatar);
    const alert = useAlert();

    useEffect(() => {
        if (temporarySpace) {
            setAvatar(placeHolders.tempLogo);
        } else {
            if (spaceInfo.profileImage) {
                if (!spaceInfo.profileImage.includes('://')) {
                    if (spaceInfo.profileImageB64) {
                        setAvatar({uri: spaceInfo.profileImageB64});
                    } else {
                        cacheFile(spaceInfo.profileImage, 'dp')
                            .then(path => setAvatar({uri: path}))
                            .catch(logger.e);
                    }
                } else {
                    setAvatar({uri: spaceInfo.profileImage});
                }
            }
        }
    }, [spaceInfo]);

    const motto =
        spaceInfo.userType === userType.general
            ? spaceInfo?.lifeMotto || null
            : spaceInfo?.slogan || null;

    const locInfo = () => {
        return !spaceInfo.suburb ? null : (
            <Text style={styles.suburbView} numberOfLines={1}>
                {spaceInfo.suburb && spaceInfo.stateShort
                    ? `${spaceInfo.suburb}, ${spaceInfo.stateShort}`
                    : spaceInfo.suburb}
            </Text>
        );
    };

    return (
        <View>
            <View style={styles.infoCard}>
                <Pressable
                    style={styles.container}
                    onPress={() => {
                        if (!temporarySpace) {
                            navigation.push('PersonalSpace', {
                                user,
                                profile: spaceInfo,
                                goBack: true,
                            });
                        }
                    }}>
                    <ImageIcon
                        size={60}
                        source={avatar}
                        onPress={() => {
                            if (!temporarySpace) {
                                navigation.push('PersonalSpace', {
                                    user,
                                    profile: spaceInfo,
                                    goBack: true,
                                });
                            }
                        }}
                    />
                    <View style={styles.infoContainer}>
                        <Text style={[styles.infoText, {fontSize: scale.font.l}]}>
                            {spaceInfo.displayName}
                        </Text>
                        {motto && motto?.length > 0 && (
                            <Text style={styles.taglines} numberOfLines={1}>
                                {motto}
                            </Text>
                        )}

                        {locInfo()}
                    </View>
                </Pressable>
                <View style={styles.infoButtonOuter}>
                    <ImageIcon
                        size={30}
                        source={screens.search_ico}
                        onPress={() =>
                            (disabled || blocked)
                                ? alert({
                                    message: blocked? strings.userAccessDenied : strings.collabAlertMessage,
                                    buttons: [
                                        {label: strings.ok, callback: () => alert.clear()},
                                    ],
                                    autoDismiss: false,
                                    cancellable: false,
                                })
                                : navigation.navigate('CoSpaceSearch', {spaceInfo, temporarySpace})
                        }
                    />
                </View>
                <View style={styles.infoButtonOuter}>
                    <ImageIcon
                        size={30}
                        source={screens.flip_ico}
                        onPress={() =>
                            (disabled || blocked)
                                ? alert({
                                    message: blocked? strings.userAccessDenied : strings.collabAlertMessage,
                                    buttons: [
                                        {label: strings.ok, callback: () => alert.clear()},
                                    ],
                                    autoDismiss: false,
                                    cancellable: false,
                                })
                                : isMostLovits
                                ? navigation.navigate('ClipCoSpace', {
                                    spaceInfo,
                                    temporarySpace,
                                })
                                : navigation.navigate('MostLovitsSpace', {
                                    spaceInfo,
                                    temporarySpace,
                                })
                        }
                    />
                </View>
            </View>
            <LineView spacing={0} width={'95%'}/>
        </View>
    );
}

const infoStyle = ({colors}, width) => {
    return StyleSheet.create({
        infoCard: {
            flexDirection: 'row',
            backgroundColor: colors.surfaceDark,
            width: width,
            paddingVertical: 5,
            paddingHorizontal: 15,
        },
        suburbView: {fontSize: scale.font.xs, color: colors.textPrimary},
        infoContainer: {
            flexDirection: 'column',
            flex: 1,
            marginHorizontal: 15,
            alignSelf: 'center',
            color: colors.textPrimaryDark,
        },
        infoText: {fontSize: scale.font.s, color: colors.textPrimaryDark},
        taglines: {
            fontSize: scale.font.s,
            fontFamily: fonts.ShadowsIntoLight,
            color: colors.textPrimary,
        },
        infoLine: {
            width: '95%',
            alignSelf: 'center',
            height: 1,
            backgroundColor: colors.textPrimary,
            opacity: 0.5,
        },
        infoButtonOuter: {alignSelf: 'center', marginHorizontal: 10},
        container: {flexDirection: 'row', flex: 1, alignItems: 'center'},
    });
};
