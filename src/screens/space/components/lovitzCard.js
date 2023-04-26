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
import Moment from 'moment';

export default function LovitzCard({item, _key, user}) {
    const {theme} = useTheme();
    const styles = lovitzCardStyle(theme);
    const navigation = useNavigation();
    const [userInfo, setUserInfo] = useState(item);
    const [avatar, setAvatar] = useState(placeHolders.avatar);

    useEffect(() => {
        setUserInfo(item);
    }, [item]);

    useEffect(() => {
        let mounted = true;
        if (
            userInfo.userDetails.profileImage &&
            userInfo.userDetails.profileImage.trim().length > 0
        ) {
            if (userInfo.userDetails.profileImageB64) {
                setAvatar({uri: userInfo.userDetails.profileImageB64});
            } else {
                cacheFile(userInfo.userDetails.profileImage, 'dp')
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
            profile: {...userInfo?.userDetails, uid: userInfo?.userDetails.uid},
            goBack: true,
        });
    };

    const dateString = timeStamp => {
        const pts = new Date(parseFloat(timeStamp));
        const pt = {
            time: Moment(pts).format('h:mm a'),
            date: Moment(pts).format('D MMM YYYY'),
        };
        return `${pt.time} on ${pt.date}`;
    };

    return (
        <View style={styles.card}>
            <Pressable style={styles.cardInfo} onPress={gotoPersonalSpace}>
                <View style={styles.avatar}>
                    <ImageIcon
                        containerStyle={styles.avatar}
                        source={avatar}
                        onPress={gotoPersonalSpace}
                    />
                </View>
                <View style={styles.info}>
                    <Text numberOfLines={1} style={styles.infoTitle}>
                        {userInfo.userDetails.displayName}
                    </Text>
                    <Text numberOfLines={1} style={styles.infoTitle}>
                        {`at ${dateString(userInfo.updatedOn)}`}
                    </Text>
                </View>
            </Pressable>
        </View>
    );
}

const lovitzCardStyle = ({colors}) =>
    StyleSheet.create({
        card: {
            flexDirection: 'row',
            flex: 1,
            marginHorizontal: 20,
            marginTop: 10,
            marginBottom: 5,
            borderColor: '#acacac',
            borderRadius: 15,
            borderWidth: 0.5,
            paddingVertical: 5,
            paddingHorizontal: 12,
        },
        cardInfo: {
            flexDirection: 'row',
            flex: 1,
        },
        avatar: {
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
