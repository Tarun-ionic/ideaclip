// noinspection DuplicatedCode,JSUnresolvedFunction,JSUnresolvedVariable

import React, {useEffect, useState} from 'react';
import {Modal, Platform, StatusBar, Text, TextInput, TouchableOpacity, View,} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {businessData, charityData, userData, userType,} from '../../utilities/constant';
import Toast from 'react-native-simple-toast';
import {useNavigation, useRoute} from '@react-navigation/native';
import SocialLogin from './SocialLogin';
import {checkEmail, useBackHandler} from '../../utilities/helper';
import {ProgressLoader, RoundButton, SafeScreenView} from '../../index';
import apiConstant from '../../constant/apiConstant';
import {useTheme} from '../../context/ThemeContext';
import AutoHeightImage from 'react-native-auto-height-image';
import {useAlert} from '../../context/AlertContext';
import {strings} from '../../constant/strings';
import {appLogo} from '../../utilities/assets';
import CountryPicker, {DARK_THEME} from 'react-native-country-picker-modal';
import {Icon} from 'react-native-elements';
import SignStyle from 'system/styles/signStyle';
import {checkUserEmail} from '../../lib/axios';
import AppBar from '../../screens/components/toolbar/appBar';
import scale from '../../utilities/scale';
import {queries} from '../../schema';
import apollo from '../../lib/apolloLib';
import {useSession} from "../../context/SessionContext";

export default function Signup() {
    const session = useSession();
    const navigation = useNavigation();
    const route = useRoute();
    const {theme, height} = useTheme();
    const {colors} = theme;
    const styles = SignStyle(theme, height);
    const alert = useAlert();
    const [user, setUserData] = useState(
        isUser ? {...userData} : {...businessData},
    );
    const [userLoginType] = useState(route.params?.userLoginType);
    const [isUser] = useState(userLoginType === userType.general);
    const [referralCode, setReferralCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [termsAndConditions, setTermsAndConditions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showCountryPicker, setShowCountryPicker] = useState(false);
    const [phone, setPhone] = useState('');
    const [countryCode, setCountryCode] = useState('AU');
    const [country, setCountry] = useState('Australia');
    const [phoneCode, setPhoneCode] = useState('+61');

    const onSelect = _country => {
        setShowCountryPicker(false);
        setCountryCode(_country.cca2);
        setCountry(_country.name);
        if (_country.callingCode && _country.callingCode.length > 0) {
            setPhoneCode(`+${_country.callingCode[0]}`);
        }
    };

    useEffect(() => {
        StatusBar.setHidden(true);
    }, []);

    useBackHandler(() => {
        if (!isLoading) {
            navigation.goBack(null);
        }
        return true;
    }, []);

    const onFooterLinkPress = () => {
        navigation.navigate('Login', {...route.params});
    };

    const handleChange = (name, value) => {
        setUserData(prevState => ({
            ...prevState,
            [name]: value.trim(),
        }));
    };

    const onTermsCallback = status => {
        setTermsAndConditions(status);
    };

    const handleEmailCheck = () => {
        checkUserEmail(user.email)
            .then(res => {
                if (res === apiConstant.statusCodes.success) {
                    if (termsAndConditions) {
                        setIsLoading(false);
                        switch (userLoginType) {
                            case userType.business:
                                navigation.push('InitializeUser', {
                                    user: {
                                        ...businessData,
                                        email: user.email,
                                        userType:userLoginType,
                                    },
                                    referralCode: referralCode ?? '',
                                    password,
                                    userLoginType,
                                });
                                break;
                            case userType.charity:
                                navigation.push('InitializeUser', {
                                    user: {
                                        ...charityData,
                                        email: user.email,
                                        userType:userLoginType,
                                    },
                                    referralCode: referralCode ?? '',
                                    password,
                                    userLoginType,
                                });
                                break;
                            default:
                                if (phone && phone.length >= 9) {
                                    navigation.navigate('InitializeUser', {
                                        user: {
                                            ...userData,
                                            email: user.email,
                                            countryCode: countryCode,
                                            country: country,
                                            phoneNumber: {
                                                phNumber: phone,
                                                countryCode: countryCode,
                                                phoneCode: phoneCode,
                                            },
                                            userType:userLoginType,
                                        },
                                        referralCode: referralCode ?? '',
                                        password,
                                        userLoginType,
                                    });
                                } else {
                                    setIsLoading(false);
                                    Toast.show('Enter a valid phone number');
                                }
                        }
                    } else {
                        switch (userLoginType) {
                            case userType.business:
                                setIsLoading(false);
                                navigation.navigate('TermsAndConditions', {
                                    user: {
                                        ...businessData,
                                        email: user.email,
                                        userType: userLoginType,
                                    },
                                    referralCode: referralCode ?? '',
                                    password,
                                    userLoginType,
                                    socialMedia: false,
                                    callback: onTermsCallback,
                                });
                                break;
                            case userType.charity:
                                setIsLoading(false);
                                navigation.navigate('TermsAndConditions', {
                                    user: {
                                        ...charityData,
                                        email: user.email,
                                        userType: userLoginType,
                                    },
                                    referralCode: referralCode ?? '',
                                    password,
                                    userLoginType,
                                    socialMedia: false,
                                    callback: onTermsCallback,
                                });
                                break;
                            default:
                                if (phone && phone.length >= 9) {
                                    setIsLoading(false);
                                    navigation.navigate('TermsAndConditions', {
                                        user: {
                                            ...userData,
                                            email: user.email,
                                            countryCode: countryCode,
                                            country: country,
                                            phoneNumber: {
                                                phNumber: phone,
                                                countryCode: countryCode,
                                                phoneCode: phoneCode,
                                            },
                                            userType:   userLoginType,
                                        },
                                        referralCode: referralCode ?? '',
                                        password,
                                        userLoginType,
                                        socialMedia: false,
                                        callback: onTermsCallback,
                                    });
                                } else {
                                    setIsLoading(false);
                                    Toast.show('Enter a valid phone number');
                                }
                        }
                    }
                } else {
                    setIsLoading(false);
                    alert(res);
                }
            })
            .catch(err => {
                if (String(err) === 'AxiosError: Network Error') {
                    alert(strings.network_error_message);
                } else if (
                    String(err) === 'AxiosError: Request failed with status code 400'
                ) {
                    alert(strings.duplicate_email_message);
                }
                setIsLoading(false);
            });
    };

    const onSignupPress = () => {
        setIsLoading(true);
        checkEmail(user.email)
            .then(() => {
                var regix = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
                if (password === confirmPassword && regix.test(password)) {
                    referralCode
                        ? apollo.client(session)
                            .query({
                                fetchPolicy: 'no-cache',
                                variables: {code: referralCode},
                                query: queries.checkReferralCode,
                            })
                            .then(({data}) => {
                                if (data?.checkReferralCode) {
                                    handleEmailCheck();
                                } else {
                                    setIsLoading(false);
                                    alert('Referral code is not valid.');
                                    return false;
                                }
                            })
                            .catch(() => {
                                setIsLoading(false);
                                alert('Referral code is not valid.');
                                return false;
                            })
                        : handleEmailCheck();
                } else {
                    setIsLoading(false);
                    if (!regix.test(password)) {
                        Toast.show('Password must be a minimum of 8 characters including number, Upper, Lower And one Special Character');
                    } else if (password !== confirmPassword) {
                        Toast.show("Passwords don't match");
                    }
                }
            })
            .catch(() => {
                setIsLoading(false);
                Toast.show('Enter valid email address');
            });
    };

    return (
        <SafeScreenView
            translucent={Platform.OS === 'ios'}
            colors={['#e50012', '#0359a7']}
            locations={[0.4, 0.9]}>
            <AppBar
                title={'Create new account'}
                // gradiant
                onBackPress={() => navigation.goBack('')}
            />
            <KeyboardAwareScrollView
                style={styles.wrap}
                keyboardShouldPersistTaps="always">
                <View style={styles.container}>
                    <View style={styles.iconContainerView}>
                        <Text style={styles.subTitle}>
                            {isUser ? strings.signup_user_title : strings.signup_title}
                        </Text>
                        <AutoHeightImage
                            width={scale.ms(300)}
                            style={styles.logo}
                            source={appLogo.full}
                        />
                    </View>

                    <TextInput
                        style={styles.InputBox}
                        placeholder={'E-mail Address'}
                        placeholderTextColor="#aaaaaa"
                        onChangeText={text => handleChange('email', text)}
                        value={user.email}
                        underlineColorAndroid="transparent"
                        autoCapitalize="none"
                    />
                    <TextInput
                        style={styles.InputBox}
                        placeholder={'Password'}
                        placeholderTextColor="#aaaaaa"
                        secureTextEntry
                        onChangeText={setPassword}
                        value={password}
                        underlineColorAndroid="transparent"
                        autoCapitalize="none"
                    />
                    <TextInput
                        style={styles.InputBox}
                        placeholder={'Confirm password'}
                        placeholderTextColor="#aaaaaa"
                        secureTextEntry
                        onChangeText={setConfirmPassword}
                        value={confirmPassword}
                        underlineColorAndroid="transparent"
                        autoCapitalize="none"
                    />
                   
                    <TextInput
                        style={styles.InputBox}
                        placeholder={'Enter Referral Code(Optional)'}
                        placeholderTextColor="#aaaaaa"
                        onChangeText={text => setReferralCode(
                            text.trim().replace(/[^A-Za-z0-9]+/g, '').toUpperCase()
                            // text.trim().toUpperCase()
                        )}
                        value={referralCode}
                        maxLength={6}
                        numberOfLines={1}
                        underlineColorAndroid="transparent"
                        autoCapitalize={"characters"}
                    />
                     <View style={styles.referralCodeMessage}>
                        <Text style={styles.message}>{strings.referralCodeMessage}</Text>
                    </View>
                    {isUser && (
                        <View style={styles.phone_check_box}>
                            <Text style={styles.message}>{strings.phoneNumberMessage}</Text>
                            <View style={styles.phone_input_view}>
                                <TouchableOpacity
                                    onPress={() => setShowCountryPicker(true)}
                                    style={styles.phone_input}>
                                    <CountryPicker
                                        countryCode={countryCode}
                                        withFilter={true}
                                        withFlag={true}
                                        withCountryNameButton={false}
                                        withAlphaFilter={true}
                                        withCallingCode={true}
                                        withEmoji={true}
                                        modalProps={{transparent: false, visible: false}}
                                        visible={false}
                                        onOpen={() => setShowCountryPicker(true)}
                                    />

                                    <Icon
                                        name="arrow-drop-down"
                                        size={20}
                                        color={colors.textPrimary}
                                        type="material"
                                    />
                                </TouchableOpacity>
                                <View style={styles.phone_input_box}>
                                    <Text style={styles.phoneCode}>{phoneCode}</Text>
                                    <TextInput
                                        style={styles.InputPhoneBox}
                                        placeholder={'Phone number'}
                                        placeholderTextColor="#aaaaaa"
                                        onChangeText={text =>
                                            setPhone(text.trim().replace(/[\D]+/g, ''))
                                        }
                                        maxLength={10}
                                        value={phone}
                                        keyboardType="numeric"
                                        textContentType={'telephoneNumber'}
                                        underlineColorAndroid="transparent"
                                        autoCapitalize="none"
                                    />
                                </View>
                            </View>
                        </View>
                    )}

                    <RoundButton
                        style={styles.signupText}
                        onPress={onSignupPress}
                        label={strings.sign_up_as_(userLoginType)}
                    />
                    <View style={styles.footerView}>
                        <Text style={styles.footerText}>
                            Already got an account ?
                            <Text onPress={onFooterLinkPress} style={styles.footerLink}>
                                {'  Log in'}
                            </Text>
                        </Text>
                    </View>

                    <View style={styles.loginLink}>
                        <View style={[styles.lineStyle]}/>
                        <Text style={styles.splitText}>{strings.or}</Text>
                        <View style={[styles.lineStyle]}/>
                    </View>
                    <SocialLogin
                        isLogin={false}
                        onProgress={setIsLoading}
                        termsCallback={status => {
                            setTermsAndConditions(status);
                        }}
                        termsCondition={termsAndConditions}
                    />
                </View>

                {isUser && (
                    <Modal
                        transparent={true}
                        visible={showCountryPicker}
                        onRequestClose={() => setShowCountryPicker(false)}
                        onDismiss={() => setShowCountryPicker(false)}>
                        <View style={styles.popupBody}>
                            <View style={styles.popupContent}>
                                <View style={styles.popupActionButton}>
                                    <Text style={styles.popupTitle}>Select your country</Text>
                                    <Icon
                                        name="cancel"
                                        size={30}
                                        color={colors.secondaryAccent}
                                        type="material"
                                        onPress={() => setShowCountryPicker(false)}
                                    />
                                </View>

                                <CountryPicker
                                    countryCode={countryCode}
                                    withFilter={true}
                                    withFlag={true}
                                    withCountryNameButton={false}
                                    withAlphaFilter={true}
                                    withCallingCode={true}
                                    withEmoji={true}
                                    onSelect={onSelect}
                                    filterProps={{style: styles.InputBoxFull}}
                                    withCloseButton={false}
                                    theme={theme.dark && DARK_THEME}
                                    onClose={() => setShowCountryPicker(false)}
                                    visible
                                    withModal={false}
                                />
                            </View>
                        </View>
                    </Modal>
                )}
            </KeyboardAwareScrollView>
            <ProgressLoader visible={isLoading}/>
        </SafeScreenView>
    );
}
