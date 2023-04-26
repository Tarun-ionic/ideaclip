// noinspection JSUnresolvedFunction,JSUnresolvedVariable

import React, {useEffect, useState} from 'react';
import {logger} from '../../../index';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import scale from 'utilities/scale';
import {placeHolders} from 'utilities/assets';
import {cacheFile} from '../../../lib/storage';
import {useTheme} from 'context/ThemeContext';
import {useNavigation} from '@react-navigation/native';
import ImageIcon from 'screens/components/utility/imageIcon';

export default function UserCard({item, _key, user}) {
    const {theme} = useTheme();
    const styles = userCardStyle(theme);
    const navigation = useNavigation();
    const [userInfo, setUserInfo] = useState(item);
    const [avatar, setAvatar] = useState(placeHolders.avatar);

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
    }, [userInfo]);
    const gotoPersonalSpace = () => {
        navigation.push('PersonalSpace', {
            user,
            profile: {...userInfo, uid: userInfo.uid},
            goBack: true,
        });
    };

    return (
        <View style={styles.card}>
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
                        {userInfo.displayName}
                    </Text>
                </View>
            </Pressable>
        </View>
    );
}

const userCardStyle = ({colors}) =>
    StyleSheet.create({
        card: {
            flexDirection: 'row',
            borderColor: colors.textPrimaryDark,
            borderWidth: 0.5,
            flex: 1,
            marginVertical: 4,
            marginHorizontal: 20,
            borderRadius: 5,
            padding: 5,
        },
        cardInfo: {
            flexDirection: 'row',
            flex: 1,
        },
        avatar: {
            backgroundColor: colors.surfaceAccent,
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
    });
