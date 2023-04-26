/* eslint-disable react-hooks/exhaustive-deps,react-native/no-inline-styles */
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
    Keyboard,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
// import EmojiBoard from 'react-native-emoji-board';
import BackHandler from 'react-native/Libraries/Utilities/BackHandler';
import {screens} from 'utilities/assets';
import {newClip} from 'utilities/constant';
import Toast from 'react-native-simple-toast';
import Thead from './minClip';
import {useClip} from 'context/ClipContext';
import FilesBar from './clipBar/FilesBar';
import AttachBar from './clipBar/AttachBar';
import TSearch from './clipBar/TSearch';
import MSearch from './clipBar/MSearch';
import {isHashTag, isMention, reJoin} from '../../../lib/checker';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {getUniqId} from '../../../lib/storage';
import {useTheme} from 'context/ThemeContext';
import {strings} from 'constant/strings';
import {Avatar} from 'components';
import {mediaMapper} from './coSpaceHelper';
import {useSession} from '../../../context/SessionContext';
import {useAlert} from '../../../context/AlertContext';
import config from '../../../constant/config';
import {checkSize, onTrigger, useDebounce} from '../../../utilities/helper';
import {LineView} from '../../../system/ui/components';
import scale from 'utilities/scale';
import DeviceInfo from "react-native-device-info";
import apolloLib from "../../../lib/apolloLib";
import {queries} from "../../../schema";
import logger from "../../../lib/logger";

function ClipInputBar({
                          setOnChange,
                          threading,
                          onClearThreading,
                          spaceInfo,
                          disabled = false,
                          blocked = false,
                          viewLatest = () => {
                          },
                          showArchived,
                      }) {
    const {debounce} = useDebounce();
    const session = useSession();
    const {user} = session;
    const {theme, width} = useTheme();
    const alert = useAlert();
    const {colors} = theme;
    const isFocused = useIsFocused();
    const styles = ClipBarStyles(theme);
    const [clipText, setClipText] = useState('');
    const [cursorPos, setcursorPos] = useState(0);
    const [isKeyboardEmoji, setKeyboardEmoji] = useState(false);
    const [sending, setSending] = useState(false);
    const [viewAttachment, setViewAttachment] = useState(false);
    const [attachments, setAttachment] = useState([]);
    const [tag, setTag] = useState('');
    const [toastShown, setToastShown] = useState(false);
    const [attachToastShown, setAttachToastShown] = useState(false);
    const [mention, setMention] = useState('');
    const {onsetClip} = useClip();
    const timerId = useRef(false);
    const navigation = useNavigation();
    const {searchHint, onSearch} = useClip();
    const characterLength = config.textLimit.coSpace

    useEffect(() => {
        if (searchHint && searchHint.length > 0) {
            onSearch('');
            navigation.navigate('CoSpaceSearch', {spaceInfo, searchHint});
        }
    }, [searchHint]);

    useEffect(() => {
        if (!isFocused) {
            setTag('');
            setMention('');
            setKeyboardEmoji(false);
            Keyboard.dismiss();
        }
    }, [isFocused]);

    const checkInput = text => {
        if (text?.trim().length === 0 || text.endsWith(' ')) {
            setMention('');
            setTag('');
        } else {
            // check data
            const words = text?.trim()?.split(/[\s]+/);
            const word = words[words.length - 1] || '';

            //hash  tag
            if (isHashTag(word)) {
                setTag(word);
            }

            //mention
            if (isMention(word)) {
                setMention(word);
            }
        }
    };

    const onMention = ({displayName, searchString}) => {
        setMention('');
        clearTimeout(timerId.current);
        setClipText(reJoin(clipText, searchString, `@${displayName} `));
    };

    const onTag = ({_tag, searchString}) => {
        setTag('');
        clearTimeout(timerId.current);
        setClipText(reJoin(clipText, searchString, `#${_tag} `));
    };

    const onChange = text => {
        checkInput(text);
        setClipText(text);
    };

    const clear = () => {
        setAttachment([]);
        setViewAttachment(false);
        Keyboard.dismiss();
        setClipText('');
        setMention('');
        setTag('');
        if (onClearThreading) {
            onClearThreading();
        }
    };
    const checkStatus = () => {
        return apolloLib
            .client(session)
            .query({
                fetchPolicy: 'no-cache',
                query: queries.getClipUserStatus,
                variables: {
                    id: spaceInfo?.spaceId,
                },
            })
            .then(({data}) => {
                const {profile} = data;
                return profile?.status
            })
            .catch(err => {
                logger.e(err);
                return ''
            });
    }

    const sendTextClip = async () => {
        let a = await checkStatus()
        if (a !== 'Archived') {
            if (attachments?.length > 0 && checkSize(attachments, config.fileSize.coSpace)) {
                Toast.show(strings.fileSizeExceed)
                setSending(false)
            } else {
                onTrigger(setOnChange, getUniqId());
                const words = clipText?.trim()?.split(/[\s]+/);
                const hashTags = words
                    .filter(w => isHashTag(w))
                    .map(t => ({id: '', tag: t}));
                const uniqId = getUniqId();
                setKeyboardEmoji(false);
                if (clipText.length > 0) {
                    const medias = await mediaMapper(attachments);
                    onsetClip({
                        ...newClip,
                        id: `${uniqId}${getUniqId()}`,
                        uid: user.uid,
                        rid: spaceInfo.spaceId,
                        spaceType: spaceInfo.spaceType,
                        user: {
                            displayName: user.displayName,
                            profileImage: user.profileImage,
                            profileImageB64: user.profileImageB64,
                            userType: user.userType,
                            uid: user.uid,
                        },
                        parentThread: {
                            id: threading?.id || '',
                            text: threading?.text || '',
                            user: threading?.user,
                        },
                        hashTags,
                        text: clipText,
                        attachments: medias,
                        publishedOn: String(new Date().getTime()),
                        medias,
                    });
                    viewLatest();
                    clear(); //clear send text
                    setSending(false)
                } else {
                    setSending(false)
                    Toast.show(strings.clip_description_required, Toast.SHORT);
                }
            }
        } else {
            if (a === 'Archived') {
                showArchived()
                setSending(false)
            } else {
                setSending(false)
                alert({
                    message: strings.something_went_wrong,
                    cancellable: false,
                    autoDismiss: false,
                    buttons: [
                        {
                            label: strings.ok, callback: () => {
                                alert.clear()
                            }
                        },
                    ],
                });
            }
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
    }, []);

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
    }, [isKeyboardEmoji]);

    const backspace = () => {
        let text = clipText.slice(0, -1);
        setClipText(text);
    };
    const emojiUpdate = em => {
        if (clipText.length + em.code.length < characterLength) {
            try {
                const text = `${clipText.slice(0, cursorPos)}${em.code}${clipText.slice(
                    cursorPos,
                )}`;
                const nc = cursorPos + em.code.length;
                setcursorPos(nc);
                setClipText(text);
            } catch (e) {
            }
        }
    };
    const onRemoveFiles = id => {
        const files = [...attachments];
        files.splice(id, 1);
        setAttachment(files);
    };

    const filePreview = useCallback(() => {
        return <FilesBar files={attachments} onRemove={onRemoveFiles}/>;
    }, [attachments]);

    const textInput = useRef();

    const onTriggerSend = () => {
        if(!sending) {
            setSending(true)
            if (disabled || blocked) {
                setSending(false)
                alert({
                    message:blocked?strings.userAccessDenied : strings.collabAlertMessage,
                    buttons: [
                        {label: strings.ok, callback: () => alert.clear()},
                    ],
                    autoDismiss: false,
                    cancellable: false,
                });
            } else {
                if (clipText?.trim().length > 0) {
                    sendTextClip().then()
                } else {
                    setSending(false)
                    if (!toastShown) {
                        setToastShown(true);
                        Toast.show(
                            strings.clip_description_required,
                            Toast.SHORT,
                        );
                        setTimeout(() => setToastShown(false), 2500);
                    }
                }
            }
        }
    };
    return (
        <SafeAreaView style={styles.container}>
            {filePreview()}
            {tag?.trim()?.length > 0 && <TSearch searchString={tag} onTag={onTag}/>}
            {mention?.trim()?.length > 0 && (
                <MSearch searchString={mention} onMention={onMention}/>
            )}
            {threading && threading.id && (
                <View style={styles.thread}>
                    <Thead
                        visibility={true}
                        name={threading.user.displayName || ''}
                        onClose={() => onClearThreading()}
                        text={threading.text}
                        imageUri={threading.avatar}
                        enableClose={true}
                    />
                </View>
            )}

            <TouchableWithoutFeedback
                onPress={Keyboard.dismiss}
                style={{
                    width: width,
                    backgroundColor: 'transparent',
                }}>
                <View style={{flexDirection: 'column'}}>
                    <LineView spacing={0}/>
                    <View style={styles.clipBar}>
                        <View style={styles.clipInputOutline}>
                            <View style={{alignItems: 'center', justifyContent: 'flex-start'}}>
                                <View style={{flex: 1}}>
                                    <Avatar
                                        style={{marginTop: 5,}}
                                        size={30}
                                        rounded={false}
                                        source={screens.add}
                                        onPress={() => {
                                            setKeyboardEmoji(false);
                                            if (disabled || blocked) {
                                                alert({
                                                    message: blocked? strings.userAccessDenied : strings.collabAlertMessage,
                                                    buttons: [
                                                        {label: strings.ok, callback: () => alert.clear()},
                                                    ],
                                                    autoDismiss: false,
                                                    cancellable: false,
                                                });
                                            } else {
                                                if (attachments.length < config.fileUpload.maxLimit) {
                                                    setViewAttachment(true);
                                                } else {
                                                    if (!attachToastShown) {
                                                        setAttachToastShown(true);
                                                        Toast.show(strings.file_limit_reached, Toast.SHORT);
                                                        setTimeout(() => setAttachToastShown(false), 2500);
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                </View>
                            </View>

                            {disabled || blocked ? (
                                <Pressable
                                    onPress={() => {
                                        alert({
                                            message: blocked? strings.userAccessDenied :  strings.collabAlertMessage,
                                            buttons: [
                                                {label: strings.ok, callback: () => alert.clear()},
                                            ],
                                            autoDismiss: false,
                                            cancellable: false,
                                        });
                                    }}
                                    style={{flex: 1}}>
                                    <TextInput
                                        pointerEvents={'none'}
                                        onPressIn={() => setKeyboardEmoji(false)}
                                        onFocus={() => {
                                            setKeyboardEmoji(false);
                                        }}
                                        autoCorrect={false}
                                        placeholder={""}
                                        // placeholder={strings.chatTextPlaceholder}
                                        onChangeText={text => onChange(text)}
                                        maxLength={characterLength}
                                        multiline={true}
                                        placeholderTextColor={colors.clipTextSecondary}
                                        style={styles.ClipInput2}
                                        scrollEnabled
                                    >
                                        {clipText}
                                    </TextInput>

                                </Pressable>
                            ) : (
                                <TextInput
                                    ref={textInput}
                                    autoCorrect={false}
                                    onSelectionChange={event => {
                                        setcursorPos(event.nativeEvent.selection.start);
                                    }}
                                    placeholder={""}
                                    // placeholder={strings.chatTextPlaceholder}
                                    onChangeText={text => onChange(text)}
                                    multiline={true}
                                    maxLength={characterLength}
                                    placeholderTextColor={colors.clipTextSecondary}
                                    style={styles.ClipInput2}
                                    scrollEnabled>
                                    {clipText}
                                </TextInput>
                            )}
                            <View style={{alignItems: 'center'}}>
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: "center",
                                    justifyContent: 'center',
                                    marginTop: 5,
                                }}>
                                    {/* <Avatar
                                        size={30}
                                        rounded={false}
                                        source={screens.emoji_ico}
                                        onPress={() => {
                                            if (disabled || blocked) {
                                                alert({
                                                    message: blocked? strings.userAccessDenied : strings.collabAlertMessage,
                                                    buttons: [
                                                        {label: strings.ok, callback: () => alert.clear()},
                                                    ],
                                                    autoDismiss: false,
                                                    cancellable: false,
                                                });
                                            } else {
                                                setKeyboardEmoji(() => !isKeyboardEmoji);
                                            }
                                        }}
                                    /> */}
                                    <Avatar
                                        size={30}
                                        rounded={false}
                                        source={screens.send_ico}
                                        onPress={() => debounce(onTriggerSend)}
                                    />
                                </View>
                                <View style={{flex: 1, justifyContent: "flex-end",}}>
                                    <Text style={{
                                        marginBottom: 10,
                                        fontSize: scale.font.xs,
                                        lineHeight: scale.font.ms,
                                        color: theme.colors.textPrimary
                                    }}>
                                        {clipText.length}/{characterLength}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {viewAttachment && (
                            <AttachBar
                                visibility={viewAttachment}
                                onDismiss={() => setViewAttachment(false)}
                                fileCount={config.fileUpload.maxLimit - attachments.length}
                                onAttach={files => {
                                    setAttachment(prev => [...prev, ...files]);
                                }}
                            />
                        )}
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
                </View>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
}

export default React.memo(ClipInputBar);

const ClipBarStyles = ({colors, width}) =>
    StyleSheet.create({
        container: {
            backgroundColor: 'transparent',
            zIndex: 50,
        },
        clipBar: {
            flexDirection: 'row',
            width: width,
            backgroundColor: colors.surfaceDark,
            alignItems: 'center',
            zIndex: 11,
        },
        lottie: {
            width: 150,
            height: 150,
        },
        clipInputOutline: {
            flex: 1,
            flexDirection: 'row',
            backgroundColor: colors.surfaceDark,
            color: colors.textPrimaryDark,
            paddingVertical: 15,
            paddingLeft: 10,
            alignItems: 'center',
            paddingRight: 10,
        },
        ClipInput: {
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
        ClipInput2: {
            flex: 1,
            width: "95%",
            maxHeight: 120,
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
            marginStart: 5,
        },
        selectedImage: {
            flexDirection: 'row',
            borderRadius: 20,
            backgroundColor: colors.surface,
            margin: 5,
            alignSelf: 'center',
            padding: 10,
            width: '95%',
        },
        thread: {
            flexDirection: 'row',
            margin: 5,
            alignSelf: 'center',
            width: '95%',
            minHeight: 60,
        },
        thump: {
            marginBottom: 10,
            backgroundColor: colors.surface,
            width: '100%',
            height: '100%',
        },
        typing: {
            paddingHorizontal: 15,
            alignItems: 'center',
        },
        dots: {
            margin: 0,
            padding: 0,
            alignItems: 'flex-end',
        },
        links: {maxHeight: 200, backgroundColor: colors.surfaceDark},
        urlPreview: {
            flexDirection: 'column',
            backgroundColor: colors.surfaceDark,
            padding: 5,
        },
        clip_description_required: '',
    });
