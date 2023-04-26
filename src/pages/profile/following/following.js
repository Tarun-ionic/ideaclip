/* eslint-disable react-hooks/exhaustive-deps,react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';

import {Text, TouchableOpacity, View} from 'react-native';
import {placeHolders} from '../../../utilities/assets';
import {onTrigger} from '../../../utilities/helper';
import {useTheme} from '../../../context/ThemeContext';
import {SearchListStyles} from '../../../system/styles/searchStyle';
import {cacheFile} from '../../../lib/storage';
import Pressable from 'react-native/Libraries/Components/Pressable/Pressable';
import ImageIcon from '../../../screens/components/utility/imageIcon';
import logger from '../../../lib/logger';
import {collab, uncollab} from '../../../utilities/collab';
import Toast from 'react-native-simple-toast';
import {useSession} from '../../../context/SessionContext';

function Following({follower, onPress, profileId}) {
    const {theme} = useTheme();
    const styles = SearchListStyles(theme);
    const session = useSession();
    const {user} = session;
    const [item, setItem] = useState(follower.item);
    const [logo, setLogo] = useState(placeHolders.avatar);
    const [uncollabed, setUncollabed] = useState(false);
    const {colors} = theme;

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
    }, []);
    const updateFailed = () => {
        Toast.show('Failed to update collab status. Please try again later.');
    };
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
                            backgroundColor: item.followStatus
                                ? colors.customLBlue
                                : uncollabed
                                    ? '#e4fcfa'
                                    : '#38446d',
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            borderRadius: 5,
                            margin: 5,
                            minWidth: 100,
                            alignContent: 'center',
                            justifyContent: 'center',
                        }}
                        onPress={() => {
                            if (item.followStatus) {
                                uncollab(user.uid, item.uid, session)
                                    .then(() => {
                                        setUncollabed(true);
                                        setItem(profile => ({...profile, followStatus: false}));
                                    })
                                    .catch(updateFailed);
                            } else {
                                if (uncollabed) {
                                    collab(
                                        {
                                            uid: user.uid,
                                            followStatus: true,
                                            notificationStatus: true,
                                            displayName: user.displayName,
                                        },
                                        item.uid,
                                        session
                                    )
                                        .then(() => {
                                            setUncollabed(false);
                                            setItem(profile => ({...profile, followStatus: true}));
                                        })
                                        .catch(updateFailed);
                                }
                            }
                        }}>
                        <View style={styles.roundedButtonWrap}>
                            <Text
                                style={[
                                    styles.roundedButtonLabel,
                                    {
                                        color: item.followStatus
                                            ? '#FFF'
                                            : uncollabed
                                                ? colors.customViolet
                                                : '#fff',
                                    },
                                ]}>
                                {item.followStatus
                                    ? 'Collabing'
                                    : uncollabed
                                        ? 'Collab'
                                        : 'Pending'}
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

export default React.memo(Following);
