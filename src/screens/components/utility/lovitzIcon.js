/* eslint-disable react-native/no-inline-styles */
// noinspection ES6CheckImport,JSUnresolvedVariable

import React from 'react';
import {Image, Pressable} from 'react-native';
import PropTypes from 'prop-types';
import LottieView from "lottie-react-native";
import {lottie} from "../../../utilities/assets";

export default function LovitzIcon({
                                       source,
                                       style,
                                       containerStyle,
                                       loaderStyle,
                                       onClick = () => {
                                       },
                                       loading = false
                                   }) {
    return (
        <Pressable
            style={containerStyle}
            onPress={() => {
                if (!loading)
                    onClick()
            }}>
            {loading ?
                <LottieView source={lottie.loader} loop autoPlay style={loaderStyle}/>
                :
                <Image source={source} style={style}/>
            }
        </Pressable>
    );
}

LovitzIcon.propTypes = {
    source: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.number]).isRequired,
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    containerStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    loaderStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    onPress: PropTypes.func,
    loading: PropTypes.bool,
};
