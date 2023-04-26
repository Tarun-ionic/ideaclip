import {Image, Pressable, Text, TextInput, View,} from 'react-native';
import {appLogo} from '../../../utilities/assets';
import {Icon} from 'react-native-elements';
import React, {useEffect, useRef, useState} from 'react';
import styles from './assets/style';
import {useTheme} from '../../../context/ThemeContext';
import {AppModal, RoundButton} from '../../../system/ui/components';
import scale from '../../../utilities/scale';
import {strings} from '../../../constant/strings';
import {pcTypes, userType} from '../../../utilities/constant';
import {onTrigger} from '../../../utilities/helper';
import Toast from 'react-native-simple-toast';
import PropTypes from 'prop-types';

const userOptions = [
    {label: 'Show it to all my Collabers', value: pcTypes.personalClip},
    {label: "'My Diary' Mode (Private View)", value: pcTypes.myDiary},
];
const businessOptions = [
    {label: 'Show it to all my Collabers', value: pcTypes.personalClip},
    {label: "'FLASH DEALS' Boost", value: pcTypes.flashDeal, counter: true},
    {label: "'UPCOMING EVENT' Boost", value: pcTypes.businessEventBoost},
    {label: "'My Diary' Mode (Private View)", value: pcTypes.myDiary},
];
const charityOptions = [
    {label: 'Show it to all my Collabers', value: pcTypes.personalClip},
    {label: `'Volunteer Needed' Boost`, value: pcTypes.volunteerNeeded},
    {label: "'UPCOMING EVENT' Boost", value: pcTypes.charityEventBoost},
    {label: "'My Diary' Mode (Private View)", value: pcTypes.myDiary},
];

CreatePersonalClipModal.propTypes = {
    visibility: PropTypes.bool,
    cUserType: PropTypes.string,
    onPost: PropTypes.func,
};

export default function CreatePersonalClipModal({
                                                    visibility,
                                                    cUserType,
                                                    onPost,
                                                    onDismiss,
                                                }) {
    const {theme, width, height} = useTheme();
    const {colors} = theme;
    const style = styles(theme, width, height);
    const [showModal, setShowModal] = useState(false);
    const [selectedOption, setSelectedOption] = useState({
        option: {},
        hrs: '',
        min: '',
        isDisabled: false,
    });
    const minutesRef = useRef()
    const [options, setOptions] = useState([]);
    const seconds = (h, m, s) => h * 60 * 60 + m * 60 + s;
    const onUpdate = () => {
        if (selectedOption.isDisabled === true) {
            return false;
        }
        if (!selectedOption.option?.value) {
            Toast.show('Please select an option.');
            setSelectedOption(s => ({...s, isDisabled: true}));
            return false;
        } else if (selectedOption.option?.value === pcTypes.flashDeal) {
            const hrs = parseInt(selectedOption.hrs) | 0;
            const min = parseInt(selectedOption.min) | 0;
            if (hrs === 0 && min === 0) {
                Toast.show('Please set time frame.');
            } else {
                onTrigger(onPost, {
                    type: selectedOption.option?.value,
                    isPrivate: false,
                    duration: seconds(hrs, min, 0).toString(),
                });
            }
        } else {
            const type =
                selectedOption.option?.value === pcTypes.myDiary
                    ? pcTypes.personalClip
                    : selectedOption.option?.value;
            const isPrivate = selectedOption.option?.value === pcTypes.myDiary;
            onTrigger(onPost, {type, isPrivate, duration: '0'});
        }
    };

    const onchange = (field, {text}) => {
        const _text = text.replace(/\D/g, '');
        const num = parseInt(_text) | 0;
        if (field === 'hrs' && num <= 24) {
            if (_text.toString().length === 2 && minutesRef?.current) minutesRef?.current?.focus()
            setSelectedOption(sp => ({...sp, hrs: _text, min: num === 24 ? 0 : sp.min}));
        } else if (field === 'min' && num < 60) {
            setSelectedOption(sp => ({...sp, min: selectedOption.hrs < 24 ? _text : "00"}));
        }
    };

    useEffect(() => {
        if (cUserType === userType.business) {
            setOptions(businessOptions);
        } else if (cUserType === userType.charity) {
            setOptions(charityOptions);
        } else {
            setOptions(userOptions);
        }
    }, []);

    const optionRender = () => {
        return options.map(option => {
            const {value, label, counter} = option;
            const isSelected = selectedOption.option?.value === value;
            const color = colors.secondary;
            return (
                <View key={`option-key-${value}`}>
                    <View
                        style={style.radioBtnRow}>
                        <Icon
                            name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                            type="material-icons"
                            color={color}
                            size={20}
                            onPress={() =>
                                setSelectedOption({
                                    hrs: '',
                                    min: '',
                                    option: option,
                                    isDisabled: false,
                                })
                            }
                        />
                        <Pressable onPress={() =>
                            setSelectedOption({
                                hrs: '',
                                min: '',
                                option: option,
                                isDisabled: false,
                            })
                        }>
                            <Text style={style.radioBtnText}>{label}</Text>
                        </Pressable>
                    </View>
                    {isSelected && counter === true && (
                        <View>
                            <View style={style.optionContainer2}>
                                <Text style={style.timeSetterText}>
                                    {strings.setTimeFrame}:{' '}
                                </Text>
                                <View style={style.radioRow}>
                                    <TextInput
                                        placeholder={'00'}
                                        keyboardType="numeric"
                                        style={style.radioInput}
                                        value={selectedOption.hrs}
                                        placeholderTextColor={colors.fp_inputText}
                                        maxLength={2}
                                        onChange={({nativeEvent}) => onchange('hrs', nativeEvent)}
                                    />
                                    <Text style={style.middleText}>{' : '}</Text>
                                    <TextInput
                                        placeholder={'00'}
                                        keyboardType="numeric"
                                        value={selectedOption.min}
                                        maxLength={2}
                                        ref={minutesRef}
                                        placeholderTextColor={colors.fp_inputText}
                                        onChange={({nativeEvent}) => onchange('min', nativeEvent)}
                                        style={style.radioInput}
                                    />
                                </View>
                            </View>
                            <Text style={style.maxButton}>{strings.pc_maximum}</Text>
                        </View>
                    )}
                </View>
            );
        });
    };

    useEffect(() => {
        setShowModal(visibility);
    }, [visibility]);
    return (
        <AppModal visibility={showModal === true}>
            <View style={style.wrap}>
                <View style={style.container}>
                    <View style={style.titleContainer}>
                        <Image style={style.logo} source={appLogo.min}/>
                        <Text style={style.title}>{strings.pc_heading}</Text>
                        <Icon
                            name="cancel"
                            size={30}
                            color={colors.secondaryDark}
                            type="material"
                            disabledStyle={{backgroundColor: 'transparent'}}
                            onPress={() => onDismiss()}
                        />
                    </View>
                    <View style={style.titleContainer}>
                        <Text style={style.subTitle}>{strings.pc_title}</Text>
                    </View>

                    <View style={style.radioButtonContainer}>{optionRender()}</View>

                    <RoundButton
                        style={style.roundButton}
                        labelStyle={{fontSize: scale.font.s}}
                        label={strings.pc_post}
                        onPress={onUpdate}
                    />
                </View>
            </View>
        </AppModal>
    );
}
