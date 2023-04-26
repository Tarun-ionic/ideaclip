// noinspection ES6CheckImport,JSUnresolvedVariable

import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {moderateScale} from 'react-native-size-matters';
import {useTheme} from '../../context/ThemeContext';
import {Icon} from 'react-native-elements';
import PropTypes from 'prop-types';

export default function AuthBarWhite({title = '', onBackPress}) {
    const {theme} = useTheme();
    const {colors} = theme;
    const styles = styleSheet(theme);
    return (
        <View style={styles.backgroundStyle}>
            <View style={styles.viewContainer}>
                {onBackPress && (
                    <Icon
                        color={colors.secondaryDark}
                        name="chevron-left"
                        size={25}
                        type="font-awesome-5"
                        onPress={onBackPress}
                    />
                )}
                <Text numberOfLines={1} style={styles.TitleText}>
                    {title}
                </Text>
            </View>
        </View>
    );
}
AuthBarWhite.propTypes = {
    title: PropTypes.string.isRequired,
    onBackPress: PropTypes.func.isRequired,
};

const styleSheet = ({colors, fontFamily}) =>
    StyleSheet.create({
        backgroundStyle: {
            width: '100%',
            height: moderateScale(50, 0.3),
            backgroundColor: 'white',
            elevation: 10,
        },
        viewContainer: {
            flexDirection: 'row',
            alignSelf: 'center',
            alignContent: 'center',
            alignItems: 'center',
            flex: 1,
            paddingHorizontal: 10,
        },
        TitleText: {
            flex: 1,
            fontFamily,
            fontSize: 18,
            letterSpacing: 1,
            marginLeft: 3,
            color: colors.secondaryDark,
        },
    });
