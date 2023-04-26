/* eslint-disable react-native/no-inline-styles */
// noinspection DuplicatedCode

import React, {useEffect, useState} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import scale from 'utilities/scale';
import ActionMenu from '../../../components/popup/ActionMenu';
import {useTheme} from '../../../context/ThemeContext';
import {placeHolders, screens} from '../../../utilities/assets';
import {cacheFile, Time2String} from '../../../lib/storage';
import ImageIcon from '../utility/imageIcon';
import logger from '../../../lib/logger';
import {useNavigation} from '@react-navigation/native';
import {useSession} from '../../../context/SessionContext';

export default function UserInfo({user, time, actionMenu, reactionCount}) {
    const {colors} = useTheme().theme;
    const [avatar, setAvatar] = useState(placeHolders.avatar);
    const session = useSession();

    const navigation = useNavigation();
    const styles = StyleSheet.create({
        userInfo: {
            flexDirection: 'row',
            paddingVertical: 10,
            flex: 1,
        },
        avatarWarp: {
            borderRadius: 50,
            backgroundColor: colors.surfaceAccent,
            elevation: 5,
        },
        emotion: {
            height: 25,
            width: 25,
            borderRadius: 50,
        },
        labelContainer: {
            alignSelf: 'center',
            flexShrink: 1,
            flexGrow: 0,
            flexDirection: 'column',
            marginHorizontal: 5,
        },
        label: {
            fontSize: scale.font.s,
            color: colors.textPrimaryDark,
        },
        time: {
            fontSize: scale.font.xs,
            color: colors.textPrimaryDark,
        },
    });
    const profileNavigation = () => {
        navigation.push('PersonalSpace', {
            user: session.user,
            profile: user,
            goBack: true,
        });
    };
    useEffect(() => {
        if (user?.profileImage) {
            if (user?.profileImageB64) {
                setAvatar({uri: user?.profileImageB64});
            } else {
                cacheFile(user?.profileImage, 'dp')
                    .then(path => setAvatar({uri: path}))
                    .catch(logger.e);
            }
        }
    }, [user?.profileImage]);

    return (
        <View style={styles.userInfo}>
            <View style={styles.avatarWarp}>
                <ImageIcon
                    size={40}
                    source={avatar}
                    onError={error => logger.e('ImageIcon', error)}
                    onPress={() => profileNavigation()}
                />
            </View>

            <View style={styles.labelContainer}>
                <Text style={[styles.label]} onPress={() => profileNavigation()}>
                    {user?.displayName}
                </Text>
                {time && <Text style={[styles.time]}>{Time2String(time)}</Text>}
            </View>
            {reactionCount > 0 && (
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                    }}>
                    <Image style={styles.emotion} source={screens.lovits}/>
                    <Text
                        style={{
                            color: colors.secondaryDark,
                            marginLeft: 5,
                            marginRight: 5,
                        }}>
                        {reactionCount}
                    </Text>
                </View>
            )}

            <ActionMenu items={actionMenu}/>
        </View>
    );
}
