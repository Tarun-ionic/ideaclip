/* eslint-disable react-hooks/exhaustive-deps,react-native/no-inline-styles */
// noinspection JSUnresolvedFunction

import React, {useEffect, useState} from 'react';
import logger from '../../lib/logger';
import {BackHandler, Linking, Platform, StatusBar, Text, View} from 'react-native';
import scale from 'utilities/scale';
import {lottie, SafeScreenView} from '../../index';
import {appLogo} from '../../utilities/assets';
import {useTheme} from '../../context/ThemeContext';
import SplashStyle from '../../system/styles/splashStyle';
import AutoHeightImage from 'react-native-auto-height-image';
import LottieView from 'lottie-react-native';
import DeviceInfo from 'react-native-device-info';
import {navigationReset, updateDeviceToken, useBackHandler} from '../../utilities/helper';
import {queries} from '../../schema';
import auth from '@react-native-firebase/auth';

import apolloLib from '../../lib/apolloLib';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import {useSession} from 'context/SessionContext';
import {userType} from '../../utilities/constant';
import {strings} from '../../constant/strings';
import {clearAllPageData} from '../../services/notificationHelper';
import {useAlert} from "../../context/AlertContext";
import notify from "../../services/notify";

export default function Splash() {
    const navigation = useNavigation();
    const session = useSession();
    const {theme} = useTheme();
    const {colors} = theme;
    const styles = SplashStyle(theme);
    const isFocused = useIsFocused();
    const [isConnected, setIsConnected] = useState(true);
    const alert = useAlert();

    useBackHandler(() => {
        BackHandler.exitApp();
        return true;
    }, []);

    useEffect(() => {
        if (isFocused) {
            const unsubscribe = NetInfo.addEventListener(state => {
                setIsConnected(state.isConnected && state.isInternetReachable);
            });
            return () => unsubscribe();
        }
    }, [isFocused]);

    useEffect(() => {
        if (isConnected === false) navigation.push('noNetwork')
    }, [isConnected])

    const checkUser = () => {
        if (session.user?.displayName?.trim()?.length > 0 && session.user.uid !== session.user.gid) {
                navigationReset(navigation, 'PersonalSpace', {user: session.user},true);
        } else {
            switch (session.user.userType) {
                case userType.general: {
                    navigationReset(navigation, 'InitialSetup', {user: session.user});
                    break;
                }

                case userType.business: {
                    navigationReset(navigation, 'InitialSetupBusiness', {user: session.user});
                    break;
                }

                case userType.charity: {
                    navigationReset(navigation, 'InitialSetupCharity', {user: session.user});
                    break;
                }

                default: {
                    session.logout()
                }
            }
        }
    }

    useEffect(() => {
        if (session.user.session === true && isConnected === true) {
            const user = auth().currentUser;
            if (user && Object.keys(user).length > 0 && user?.uid === session.user?.gid) {
                checkAppState()
            } else  {
              session.logout()
            }
        } else if (isConnected === false) navigation.push('noNetwork')
    }, [session.user, isConnected])

    const checkAppState = () => {
        apolloLib.client().query({
            fetchPolicy: 'no-cache',
            query: queries.getAppState,
            variables: {os: Platform.OS, version: DeviceInfo.getVersion()},
        })
            .then(({data: {getAppState}}) => {
                const {serverState, appUpdate} = getAppState;
                if (serverState === true && appUpdate === false) {
                    checkUser()
                } else if (serverState === false) {
                    alert({
                        message: "IDEACLIP is currently down for maintenance.",
                        buttons: [
                            {
                                label: "close", callback: () => {
                                    alert.clear()
                                    BackHandler.exitApp();
                                }
                            },
                        ],
                        autoDismiss: false,
                        cancellable: false,
                    })
                } else if (appUpdate === true) {
                    alert({
                        message: "Upgrade required. \nNew version app is updated in store.",
                        buttons: [
                            {
                                label: "close", callback: () => {
                                    alert.clear()
                                    BackHandler.exitApp();
                                }
                            },
                            {
                                label: "update now", callback: () => {
                                    alert.clear()
                                    const url = Platform.OS === 'ios' ? `itms-apps://apps.apple.com/in/app/ideaclip/id1578859437` : `market://details?id=${DeviceInfo.getBundleId()}`
                                    Linking.canOpenURL(url).then(supported => {
                                        supported && Linking.openURL(url);
                                    }, (err) => BackHandler.exitApp());
                                }
                            }
                        ],
                        autoDismiss: false,
                        cancellable: false,
                    })
                }
            }).catch(error => logger.e('app-state', error));
    };

    useEffect(() => {
        StatusBar.setHidden(true);
        session.setNavigation(navigation);
        clearAllPageData();
    }, []);

    return (
        <SafeScreenView>
            <View style={styles.container}>
                <AutoHeightImage
                    style={styles.logo}
                    width={scale.ms(125)}
                    source={appLogo.min}
                />
                <Text style={[styles.tagline, {color: colors.secondaryDark}]}>
                    {strings.slogan}
                </Text>
                <LottieView
                    source={lottie.splash}
                    style={styles.lottie}
                    autoPlay
                    loop
                />
                <Text style={styles.version}>version {DeviceInfo.getVersion()} </Text>
            </View>
        </SafeScreenView>
    );
}
