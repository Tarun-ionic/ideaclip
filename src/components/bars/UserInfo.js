/* eslint-disable react-native/no-inline-styles */
// noinspection DuplicatedCode,ES6CheckImport,JSUnresolvedVariable

import React, {useEffect, useState} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import ActionMenu from '../popup/ActionMenu';
import {useTheme} from '../../context/ThemeContext';
import {images, screens} from '../../utilities/assets';
import {cacheFile, Time2String} from '../../lib/storage';
import ImageIcon from '../../screens/components/utility/imageIcon';
import logger from '../../lib/logger';

export default function UserInfo({user, time, actionMenu, reactionCount}) {
    const {colors, fontFamily} = useTheme().theme;
    const [avatar, setAvatar] = useState(images.defaultAvatar);

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
            backgroundColor: '#efefef',
        },
        labelContainer: {
            flex: 1,
            flexDirection: 'column',
            marginHorizontal: 5,
        },
        label: {
            fontSize: 14,
            fontFamily,
            color: colors.textPrimaryDark,
        },
        time: {
            fontSize: 12,
            fontFamily,
            color: colors.textPrimaryDark,
        },
    });

    useEffect(() => {
        if (user?.profileImage) {
            if (user?.profileImageB64) {
                setAvatar({uri: user.profileImageB64});
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
                />
            </View>

            <View style={styles.labelContainer}>
                <Text style={[styles.label]}>{user?.displayName}</Text>
                {time && <Text style={[styles.time]}>{Time2String(time)}</Text>}
            </View>
            {reactionCount > 0 && (
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
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
