/* eslint-disable react-native/no-inline-styles */
// noinspection ES6CheckImport,JSUnresolvedVariable

import React, {memo, useEffect, useState} from 'react';
import FastImage from 'react-native-fast-image';
import {logger, lottie} from '../../../index';
import PropTypes from 'prop-types';
import {placeHolders} from '../../../utilities/assets';
import storage from '@react-native-firebase/storage';
import { Image, TouchableOpacity, View} from "react-native";
import LottieView from "lottie-react-native";

function LovitzProfile({source, style = {}, size,onPress}) {
    const [avatar, setAvatar] = useState(null);
    const [prev, setPrevious] = useState('')
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        let mounted = true
        if (source) {
            if (source?.userDetails?.uid !== prev) {
                mounted && setAvatar(null);
                if (!source?.userDetails?.profileImageB64) {
                    if (source?.userDetails.profileImage) {
                        if (!source?.userDetails.profileImage.includes('://')) {
                            storage()
                                .ref(source?.userDetails.profileImage)
                                .getDownloadURL()
                                .then(url => {
                                    mounted && setPrevious(source?.userDetails?.uid)
                                    mounted && setAvatar({uri: url});
                                })
                                .catch(err => {
                                    mounted && setPrevious('')
                                    mounted && setAvatar(placeHolders.avatar);
                                });
                        } else {
                            mounted && setPrevious(source?.userDetails?.uid)
                            mounted && setAvatar({uri: source?.userDetails.profileImage});
                        }
                    } else {
                        mounted && setPrevious('')
                        mounted && setAvatar(placeHolders.avatar);
                    }
                } else {
                    mounted && setPrevious(source?.userDetails?.uid)
                    mounted && setAvatar({uri: source?.userDetails?.profileImageB64});
                }
            }
        }
        return () => {
            mounted = false
        }
    }, [source]);

    return (
        <TouchableOpacity onPress={()=>{}} style={{position:'absolute',top:0}}>

            {avatar !== null &&
            // <View style={[style, loading ? {opacity: 0} : {},{overflow:'hidden'}]}>
            //     <Image 
            //         style={{width:'100%',height:'100%'}}
            //         source={avatar}
            //         onLoadStart={() => {
            //             setLoading(true)
            //         }}
            //         onLoadEnd={() => {
            //             setLoading(false)
            //         }}
            //         resizeMode={FastImage.resizeMode.contain}
            //         onError={error => {
            //             logger.e('ImageIcon', error)
            //             setAvatar(placeHolders.avatar)
            //         }}
            //      />
            // </View>
            <FastImage
                style={[style, loading ? {opacity: 0} : {}]}
                source={avatar}
                onLoadStart={() => {
                    setLoading(true)
                }}
                onLoadEnd={() => {
                    setLoading(false)
                }}
                resizeMode={FastImage.resizeMode.contain}
                onError={error => {
                    logger.e('ImageIcon', error)
                    setAvatar(placeHolders.avatar)
                }}
                onTouchStart={onPress}
            />
            }
            {loading === true &&
            <View style={[style, {borderWidth: 0}]}>
                <View style={{
                    height: size,
                    width: size,
                    position: "absolute",
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <LottieView source={lottie.loader} autoPlay={true} loop={true}
                                style={{height: size - 2, width: size - 2}}/>
                </View>
            </View>
            }
        </TouchableOpacity>
    )
}


LovitzProfile.propTypes = {
    source: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
    style: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
};

export default memo(LovitzProfile)
