/* eslint-disable react-hooks/exhaustive-deps,react-native/no-inline-styles */
// noinspection JSUnresolvedFunction

import React, {useEffect} from 'react';
import {screens} from '../../utilities/assets';
import {Dimensions, Image, ImageBackground} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import { SafeScreenView } from '../..';

export default function CollabSpaceSplash() {
    const navigation = useNavigation();
    const size = Dimensions.get('window').width*0.8

    useEffect(() => {
        const timeoutHandle = setTimeout(() => {
            navigation.replace('CollabSpace');
        }, 2000);
        return () => clearTimeout(timeoutHandle);
    }, []);

    return (
        <SafeScreenView translucent={true} >
        <ImageBackground
            source={screens.collabBG}
            style={{flex:1,paddingVertical:10,justifyContent:'space-around'}}>
            <Image
                source={screens.collabHeader}
                style={{
                    // marginTop:10,
                    // position:'absolute',
                    // top:0,
                    width:size,
                    height:size/1.9,
                    resizeMode: 'contain',
                    alignSelf:'center'
                }}
            />
            <Image
                source={screens.collabRocket}
                style={{
                    flex:1,
                    maxWidth:size,
                    aspectRatio:1.04,
                    overflow:"hidden",
                    resizeMode: 'contain',
                    alignSelf: 'center',
                }}
            />
            <Image
                source={screens.collabFooter}
                style={{
                    // position:'absolute',
                    // bottom:0,
                    width: size,
                    height:size/15.6,
                    resizeMode: 'contain',
                    alignSelf: 'center',
                    // marginBottom:10,
                }}
            />
        </ImageBackground>
        </SafeScreenView>
    );
}
