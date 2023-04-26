/* eslint-disable react-hooks/exhaustive-deps,react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {I18nManager, Platform, StyleSheet, Text, TextInput, View} from 'react-native';
import {useLazyQuery} from '@apollo/client';
import {Icon} from 'react-native-elements';
import LottieView from 'lottie-react-native';
import {lottie} from '../../../utilities/assets';
import {queries} from '../../../schema';
import {useTheme} from '../../../context/ThemeContext';
import {strings} from '../../../constant/strings';
import {checkUserName} from '../../../utilities/helper';
import TextInputBox from './TextInputBox';
import scale from "../../../utilities/scale";

export default function NickName({
                                     value,
                                     setValue,
                                     originalName,
                                     initial = false,
                                     verified = () => {
                                     },
                                    isSignup=false
                                 }) {
    const [isLoading, setIsLoading] = useState(false);
    const [textChange, setTextChange] = useState(true);
    const [isUsed, setIsUsed] = useState(false);
    const [isError, setIsError] = useState(false);
    const {theme} = useTheme();
    const {colors} = theme;
    const style = stylesCreator(theme);
    const [execute, {loading, data}] = useLazyQuery(queries.checkNickname, {
        fetchPolicy: 'no-cache',
    });
    const emptyMessage = 'Username should not be empty.';
    const usedMessage = 'Username is already in use.';
    const errorMessage =
        "Username should be 5-30 characters long and can contain only small letters (a-z), numbers (0-9), and periods (. _ @).(can contain only one '.')";
    useEffect(() => {
        if (data && !loading) {
            setIsLoading(false);
            setIsUsed(data.nameExist.isUsed);
            verified(!data.nameExist.isUsed);
            setTextChange(false);
        }
    }, [data]);
    useEffect(() => {
        if (isUsed) {
            setValue('nickNameError', true);
        } else {
            setValue('nickNameError', false);
        }
    }, [isUsed]);

    function checkName() {
        if (value !== originalName || initial) {
            setIsLoading(true);
            if (value?.length < 5 || value?.length > 30) {
                verified(false);
                setValue('nickNameError', true);
                setIsLoading(false);
                setIsError(true);
                setTextChange(false);
            } else {
                setValue('nickNameError', false);
                checkUserName(value)
                    .then(() => {
                        setIsError(false);
                        execute({
                            variables: {
                                displayName: value,
                            },
                        });
                    })
                    .catch(err => {
                        verified(false);
                        setValue('nickNameError', true);
                        setIsLoading(false);
                        setIsError(true);
                        setTextChange(false);
                    });
            }
        }
    }

    const TrimString = () => {
        if (value) {
            return value.replace(/ /g, '').trim().toLowerCase();
        } else {
            return value;
        }
    };
    if(isSignup){
        return (
            <View style={{alignSelf: 'center',}}>
                <View
                    style={{
                        alignSelf: 'center',
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}>
                    {Platform.OS === 'ios' ? (

                        <TextInput
                            label={``}
                            onBlur={() => {
                                checkName();
                            }}
                            value={TrimString()}
                            editable={!isLoading}
                            autoCapitalize="none"
                            onChangeText={text => {
                                if (!textChange) {
                                    verified(false);
                                    setTextChange(true);
                                    setIsUsed(false);
                                    setIsError(false);
                                }
                                setValue('displayName', text.replace(/[\s]+/g, ''));
                            }}
                            style={style.InputBoxSignup}
                            maxLength={30}
                        />
                    ) : (
                        <TextInput
                            label={``}
                            onBlur={() => {
                                checkName();
                            }}
                            value={TrimString()}
                            editable={!isLoading}
                            autoCapitalize="none"
                            secureTextEntry={true}
                            keyboardType={'visible-password'}
                            onChangeText={text => {
                                if (!textChange) {
                                    setTextChange(true);
                                    setIsUsed(false);
                                    setIsError(false);
                                }
                                setValue('displayName', text.replace(/[\s]+/g, ''));
                            }}
                            style={style.InputBoxSignup}
                            maxLength={30}
                        />
                    )}

                    {isLoading && (
                        <LottieView
                            source={lottie.loader}
                            style={{height: 25}}
                            autoPlay
                            loop
                        />
                    )}
                    {!textChange && (
                        <Icon
                            name={isUsed || isError ? 'error' : 'check-circle'}
                            type="material-icons"
                            color={isUsed || isError ? 'red' : 'green'}
                            size={25}
                            style={{marginStart: 5, alignSelf: 'center'}}
                        />
                    )}
                </View>
                {initial && (
                    <Text style={{color: colors.secondaryDark}}>
                        Username is NOT editable once saved.
                    </Text>
                )}
                {isUsed && !textChange && (
                    <Text style={{color: colors.secondaryDark}}>
                        {value ? usedMessage : emptyMessage}
                    </Text>
                )}
                {isError && !textChange && (
                    <Text style={{color: colors.secondaryDark}}>{errorMessage}</Text>
                )}
            </View>
        );
    } else {
        return (
            <View style={{alignSelf: 'center', width: '90%'}}>
                <View
                    style={{
                        alignSelf: 'center',
                        marginTop: 20,
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}>
                    {Platform.OS === 'ios' ? (
                        <TextInputBox
                            colors={colors}
                            label={`${strings.userName} *`}
                            onBlur={() => {
                                checkName();
                            }}
                            value={TrimString()}
                            // value={value}
                            mode="outlined"
                            editable={!isLoading}
                            autoCapitalize="none"
                            onChangeText={text => {
                                if (!textChange) {
                                    verified(false);
                                    setTextChange(true);
                                    setIsUsed(false);
                                    setIsError(false);
                                }
                                setValue('displayName', text.replace(/[\s]+/g, ''));
                            }}
                            style={style.InputBox}
                            maxLength={30}
                            disabled={!initial}
                        />
                    ) : (
                        <TextInputBox
                            colors={colors}
                            label={`${strings.userName} *`}
                            onBlur={() => {
                                checkName();
                            }}
                            value={TrimString()}
                            // value={value}
                            mode="outlined"
                            editable={!isLoading}
                            autoCapitalize="none"
                            secureTextEntry={true}
                            keyboardType={'visible-password'}
                            onChangeText={text => {
                                if (!textChange) {
                                    setTextChange(true);
                                    setIsUsed(false);
                                    setIsError(false);
                                }
                                setValue('displayName', text.replace(/[\s]+/g, ''));
                            }}
                            style={style.InputBox}
                            maxLength={30}
                            disabled={!initial}
                        />
                    )}

                    {isLoading && (
                        <LottieView
                            source={lottie.loader}
                            style={{height: 25}}
                            autoPlay
                            loop
                        />
                    )}
                    {!textChange && (
                        <Icon
                            name={isUsed || isError ? 'error' : 'check-circle'}
                            type="material-icons"
                            color={isUsed || isError ? 'red' : 'green'}
                            size={25}
                            style={{marginStart: 5, alignSelf: 'center'}}
                        />
                    )}
                </View>
                {initial && (
                    <Text style={{color: colors.secondaryDark}}>
                        Username is NOT editable once saved.
                    </Text>
                )}
                {isUsed && !textChange && (
                    <Text style={{color: colors.secondaryDark}}>
                        {value ? usedMessage : emptyMessage}
                    </Text>
                )}
                {isError && !textChange && (
                    <Text style={{color: colors.secondaryDark}}>{errorMessage}</Text>
                )}
            </View>
        );
    }
}

const stylesCreator = ({colors}) =>
    StyleSheet.create({
        InputBox: {
            minHeight: 44,
            flex: 1,
            borderRadius: 25,
        },
        InputBoxSignup: {
            paddingVertical: 5,
            marginBottom:5,
            borderWidth: 1,
            borderColor: colors.signupInputBorder,
            backgroundColor: colors.signupInputBackground,
            color: colors.signupInputText,
            paddingHorizontal: 15,
            flex:1,
            alignItems: 'center',
            borderRadius: 15,
            fontSize: scale.font.xl,
            textAlign: I18nManager.isRTL ? 'right' : 'left',
        },
    });
