/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import scale from 'utilities/scale';
import {screens} from '../../../utilities/assets';
import {Icon} from 'react-native-elements';
import {useTheme} from '../../../context/ThemeContext';
import ImageIcon from '../../components/utility/imageIcon';
import logger from '../../../lib/logger';

export default function MinClip({
                                    secondary,
                                    text,
                                    viewer,
                                    visibility = false,
                                    onClose,
                                    enableClose = false,
                                    threading = true,
                                    onPress = () => {
                                        logger.i('default callback');
                                    },
                                    removedClip=false
                                }) {
    const {theme} = useTheme();
    const styles = threadStyles(theme);

    if (!visibility) {
        return null;
    }
    return (
        <Pressable
            style={[{flex: 1}, !removedClip&&{minHeight: scale.ms(threading ? 0 : 33, 0.3)}]}
            onPress={onPress}>
            <View
                style={[
                    styles.message,
                    secondary ? {backgroundColor: 'transparent'} : {},
                    threading
                        ? {
                            marginTop: scale.ms(20),
                            marginBottom: scale.ms(5),
                        }
                        : '',
                ]}>
                <View style={styles.labelContainer}>
                    <View style={{flexDirection: 'row'}}>
                        <Text
                            numberOfLines={2}
                            style={[
                                styles.text,
                                secondary ? {color: viewer === false ? 'black' : 'white'} : {},
                            ]}
                            onPress={onPress}>
                            {text}
                        </Text>
                        <ImageIcon
                            visibility={threading}
                            size={30}
                            rounded={false}
                            source={screens.threading}
                            onPress={onPress}
                        />
                    </View>
                </View>
                {enableClose && (
                    <Icon
                        name="cancel"
                        size={20}
                        color={'white'}
                        type="material"
                        onPress={() => onClose()}
                    />
                )}
            </View>
        </Pressable>
    );
}

const threadStyles = ({colors}) =>
    StyleSheet.create({
        message: {
            paddingHorizontal: 5,
            paddingVertical: 10,
            borderRadius: 5,
            backgroundColor: colors.clipSurfaceAccent,
            flexDirection: 'row',
            marginHorizontal: scale.ms(5),
        },
        avatar: {
            flexDirection: 'row',
            flex: 1,
        },
        labelContainer: {
            flex: 1,
            flexDirection: 'column',
        },
        label: {
            fontSize: scale.font.s,
            color: colors.clipText,
        },
        text: {
            flex: 1,
            fontSize: scale.font.s,
            textAlign: 'left',
            color: colors.clipText,
        },
    });
