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
import {Keyboard, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View,} from 'react-native';
// import EmojiBoard from 'react-native-emoji-board';
// import EmojiPicker from 'rn-emoji-keyboard'
import BackHandler from 'react-native/Libraries/Utilities/BackHandler';
import PropTypes from 'prop-types';
import Toast from 'react-native-simple-toast';
import {Avatar} from 'components';
import {screens} from 'utilities/assets';
import config from "../../../constant/config";
import scale from "../../../utilities/scale";
import DeviceInfo from "react-native-device-info";

export default function ClipAttachBar({onSend, theme, setAttached, text, onChangeText, editMode = false}) {
    const {colors, width} = theme;
    const styles = style(theme);
    // const [text, setText] = useState('');
    const [isKeyboardEmoji, setKeyboardEmoji] = useState(false);
    const [cursorPos, setcursorPos] = useState(0);
    // const textInput = useRef();
    const characterLength = config.textLimit.ideanGallery

    const handleSend = () => {
        if (text.trim().length > 0) {
            //setText('');
            if (typeof onSend === 'function') {
                onSend({text: text.trim()});
            }
        } else {
            Toast.show('Enter a description');
        }
    };

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
        onChangeText(text.slice(0, -1));
    };

    const emojiUpdate = em => {
        if (text.length + em.code.length < characterLength) {
        try {
                const textC = `${text.slice(0, cursorPos)}${em.code}${text.slice(
                    cursorPos,
                )}`;
                const nc = cursorPos + em.code.length;
                setcursorPos(nc);
                onChangeText(textC);
            } catch (e) {
            }
        }
    };
    return (
        <SafeAreaView style={styles.barOverlay}>


            <View style={styles.messageBar}>
                <View style={styles.messageInputOutline}>
                    <View style={{alignItems: 'center', justifyContent: 'flex-start'}}>
                        {!editMode &&
                        <View style={{flex: 1}}>
                            <Avatar
                                style={{marginTop: 5,}}
                                size={30}
                                rounded={false}
                                source={screens.add}
                                onPress={setAttached}
                            />
                        </View>
                        }
                    </View>
                    <TextInput
                        // ref={textInput}
                        onSelectionChange={event => {
                            setcursorPos(event.nativeEvent.selection.start);
                        }}
                        // onFocus={() => {
                        //     setKeyboardEmoji(false)
                        // }}
                        autoCorrect={false}
                        placeholder={""}
                        // placeholder={`Type here ...\nYou can enter up to ${characterLength} characters.`}
                        value={text}
                        onChangeText={t => {
                            onChangeText(t);
                        }}
                        maxLength={characterLength}
                        multiline={true}
                        placeholderTextColor={colors.clipTextSecondary}
                        style={styles.messageInput}
                    />
                    <View style={{alignItems: 'center'}}>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: "center",
                            justifyContent: 'center',
                            marginTop: 5
                        }}>
                            {/* <Avatar
                                size={30}
                                rounded={false}

                                source={screens.emoji_ico}
                                onPress={() => {
                                    if (isKeyboardEmoji) {
                                        Keyboard.dismiss();
                                    }
                                    setKeyboardEmoji(!isKeyboardEmoji);
                                }}
                            /> */}
                            <Pressable onPress={handleSend}>
                                <Avatar
                                    size={30}
                                    rounded={false}
                                    style={styles.sendButton}
                                    source={screens.send_ico}
                                    onPress={handleSend}
                                />
                            </Pressable>
                        </View>
                        <View style={{flex: 1, justifyContent: "flex-end",}}>
                            <Text style={{
                                marginBottom: 5,
                                fontSize: scale.font.xs,
                                lineHeight: 20,
                                color: theme.colors.textPrimary
                            }}>
                                {text.length}/{characterLength}
                            </Text>
                        </View>
                    </View>

                </View>


            </View>
            {/* <EmojiBoard
                containerStyle={{
                    position: isKeyboardEmoji ? 'relative' : 'absolute',
                }}
                showBoard={isKeyboardEmoji}
                hideBackSpace={true}
                tabBarPosition="bottom"
                onRemove={() => backspace()}
                onClick={emojiUpdate}
            /> */}
            {/* <EmojiPicker 
                 containerStyle={{
                    position: isKeyboardEmoji ? 'relative' : 'absolute',
                }}
                onEmojiSelected={emojiUpdate} 
                open={isKeyboardEmoji} 
                onClose={() => backspace()} 
            /> */}
        </SafeAreaView>
    );
}

ClipAttachBar.propTypes = {
    onSend: PropTypes.func.isRequired,
    theme: PropTypes.object,
};
const style = ({colors, width}) =>
    StyleSheet.create({
        barOverlay: {
            backgroundColor: 'transparent',
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
            paddingVertical: 15,
            paddingLeft: 10,
            alignItems: 'center',
            paddingRight: 10,
            minHeight: 60,
        },
        messageInput: {
            flex: 1,
            maxHeight: 100,
            minHeight: DeviceInfo.isTablet() ? 80 : 65,
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
            // backgroundColor: colors.secondaryAccent,
            // margin: 5,
            // padding: 10,
            // borderRadius: 50,
            marginStart: 5,

        },
    });
