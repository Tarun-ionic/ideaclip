/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {Text, TextInput, View} from 'react-native';
import {appLogo, lottie} from '../../utilities/assets';
import LottieView from 'lottie-react-native';
import {Icon} from 'react-native-elements';
import Toast from 'react-native-simple-toast';
import auth from '@react-native-firebase/auth';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../../context/ThemeContext';
import SignStyle from '../../system/styles/signStyle';
import {RoundButton} from '../../system/ui/components';
import {SafeScreenView} from '../../index';
import {strings} from '../../constant/strings';
import AutoHeightImage from 'react-native-auto-height-image';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import AppBar from '../../screens/components/toolbar/appBar';
import scale from '../../utilities/scale';

function ChangePassword() {
    const {theme, height} = useTheme();
    const {colors} = theme;
    const styles = SignStyle(theme, height);
    const navigation = useNavigation();
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordMatch, setPasswordMatch] = useState(true);
    const [check, setCheck] = useState(false);
    const [passCheck, setPassCheck] = useState(false);
    const [passError, setPassError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);

    const checkPassword = () => {
        if (check || (passCheck && passError)) {
            return false;
        }
        setPassError(false);
        setUpdating(true);
        setLoading(true);
        setPassCheck(true);
        if (password) {
            let user = auth().currentUser;
            let cred = auth.EmailAuthProvider.credential(user.email, password);
            user
                .reauthenticateWithCredential(cred)
                .then(() => {
                    user
                        .updatePassword(newPassword)
                        .then(() => {
                            Toast.show(strings.credential_updated);
                            setPassError(false);
                            setUpdating(true);
                            setLoading(true);
                            setPassCheck(true);
                            setPassword('');
                            setNewPassword('');
                            setConfirmPassword('');
                            setPasswordMatch(true);
                            setCheck(false);
                            setPassCheck(false);
                            setPassError(false);
                            setLoading(false);
                            setUpdating(false);
                        })
                        .catch(() => {
                            Toast.show(strings.credential_updating_failed);
                        });
                    setPassError(false);
                    setLoading(false);
                    setUpdating(false);
                })
                .catch(() => {
                    setPassError(true);
                    setLoading(false);
                    setUpdating(false);
                    Toast.show(strings.credential_updating_failed);
                });
        }
    };
    useEffect(() => {
        setPassCheck(false);
    }, [password]);

    useEffect(() => {
        if (password) {
            if (newPassword && confirmPassword) {
                if (newPassword !== confirmPassword) {
                    setPasswordMatch(false);
                    setCheck(true);
                } else {
                    if (newPassword !== password) {
                        setPasswordMatch(true);
                        setCheck(false);
                    } else {
                        setPasswordMatch(true);
                        setCheck(true);
                    }
                }
            } else {
                setCheck(true);
            }
        } else {
            setCheck(true);
        }
    }, [password, newPassword, confirmPassword]);
    return (
        <SafeScreenView translucent>
            <KeyboardAwareScrollView
                style={styles.wrap}
                keyboardShouldPersistTaps="always">
                <View style={styles.container}>
                    <AppBar
                        title={'Change Password'}
                        onBackPress={() => navigation.goBack('')}
                    />
                    <Text
                        style={[
                            styles.title,
                            {
                                marginTop: 50,
                                fontSize: scale.font.l,
                                color: theme.colors.textPrimaryDark,
                            },
                        ]}>
                        {strings.slogan_2}
                    </Text>

                    <AutoHeightImage
                        source={appLogo.full}
                        style={{resizeMode: 'contain', marginTop: 20}}
                        width={scale.ms(300)}
                    />
                    <View>
                        <View style={{alignSelf: 'center', width: '90%'}}>
                            <View style={styles.InputContainer}>
                                <TextInput
                                    style={styles.InputBox}
                                    placeholder={'Current password'}
                                    placeholderTextColor="#aaaaaa"
                                    underlineColorAndroid="transparent"
                                    autoCapitalize="none"
                                    value={password}
                                    onChangeText={text => {
                                        setPassword(text);
                                    }}
                                    editable={!updating}
                                    secureTextEntry={true}
                                />
                                {loading && (
                                    <LottieView
                                        source={lottie.loader}
                                        style={{height: 25}}
                                        autoPlay
                                        loop
                                    />
                                )}
                                {!loading && passCheck && (
                                    <Icon
                                        name={passError ? 'error' : 'check-circle'}
                                        type="material-icons"
                                        color={passError ? 'red' : colors.success}
                                        size={25}
                                        style={{marginStart: 5, alignSelf: 'center'}}
                                    />
                                )}
                            </View>
                            {!loading && passCheck && passError && (
                                <Text style={{color: 'red', margin: 10}}>
                                    Password incorrect
                                </Text>
                            )}
                        </View>
                        <View
                            style={{
                                alignSelf: 'center',
                                flexDirection: 'column',
                                width: '90%',
                            }}>
                            <TextInput
                                style={styles.InputBox}
                                placeholder={'New password'}
                                placeholderTextColor="#aaaaaa"
                                underlineColorAndroid="transparent"
                                autoCapitalize="none"
                                value={newPassword}
                                onChangeText={text => setNewPassword(text)}
                                editable={!updating}
                                secureTextEntry={true}
                            />
                            <TextInput
                                style={styles.InputBox}
                                placeholder={'Confirm new password'}
                                placeholderTextColor="#aaaaaa"
                                underlineColorAndroid="transparent"
                                autoCapitalize="none"
                                value={confirmPassword}
                                onChangeText={text => setConfirmPassword(text)}
                                editable={!updating}
                                secureTextEntry={true}
                            />

                            {!passwordMatch && (
                                <Text style={{color: 'red', margin: 10}}>
                                    Passwords do not match
                                </Text>
                            )}
                            <RoundButton
                                style={styles.signupText}
                                onPress={checkPassword}
                                label={strings.update}
                            />
                        </View>
                    </View>
                </View>
            </KeyboardAwareScrollView>
        </SafeScreenView>
    );
}

export default ChangePassword;
