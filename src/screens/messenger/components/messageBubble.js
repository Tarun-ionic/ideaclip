// noinspection JSUnresolvedVariable

/**
 * Message Bubble
 * for show user messages
 *
 * created by akhi
 * created on 30 may 2021
 * created for ideaclip
 */
import React, {memo, useEffect, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import scale from 'utilities/scale';
import TextViewer from '../../components/utility/textViewer';
import MessageBubbleArrow from './messageBubbleArrow';
import PropTypes from 'prop-types';
import MessageStatus from './messageStatus';
import {CopyText} from '../../components/utility/share';
import {useTheme} from '../../../context/ThemeContext';
import GalleryGridView from '../../components/utility/GalleryGridView';
import RetryBar from "../../../components/bars/RetryBar";
import {ms_status} from "../messengerHelper";
import {AnimatedCircularProgress} from "react-native-circular-progress";

function MessageBubble({
                           message,
                           theme,
                           onload,
                           position = 'left',
                           color = 'gray',
                           onReSend, onDelete,
                       }) {
    const {width} = useTheme();
    const {colors} = theme;
    const clipWidth = width * 0.60
    const styles = style(width, clipWidth);
    const [dim, setDim] = useState({width: 250, height: 250, isSet: false});
    useEffect(() => {
        if (typeof onload === 'function') onload();
    }, []);

    const onPageLayout = event => {
        const layout = event.nativeEvent.layout;
        if (dim.isSet === false) {
            setDim({width: layout.width - 10, height: layout.height, isSet: true});
        }
    };

    const progress = (message?.progress || 0);
    const fileCount = message?.files.length || 0;
    const split = fileCount >= 4 || fileCount === 1 ? 2 : 4;
    return (
        <View
            style={[
                styles.messageBubble,
                position === 'left' ? styles.leftBubble : styles.rightBubble,
            ]}>
            <MessageBubbleArrow
                isVisible
                position={position}
                theme={theme}
                color={color}
            />

            <View style={[styles.cloudBubble, {backgroundColor: color}]}  onLayout={onPageLayout}>

                {message.text.length > 0 && (
                    <Pressable
                        onLongPress={() => CopyText(message.text)}
                        style={styles.textOuterLayer}>
                        <TextViewer
                            text={message.text}
                            numberOfLines={4}
                            viewer={false}
                            viewWidth={clipWidth}
                            chatSpace={true}
                        />
                    </Pressable>
                )}

                {message.files?.length > 0 && (
                    <GalleryGridView square width={(clipWidth - scale.ms(10))} files={message.files} download={true}/>
                )}

                {fileCount > 0 && message.progress !== undefined && message.progress > 0 && message.progress <= 100 && ![ms_status.ms_upload_failed, ms_status.ms_failed].includes(message.status) && (
                    <View style={{
                        position: "absolute",
                        zIndex: 15,
                        bottom: ((clipWidth / split) - 10),
                        alignSelf: 'center',
                        borderRadius: 30,
                        backgroundColor: colors.progressOverlay
                    }}>
                        <AnimatedCircularProgress
                            size={30}
                            width={2}
                            fill={progress}
                            tintColor={colors.progressTint}
                            backgroundColor={colors.progressBackground}>
                            {
                                (_) => (<Text style={{color: colors.progressTint, fontSize: 8}}>
                                        {progress.toFixed(0)}%
                                    </Text>
                                )
                            }
                        </AnimatedCircularProgress>
                    </View>
                )}
            </View>
            {position === 'right' && [ms_status.ms_upload_failed, ms_status.ms_failed].includes(message.status) &&
                <RetryBar
                position={position}
                metaData={{id: message.id}}
                offset={dim.width}
                onDelete={onDelete}
                onReSend={onReSend}
                />
            }

            <MessageStatus
                position={position}
                theme={theme}
                status={message.status.toString()}
                time={message.createdOn.toString()}
            />
        </View>
    );
}

MessageBubble.propTypes = {
    message: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
    user: PropTypes.object,
    onload: PropTypes.func,
    position: PropTypes.oneOf(['left', 'right']).isRequired,
    color: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

const style = (width, clipWidth) =>
    StyleSheet.create({
        messageBubble: {
            flexDirection: 'column',
            width: width,
            marginVertical: scale.ms(10),
            paddingHorizontal: scale.ms(5),
        },
        cloudBubble: {
            flex: 1,
            minWidth: width * 0.10,
            maxWidth: clipWidth,
            padding: scale.ms(5),
            borderRadius: scale.ms(5),
            marginTop: 3,
        },
        textOuterLayer: {flex: 1},
        textViewStyle: {
            padding: scale.ms(7),
        },
        leftBubble: {
            marginLeft: 30,
            alignSelf: 'flex-start',
            alignItems: 'flex-start',
        },
        rightBubble: {
            alignSelf: 'flex-end',
            alignItems: 'flex-end',
            marginRight: 30,
        },
        activeIndicator: {
            zIndex: 50,
            top: 0,
            bottom: 0,
            position: 'absolute',
            alignSelf: 'center',
        },
    });

export default memo(MessageBubble)