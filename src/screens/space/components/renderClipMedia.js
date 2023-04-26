import React, {createRef, useEffect, useRef, useState} from 'react';
import {useTheme} from "../../../context/ThemeContext";
import {Animated, Image, Pressable, TouchableOpacity, View,} from 'react-native';
import logger from '../../../lib/logger';
import storage from '@react-native-firebase/storage';
import VideoPlayer from '../../../components/ideanGallery/videoPlayer';
import {icons, screens,} from '../../../utilities/assets';
import {PanGestureHandler, PinchGestureHandler, State} from "react-native-gesture-handler";
import ReactNativeZoomableView from '@openspacelabs/react-native-zoomable-view/src/ReactNativeZoomableView';
const zoomLocked = require('../ideanGallery/assets/zoomLocked.png')
const zoomUnLocked = require('../ideanGallery/assets/zoomUnLocked.png')
function RenderClipMedia({
                             item,
                             play = true,
                             currentlyPlayingVolume = 0,
                             // scrollChange=()=>{}
                         }) {
    const theme = useTheme();
    const size = theme.width
    const [logo, setLogo] = useState(null);
    const [thumb, setThumb] = useState(null);
    const [muted, setMuted] = useState(true);

    const [panEnabled, setPanEnabled] = useState(false);
    const [zoom, setZoom] = useState(false);
    const scale =  useRef(new Animated.Value(1)).current;
    const img =  useRef();
    const translateX = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;
    const pinchRef = createRef()
    const panRef = createRef();
    const onPinchEvent = Animated.event([{
            nativeEvent: { scale }
        }],
        { useNativeDriver: true });

    const onPanEvent = Animated.event([{
            nativeEvent: {
                translationX: translateX,
                translationY: translateY
            }
        }],
        { useNativeDriver: true });

    const handlePinchStateChange = ({ nativeEvent }) => {
        // enabled pan only after pinch-zoom
        // if (nativeEvent.state === State.ACTIVE) {
        //     setPanEnabled(true);
        // }

        const nScale = nativeEvent.scale;
    if (nativeEvent.state === State.END) {
        // if (nScale < 1) {
            Animated.spring(scale, {
                toValue: 1,
                useNativeDriver: true
            }).start();
            Animated.spring(translateX, {
                toValue: 0,
                useNativeDriver: true
            }).start();
            Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true
            }).start();

            // setPanEnabled(false);
        // }
    }
};




useEffect(() => {
        let mount = true;
        if (item.mediafile) {
            if (item.mediaType === 'video' && mount) {
                let a = '';
                let b = item.mediafile.split('/');
                let i = 0;
                for (i in b) {
                    if (i == b.length - 1) {
                        a = a + '/thumb_' + b[i];
                    } else {
                        if (a.length === 0) {
                            a = b[i];
                        } else {
                            a = a + '/' + b[i];
                        }
                    }
                }
                storage()
                    .ref(a)
                    .getDownloadURL()
                    .then(url => {
                        if (url && mount) {
                            setThumb({uri: url});
                        }
                    })
                    .catch(err => {
                        logger.e(err);
                    });
            } else if (item.mediaType === 'audio' && mount) {
                setThumb(screens.audioThumb);
            } else {
                storage()
                    .ref(item.mediafile)
                    .getDownloadURL()
                    .then(url => {
                        if (mount) {
                            setLogo({uri: url});
                        }
                    });
            }
        }


        return () => {
            mount = false
        };
    }, [item]);

    useEffect(() => {
        setMuted(play ? currentlyPlayingVolume <= 0 : false)
    }, [currentlyPlayingVolume])
    useEffect(() => {
        if (!play) {
            setMuted(true)
            img?.current?.zoomTo(1)
            Animated.spring(scale, {
                toValue: 1,
                useNativeDriver: true
            }).start();
        }
    }, [play])

    const showUnmute = () => {

        return (<Pressable style={{
            position: 'absolute',
            zIndex: 9998,
            left: 10,
            top: 10,
        }}
                           onPress={() => {
                               setMuted(!muted)
                           }}
        >
            <Image
                style={{width: 25, height: 25,}}
                source={muted ? icons.unmute : icons.mute}
                resizeMode={'contain'}
                onError={error => logger.e('ImageIcon', error)}
            />
        </Pressable>)
    };
    // const imageView=()=>{
    //     return zoom?(
    //         <View
    //         style={{
    //             width: size,
    //             height: size,
    //         }}>
    {/*            <ReactNativeZoomableView*/}
    {/*        ref={img}*/}
    {/*        minZoom={1}*/}
    //         maxZoom={5}
    //         zoomStep={1}
    {/*        initialZoom={1}*/}
    {/*        bindToBorders={true}*/}
    //         doubleTapZoomToCenter={false}
    //         pinchToZoomInSensitivity={0}
    //         pinchToZoomOutSensitivity={0}
    //         style={{
    //             width: size,
    //             height: size,
    //         }}
    {/*    >*/}


    //             {logo !== null &&
    //             <>
    //                <Image
    //                 // ref={img}
    //                 source={logo}
    //                 style={{
    //                     width: size,
    //                     height: size,
    //                     // transform: [{ scale }, { translateX }, { translateY }],
    //                     resizeMode: 'contain',
    //                 }}
    //                 resizeMode="contain"
    //             />
    //
    //                </>
    //             }
    //     </ReactNativeZoomableView>
    //             <TouchableOpacity style={{width:50,height:50,position:"absolute",right:10,top:10,borderRadius:25,}} onPress={()=>{
    //                 setZoom(false)
    //                 scrollChange(true)
    //             }}>
    //                 <View style={{backgroundColor: '#000000', opacity: 0.8, borderRadius: 50,width:50,height:50,padding:5,alignItems:'center',justifyContent:'center'}}>
    //                     <Image
    //                         source={zoomUnLocked}
    {/*                        style={{width:30,height:30, resizeMode: 'contain', tintColor: '#fff',}}*/}

    {/*                    />*/}
    //                 </View>
    //                 {/*<Image source={zoomLocked} style={{flex:1,resizeMode:'contain',tintColor:'#ffffff'}}/>*/}
    //             </TouchableOpacity>
    //         </View>
    //     ):(    <View
    //         style={{
    //             width: size,
    //             height: size,
    //         }}>
    //
    //         {logo !== null &&
    //         <><Image
    //             // ref={img}
    //             source={logo}
    //             style={{
    //                 width: size,
    //                 height: size,
    //                 // transform: [{ scale }, { translateX }, { translateY }],
    //                 resizeMode: 'contain',
    //             }}
    //             resizeMode="contain"
    //         />
    //             <TouchableOpacity style={{width:50,height:50,position:"absolute",right:10,top:10,borderRadius:25,}} onPress={()=>{
    //                 setZoom(true)
    //                 scrollChange(false)
    //             }}>
    //                 <View style={{backgroundColor: '#000000', opacity: 0.8, borderRadius: 50,width:50,height:50,padding:5,alignItems:'center',justifyContent:'center'}}>
    //                     <Image
    {/*                        source={zoomLocked}*/}
    {/*                        style={{width:30,height:30, resizeMode: 'contain', tintColor: '#fff',}}*/}
    //
    //                     />
    //                 </View>
    //             {/*<Image source={zoomLocked} style={{flex:1,resizeMode:'contain',tintColor:'#ffffff'}}/>*/}
    //             </TouchableOpacity>
    //         </>
    //         }
    //     </View>
    //     )
    // }

    return (
        <View
            style={{
                width: size,
                height: size,
            }}>
            {/*{((logo && item?.mediaType === 'photo') || item?.mediaType === null) &&*/}
            {/*    imageView()*/}
            {/*}*/}
            {((logo && item?.mediaType === 'photo') ||
                item?.mediaType === null) && (
                // <PanGestureHandler
                //     onGestureEvent={onPanEvent}
                //     ref={panRef}
                //     simultaneousHandlers={[pinchRef]}
                //     enabled={panEnabled}
                //     failOffsetX={[-1000, 1000]}
                //     shouldCancelWhenOutside
                // >
                    <Animated.View
                        style={{
                            width: size,
                            height: size,
                            overflow:'hidden'
                        }}>
                        <PinchGestureHandler
                            ref={pinchRef}
                            onGestureEvent={onPinchEvent}
                            simultaneousHandlers={[panRef]}
                            onHandlerStateChange={handlePinchStateChange}
                        >
                            {logo !== null &&
                            <Animated.Image
                                source={logo}
                                style={{
                                    width: size,
                                    height: size,
                                    transform: [{ scale }, { translateX }, { translateY }],
                                    resizeMode: 'contain',
                                }}
                                resizeMode="contain"
                            />
                            }
                        </PinchGestureHandler>
                    </Animated.View>
                // </PanGestureHandler>
            )}
            {(item.mediaType === 'video' || item.mediaType === 'audio') &&
            showUnmute()
            }
            {item?.mediaType === 'video' && (
                <View
                    style={{
                        width: size,
                        height: size,
                    }}>
                    <VideoPlayer
                        play={play}
                        source={item.mediafile}
                        thumbnail={thumb}
                        width={size }
                        muted={muted}
                    />
                </View>
            )}
            {item?.mediaType === 'audio' && (
                <View
                    style={{
                        width: size,
                        height: size,
                    }}>
                    <VideoPlayer
                        play={play}
                        source={item.mediafile}
                        thumbnail={screens.audioThumb}
                        width={size }
                        muted={muted}
                        audio={true}
                    />
                </View>
            )}
        </View>
    )
}

export default RenderClipMedia;
