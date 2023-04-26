import React, {useEffect, useState} from 'react';
import AutoHeightImage from 'react-native-auto-height-image';
import {View} from 'react-native';
import LottieView from 'lottie-react-native';
import {icons, lottie} from '../../../utilities/assets';
import {createThumbnail} from 'react-native-create-thumbnail';

const VideoThumbnail = ({style, width, source, thumbnail}) => {
    const [thumb, setThumb] = useState(null);
    useEffect(() => {
        if (thumbnail) {
            setThumb({uri: thumbnail});
        } else {
            createThumbnail({
                url: source,
                timeStamp: 10000,
            })
                .then(response => {
                    setThumb({uri: response.path});
                })
                .catch(err => {
                    setThumb(icons.videoFail);
                });
        }
    }, [source]);
    return (
        <>
            {thumb ? (
                <AutoHeightImage style={style} width={width} source={thumb}/>
            ) : (
                <View
                    style={{
                        width: width,
                        height: 60,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                    <LottieView
                        source={lottie.loader}
                        style={{height: 20}}
                        autoPlay
                        loop
                    />
                </View>
            )}
        </>
    );
};
export default React.memo(VideoThumbnail);
