// noinspection ES6CheckImport,JSUnresolvedVariable

/**
 * Message Bubble Arrow
 * for show user messages bubble arrow
 *
 * created by akhi
 * created on 30 may 2021
 * created for ideaclip
 */
import React from 'react';
import {StyleSheet, View} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import {moderateScale} from 'react-native-size-matters';
import PropTypes from 'prop-types';

export default function MessageBubbleArrow({
                                               isVisible = false,
                                               theme,
                                               position = 'left',
                                               color = 'gray',
                                           }) {
    const styles = style();

    if (!isVisible) {
        return null;
    } else {
        return (
            <View
                style={[
                    styles.arrow_Bubble,
                    position === 'left'
                        ? styles.arrow_left_Bubble
                        : styles.arrow_right_Bubble,
                ]}>
                <Svg
                    style={
                        position === 'left'
                            ? styles.arrow_leftBubble
                            : styles.arrow_rightBubble
                    }
                    width={moderateScale(18.5, 0.5)}
                    height={moderateScale(20.5, 0.5)}
                    viewBox="-428 -543 565 544"
                    enable-background="new 32.485 17.5 15.515 17.5">
                    <Path
                        d={
                            position === 'left'
                                ? 'M -336.10169,1.3050847 C -343.10169,-245.69492 -305.18644,-298.27119 -423.38983,-543 -276.50848,-516.98305 -97.71186,-471.88136 137,3.3050847 Z'
                                : 'M 49.71186,1.3050847 C 56.71186,-245.69492 18.79661,-298.27119 137,-543 -9.88135,-516.98305 -188.67797,-471.88136 -423.38983,3.3050847 Z'
                        }
                        fill={color}
                        x="0"
                        y="0"
                    />
                </Svg>
            </View>
        );
    }
}

MessageBubbleArrow.propTypes = {
    isVisible: PropTypes.bool.isRequired,
    position: PropTypes.oneOf(['left', 'right']).isRequired,
    color: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

const style = () =>
    StyleSheet.create({
        arrow_Bubble: {
            position: 'absolute',
            top: -10,
            left: 0,
            right: 0,
            zIndex: -1,
            flex: 1,
        },
        arrow_left_Bubble: {
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
        },
        arrow_right_Bubble: {
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
        },
        arrow_leftBubble: {
            left: moderateScale(3, 0.5),
        },
        arrow_rightBubble: {
            right: moderateScale(3, 0.5),
        },
    });
