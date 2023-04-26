/* eslint-disable react-native/no-inline-styles */
// noinspection DuplicatedCode,JSSuspiciousNameCombination

import React, {useEffect, useRef, useState} from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Modal,
    Platform,
    Pressable,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import scale from 'utilities/scale';
import {icons, lottie, placeHolders, screens} from '../../../utilities/assets';
import {Appbar} from 'react-native-paper';
import FastImage from 'react-native-fast-image';
import AutoHeightImage from 'react-native-auto-height-image';
import logger from '../../../lib/logger';
import {useTheme} from '../../../context/ThemeContext';
import {strings} from '../../../constant/strings';
import {useAlert} from '../../../context/AlertContext';
import DeviceInfo from 'react-native-device-info';
import VideoPlayer from 'react-native-video-player';
import {useIsFocused} from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import {downloadImage} from "../../../utilities/fileDownloader";
import {AnimatedCircularProgress} from "react-native-circular-progress";
import {useDebounce} from "../../../utilities/helper";

function GalleryGridView({files, width, square, disableAction, blockAction, download}) {
    const [fullView, setFullView] = useState('');
    const fileCount = files.length || 0;
    const alert = useAlert();

    const actionHandler = file => {
        if (!(disableAction || blockAction)) {
            setFullView(file);
        } else {
            alert({
                message: blockAction? strings.userAccessDenied : strings.collabAlertMessage,
                buttons: [{label: strings.ok, callback: () => alert.clear()}],
                autoDismiss: false,
                cancellable: false,
            });
        }
    };

    const onDismiss = () => {
        setFullView({});
    };

    if (fileCount === 1) {
        return files.map((file, index) => {
            return (
                <React.Fragment key={index}>
                    <SingleImage
                        file={file}
                        square={square}
                        actionHandler={actionHandler}
                        width={width}
                    />
                    {fullView.mediaPath && (
                        <FullView
                            onDismiss={onDismiss}
                            files={files}
                            defFile={fullView}
                            download={download}
                            index={files.indexOf(fullView)}
                            visibility={true}
                        />
                    )}
                </React.Fragment>
            );
        });
    } else if (fileCount >= 2 && fileCount < 4) {
        return (
            <>
                <GridViewImage
                    files={files}
                    actionHandler={actionHandler}
                    width={width}
                    col={2}
                    row={1}
                />
                {fullView.mediaPath && (
                    <FullView
                        onDismiss={onDismiss}
                        files={files}
                        download={download}
                        defFile={fullView}
                        index={files.indexOf(fullView)}
                        visibility={true}
                    />
                )}
            </>
        );
    } else if (fileCount >= 4) {
        return (
            <>
                <GridViewImage
                    files={files}
                    actionHandler={actionHandler}
                    width={width}
                    col={2}
                    row={2}
                />
                {fullView.mediaPath && (
                    <FullView
                        onDismiss={onDismiss}
                        files={files}
                        defFile={fullView}
                        download={download}
                        index={files.indexOf(fullView)}
                        visibility={true}
                    />
                )}
            </>
        );
    } else {
        return <></>;
    }
}

function getSource(file) {
    let source = placeHolders.noImage;
    if (file.thumbnail) {
        source = {uri: file.thumbnail};
    } else if (file.mediaThumb) {
        source = {uri: file.mediaThumb};
    }
    return source;
}

function SingleImage({file, width, actionHandler, square}) {
    const styles = styleCreator(width);
    return (
        <TouchableWithoutFeedback onPress={() => actionHandler(file)}>
            <View style={{minHeight: 125, minWidth: 200}}>
                <ActivityIndicator style={styles.indicator_} size="small" color="red"/>
                {file && file.mediaType === 'video' && (
                    <View style={styles.overlay}>
                        <View style={styles.gridIcon}>
                            <TouchableOpacity
                                style={[styles.playButton]}
                                onPress={() => actionHandler(file)}>
                                <Image source={screens.customPlay} style={[styles.playArrow]}/>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                {square ? (
                    <FastImage
                        style={styles.gridImage}
                        onError={logger.e}
                        source={getSource(file)}
                    />
                ) : (
                    <AutoHeightImage
                        width={width}
                        style={{zIndex: 5}}
                        onError={logger.e}
                        source={getSource(file)}
                    />
                )}
            </View>
        </TouchableWithoutFeedback>
    );
}

const formatData = (files, numColumns = 1, numRow = 1) => {
    const gridCol = [];
    const gridRow = [];
    files.map((file, index) => {
        if (index >= numColumns * numRow) {
            return;
        }
        if (index % numColumns === 1 && numRow > 1) {
            gridCol.push(file);
        } else {
            gridRow.push(file);
        }
    });
    return [gridRow, gridCol];
};

function GridViewImage({files, width, col = 1, row = 1, actionHandler}) {
    const styles = styleCreator(width / 2);
    const fileCount = files.length;
    const gridCount = col * row;
    const gridFiles = formatData(files, col, row);
    let counter = 0;

    return (
        <View style={{flexDirection: 'column', minHeight: 125, minWidth: 200}}>
            {gridFiles.map((grid, _index) => {
                return (
                    <View key={_index} style={{flexDirection: 'row'}}>
                        {grid.map(file => {
                            counter++;
                            return (
                                <TouchableWithoutFeedback
                                    key={counter}
                                    onPress={() => actionHandler(file)}>
                                    <View style={styles.gridImage}>
                                        {file && file.mediaType === 'video' && (
                                            <View style={styles.count}>
                                                <TouchableOpacity
                                                    style={[styles.gridIcon]}
                                                    onPress={() => actionHandler(file)}>
                                                    <Image
                                                        source={screens.customPlay}
                                                        style={[styles.playArrow]}
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                        {counter === gridCount && fileCount > gridCount && (
                                            <View style={styles.count}>
                                                <Text style={styles.gridText}>
                                                    +{fileCount - gridCount}
                                                </Text>
                                            </View>
                                        )}
                                        <FastImage
                                            source={getSource(file)}
                                            style={styles.gridImage}
                                            onError={logger.e}
                                        />
                                    </View>
                                </TouchableWithoutFeedback>
                            );
                        })}
                    </View>
                );
            })}
        </View>
    );
}
import ProgressCircle from 'react-native-progress-circle'
function FullScreenViewer({defView, onDismiss, setControls, download = false,currentlyPlaying='',setCurrentlyPlaying=()=>{}}) {
    const [dim, setDim] = useState({width: 0, height: 0});
    const [onLoaded, setOnLoaded] = useState(false);
    const {width, height, theme} = useTheme();
    const {colors} = theme
    const [pause, setPause] = useState(true);
    const [progress, setProgress] = useState(-1);
    const isFocused = useIsFocused();
    const {debounce} = useDebounce()
    const onPageLayout = event => {
        const ev = event.nativeEvent.layout;
        if ((dim.width === 0 || dim.height === 0) && !onLoaded) {
            setDim({width: ev.width, height: ev.height});
        }
    };

    useEffect(() => {
        let mounted = true;
        if(isFocused){
            if(!( currentlyPlaying === '' || currentlyPlaying === defView.mediaLabel))
                setPause(true)
        } else{
            setPause(true);
        }
        return () => (mounted = false);
    }, [isFocused, currentlyPlaying]);

    const downloader = () => {
        debounce(downloadMedia)
    }

    const downloadMedia = () => {
        let type = defView.mediaType
        if (defView.mediaType === 'photo') type = 'image'
        console.log("url ",defView.mediaUri)
        downloadImage(type, defView.mediaName, defView.mediaUri, (p) => {
            setProgress(p)
        }).finally(() => {
            setProgress(-1)
        })
    }

    return (
        <View style={{flex: 1, width, height}}>
            <Pressable onPress={downloader} style={{
                position: "absolute",
                width: 30,
                height: 30,
                zIndex: 15,
                left: 30,
                bottom: 40,
                backgroundColor: progress >= 0 && progress <= 100 ? colors.progressOverlay : 'transparent',
                borderRadius: 30
            }}>
                {progress >= 0 && progress <= 100 &&
                <ProgressCircle
                    percent={progress}
                    radius={15}
                    borderWidth={2}
                    color={colors.progressTint}
                    bgColor={colors.progressBackground}
                    shadowColor={colors.greyScale}
                >
                    <Text  style={{color: colors.progressTint, fontSize: 8}}>{progress.toFixed(0)}%</Text>
                </ProgressCircle>
                }
                {download === true && progress === -1 &&
                <Image style={{width: 30, height: 30, resizeMode: 'contain'}} source={icons.download}/>
                }
            </Pressable>
            {defView &&
            (defView.mediaType === 'photo' || defView.mediaType === 'image') && (
                <View
                    style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                    <AutoHeightImage
                        style={{
                            opacity: onLoaded ? 1 : 0,
                            alignSelf: 'center',
                            zIndex: 10,
                        }}
                        onLoad={() => {
                            setTimeout(() => setOnLoaded(true), 200);
                        }}
                        onError={err => {
                            logger.e(err);
                        }}
                        width={width}
                        animated={true}
                        source={{uri: defView.mediaUri}}
                    />
                    {!onLoaded && (
                        <>
                            <AutoHeightImage
                                style={{
                                    position: 'absolute',
                                    opacity:
                                        (dim.width === 0 && dim.height === 0) || onLoaded ? 0 : 1,
                                    alignSelf: 'center',
                                }}
                                onLayout={event => onPageLayout(event)}
                                width={width}
                                source={getSource(defView)}
                            />
                            <LottieView
                                source={lottie.loader}
                                style={{position: 'absolute', height: 50, width: 50}}
                                autoPlay
                                loop
                            />
                        </>
                    )}
                </View>
            )}
            {defView && defView.mediaType === 'video' && (
                <VideoPlayer
                    paused={pause}
                    thumbnail={getSource(defView)}
                    video={{uri: defView.mediaUri}}
                    onBack={() => onDismiss()}
                    resizeMode="contain"
                    videoHeight={height - 40}
                    videoWidth={width}
                    customPlayButton={screens.customPlay}
                    playInBackground={false}
                    playWhenInactive={false}
                    onPlayPress={() => {
                        setPause(false);
                        setCurrentlyPlaying(defView.mediaLabel);
                    }}
                    onStart={() => {
                        setPause(false);
                        setCurrentlyPlaying(defView.mediaLabel);
                    }}
                    onShowControls={() => setControls(true)}
                    onHideControls={() => setTimeout(() => setControls(false), 5000)}
                    controlsTimeout={5000}
                />
            )}
        </View>
    );
}

function FullView({files, visibility, onDismiss, index, download}) {
    const [controls, setControls] = useState(true);
    const {width, height, theme} = useTheme();
    const {colors} = theme
    const isIphoneX = DeviceInfo.hasNotch();
    const listRef = useRef();
    const [currentlyPlaying, setCurrentlyPlaying] = useState('');
    const onViewRefBlownUp = useRef((viewableItems) => {
        console.log("viewableItems ",viewableItems?.viewableItems[0]?.item)
       setCurrentlyPlaying(viewableItems?.viewableItems[0]?.item.mediaLabel) 
    })
    const viewConfigRef = useRef({viewAreaCoveragePercentThreshold: 50})

    const screenRender = ({item}) => {
        return (
            <FullScreenViewer
                defView={item}
                download={download}
                onDismiss={onDismiss}
                setControls={setControls}
                currentlyPlaying={currentlyPlaying}
                setCurrentlyPlaying = {setCurrentlyPlaying}
            />
        );
    };

    const onScrollFailed = info => {
        if (listRef.current) {
            const offset = info.index === 0 ? 0 : info.averageItemLength * info.index;
            listRef.current?.scrollToOffset({offset});
            setTimeout(() => {
                try {
                    listRef?.current?.scrollToIndex({
                        index: info.index,
                        viewOffset: 10,
                        viewPosition: 0,
                        animated: true,
                    });
                } catch {
                }
            }, 100);
        }
    }
    return (
        <Modal
            transparent={true}
            onRequestClose={() => onDismiss()}
            visible={visibility}>
            <View style={{backgroundColor: 'black', width, height}}>
                {controls && (
                    <View
                        style={[
                            style.topBar,
                            Platform.OS === 'ios' && isIphoneX ? {marginTop: 44} : {},
                        ]}>
                        <Appbar.BackAction color={colors.greyScale} onPress={() => onDismiss()}/>
                    </View>
                )}
                <FlatList
                    ref={listRef}
                    data={files}
                    horizontal={true}
                    snapToAlignment={'center'}
                    style={{flex: 1}}
                    decelerationRate={"fast"}
                    snapToInterval={width}
                    initialScrollIndex={index}
                    renderItem={screenRender}
                    keyExtractor={item => item.mediaLabel}
                    keyboardShouldPersistTaps="always"
                    onScrollFailed={onScrollFailed}
                    onViewableItemsChanged={onViewRefBlownUp.current}
                    viewabilityConfig={viewConfigRef.current}
                />
            </View>
        </Modal>
    );
}

const styleCreator = gridWidth => {
    return {
        indicator: {
            width: '50%',
            flexDirection: 'row',
            alignItems: 'center',
            position: 'absolute',
            zIndex: 1,
            bottom: 0,
            top: 0,
        },
        indicator_: {
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            position: 'absolute',
            zIndex: 1,
            bottom: 0,
            top: 0,
        },
        count: {
            width: gridWidth,
            height: gridWidth,
            flexDirection: 'row',
            alignItems: 'center',
            position: 'absolute',
            zIndex: 20,
            bottom: 0,
            top: 0,
            flex: 1,
            //backgroundColor: 'rgba(0, 0, 0, 0.6)',
        },
        overlay: {
            width: '100%',
            flexDirection: 'row',
            alignSelf: 'center',
            alignItems: 'center',
            alignContent: 'center',
            position: 'absolute',
            zIndex: 20,
            bottom: 0,
            top: 0,
            flex: 1,
            //backgroundColor: 'rgba(0, 0, 0, 0.6)',
        },
        playButton: {
            width: 64,
            height: 64,
            borderRadius: 32,
            justifyContent: 'center',
            alignItems: 'center',
        },
        playArrow: {
            height: 40,
            width: 40,
        },
        gridImage: {
            width: gridWidth,
            height: gridWidth,
            resizeMode: 'cover',
            zIndex: 1,
        },
        gridText: {
            width: '100%',
            textAlign: 'center',
            fontSize: scale.font.xxxl,
            color: '#cecaca',
        },
        gridIcon: {
            width: '100%',
            alignSelf: 'center',
            alignItems: 'center',
            alignContent: 'center',
            flex: 1,
        },
    };
};

const style = {
    topBar: {
        position: 'absolute',
        top: 0,
        flexDirection: 'row',
        height: 40,
        padding: 5,
        backgroundColor: 'transparent',
        zIndex: 30,
    },
    back: {
        padding: 10,
    },
    backArrow: {
        padding: 10,
        height: 20,
        width: 20,
    },
    thump: {
        margin: 5,
        height: 60,
        width: 60,
        alignSelf: 'center',
        resizeMode: 'cover',
    },
    thump_active: {
        margin: 5,
        height: 60,
        width: 60,
        borderWidth: 2,
        borderColor: 'white',
        alignSelf: 'center',
        resizeMode: 'cover',
    },
};

export default React.memo(GalleryGridView);
