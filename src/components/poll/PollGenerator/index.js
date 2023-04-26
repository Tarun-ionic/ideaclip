import {Image, Keyboard, Pressable, Text, TextInput, View,} from 'react-native';
import {appLogo} from '../../../utilities/assets';
import React, {useCallback, useEffect, useState} from 'react';
import styles from '../assets/style';
import {useTheme} from '../../../context/ThemeContext';
import {AppModal, RoundButton} from '../../../system/ui/components';
import scale from '../../../utilities/scale';
import {strings} from '../../../constant/strings';
import PropTypes from 'prop-types';
import backBtn from '../assets/pollBackArrow.png';
import vote from '../assets/pollVote.png';
import option1icon from '../assets/pollIcon1.png';
import option2icon from '../assets/pollIcon2.png';
import option3icon from '../assets/pollIcon3.png';
import Toast from 'react-native-simple-toast';
import {clipContentType, newClip} from "../../../utilities/constant";
import {getUniqId} from "../../../lib/storage";
import {useClip} from "../../../context/ClipContext";
import {useSession} from "../../../context/SessionContext";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {Icon} from "react-native-elements";

const initQ = "Q: "
PollGenerator.propTypes = {
    visibility: PropTypes.bool,
    onGenerate: PropTypes.func,
    spaceInfo: PropTypes.object,
};

export default function PollGenerator({visibility, onDismiss, spaceInfo, onComplete}) {
    const {theme, width, height} = useTheme();
    const {colors} = theme;
    const session = useSession();
    const {user} = session;
    const {onsetClip} = useClip();
    const style = styles(theme, width, height);
    const [showModal, setShowModal] = useState(false);

    const [state, setState] = useState({
        question: '',
        option1: '',
        option2: '',
        option3: '',
        preview: false,
    });

    const onUpdate = () => {
        onsetClip({
            ...newClip,
            id: `POLL-${getUniqId()}-${getUniqId()}`,
            uid: user.uid,
            rid: spaceInfo.spaceId,
            spaceType: spaceInfo.spaceType,
            user: {
                displayName: user.displayName,
                profileImage: user.profileImage,
                profileImageB64: "",
                userType: user.userType,
                uid: user.uid,
            },
            publishedOn: String(new Date().getTime()),
            clipContentType: clipContentType.poll,
            pollData: {
                question: state.question,
                option1: state.option1,
                option2: state.option2,
                option3: state.option3,
            }
        });
        onComplete()
    };
    const isEmpty = string => {
        return typeof string !== 'string' || `${string}`.trim().length === 0;
    };

    const onchange = (field, {text}) => {
        setState(s => ({...s, [field]: text}));
    };
    const onPreview = () => {
        if (isEmpty(state.question)) {
            Toast.show('Enter your question');
        } else if (isEmpty(state.option1)) {
            Toast.show('Enter your option 1');
        } else if (isEmpty(state.option2)) {
            Toast.show('Enter your option 2');
        } else if (isEmpty(state.option3)) {
            Toast.show('Enter your option 3');
        } else {
            setState(s => ({...s, preview: true}));
        }
    };
    const onBack = () => {
        setState(s => ({...s, preview: false}));
    };

    useEffect(() => {
        setShowModal(visibility);
    }, [visibility]);

    const OnQuestionSelect = () => {
        if (state.question.trim().length === 0) {
            setState({...state, question: initQ})
        }
    }

    const TextInputView = useCallback((props) => {
        return state.question === initQ ? <TextInput {...props} autoCapitalize={'words'} autoFocus={true}/> :
            <TextInput {...props} autoFocus={state.question.length > initQ.length} autoCapitalize={'none'}/>
    }, [state.question === initQ])

    const inputContainer = () => {
        return (
            <Pressable style={style.container} onPress={() => Keyboard.dismiss()}>
                <View style={style.titleContainer}>
                    <Image style={style.logo} source={appLogo.min}/>
                    <Text style={style.title}>{strings.poll_create_heading}</Text>
                    <Icon
                        name="cancel"
                        size={30}
                        color={colors.closeButton}
                        type="material"
                        disabledStyle={{backgroundColor: 'transparent'}}
                        onPress={() => onDismiss()}
                    />

                </View>
                <KeyboardAwareScrollView extraHeight={30} keyboardDismissMode={'none'}
                                         keyboardShouldPersistTaps={'never'}>
                    <View style={style.body}>
                        <View style={[style.inputWrap, style.inputContainer]}>
                            <TextInputView
                                placeholder={strings.poll_create_quiz}
                                style={style.inputQuestion}
                                placeholderTextColor={colors.poll_inputText}
                                multiline
                                maxLength={100}
                                autoCorrect={false}
                                onPressIn={OnQuestionSelect}
                                value={state.question}
                                onChange={({nativeEvent}) => onchange('question', nativeEvent)}/>
                            <Text style={style.inputInfo}>{strings.poll_create_quiz_info}</Text>
                        </View>
                        <View style={[style.inputWrap, style.option1]}>
                            <TextInput
                                placeholder={strings.poll_type_option1}
                                style={style.inputQuestion}
                                placeholderTextColor={colors.poll_inputText}
                                multiline
                                value={state.option1}
                                maxLength={100}
                                onChange={({nativeEvent}) => onchange('option1', nativeEvent)}
                            />
                        </View>
                        <View style={[style.inputWrap, style.option2]}>
                            <TextInput
                                placeholder={strings.poll_type_option2}
                                style={style.inputQuestion}
                                placeholderTextColor={colors.poll_inputText}
                                multiline
                                value={state.option2}
                                maxLength={100}
                                onChange={({nativeEvent}) => onchange('option2', nativeEvent)}
                            />
                        </View>
                        <View style={[style.inputWrap, style.option3]}>
                            <TextInput
                                placeholder={strings.poll_type_option3}
                                style={style.inputQuestion}
                                multiline
                                placeholderTextColor={colors.poll_inputText}
                                value={state.option3}
                                maxLength={100}
                                onChange={({nativeEvent}) => onchange('option3', nativeEvent)}
                            />
                        </View>

                        <RoundButton
                            style={style.roundButton}
                            labelStyle={{fontSize: scale.font.s}}
                            label={strings.poll_previewBtn}
                            onPress={onPreview}
                        />
                    </View>
                </KeyboardAwareScrollView>

            </Pressable>
        );
    };

    const inputPreView = () => {
        return (
            <Pressable style={[style.container, style.previewContainer]} onPress={() => Keyboard.dismiss()}>
                <View style={style.titleContainer}>
                    <Pressable style={style.backBtnWrap} onPress={onBack}>
                        <Image style={style.back} source={backBtn}/>
                    </Pressable>
                    <Image style={style.vote} source={vote}/>
                    <Pressable style={{position: "absolute", top: 10, right: 15, zIndex: 10}} onPress={onDismiss}>
                        <Icon
                            name="cancel"
                            size={30}
                            color={colors.closeButton}
                            type="material"
                            disabledStyle={{backgroundColor: 'transparent'}}
                            onPress={onDismiss}
                        />
                    </Pressable>

                </View>
                <View style={style.body}>
                    <View style={style.quizWrap}>
                        <Text style={style.questionText}>{state.question}</Text>
                    </View>

                    <View style={style.optionContainer}>
                        <View style={style.optionIconWrap}>
                            <Image style={style.optionIcon} source={option1icon}/>
                            <Text style={style.optionIconText}>+ 0</Text>
                        </View>
                        <View style={[style.optionWrap, style.option1]}>
                            <Text style={[style.option, style.option1]}>{state.option1}</Text>
                        </View>
                    </View>

                    <View style={style.optionContainer}>
                        <View style={style.optionIconWrap}>
                            <Image style={style.optionIcon} source={option2icon}/>
                            <Text style={style.optionIconText}>+ 0</Text>
                        </View>
                        <View style={[style.optionWrap, style.option2]}>
                            <Text style={[style.option, style.option2]}>{state.option2}</Text>
                        </View>
                    </View>

                    <View style={style.optionContainer}>
                        <View style={style.optionIconWrap}>
                            <Image style={style.optionIcon} source={option3icon}/>
                            <Text style={style.optionIconText}>+ 0</Text>
                        </View>
                        <View style={[style.optionWrap, style.option3]}>
                            <Text style={[style.option, style.option3]}>{state.option3}</Text>
                        </View>
                    </View>

                    <RoundButton
                        style={style.roundButton}
                        labelStyle={{fontSize: scale.font.s}}
                        label={strings.poll_post}
                        onPress={onUpdate}
                    />
                </View>
            </Pressable>
        );
    };

    return (
        <AppModal onDismiss={onDismiss} visibility={showModal}>
            <View style={style.wrap}>
                {state.preview === true ? inputPreView() : inputContainer()}
            </View>
        </AppModal>
    );
}
