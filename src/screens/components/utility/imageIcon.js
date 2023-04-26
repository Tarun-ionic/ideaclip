/* eslint-disable react-native/no-inline-styles */
// noinspection ES6CheckImport,JSUnresolvedVariable

import {ms} from 'react-native-size-matters';
import React from 'react';
import {Pressable} from 'react-native';
import FastImage from 'react-native-fast-image';
import {logger, onTrigger} from '../../../index';
import PropTypes from 'prop-types';
import {AnimatedTouchable} from "../../../system/ui/components";

export default function ImageIcon({
                                      size = 40,
                                      source,
                                      style = {background: 'red'},
                                      containerStyle = {background: 'red'},
                                      onPress,
                                      rounded = true,
                                      visibility = true,
                                  }) {
    const viewSize = ms(size, 0.3);
    const handleClick = () => {
        onTrigger(onPress)
    }
    if (visibility && source) {
        return (
            <AnimatedTouchable style={containerStyle} onPress={handleClick}>
                <FastImage
                    style={[
                        {
                            width: viewSize,
                            height: viewSize,
                            borderRadius: rounded ? viewSize : 0,
                        },
                        style,
                    ]}
                    source={source}
                    resizeMode={FastImage.resizeMode.contain}
                    onError={error => logger.e('ImageIcon', error)}
                />
            </AnimatedTouchable>
        );
    } else {
        return null;
    }
}

ImageIcon.propTypes = {
    size: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]),
    source: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.number
    ]).isRequired,
    style: PropTypes.object,
    containerStyle: PropTypes.object,
    onPress: PropTypes.func,
    rounded: PropTypes.bool,
    visibility: PropTypes.bool,
};
