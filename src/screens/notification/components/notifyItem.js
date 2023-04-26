import React, {useEffect, useState} from 'react';
import logger from '../../../lib/logger';
import {Text, TouchableWithoutFeedback, View} from 'react-native';
import {placeHolders} from '../../../utilities/assets';
import {onTrigger} from '../../../utilities/helper';
import {useMutation} from '@apollo/client';
import {mutations} from '../../../schema';
import {useTheme} from '../../../context/ThemeContext';
import {SearchListStyles} from '../../../system/styles/searchStyle';
import {cacheFile, Time2String} from '../../../lib/storage';
import ImageIcon from '../../components/utility/imageIcon';

function NotifyItem({notification, onPress, uid, lovitz = false}) {
    const {theme} = useTheme();
    const styles = SearchListStyles(theme);
    const [item, setItem] = useState(notification.item);
    const [read, setRead] = useState(false);
    const [changeReadStatus] = useMutation(lovitz ? mutations.lovitzNotificationRead : mutations.notificationRead);
    const [avatar, setAvatar] = useState(placeHolders.avatar);

    useEffect(() => {
        if (item && item.orgData && item.orgData.profileImage) {
            if (item.orgData.profileImageB64) {
                setAvatar({uri: item.orgData.profileImageB64});
            } else {
                cacheFile(item.orgData.profileImage, 'dp')
                    .then(path => {
                        setAvatar({uri: path});
                    })
                    .catch(logger.e);
            }
        }
    }, [item]);

    useEffect(() => {
        if (notification && notification.item) {
            setItem(notification.item);
        }
    }, [notification]);

    const notificationPressed = i => {
        if (i.readStatus) {
            onTrigger(onPress, i);
        } else {
            changeReadStatus({
                variables: {
                    userId: uid,
                    notificationId: i.id,
                    readStatus: true,
                },
            })
                .then(() => {
                    setRead(true);
                    onTrigger(onPress, i);
                })
                .catch(err => {
                    logger.e(err);
                });
        }
    };
    return (
        <TouchableWithoutFeedback onPress={() => notificationPressed(item)}>
            <View style={styles.card}>
                <View style={styles.avatar}>
                    <ImageIcon style={styles.avatarFill} source={avatar}/>
                </View>
                <View style={styles.info}>
                    {item.title && (
                        <Text numberOfLines={1} style={styles.infoTitle}>
                            {item.title}
                        </Text>
                    )}
                    {item.message && (
                        <Text numberOfLines={2} style={styles.subTitle}>
                            {item.message}
                        </Text>
                    )}
                    {item?.createdOn && (
                        <Text numberOfLines={1} style={styles.subTitle}>
                            {Time2String(item?.createdOn?.toString())}
                        </Text>
                    )}
                </View>
                <View style={styles.info2}>
                    <View style={{flex: 1, minHeight: "50%"}}>
                        {!item.readStatus && !read && <View style={[styles.unRead]}/>}
                    </View>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
}

export default React.memo(NotifyItem);
