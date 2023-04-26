/* eslint-disable react-native/no-inline-styles */
// noinspection JSUnresolvedFunction

import React, {useEffect, useState} from 'react';
import {BackHandler, Linking, Pressable, ScrollView, StatusBar, StyleSheet, Text, View,} from 'react-native';
import scale from 'utilities/scale';
import {screens} from 'utilities/assets';
import {Icon} from 'react-native-elements';
import {userType, webURLs} from 'utilities/constant';
import {useTheme} from 'context/ThemeContext';
import AutoHeightImage from 'react-native-auto-height-image';
import {useBackHandler} from 'utilities/helper';
import {useAlert} from 'context/AlertContext';
import {strings} from 'constant/strings';
import {useNavigation, useRoute} from '@react-navigation/native';
import {BackgroundImage} from 'react-native-elements/dist/config';
import {RoundCornerButton} from 'system/ui/components';
import {displayOrientation} from '../../utilities/constant';
import {getUserSession} from "../../lib/storage";
import {navigationReset} from "../../utilities/helper";

export default function Landing() {
    const navigation = useNavigation();
    const route = useRoute();
    const isSignUp = route.params?.isSignUp != null ?route.params?.isSignUp:  true;
    const {theme, width, height, orientation} = useTheme();
    const alert = useAlert();
    const {colors} = theme;
    const styles = landingStyle(theme, width, height, orientation);
    const [user, setUser] = useState(null)

    useEffect(() => {
        if (user && user?.uid) {
            navigationReset(navigation, 'PersonalSpace', {
                user: user,
                profile: {uid: user.uid},
                goBack: false
            },true)
        }
    }, [user]);

    useEffect(() => {
        StatusBar.setHidden(true);
        (async () => setUser(await getUserSession()))()
    }, []);


    useBackHandler(() => {
        alert({
            message: strings.confirm_app_exit,
            buttons: [
                {label: strings.cancel},
                {label: strings.ok, callback: () => BackHandler.exitApp()},
            ],
        });
    }, []);

    const onPressCreateAccount = () => {
        navigation.navigate('Landing', {isSignUp: !isSignUp});
    };

    const redirect = userLoginType => {
        if (isSignUp) {
            navigation.navigate('Register', {userLoginType});
        } else {
            navigation.navigate('Login', {userLoginType});
        }
    };

    return (
        <BackgroundImage source={screens.landing} style={styles.backgroundImages}>
            <ScrollView style={styles.wrap}>
                <View
                    style={[
                        styles.container,
                        {
                            height:
                                orientation == displayOrientation.portrait ? height : width,
                        },
                    ]}>
                    <View style={{width: '100%'}}>
                        <Text style={styles.info}> {strings.welcome_text}</Text>
                        <AutoHeightImage
                            width={scale.ms(300)}
                            style={styles.logo}
                            source={screens.logo_wt}
                        />
                        <Text style={styles.info}> {strings.social_collab_platform}</Text>
                    </View>
                    <View style={styles.buttonContainer}>
                        <Text style={styles.account}>
                            {isSignUp ? strings.sign_up_as : strings.login}
                        </Text>
                        <RoundCornerButton
                            style={isSignUp?styles.roundedButton:styles.roundedButtonLogin}
                            label={strings.general_user}
                            labelStyle={isSignUp?styles.roundedButtonText:styles.roundedButtonLoginText}
                            onPress={() => redirect(userType.general)}
                        />
                        <RoundCornerButton
                            style={isSignUp?styles.roundedButton:styles.roundedButtonLogin}
                            label={strings.business}
                            labelStyle={isSignUp?styles.roundedButtonText:styles.roundedButtonLoginText}
                            onPress={() => redirect(userType.business)}
                        />

                        <RoundCornerButton
                            style={isSignUp?styles.roundedButton:styles.roundedButtonLogin}
                            label={strings.charity}
                            labelStyle={isSignUp?styles.roundedButtonText:styles.roundedButtonLoginText}
                            onPress={() => redirect(userType.charity)}
                        />
                    </View>

                    <View style={{justifyContent: 'center'}}>
                        <View style={styles.line}/>
                        <Text style={styles.account} onPress={onPressCreateAccount}>
                            {' '}
                            {isSignUp ? strings.login_to_account : strings.create_an_account}
                        </Text>

                        <Pressable
                            style={styles.linkButton}
                            onPress={() => Linking.openURL(webURLs.home)}>
                            <Icon
                                color={colors.textSecondaryDark}
                                style={{opacity: 0.7}}
                                name="external-link-alt"
                                size={15}
                                type="font-awesome-5"
                            />
                            <Text style={styles.linkButtonLabel}>
                                {strings.what_is_ideaclip}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </BackgroundImage>
    );
}

const landingStyle = ({colors}, width, height, orientation) => {
    return StyleSheet.create({
        wrap: {
            width: '100%',
            height: '100%',
        },
        container: {
            justifyContent: 'space-around',
            alignItems: 'center',
        },
        logo: {
            width: '100%',
            marginTop: 20,
            justifyContent: 'center',
            alignItems: 'center',
            resizeMode: 'contain',
        },
        info: {
            width: '100%',
            fontSize: scale.font.s,
            color: colors.textPrimaryAccent,
            marginVertical: 25,
            textAlign: 'center',
        },
        roundedButton: {
            marginVertical: 15,
            paddingVertical: 10,
        },
        roundedButtonLogin: {
            marginVertical: 15,
            paddingVertical: 10,
            backgroundColor:colors.loginButtons
        },
        roundedButtonText: {
            color:colors.textPrimary
        },
        roundedButtonLoginText: {
            color:colors.loginButtonsText
        },
        buttonContainer: {
            alignItems: 'center',
            flexDirection: 'column',
            justifyContent: 'center',
        },
        account: {
            fontSize: scale.font.xl,
            color: colors.textSecondaryDark,
            marginVertical: 20,
            textAlign: 'center',
        },
        line: {
            width: width * 0.9,
            height: 1,
            opacity: 0.6,
            marginTop: 10,
            backgroundColor: 'white',
        },
        linkButton: {
            marginTop: 20,
            flexDirection: 'row',
            justifyContent: 'center',
        },
        linkButtonLabel: {
            marginLeft: 5,
            color: colors.textSecondaryDark,
            fontSize: scale.font.s,
            textAlign: 'center',
            alignSelf: 'center',
        },
        backgroundImages: {
            width: '100%',
            height: '100%',
        },
    });
};
