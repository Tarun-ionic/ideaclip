/* eslint-disable react-hooks/exhaustive-deps,react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {I18nManager, Platform, StyleSheet, Text, TextInput, View} from 'react-native';
import {useLazyQuery} from '@apollo/client';
import {Icon} from 'react-native-elements';
import LottieView from 'lottie-react-native';
import {lottie} from '../../../utilities/assets';
import {queries} from '../../../schema';
import {useTheme} from '../../../context/ThemeContext';
import {checkEmail, checkUserName} from '../../../utilities/helper';
import TextInputBox from './TextInputBox';
import scale from "../../../utilities/scale";

export default function Email({
                                  value,
                                  setValue,
                                  original,
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
    const [execute, {loading, data}] = useLazyQuery(queries.emailCheck, {
        fetchPolicy: 'no-cache',
    });
    const emptyMessage = 'Email address should not be empty.';
    const usedMessage = 'Email address is already in use.';
    const errorMessage =
        "Email address is incorrectly formatted";
    useEffect(() => {
        if (data && !loading) {
            setIsLoading(false);
            setIsUsed(data?.emailCheck);
            verified(!data?.emailCheck);
            setTextChange(false);
        }
    }, [data]);

    useEffect(() => {
        if (isUsed) {
            setValue('emailError', true);
        } else {
            setValue('emailError', false);
        }
    }, [isUsed]);

    function checkName() {
        if (value !== original) {
            setIsLoading(true);
            checkEmail(value)
                .then(() => {
                    setIsError(false);
                    setValue('emailError', false)
                    execute({
                        variables: {
                            email: value,
                        },
                    });
                })
                .catch(err => {
                    verified(false);
                    setValue('emailError', true);
                    setIsLoading(false);
                    setIsError(true);
                    setTextChange(false);
                });
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
                                setValue('email', text.replace(/[\s]+/g, ''));
                            }}
                            style={style.InputBoxSignup}
                            maxLength={17}
                        />
                    ) : (
                        <TextInput
                            colors={colors}
                            label={``}
                            onBlur={() => {
                                checkName();
                            }}
                            value={TrimString()}
                            // value={value}
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
                                setValue('email', text.replace(/[\s]+/g, ''));
                            }}
                            style={style.InputBoxSignup}
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
                <Text style={{color: colors.secondaryDark}}>
                    Email address is NOT editable once saved.
                </Text>
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
                            label={`Email *`}
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
                                setValue('email', text.replace(/[\s]+/g, ''));
                            }}
                            style={style.InputBox}
                            maxLength={17}
                        />
                    ) : (
                        <TextInputBox
                            colors={colors}
                            label={`Email *`}
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
                                setValue('email', text.replace(/[\s]+/g, ''));
                            }}
                            style={style.InputBox}
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
                <Text style={{color: colors.secondaryDark}}>
                    Email address is NOT editable once saved.
                </Text>
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
            borderWidth: 1,
            marginBottom:5,
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
