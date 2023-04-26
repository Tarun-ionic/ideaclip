/* eslint-disable react-hooks/rules-of-hooks,react-hooks/exhaustive-deps,radix,no-alert,react-native/no-inline-styles */
import React, {useEffect, useRef, useState} from 'react';
import {Keyboard, Platform, StatusBar, Text, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import OTPTextView from 'react-native-otp-textinput';
import {useTheme} from '../../context/ThemeContext';
import SignStyle from '../../system/styles/signStyle';
import {useBackHandler} from '../../utilities/helper';
import {appLogo} from '../../utilities/assets';
import AutoHeightImage from 'react-native-auto-height-image';
import {ProgressLoader, RoundButton, SafeScreenView} from '../../index';
import OtpAutocomplete from 'react-native-otp-autocomplete';
import {strings, subTitles, titles} from '../../constant/strings';
import {useNavigation, useRoute} from '@react-navigation/native';
import {verifyPhoneOtp} from '../../lib/axios';
import apiConstant from '../../constant/apiConstant';
import logger from '../../lib/logger';
import AppBar from '../../screens/components/toolbar/appBar';
import scale from '../../utilities/scale';
import {useAlert} from '../../context/AlertContext';

export default function PhoneOtp() {
    const navigation = useNavigation();
    const {theme, height} = useTheme();
    const alert = useAlert();
    const styles = SignStyle(theme, height);
    const [timer, setTimer] = useState(0);
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const otpInput = useRef();
    const route = useRoute();

    useEffect(() => {
        StatusBar.setHidden(true);
    }, []);

    const otpHandler = message => {
        const otpRead = /(\d{6})/g.exec(message)[1];
        // setOtp(otpRead)
        otpInput.current.setValue(otpRead);
        OtpAutocomplete.removeListener();
        Keyboard.dismiss();
    };
    const getHash = () => {
        OtpAutocomplete.getHash().then();
    };

    const startListeningForOtp = () => {
        OtpAutocomplete.getOtp()
            .then(() => OtpAutocomplete.addListener(otpHandler))
            .catch(p => logger.e(p));
    };

    useEffect(() => {
        if (Platform.OS !== 'ios') {
            getHash();
            startListeningForOtp();
            return () => {
                OtpAutocomplete.removeListener();
            };
        }
    }, []);

    useEffect(() => {
        if (timer >= 1) {
            setTimeout(() => {
                setTimer(time => parseInt(time) - 1);
            }, 1000);
        }
    }, [timer]);

    useBackHandler(() => {
        navigation.navigate('Register',);
    }, []);

    const verifyCode = () => {
        setLoading(true);
        const {user} = route.params;
        verifyPhoneOtp(
            `${user?.phoneNumber?.phoneCode}${user?.phoneNumber?.phNumber}`,
            otp,
        )
            .then(res => {
                if (res === apiConstant.statusCodes.success) {
                    setLoading(false);
                    if (Platform.OS !== 'ios') {
                        OtpAutocomplete.removeListener();
                    }
                    navigation.navigate('Initial', {
                        ...route.params,
                    });
                    // navigation.navigate('InitialSetup', {
                    //     ...route.params,
                    // });
                } else {
                    setLoading(false);
                    alert(res);
                }
            })
            .catch(err => {
                setLoading(false);
                let message = apiConstant.sendMessages.failure;
                if (err.status === apiConstant.statusCodes.error && err?.data) {
                    message = err?.data;
                } else if (!err.data) {
                    message = apiConstant.sendMessages.failure;
                }
                alert(message);
            });
    };

    return (
        <SafeScreenView
            translucent={Platform.OS === 'ios'}
            colors={['#e50012', '#0359a7']}
            locations={[0.4, 0.9]}>
            <AppBar
                // gradiant
                title={titles.verifyAccount}
                onBackPress={() => navigation.navigate('Register')}
            />
            <KeyboardAwareScrollView
                style={styles.wrap}
                keyboardShouldPersistTaps="always">
                <View style={styles.container}>

                    <Text
                        style={[
                            styles.title,
                            {
                                marginTop: 50,
                                fontSize: scale.font.xl,
                                color: theme.colors.textPrimaryDark,
                            },
                        ]}>
                        {strings.slogan_2}
                    </Text>
                    <AutoHeightImage
                        source={appLogo.full}
                        width={scale.ms(300)}
                        style={{resizeMode: 'contain', marginTop: 20}}
                    />

                    <Text
                        style={[
                            styles.subTitle,
                            {
                                fontSize: scale.font.l,
                                marginTop: 70,
                                marginBottom: 15,
                                paddingLeft: 30,
                                paddingRight: 30,
                                color: theme.colors.textPrimaryDark,
                            },
                        ]}>
                        {subTitles.verifyOtp}
                    </Text>
                    {route.params &&
                    route.params.user &&
                    route.params.user.phoneNumber && (
                        <Text style={styles.subTitle}>
                            {route.params.user.phoneNumber.phoneCode +
                            ' ' +
                            route.params.user.phoneNumber.phNumber}
                        </Text>
                    )}
                    <OTPTextView
                        defaultValue={otp}
                        handleTextChange={setOtp}
                        containerStyle={styles.otpBox}
                        inputCount={6}
                        textInputStyle={styles.otpItem}
                        keyboardType="numeric"
                        ref={otpInput}
                    />

                    <RoundButton
                        style={styles.signupText}
                        onPress={() => {
                            verifyCode();
                        }}
                        label={strings.verify}
                    />
                    <ProgressLoader visible={loading}/>
                </View>
            </KeyboardAwareScrollView>
        </SafeScreenView>
    );
}
