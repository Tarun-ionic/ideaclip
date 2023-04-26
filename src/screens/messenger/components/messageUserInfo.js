/* eslint-disable react-native/no-inline-styles */
// noinspection JSUnresolvedVariable

/**
 * Message Bubble user info
 * for show user messages
 *
 * created by akhi
 * created on 30 may 2021
 * created for ideaclip
 */
import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import scale from 'utilities/scale';
import {Time2String} from '../../../lib/storage';
import ImageIcon from 'screens/components/utility/imageIcon';
import PropTypes from 'prop-types';
import MessageBubbleArrow from './messageBubbleArrow';
import {onTrigger} from 'utilities/helper';
import {useTheme} from '../../../context/ThemeContext';

export default function MessageUserInfo({
                                            userName,
                                            userDp,
                                            time = '',
                                            position = 'left',
                                            theme,
                                            onPress,
                                        }) {
    const {width} = useTheme();
    const styles = style(theme, width);
    const handleOnPress = () => {
        onTrigger(onPress);
    };

    return (
        <View
            style={[
                styles.messageBubble,
                position === 'left' ? styles.leftBubble : styles.rightBubble,
            ]}>
            <Pressable style={styles.avatarBubble} onPress={handleOnPress}>
                <ImageIcon
                    size={40}
                    source={userDp}
                    style={{opacity: position === 'left' ? 1 : 0}}
                />
                <View style={styles.labelContainerBubble}>
                    <Text
                        style={[
                            styles.labelBubble,
                            {textAlign: position === 'left' ? 'left' : 'right'},
                        ]}>
                        {userName}
                    </Text>
                    <Text
                        style={[
                            styles.timeBubble,
                            {textAlign: position === 'left' ? 'left' : 'right'},
                        ]}>
                        {Time2String(time)}
                    </Text>
                </View>
                <ImageIcon
                    size={40}
                    source={userDp}
                    style={{opacity: position === 'left' ? 0 : 1}}
                />
            </Pressable>
        </View>
    );
}

MessageBubbleArrow.propTypes = {
    userName: PropTypes.string.isRequired,
    userDp: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
    theme: PropTypes.object.isRequired,
    onPress: PropTypes.func,
    position: PropTypes.oneOf(['left', 'right']).isRequired,
};

const style = (colors, width) =>
    StyleSheet.create({
        avatar: {
            padding: scale.ms(5),
            flexDirection: 'row',
            flex: 1,
        },
        messageBubble: {
            width: width,
            flexDirection: 'column',
            marginVertical: scale.ms(10),
            paddingHorizontal: scale.ms(5),
        },
        labelContainerBubble: {
            flex: 1,
            flexDirection: 'column',
            marginHorizontal: 5,
        },
        labelBubble: {
            fontSize: scale.font.s,
            color: colors.textPrimaryDark,
        },
        timeBubble: {
            fontSize: scale.font.xs,
            marginTop: -5,
            color: colors.textPrimaryDark,
        },
        leftBubble: {
            marginLeft: 5,
            alignSelf: 'flex-end',
        },
        rightBubble: {
            alignSelf: 'flex-end',
            alignItems: 'flex-end',
            marginRight: 5,
        },
    });
