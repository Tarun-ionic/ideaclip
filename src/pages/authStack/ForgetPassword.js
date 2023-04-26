/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {StatusBar, Text, TextInput, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import AutoHeightImage from 'react-native-auto-height-image';
import {appLogo} from '../../utilities/assets';
import {ProgressLoader, RoundButton, SafeScreenView} from '../../index';
import {useTheme} from '../../context/ThemeContext';
import SignStyle from '../../system/styles/signStyle';
import {useAlert} from '../../context/AlertContext';
import {checkEmail, useBackHandler} from '../../utilities/helper';
import auth from '@react-native-firebase/auth';
import {useNavigation} from '@react-navigation/native';
import {strings} from '../../constant/strings';
import AppBar from '../../screens/components/toolbar/appBar';
import scale from '../../utilities/scale';
import Toast from 'react-native-simple-toast';

export default function ForgetPassword() {
    const navigation = useNavigation();
    const {theme, height} = useTheme();
    const styles = SignStyle(theme, height);
    const alert = useAlert();

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        StatusBar.setHidden(true);
    }, []);

    useBackHandler(() => {
        navigation.goBack(null);
        return true;
    }, []);

    const handleReset = () => {
        if (email && email.length > 0) {
            checkEmail(email)
                .then(() => {
                    setLoading(true);
                    auth()
                        .sendPasswordResetEmail(email)
                        .then(() => {
                            setLoading(false);
                            alert({
                                message: strings.reset_link_send_message,
                                buttons: [
                                    {label: strings.ok, callback: () => navigation.goBack('')},
                                ],
                            });
                        })
                        .catch(error => {
                            setLoading(false);
                            alert(String(error).replace('Error:', ''));
                        });
                })
                .catch(() => {
                    Toast.show('Please enter a valid email address');
                });
        } else {
            Toast.show('Please enter a valid email address');
        }
    };

    return (
        <SafeScreenView>
            <KeyboardAwareScrollView
                style={styles.wrap}
                keyboardShouldPersistTaps="always">
                <View style={styles.container}>
                    <AppBar
                        // gradiant
                        title={'Change Password'}
                        onBackPress={() => navigation.goBack('')}
                    />

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
                        style={{resizeMode: 'contain', marginTop: 20}}
                        width={scale.ms(300)}
                    />

                    <Text
                        style={[
                            styles.subTitle,
                            {
                                fontSize: scale.font.l,
                                marginTop: 70,
                                marginBottom: 0,
                                color: theme.colors.textPrimaryDark,
                            },
                        ]}>
                        {'Enter your registered email address:'}
                    </Text>
                    <TextInput
                        style={styles.InputBox}
                        placeholder={'Email address'}
                        placeholderTextColor="#aaaaaa"
                        onChangeText={text => setEmail(text)}
                        value={email}
                        underlineColorAndroid="transparent"
                        autoCapitalize="none"
                    />

                    <RoundButton
                        style={styles.signupText}
                        onPress={handleReset}
                        label={strings.reset_credentials_string}
                    />
                    <ProgressLoader visible={loading}/>
                </View>
            </KeyboardAwareScrollView>
        </SafeScreenView>
    );
}
