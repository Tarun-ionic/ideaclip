// noinspection JSUnresolvedFunction,JSUnresolvedVariable

import React, {useEffect, useState} from 'react';
import {logger} from '../../../index';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import scale from 'utilities/scale';
import {placeHolders} from 'utilities/assets';
import {cacheFile} from '../../../lib/storage';
import {useTheme} from 'context/ThemeContext';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import ImageIcon from 'screens/components/utility/imageIcon';

export default function UserInfo({item, user, navigation}) {
    const {theme} = useTheme();
    const styles = userCardStyle(theme);
    const [userInfo, setUserInfo] = useState(item);
    const [avatar, setAvatar] = useState(placeHolders.avatar);
    const isFocused = useIsFocused()

    /////////////////////////////////////////// use effect //////////////////////////////
    useEffect(() => {
        setUserInfo(item);
    }, [item]);

    useEffect(() => {
        let mounted = true;
        if (userInfo.profileImage && userInfo.profileImage.trim().length > 0) {
            if (userInfo.profileImageB64) {
                setAvatar({uri: userInfo.profileImageB64});
            } else {
                cacheFile(userInfo.profileImage, 'dp')
                    .then(path => (mounted ? setAvatar({uri: path}) : {}))
                    .catch(logger.e);
            }
        } else {
            setAvatar(placeHolders.avatar);
        }
    }, [userInfo, isFocused]);

    const gotoPersonalSpace = () => {
        navigation.push('PersonalSpace', {
            user,
            profile: {...userInfo, uid: userInfo.uid},
            goBack: true,
        });
    };

    return (
        <Pressable style={styles.cardInfo} onPress={gotoPersonalSpace}>
            <View style={styles.avatar}>
                <ImageIcon
                    containerStyle={styles.cardAvatar}
                    source={avatar}
                    onPress={gotoPersonalSpace}
                />
            </View>
            <View style={styles.info}>
                <Text numberOfLines={1} style={styles.infoTitle}>
                    {userInfo?.displayName}
                </Text>
                <Text numberOfLines={1} style={styles.infoTitle}>
                    {userInfo?.userProfile?.suburb}
                    {userInfo?.userProfile?.countryCode !== 'AU'
                        ? userInfo?.userProfile?.state != null
                            ? userInfo?.userProfile?.suburb
                                ? `, ${userInfo?.userProfile?.state}`
                                : `${userInfo?.userProfile?.state}`
                            : ''
                        : userInfo?.userProfile?.stateShort != null
                            ? userInfo?.userProfile?.suburb
                                ? `, ${userInfo?.userProfile?.stateShort}`
                                : `${userInfo?.userProfile?.stateShort}`
                            : ''
                    }
                </Text>
            </View>
        </Pressable>
    );
}

const userCardStyle = ({colors}) =>
    StyleSheet.create({
        cardInfo: {
            flexDirection: 'row',
            flex: 1,
            alignItems: 'center',
        },
        avatar: {
            backgroundColor: colors.surfaceDark,
            borderRadius: 50,
            alignItems: 'center',
            alignContent: 'center',
            overflow: 'hidden',
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
            fontSize: 14,
            paddingEnd: 15,
            color: colors.textPrimaryDark,
        },
    });
