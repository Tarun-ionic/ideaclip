// import {View} from 'native-base';
import React, {useEffect, useRef, useState} from 'react';
import {Text, Image, ImageBackground, Pressable, View} from 'react-native';
import Video from 'react-native-video'; // eslint-disable-line
import LottieView from 'lottie-react-native';
import {lottie} from '../../../utilities/assets';
import storage from '@react-native-firebase/storage';
import logger from "../../../lib/logger";

const replayIcon = require('./assets/replay.png')
const playIcon = require('./assets/play.png')
const pauseIcon = require('./assets/pause.png')
const VideoPlayer = ({
                         play = false,
                         source,
                         disabled,
                         cached,
                         thumbnail,
                         width,
                         muted = true,
                         audio = false,
                         minPlayer = false,
                         onPress
                     }) => {
    const [src, setSrc] = useState('')
    const [loading, setLoading] = useState(true)
    const [downloading, setDownloading] = useState(false)
    const [failed, setFailed] = useState(false)
    const [noFile, setNofile] = useState(false)
    const [end, setEnd] = useState(false)
    const [progress, setProgress] = useState(0)
    const [duration, setDuration] = useState(0)
    const [paused, setPaused] = useState(false)

    const player = useRef();
    let mount = true;

    const loadUrl = () => {
        if (mount) {
            if (source && mount) {
                if (source.includes("file://") && mount) {
                    setSrc({uri: source});
                } else if (!source.includes('://') && mount) {
                    setDownloading(true)
                    storage()
                        .ref(source)
                        .getDownloadURL()
                        .then(url => {
                            setSrc({uri: url});
                            setDownloading(false)
                        })
                        .catch(err => {
                            setSrc('');
                            setDownloading(false)
                            setFailed(true)
                            console.log("firebase file load error ")
                            console.log("file : ", src)
                            console.log("err : ", err)

                        });
                } else {
                    setSrc({uri: src});
                }
            } else {
                setNofile(true)
            }
        }
    }

    useEffect(() => {
        loadUrl()
        return () => {
            mount = false
        };
    }, [source])

    useEffect(() => {
        if (play && mount)
            if (src && src?.uri && mount) {
                if (progress <= 1 && mount)
                    replay()
            } else {
                loadUrl()
            }
        return () => {
            mount = false
        };
    }, [play])


    const loaderView = (absolute = false) => {
        return (<View style={[{
            width: width,
            height: width,
            alignItems: 'center',
            justifyContent: 'center'
        }, absolute && {position: 'absolute'}]}>
            <View style={{backgroundColor: '#000', opacity: 0.8, borderRadius: 40, alignSelf: 'center'}}>
                <LottieView
                    source={lottie.loader}
                    style={{height: 40, alignSelf: 'center',}}
                    autoPlay={true}
                    loop={true}
                />
            </View>
        </View>)
    }
    const reloadView = () => {
        return (<Pressable style={[{
            width: width,
            height: width,
            alignItems: 'center',
            justifyContent: 'center'
        }, {position: 'absolute'}]} onPress={() => {
            if (end)
                replay()
            else
                setPaused(false)
        }}>
            <View style={{backgroundColor: '#000000', opacity: 0.8, borderRadius: 50,}}>
                <Image
                    source={end ? replayIcon : playIcon}
                    style={{height: 40, width: 40, resizeMode: 'contain', tintColor: '#fff', margin: 5}}

                />
            </View>
        </Pressable>)
    }

    const progressBar = () => {
        return (<View style={{
            width: width,
            height: 4,
            backgroundColor: '#888888',
            opacity: 0.8,
            position: 'absolute',
            bottom: 0
        }}>
            <View style={{width: progress * width, height: 4, backgroundColor: 'red'}}/>
        </View>)
    }


    const replay = () => {
        if (mount) {
            setLoading(true)
            player?.current?.seek(0)
            setProgress(0)
            setEnd(false)
        }
    }

    return (
        <Pressable style={{width: width, height: width, backgroundColor: '#000'}} onPress={() => {
            if (!disabled && !cached) {
                if (!minPlayer) {
                    if (end) {
                        replay()
                    } else {
                        setPaused(!paused)
                    }
                } else {
                    onPress()
                }
            }
        }}>
            <ImageBackground source={thumbnail} style={{width: width, height: width}} resizeMode={'contain'}
                             onError={(err) => {
                                 logger.e(err)
                             }}>
                {source ?
                    src && src?.uri ?
                        <>
                            {
                                !disabled && !cached && downloading && play ?
                                    loaderView()
                                    :
                                    <>
                                        {loading && play &&
                                        loaderView(true)
                                        }
                                        {!disabled && !cached && play && <Video
                                            source={src}
                                            ref={player}
                                            muted={muted}
                                            paused={disabled || cached || end || !play || paused}
                                            audioOnly={audio}
                                            onProgress={(b) => {
                                                setProgress(b.currentTime / duration)
                                            }}
                                            onBuffer={(buff) => {
                                                // console.log("buffering... ",buff)
                                            }}
                                            onError={(err) => {
                                                console.log("error loading file ", err)
                                            }}
                                            onLoad={(a) => {
                                                setLoading(false)
                                                setDuration(a.duration)
                                            }}
                                            onEnd={(a) => {
                                                setProgress(1)
                                                setEnd(true)
                                            }}
                                            resizeMode={'contain'}
                                            style={{width: '100%', height: '100%'}}
                                        />}
                                        {!minPlayer && play && progressBar()}
                                        {!minPlayer && (end || paused) && play && reloadView()}
                                    </>
                            }
                        </>
                        :
                        !disabled && !cached && play && loaderView()

                    :
                    <Text>No file</Text>
                }
            </ImageBackground>
        </Pressable>
    )

}
export default React.memo(VideoPlayer);