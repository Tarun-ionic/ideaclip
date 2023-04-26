/* eslint-disable react-hooks/exhaustive-deps,react-native/no-inline-styles */
// noinspection DuplicatedCode

import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Icon} from 'react-native-elements';
import LottieView from 'lottie-react-native';
import {lottie} from '../../../utilities/assets';
import {useTheme} from '../../../context/ThemeContext';
import TextInputBox from './TextInputBox';

export default function AuthenticatingTextBox({
                                                  label,
                                                  value,
                                                  setValue,
                                                  originalValue="",
                                                  validate,
                                                  errorMessage,
                                                  emptyMessage,
                                                  labelKey,
                                              }) {
    const {theme} = useTheme();
    const {colors} = theme;
    const style = stylesCreator(theme);
    const [isLoading, setIsLoading] = useState(false);
    const [textChange, setTextChange] = useState(true);
    const [errors, setErrors] = useState(false);

    useEffect(() => {
        if (errors) {
            setValue(labelKey + 'Error', true);
        } else {
            setValue(labelKey + 'Error', false);
        }
    }, [errors]);

    function checkName() {
        if (value !== originalValue || !value) {
            setIsLoading(true);
            validate(value).then(res => {
                setErrors(res);
                setIsLoading(false);
                setTextChange(false);
            });
        }
    }

    return (
        <View style={{alignSelf: 'center', width: '90%'}}>
            <View
                style={{
                    alignSelf: 'center',
                    marginTop: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                }}>
                <TextInputBox
                    colors={colors}
                    label={`${label} *`}
                    onBlur={() => {
                        checkName();
                    }}
                    value={value}
                    mode="outlined"
                    editable={!isLoading}
                    onChangeText={text => {
                        if (!textChange) {
                            setTextChange(true);
                        }
                        setValue(labelKey, text);
                    }}
                    style={style.InputBox}
                />
                {isLoading && (
                    <LottieView
                        source={lottie.loader}
                        style={{height: 25}}
                        autoPlay
                        loop
                    />
                )}
                {!textChange && errors && (
                    <Icon
                        name={errors ? 'error' : 'check-circle'}
                        type="material-icons"
                        color={errors ? 'red' : 'green'}
                        size={25}
                        style={{marginStart: 5, alignSelf: 'center'}}
                    />
                )}
            </View>
            {errors && !textChange && (
                <Text style={{color: 'red'}}>
                    {value ? errorMessage : emptyMessage}
                </Text>
            )}
        </View>
    );
}

const stylesCreator = ({colors}) =>
    StyleSheet.create({
        InputBox: {
            minHeight: 44,
            flex: 1,
            borderRadius: 25,
        },
        separator: {
            height: 1,
            borderWidth: 0.8,
            width: '95%',
            padding: 0,
            alignSelf: 'center',
            borderColor: colors.secondaryDark,
            marginStart: 10,
            marginEnd: 10,
        },
    });
