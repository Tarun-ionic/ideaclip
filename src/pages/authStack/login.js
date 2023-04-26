// noinspection JSUnresolvedVariable

import React, {useEffect, useState} from 'react';

import {Linking, Platform, StatusBar, Text, TextInput, View,} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

import {ProgressLoader, RoundButton, SafeScreenView,} from '../../index';
import {userStatus, userType, webURLs,} from '../../utilities/constant';
import {useNavigation, useRoute} from '@react-navigation/native';
import SocialLogin from './SocialLogin';
import apiConstant from '../../constant/apiConstant';
import {mutations, queries} from '../../schema';
import {useTheme} from '../../context/ThemeContext';
import SignStyle from '../../system/styles/signStyle';
import {useAlert} from '../../context/AlertContext';
import AutoHeightImage from 'react-native-auto-height-image';
import {checkEmail, getUserType, navigationReset, useBackHandler} from '../../utilities/helper';
import apolloLib from '../../lib/apolloLib';
import auth from '@react-native-firebase/auth';
import Toast from 'react-native-simple-toast';
import {useSession} from '../../context/SessionContext';
import {strings} from '../../constant/strings';
import logger from '../../lib/logger';
import {appLogo} from '../../utilities/assets';
import {GoogleSignin} from '@react-native-community/google-signin';
import AppBar from '../../screens/components/toolbar/appBar';
import scale from '../../utilities/scale';
import {getUserSession} from "../../lib/storage";

export default function Login() {
    const navigation = useNavigation();
    const session = useSession();
    const route = useRoute();
    const {theme, height} = useTheme();
    const styles = SignStyle(theme, height);
    const alert = useAlert();
    const userLoginType = route.params?.userLoginType;
    const [isLoading, setIsLoading] = useState(false);
    const [appToken, setAppToken] = useState("");
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [user, setUser] = useState(null)

    // useEffect(() => {
    //     const f_user = auth().currentUser;
    //     if (f_user && f_user.uid && user && user?.uid) {
    //         navigationReset(navigation, 'PersonalSpace', {
    //             user: user,
    //             profile: {uid: user.uid},
    //             goBack: false
    //         },true)
    //     }
    // }, [user]);

    useEffect(() => {
        StatusBar.setHidden(true);
        (async () => setUser(await getUserSession()))()
    }, []);


    useBackHandler(() => {
        if (!isLoading) {
            navigation.goBack(null);
        }
        return true;
    }, []);

    const onApiError = (message = 'something went wrong !!!') => {
        setIsLoading(false);
        alert(message);
    };

    const handleUser = checkUser => {
        if (checkUser?.userType === userLoginType) {
            switch (checkUser?.userType) {
                case userType.business:
                    getBusiness(checkUser.userId);
                    break;
                case userType.charity:
                    getCharity(checkUser.userId);
                    break;
                default:
                    getUser(checkUser.userId);
            }
        } else {
            handleWrongUserType();
        }
    };
    const signOut = (message = "") => {
        auth()
            .signOut()
            .then(() => {
                GoogleSignin.revokeAccess().then();
                GoogleSignin.signOut().then();
                if (message)
                    alert(message);
                setIsLoading(false);
            })
            .catch(e => {
                logger.e('session context', 'revokeAccess', e);
                GoogleSignin.revokeAccess().then();
                GoogleSignin.signOut().then();
                if (message)
                    alert(message);
                setIsLoading(false);
            });
    };
    const handleWrongUserType = () => {
        let message = `There is no ${getUserType(
            userLoginType,
        )} account with the entered credentials.`;
        signOut(message);
    };


    //  check use type
    const checkUserType = (uid, token) => {
        setIsLoading(true);
        apolloLib.client(session)
            .query({
                fetchPolicy: 'no-cache',
                query: queries.checkUser,
                variables: {id: uid},
            })
            .then(({data, error}) => {
                const {checkUser} = data;
                if (checkUser?.status) {
                    handleUser(checkUser);
                } else {
                    handleWrongUserType()
                }
                if (error) {
                    onApiError();
                    logger.e('login', 'checkUserType', error);
                }
            })
            .catch(error => {
                onApiError();
                logger.e('login', 'checkUserType', error);
            });
    };

    // get user data
    const getUser = async (uid) => {
        apolloLib.client(session)
            .query({
                fetchPolicy: 'no-cache',
                query: queries.getUserProfile,
                variables: {id: uid, uid: ''},
            })
            .then(async ({data, error}) => {
                if (data) {
                    setIsLoading(false);
                    await session.login({...data.profile, uid: uid, userType: userType.general});
                    if (
                        data?.profile?.status &&
                        (data?.profile?.status === userStatus.disabled ||
                            data?.profile?.status === userStatus.archived)
                    ) {
                        disablePopup(data?.profile?.status);
                    } else {
                        await apolloLib.client(session).mutate({
                            fetchPolicy: 'no-cache',
                            mutation: mutations.login,
                            variables: {uid: uid},
                        })
                        navigationReset(navigation, 'PersonalSpace', {
                            user: {...data.profile, uid: uid},
                        },true);
                    }
                } else {
                    if (error) {
                        onApiError();
                        logger.e('login', 'getUser', error);
                    } else {
                        await apolloLib.client(session).mutate({
                            fetchPolicy: 'no-cache',
                            mutation: mutations.login,
                            variables: {uid: uid},
                        })
                        navigation.navigate('InitialSetup', {
                            user: {
                                ...data.profile,
                                email: email,
                                uid: uid,
                            },
                        });
                    }
                }
            })
            .catch(error => {
                onApiError();
                logger.e('login', 'getUser', error);
            });
    };

    // get business user data
    const getBusiness = uid => {
        apolloLib.client(session)
            .query({
                fetchPolicy: 'no-cache',
                query: queries.getBusinessProfile,
                variables: {id: uid, uid: ''},
            })
            .then(async ({data, error}) => {
                if (data) {
                    setIsLoading(false);
                    await session.login({...data?.profile, uid: uid, userType: userType.business});
                    if (
                        data?.profile?.status &&
                        (data?.profile?.status === userStatus.disabled ||
                            data?.profile?.status === userStatus.archived)
                    ) {
                        disablePopup(data?.profile?.status);
                    } else {
                        await apolloLib.client(session).mutate({
                            fetchPolicy: 'no-cache',
                            mutation: mutations.login,
                            variables: {uid: uid},
                        })
                        navigationReset(navigation, 'PersonalSpace', {
                            user: {...data.profile, uid: uid},
                        },true);
                    }
                } else {
                    if (error) {
                        onApiError();
                        logger.e('login', 'getBusiness', error);
                    } else {
                        await apolloLib.client(session).mutate({
                            fetchPolicy: 'no-cache',
                            mutation: mutations.login,
                            variables: {uid: uid},
                        })
                        navigation.navigate('InitialSetupBusiness', {
                            user: {
                                ...data.profile,
                                email: email,
                                uid: uid,
                            },
                        });
                    }
                }
            })
            .catch(error => {
                onApiError();
                logger.e('login', 'getBusiness', error);
            });
    };
    const disablePopup = (status) => {

        signOut();
        alert({
            type: 'custom',
            title: strings.report,
            content: status === userStatus.disabled ? (
                <Text style={styles.reasonLabel}>
                    {strings.disableMessage1}
                    <Text
                        style={styles.popUpLink}
                        onPress={() => {
                            alert.clear();
                            Linking.openURL(webURLs.disabled);
                        }}>
                        {strings.disableMessage2}
                    </Text>
                    {strings.disableMessage3}
                </Text>
            ) : (
                <Text style={styles.reasonLabel}>
                    {strings.archiveMessage1}
                    <Text
                        style={styles.popUpLink}
                        onPress={() => {
                            alert.clear();
                            Linking.openURL(webURLs.adminMail);
                        }}>
                        {strings.archiveMessage2}
                    </Text>
                    {strings.archiveMessage3}
                </Text>
            ),
            autoDismiss: false,
            cancellable: false,
            buttons: [
                {
                    label: strings.ok,
                    callback: () => {
                        alert.clear();
                    },
                },
            ],
        });
    };
    // get charity user data
    const getCharity = uid => {
        apolloLib.client(session)
            .query({
                fetchPolicy: 'no-cache',
                query: queries.getCharityProfile,
                variables: {id: uid, uid: ''},
            })
            .then(async ({data, error}) => {
                if (data) {
                    setIsLoading(false);
                    await session.login({...data?.profile, uid: uid, userType: userType.charity});
                    if (
                        data?.profile?.status &&
                        (data?.profile?.status === userStatus.disabled ||
                            data?.profile?.status === userStatus.archived)
                    ) {
                        disablePopup(data?.profile?.status);
                    } else {
                        await apolloLib.client(session).mutate({
                            fetchPolicy: 'no-cache',
                            mutation: mutations.login,
                            variables: {uid: uid},
                        })
                        navigationReset(navigation, 'PersonalSpace', {
                            user: {...data.profile, uid: uid},
                        },true);
                    }
                } else {
                    if (error) {
                        onApiError();
                        logger.e('login', 'getCharity', error);
                    } else {
                        await apolloLib.client(session).mutate({
                            fetchPolicy: 'no-cache',
                            mutation: mutations.login,
                            variables: {uid: uid},
                        })
                        navigation.navigate('InitialSetupCharity', {
                            user: {
                                ...data.profile,
                                email: email,
                                uid: uid,
                            },
                        });
                    }
                }
            })
            .catch(error => {
                onApiError();
                logger.e('login', 'getCharity', error);
            });
    };

    const onFooterLinkPress = () => {
        navigation.navigate('Register', {...route.params});
    };

    const onResetLinkPress = () => {
        setEmail('');
        setPassword('');
        navigation.navigate('ResetPassword', {...route.params});
    };

    const onLoginPress = () => {
        checkEmail(email)
            .then(() => {
                if (password.length < 6) {
                    Toast.show(strings.credential_length_alert);
                } else {
                    authenticate();
                }
            })
            .catch(() => {
                Toast.show(strings.enter_valid_mail);
            });
    };

    const authenticate = () => {
        setIsLoading(true);
        auth()
            .signInWithEmailAndPassword(email.trim(), password)
            .then(response => {
                const uid = response.user.uid;
                response.user.getIdTokenResult().then(tokenResult => {
                    checkUserType(uid, tokenResult.token);
                });
            })
            .catch(error => {
                logger.e(error);
                setIsLoading(false);
                if (email?.trim().length === 0) {
                    onApiError('Enter email id');
                } else {
                    if (error.code === 'auth/network-request-failed') {
                        alert(strings.network_error_message);
                    } else if (error.code === 'auth/user-not-found') {
                        alert(strings.no_user_message);
                    } else if (error.code === 'auth/wrong-password') {
                        alert(strings.no_user_message);
                    } else {
                        onApiError(String(error).replace('Error:', ''));
                    }
                }
            });
    };

    return (
        <SafeScreenView
            translucent={Platform.OS === 'ios'}
            colors={['#e50012', '#0359a7']}
            locations={[0.4, 0.9]}>
            <AppBar
                // gradiant
                title={strings.login_title}
                onBackPress={() => navigation.goBack(null)}
            />
            <KeyboardAwareScrollView
                style={styles.wrap}
                keyboardShouldPersistTaps="always">
                <View style={styles.container}>
                    <View style={styles.iconContainerView}>
                        <Text style={styles.subTitle}>{strings.login_slogan}</Text>
                        <AutoHeightImage
                            width={scale.ms(300)}
                            style={styles.logo}
                            source={appLogo.full}
                        />
                    </View>

                    <TextInput
                        style={styles.InputBox}
                        placeholder={'E-mail'}
                        placeholderTextColor="#aaaaaa"
                        onChangeText={text => setEmail(text.trim())}
                        value={email}
                        underlineColorAndroid="transparent"
                        autoCapitalize="none"
                    />

                    <TextInput
                        style={styles.InputBox}
                        placeholderTextColor="#aaaaaa"
                        secureTextEntry
                        placeholder={'Password'}
                        onChangeText={setPassword}
                        value={password}
                        underlineColorAndroid="transparent"
                        autoCapitalize="none"
                    />

                    <Text
                        style={styles.forgotPasswordText}
                        onPress={() => onResetLinkPress()}>
                        {strings.forget_password}
                    </Text>

                    <RoundButton
                        style={styles.signupText}
                        onPress={onLoginPress}
                        label={strings.login_as(userLoginType)}
                    />

                    <View style={styles.footerView}>
                        <Text style={styles.footerText}>
                            Don't have an account ?
                            <Text onPress={onFooterLinkPress} style={styles.footerLink}>
                                {strings.sign_up}.
                            </Text>
                        </Text>
                    </View>

                    <View style={styles.loginLink}>
                        <View style={[styles.lineStyle]}/>
                        <Text style={styles.splitText}>{strings.or}</Text>
                        <View style={[styles.lineStyle]}/>
                    </View>
                    <SocialLogin isLogin={true} onProgress={setIsLoading}/>
                </View>
            </KeyboardAwareScrollView>
            <ProgressLoader visible={isLoading}/>
        </SafeScreenView>
    );
}
