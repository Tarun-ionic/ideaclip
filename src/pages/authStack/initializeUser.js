/* eslint-disable react-hooks/exhaustive-deps,react-native/no-inline-styles */
// noinspection JSUnresolvedFunction,JSUnresolvedVariable

import React, {useEffect, useState} from 'react';
import {Platform, Text, View} from 'react-native';
import {lottie} from '../../index';
import AnimatedLoader from 'react-native-animated-loader';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useTheme} from '../../context/ThemeContext';
import StyleGenerator from './questionnaire/StyleGenerator';
import {userType} from '../../utilities/constant';
import {strings} from '../../constant/strings';
import {useAlert} from '../../context/AlertContext';
import {useBackHandler} from '../../utilities/helper';
import OtpAutocomplete from 'react-native-otp-autocomplete';
import {sendPhoneOtp} from '../../lib/axios';
import apiConstant from '../../constant/apiConstant';

const InitializeUser = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const {theme} = useTheme();
    const {colors} = theme;
    const styles = StyleGenerator(theme);
    const [loading, setLoading] = useState(true);
    const alert = useAlert();

    useEffect(() => {
        if (route?.params?.user) {
            switch (route.params.user.userType) {
                case userType.charity:
                    setLoading(false);
                    navigation.push('Initial', {
                        user: {...route.params.user},
                        password: route.params.password,
                        referralCode: route?.params?.referralCode ?? '',
                    });
                    // navigation.push('InitialSetupCharity', {
                    //     user: {...route.params.user},
                    //     password: route.params.password,
                    //     referralCode: route?.params?.referralCode ?? '',
                    // });
                    break;
                case userType.business:
                    setLoading(false);
                    navigation.push('Initial', {
                        user: {...route.params.user},
                        password: route.params.password,
                        referralCode: route?.params?.referralCode ?? '',
                    });
                    // navigation.push('InitialSetupBusiness', {
                    //     user: {...route.params.user},
                    //     password: route.params.password,
                    //     referralCode: route?.params?.referralCode ?? '',
                    // });
                    break;
                default:
                    generalUser();
            }
        }
    }, [route.params]);

    const handleIOS = () => {
        sendPhoneOtp(
            `${route.params.user?.phoneNumber?.phoneCode}${route.params.user?.phoneNumber?.phNumber}`,
            '',
        )
            .then(res => {
                if (res === apiConstant.statusCodes.success) {
                    setLoading(false);
                    navigation.navigate('PhoneOtp', {
                        user: {...route.params.user},
                        password: route.params.password,
                        referralCode: route?.params?.referralCode ?? '',
                    });
                } else {
                    setLoading(false);
                    alert({
                        message: res,
                        buttons: [
                            {
                                label: strings.ok,
                                callback: () => {
                                    alert.clear();
                                    navigation.navigate('Register');
                                },
                            },
                        ],
                        autoDismiss: false,
                        cancellable: false,
                    });
                }
            })
            .catch(err => {
                setLoading(false);
                let message = 'Unable to send verification code';
                if (err.status === apiConstant.statusCodes.error && err?.data) {
                    message = err?.data;
                }
                alert({
                    message: message,
                    buttons: [
                        {
                            label: strings.ok,
                            callback: () => {
                                alert.clear();
                                navigation.navigate('Register');
                            },
                        },
                    ],
                    autoDismiss: false,
                    cancellable: false,
                });
            });
    };

    const handleAndroid = () => {
        OtpAutocomplete.getHash()
            .then(hash => {
                sendPhoneOtp(
                    `${route.params?.user?.phoneNumber.phoneCode}${route.params?.user?.phoneNumber.phNumber}`,
                    hash[0],
                )
                    .then(res => {
                        if (res === apiConstant.statusCodes.success) {
                            setLoading(false);
                            navigation.navigate('PhoneOtp', {
                                user: {...route.params?.user},
                                password: route.params?.password,
                                referralCode: route?.params?.referralCode ?? '',
                            });
                        } else {
                            setLoading(false);
                            alert({
                                message: res,
                                buttons: [
                                    {
                                        label: strings.ok,
                                        callback: () => {
                                            alert.clear();
                                            navigation.navigate('Register');
                                        },
                                    },
                                ],
                                autoDismiss: false,
                                cancellable: false,
                            });
                        }
                    })
                    .catch(err => {
                        setLoading(false);
                        let message = 'Unable to send verification code.';
                        if (err.status === apiConstant.statusCodes.error && err?.data) {
                            message = err?.data;
                        }
                        alert({
                            message: message,
                            buttons: [
                                {
                                    label: strings.ok,
                                    callback: () => {
                                        alert.clear();
                                        navigation.navigate('Register');
                                    },
                                },
                            ],
                            autoDismiss: false,
                            cancellable: false,
                        });
                    });
            })
            .catch(() => {
                setLoading(false);
                alert({
                    message: 'Error generating hash. Please try again later',
                    buttons: [
                        {
                            label: strings.ok,
                            callback: () => {
                                alert.clear();
                                navigation.navigate('Register');
                            },
                        },
                    ],
                    autoDismiss: false,
                    cancellable: false,
                });
            });
    };

    const generalUser = () => {
        if (Platform.OS === 'ios') {
            handleIOS();
        } else {
            handleAndroid();
        }
    };

    useBackHandler(() => {
        return true;
    }, []);
    return (
        <View style={[styles.container, {backgroundColor: colors.surfaceDark}]}>
            <AnimatedLoader
                visible={loading}
                overlayColor="rgba(255,255,255,0)"
                source={lottie.loader}
                animationStyle={styles.lottie}
                speed={1}
                loop={true}>
                <Text style={{alignSelf: 'center', color: colors.secondary}}>
                    {' '}
                    Initialising your account ...
                </Text>
            </AnimatedLoader>
        </View>
    );
};
export default InitializeUser;
