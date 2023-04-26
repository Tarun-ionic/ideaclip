/* eslint-disable react-hooks/exhaustive-deps,react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';

import {Pressable, Text, TouchableOpacity, View} from 'react-native';
import {placeHolders} from '../../../utilities/assets';
import {onTrigger} from '../../../utilities/helper';
import {useTheme} from '../../../context/ThemeContext';
import {cacheFile} from '../../../lib/storage';
import ImageIcon from '../../../screens/components/utility/imageIcon';
import logger from '../../../lib/logger';
import {block} from '../../../utilities/collab';
import Toast from 'react-native-simple-toast';
import {useSession} from '../../../context/SessionContext';
import {strings} from "../../../constant/strings";
import {UserListStyle} from "./userListStyle";

function BlockedUserCard({item, user,onPress}) {
    const session = useSession()
    const {theme} = useTheme();
    const styles = UserListStyle(theme);
    const [blocked, setBlocked] = useState(false);
    const [logo, setLogo] = useState(placeHolders.avatar);

    

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
        if (item.isBlocked) {
            setBlocked(true);
        } else {
            setBlocked(false);
        }
    }, [item]);

    if (item?.displayName) {
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
                            {item.displayName}
                        </Text>
                    </View>
                </Pressable>

    
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
                            block(user.uid, item.profileId, blocked, session)
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
                
            </View>
        );
    } else {
        return null;
    }
}

export default React.memo(BlockedUserCard);
