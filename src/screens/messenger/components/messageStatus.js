// noinspection JSUnresolvedVariable

/**
 * Message Status
 * for show user messages Status
 *
 * created by akhi
 * created on 30 may 2021
 * created for ideaclip
 */
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import PropTypes from 'prop-types';
import {Time2String} from '../../../lib/storage';
import {Icon} from 'react-native-elements';
import {ms_status} from '../messengerHelper';
import scale from 'utilities/scale';

export default function MessageStatus({
                                          theme,
                                          time,
                                          status,
                                          position = 'left',
                                      }) {
    const styles = style(theme);

    const status_view = () => {
        switch (status) {
            case ms_status.ms_failed:
                return <Icon name="update" type="material" color="#517fa4" size={12}/>;
            case ms_status.ms_send:
                return <Icon name="done" type="material" color="#517fa4" size={12}/>;
            case ms_status.ms_delivered:
                return (
                    <Icon name="done-all" type="material" color="#517fa4" size={12}/>
                );
            case ms_status.ms_read:
                return <Icon name="done-all" type="material" color="red" size={12}/>;
            default:
                return (
                    <Icon name="schedule" type="material" color="#517fa4" size={12}/>
                );
        }
    };

    return (
        <View
            style={[
                styles.statusContainer,
                position === 'left' ? styles.status_left : styles.status_right,
            ]}>
            <Text style={styles.timeStamp}>{Time2String(time)}</Text>
            {position === 'right' && status_view()}
        </View>
    );
}

MessageStatus.propTypes = {
    time: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    theme: PropTypes.object.isRequired,
    position: PropTypes.oneOf(['left', 'right']).isRequired,
};

const style = ({colors}) =>
    StyleSheet.create({
        timeStamp: {
            fontSize: scale.font.s,
            color: colors.textPrimaryDark,
            paddingHorizontal: 5,
        },
        statusContainer: {
            flexDirection: 'row',
            flex: 1,
            padding: 3,
        },
        status_left: {
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
        },
        status_right: {
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
        },
    });
