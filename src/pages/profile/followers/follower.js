/* eslint-disable react-hooks/exhaustive-deps,react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';

import {Pressable, Text, TouchableOpacity, View} from 'react-native';
import {placeHolders} from '../../../utilities/assets';
import {onTrigger} from '../../../utilities/helper';
import {useTheme} from '../../../context/ThemeContext';
import {SearchListStyles} from '../../../system/styles/searchStyle';
import {cacheFile} from '../../../lib/storage';
import ImageIcon from '../../../screens/components/utility/imageIcon';
import logger from '../../../lib/logger';
import {block} from '../../../utilities/collab';
import Toast from 'react-native-simple-toast';
import {useSession} from '../../../context/SessionContext';
import {strings} from "../../../constant/strings";

function Follower({follower, profileId, onPress}) {
    const {theme} = useTheme();
    const styles = SearchListStyles(theme);
    const session = useSession();
    const {user} = session;
    const [item, setItem] = useState(follower.item);
    const [blocked, setBlocked] = useState(false);
    const [logo, setLogo] = useState(placeHolders.avatar);

    useEffect(() => {
        if (follower && follower.item) {
            setItem(follower.item);
        }
    }, [follower]);

    useEffect(() => {
        if (item.details && item.details.profileImage) {
            if (item.details.profileImageB64) {
                setLogo({uri: item.details.profileImageB64});
            } else {
                cacheFile(item.details.profileImage, 'dp')
                    .then(path => setLogo({uri: path}))
                    .catch(logger.e);
            }
        }
        if (!item.blockStatus) {
            setBlocked(false);
        } else {
            setBlocked(true);
        }
    }, []);

    if (item?.details?.displayName) {
        return (
            <View style={styles.card2}>
                <Pressable
                    style={styles.cardInfo}
                    onPress={() => {
                        onTrigger(onPress, item);
                    }}>
                    <View style={styles.avatar}>
                        <ImageIcon
                            style={styles.avatarFill}
                            source={logo}
                            onPress={() => {
                                onTrigger(onPress, item);
                            }}
                        />
                    </View>
                    <View style={styles.info}>
                        <Text numberOfLines={1} style={styles.infoTitle}>
                            {item.details.displayName}
                        </Text>
                    </View>
                </Pressable>

                {profileId === user.uid && (
                    <TouchableOpacity
                        style={{
                            alignSelf: 'center',
                            zIndex: 20,
                            backgroundColor: blocked ? '#e5251e' : '#5c75ed',
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            borderRadius: 5,
                            margin: 5,
                            minWidth: 90,
                        }}
                        onPress={() => {
                            block(user.uid, item.uid, blocked, session)
                                .then(status => {
                                    if (status != null) {
                                        Toast.show(status ? strings.userBlockingCompleted : strings.userUnblockingCompleted);
                                        setBlocked(status);
                                    } else{
                                        Toast.show(blocked?strings.unblockFailed:strings.blockFailed);
                                    }
                                })
                                .catch(() => {
                                    Toast.show('Failed to block user. Please try again later.');
                                });
                        }}>
                        <View style={styles.roundedButtonWrap}>
                            <Text style={[styles.roundedButtonLabel, {color: '#FFF'}]}>
                                {blocked ? 'Unblock' : 'Block'}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}
            </View>
        );
    } else {
        return null;
    }
}

export default React.memo(Follower);
