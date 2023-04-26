/* eslint-disable react-native/no-inline-styles */
// noinspection DuplicatedCode,JSUnresolvedVariable

/**
 * message send bar
 * message input and attachments
 *
 * created by akhi
 * created on 30 may 2021
 * created for ideaclip
 */
import React, {useEffect, useRef, useState} from 'react';
import {Keyboard, SafeAreaView, StyleSheet, TextInput, View,} from 'react-native';
import {Avatar} from 'components';
import {Icon} from 'react-native-elements';
// import EmojiBoard from 'react-native-emoji-board';
import BackHandler from 'react-native/Libraries/Utilities/BackHandler';
import PropTypes from 'prop-types';
import {screens} from 'utilities/assets';
import {strings} from '../../../constant/strings';
import ImageIcon from '../../components/utility/imageIcon';
import {LineView} from '../../../system/ui/components';
import scale from 'utilities/scale';

export default function MessageBar({
                                       onSend,
                                       theme,
                                       fileAttach = 'none',
                                       emptyString = false,
                                       onSelectFilePicker,
                                   }) {
    const {colors, width} = theme;
    const styles = style(theme, width);
    const [text, setText] = useState('');
    const [cursorPos, setCursorPos] = useState(0);
    const [isKeyboardEmoji, setKeyboardEmoji] = useState(false);
    const handleSend = () => {
        if (text.trim().length > 0 || emptyString) {
            Keyboard.dismiss();
            setText('');
            if (typeof onSend === 'function') {
                onSend({text: text.trim()});
            }
        }
    };
    const textInput = useRef();
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setKeyboardEmoji(false);
            },
        );

        return () => {
            keyboardDidShowListener.remove();
        };
    }, [theme]);

    useEffect(() => {
        if (isKeyboardEmoji) {
            Keyboard.dismiss();
        }
        const backAction = () => {
            if (isKeyboardEmoji) {
                setKeyboardEmoji(false);
                return true;
            } else {
                return false;
            }
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction,
        );
        return () => backHandler.remove();
    }, [isKeyboardEmoji, theme]);

    const backspace = () => {
        setText(text.slice(0, -1));
    };
    const emojiUpdate = em => {
        try {
            const textC = `${text.slice(0, cursorPos)}${em.code}${text.slice(
                cursorPos,
            )}`;
            const nc = cursorPos + em.code.length;

            setCursorPos(nc);
            setText(textC);
        } catch (e) {
        }
    };
    return (
        <SafeAreaView style={styles.barOverlay}>
            <LineView spacing={0}/>
            <View style={styles.messageBar}>
                <View style={styles.messageInputOutline}>
                    {fileAttach === 'image' && (
                        <Icon
                            name="satellite"
                            size={25}
                            color={colors.textPrimary}
                            type="material"
                            onPress={() =>
                                typeof onSelectFilePicker === 'function'
                                    ? onSelectFilePicker(true)
                                    : {}
                            }
                        />
                    )}

                    <TextInput
                        ref={textInput}
                        autoCorrect={false}
                        onSelectionChange={event => {
                            setCursorPos(event.nativeEvent.selection.start);
                        }}
                        placeholder={''}
                        // placeholder={strings.chatTextPlaceholder}
                        onChangeText={setText}
                        multiline={true}
                        placeholderTextColor={colors.clipTextSecondary}
                        style={styles.messageInput}>
                        {text}
                    </TextInput>
                    {/* <Avatar
                        size={30}
                        rounded={false}
                        source={screens.emoji_ico}
                        onPress={() => setKeyboardEmoji(() => !isKeyboardEmoji)}
                    /> */}
                </View>
                <ImageIcon
                    size={30}
                    rounded={false}
                    source={screens.send_ico}
                    onPress={handleSend}
                    style={styles.sendButton}
                />
            </View>
            {/* <EmojiBoard
                containerStyle={{
                    position: isKeyboardEmoji ? 'relative' : 'absolute',
                }}
                hideBackSpace={true}
                tabBarPosition="bottom"
                showBoard={isKeyboardEmoji}
                onRemove={() => backspace()}
                onClick={emojiUpdate}
            /> */}
        </SafeAreaView>
    );
}

MessageBar.propTypes = {
    onSend: PropTypes.func.isRequired,
    onSelectFilePicker: PropTypes.func.isRequired,
    theme: PropTypes.object,
    attachPhoto: PropTypes.bool,
    emptyString: PropTypes.bool,
};
const style = ({colors}, width) =>
    StyleSheet.create({
        barOverlay: {
            backgroundColor: 'transparent',
            zIndex: 50,
        },
        messageBar: {
            flexDirection: 'row',
            backgroundColor: colors.surfaceDark,
            alignItems: 'center',
            width: width,
            zIndex: 11,
        },
        lottie: {
            width: 150,
            height: 150,
        },
        messageInputOutline: {
            flex: 1,
            flexDirection: 'row',
            backgroundColor: colors.surfaceDark,
            color: colors.textPrimaryDark,
            paddingVertical: 5,
            paddingLeft: 10,
            alignItems: 'center',
            paddingRight: 10,
        },
        messageInput: {
            flex: 1,
            maxHeight: 100,
            minHeight: 30,
            alignSelf: 'center',
            textAlignVertical: 'center',
            justifyContent: 'center',
            marginHorizontal: 5,
            color: colors.clipTextSecondary,
            backgroundColor: '#bbf9fc',
            paddingHorizontal: 10,
            paddingTop: 10,
            paddingBottom: 8,
            borderRadius: 10,
            fontSize: scale.font.l,
        },
        sendButton: {
            margin: 5,
            padding: 10,
        },
    });
