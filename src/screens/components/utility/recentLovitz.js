/* eslint-disable react-native/no-inline-styles */
// noinspection ES6CheckImport,JSUnresolvedVariable

import {ms} from 'react-native-size-matters';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Pressable, View} from 'react-native';
import {logger} from '../../../index';
import PropTypes from 'prop-types';
import LovitzProfile from './lovitzProfile';
import {transparent} from "react-native-paper/lib/typescript/styles/colors";

export default function RecentLovitz({
                                         size = 40,
                                         source = [],
                                         style = {},
                                         containerStyle = {},
                                         onPress = () => {
                                             logger.i('default callback');
                                         },
                                         visibility = true,
                                     }) {
    const [profiles, setProfiles] = useState(source);
    const viewSize = ms(size, 0.3);
    useEffect(() => {
        if (Array.isArray(source)) setProfiles([...source.slice(0,3)]);
    }, [source]);

    const renderView = useCallback((item,index) =>{
       return <LovitzProfile
           key={index}
            style={[
                {
                    width: viewSize,
                    height: viewSize,
                    borderRadius: viewSize,
                    position: 'absolute',
                    zIndex:profiles.length-index,
                    flex: 1,
                    left:(viewSize*0.75*(profiles.length-(index+1)))
                },
                style,
            ]}
            onPress={onPress}
            source={item}
            size={viewSize}
        />
    },[profiles])


    return visibility ?(
        <Pressable style={[containerStyle,{flexDirection:"row",width:(viewSize*(profiles.length>1?1+((profiles.length-1)*0.75):profiles.length))+5,height:viewSize+5}]} onPress={onPress}>
            {profiles.map(renderView)}
        </Pressable>

    ):null
}

RecentLovitz.propTypes = {
    size: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]),
    source: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.array
    ]).isRequired,
    style: PropTypes.object,
    containerStyle: PropTypes.object,
    onPress: PropTypes.func,
    visibility: PropTypes.bool,
};
