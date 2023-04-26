/* eslint-disable react-native/no-inline-styles */
// noinspection DuplicatedCode

import React, {useEffect, useState} from 'react';
import logger from '../../lib/logger';
import {Linking, Platform, Text, View} from 'react-native';
import {AccessToken, LoginManager} from 'react-native-fbsdk';
import {businessData} from '../../index';
import {charityData, loginMethods, userData, userStatus, userType, webURLs,} from '../../utilities/constant';
import {GoogleSignin} from '@react-native-community/google-signin';
import auth from '@react-native-firebase/auth';
import {appleAuth} from '@invertase/react-native-apple-authentication';
import {useNavigation, useRoute} from '@react-navigation/native';

import {mutations, queries} from '../../schema';
import {useTheme} from '../../context/ThemeContext';
import SignStyle from '../../system/styles/signStyle';
import apolloLib from '../../lib/apolloLib';
import {useAlert} from '../../context/AlertContext';
import {WEB_CLIENT_ID} from '@env';
import {useSession} from '../../context/SessionContext';
import {strings} from '../../constant/strings';
import {RoundCornerButton} from '../../system/ui/components';
import {screens} from '../../utilities/assets';
import {getUserType, navigationReset} from '../../utilities/helper';

export default function SocialLogin({
                                        onProgress,
                                        isLogin = true,
                                        termsCallback,
                                        termsCondition,
                                    }) {
    const {theme, height} = useTheme();
    const styles = SignStyle(theme, height);
    const route = useRoute();
    const navigation = useNavigation();
    const alert = useAlert();
    const session = useSession();
    const userLoginType = route.params?.userLoginType;
    const [termsAndConditions, setTermsAndConditions] = useState(false);

    useEffect(() => {
        GoogleSignin.configure({
            webClientId: WEB_CLIENT_ID,
            offlineAccess: false,
        });
    }, []);
    useEffect(() => {
        if (termsCondition !== termsAndConditions) {
            setTermsAndConditions(termsCondition);
        }
    }, [termsCondition]);

    const updateProgress = status => {
        if (typeof onProgress === 'function') {
            onProgress(status);
        }
    };

    const onError = (message = strings.something_went_wrong) => {
        updateProgress(false);
        alert(message);
        return false;
    };
    const disablePopup = (status) => {
        auth()
            .signOut()
            .then(async () => {
                await GoogleSignin.revokeAccess();
                await GoogleSignin.signOut();
                await LoginManager.logOut();
            })
            .catch(async e => {
                await GoogleSignin.revokeAccess();
                await GoogleSignin.signOut();
                await LoginManager.logOut();
            });
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
    const onTermsCallback = (status, type) => {
        if (typeof termsCallback === 'function') {
            termsCallback(status);
        }
        setTermsAndConditions(status);
        switch (type) {
            case loginMethods.facebook:
                onFacebookButtonPress().then();
                break;
            case loginMethods.apple:
                onAppleButtonPress().then();
                break;
            default:
                onGoogleButtonPress().then();
        }
    };

    const handleUser = (checkUser, gid) => {
        if (checkUser?.userType === userLoginType) {
            switch (checkUser?.userType) {
                case userType.business:
                    getBusiness(checkUser.userId, gid);
                    break;
                case userType.charity:
                    getCharity(checkUser.userId, gid);
                    break;
                default:
                    getUser(checkUser.userId, gid);
            }
        } else {
            handleWrongUserType(false, checkUser?.userType);
        }
    };

    const wrongUserThen = async (loginType, exists = false) => {
        let message = `There is no ${getUserType(
            userLoginType,
        )} account with the entered credentials.`;
        if (loginType === loginMethods.google) {
            await GoogleSignin.signOut()
        }
        if (loginType === loginMethods.facebook) {
            LoginManager.logOut();
        }
        alert(exists ? strings.account_exists : message);
        await updateProgress(false);
    };

    const wrongUserCatch = async (loginType, e, exists = false) => {
        let message = `There is no ${getUserType(
            userLoginType,
        )} account with the entered credentials.`;
        if (loginType === loginMethods.google) {
            await GoogleSignin.signOut()
        }
        else if (loginType === loginMethods.facebook) {
            await LoginManager.logOut();
        }
        alert(exists ? strings.account_exists : message);
        updateProgress(false);
    };
    const handleWrongUserType = (deleteAccount, loginType) => {
        if (deleteAccount) {
            auth()
                .currentUser.delete()
                .then(() => wrongUserThen(loginType))
                .catch(e => wrongUserCatch(loginType, e));
        } else {
            auth()
                .signOut()
                .then(() => wrongUserThen(loginType, true))
                .catch(e => wrongUserCatch(loginType, e, true));
        }
    };

    //  check use type
    const checkUserType = (gid, mail, loginMethod) => {
        updateProgress(true);
        apolloLib.client(session)
            .query({
                fetchPolicy: 'no-cache',
                query: queries.checkUser,
                variables: {id: gid},
            })
            .then(async ({data, error}) => {
                const {checkUser} = data;
                if (checkUser && checkUser?.status) {
                    handleUser(checkUser, gid);
                } else {
                    await wrongUserThen(loginMethod)
                }
                if (error) {
                    onError();
                    logger.e('social.login', 'checkUserType', error);
                }
            })
            .catch(error => {
                onError();
                logger.e('social.login', 'checkUserType', error);
            });
    };

    // get user data
    const getUser = (uid, gid) => {
        apolloLib.client(session)
            .query({
                fetchPolicy: 'no-cache',
                query: queries.getUserProfile,
                variables: {id: uid, uid: ''},
            })
            .then(async ({data, error}) => {
                if (data) {
                    await session.login({...data?.profile, uid, gid, userType: userType.general});
                    updateProgress(false);
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
                        onError();
                        logger.e('social.login', 'getUser', error);
                    } else {
                        updateProgress(false);
                        navigationReset(navigation, 'InitialSetup', {
                            user: {
                                ...data.profile,
                                uid: uid,
                            },
                        });
                    }
                }
            })
            .catch(error => {
                onError();
                logger.e('social.login', 'getUser', error);
            });
    };

    // get business user data
    const getBusiness = (uid, gid) => {
        apolloLib.client(session)
            .query({
                fetchPolicy: 'no-cache',
                query: queries.getBusinessProfile,
                variables: {id: uid, uid: ''},
            })
            .then(async ({data, error}) => {
                if (data) {
                    await session.login({...data?.profile, uid, gid, userType: userType.business});
                    updateProgress(false);
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
                        onError(error);
                        logger.e('social.login', 'getBusiness', error);
                    } else {
                        updateProgress(false);

                        navigationReset(navigation, 'InitialSetupBusiness', {
                            user: {
                                ...data.profile,
                                uid: uid,
                            },
                        });
                    }
                }
            })
            .catch(error => {
                onError();
                logger.e('social.login', 'getBusiness', error);
            });
    };

    // get charity user data
    const getCharity = (uid, gid) => {
        apolloLib.client(session)
            .query({
                fetchPolicy: 'no-cache',
                query: queries.getCharityProfile,
                variables: {id: uid, uid: ''},
            })
            .then(async ({data, error}) => {
                if (data) {
                    await session.login({...data?.profile, uid, gid, userType: userType.charity});
                    updateProgress(false);
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
                        onError();
                        logger.e('social.login', 'getCharity', error);
                    } else {
                        updateProgress(false);

                        navigationReset(navigation, 'InitialSetupCharity', {
                            user: {
                                ...data.profile,
                                uid: uid,
                            },
                        });
                    }
                }
            })
            .catch(error => {
                onError();
                logger.e('social.login', 'getCharity', error);
            });
    };

    const handleNavigation = user => {
        switch (route?.params?.userLoginType) {
            case userType.business:
                session.login({...businessData, ...user, gid: user.uid, userType: userType.business});
                navigation.navigate('Initial', {
                    ...route.params,
                    user: {...businessData, ...user},
                });
                break;
            case userType.charity:
                session.login({...charityData, ...user, gid: user.uid, userType: userType.charity});
                navigation.navigate('Initial', {
                    ...route.params,
                    user: {
                        ...charityData,
                        ...user,
                    },
                });
                break;
            default:
                session.login({...userData, ...user, gid: user.uid, userType: userType.general});
                navigation.navigate('Initial', {
                    ...route.params,
                    user: {
                        ...userData,
                        ...user,
                    },
                });
        }
    };

    const handleFacebookLogin = response => {
        if (response?.user) {
            if (response.additionalUserInfo.isNewUser) {
                if (isLogin) {
                    handleWrongUserType(true, loginMethods.facebook);
                } else {
                    onProgress(false);
                    handleNavigation({
                        uid: response.user.uid,
                        firstName: response.additionalUserInfo.profile.first_name,
                        lastName: response.additionalUserInfo.profile.last_name,
                        email: response.user.email,
                        profileImage: response.user.photoURL,
                        loginMethod: loginMethods.facebook,
                    });
                }
            } else {
                if (isLogin) {
                    checkUserType(response.user.uid, response.user.email, loginMethods.facebook);
                } else {
                    handleWrongUserType(false, loginMethods.facebook);
                }
            }
        } else {
            onError();
        }
    };

    const handleGoogleLogin = response => {
        if (response?.user) {
            if (response.additionalUserInfo.isNewUser) {
                if (isLogin) {
                    handleWrongUserType(true, loginMethods.google);
                } else {
                    onProgress(false);
                    handleNavigation({
                        uid: response.user.uid,
                        firstName: response.additionalUserInfo.profile.given_name,
                        lastName: response.additionalUserInfo.profile.family_name,
                        orgName: response.user.displayName,
                        email: response.user.email,
                        profileImage: response.user.photoURL,
                        loginMethod: loginMethods.google,
                    });
                }
            } else {
                if (isLogin) {
                    checkUserType(response.user.uid, response.user.email, loginMethods.google);
                } else {
                    handleWrongUserType(false, loginMethods.google);
                }
            }
        } else {
            onError();
        }
    };

    const handleAppleLogin = response => {
        if (response?.user) {
            if (response.additionalUserInfo.isNewUser) {
                if (isLogin) {
                    handleWrongUserType(true, loginMethods.apple);
                } else {
                    let fullname = response?.fullName
                    let firstName = fullname?.givenName || ""
                    let lastName = fullname?.middleName || ""
                    lastName = lastName?.length > 0 ? " " + fullname?.familyName || "" : fullname?.familyName || ""
                    onProgress(false);
                    handleNavigation({
                        uid: response.user.uid,
                        firstName: firstName,
                        lastName: lastName,
                        email: response.user.email,
                        profileImage: response.user.photoURL,
                        loginMethod: loginMethods.apple,

                    });
                }
            } else {
                if (isLogin) {
                    checkUserType(response.user.uid, response.user.email, loginMethods.apple);
                } else {
                    handleWrongUserType(false, loginMethods.apple);
                }
            }
        } else {
            onError();
        }
    };

    const setUserCred = (response, type = loginMethods.google) => {
        onProgress(true);
        switch (type) {
            case loginMethods.facebook: {
                handleFacebookLogin(response);
                break;
            }
            case loginMethods.google: {
                handleGoogleLogin(response);
                break;
            }
            case loginMethods.apple: {
                handleAppleLogin(response);
                break;
            }
        }
    };


    const executeCancelAlert = () =>{
        if(isLogin) {
            onError(strings.login_cancelled);
        }else{
            onError(strings.signup_cancelled);
        }
    }

    //google sign in
    const onGoogleButtonPress = async () => {
        try {
            GoogleSignin.revokeAccess()
                .then(() => {
                    GoogleSignin.signOut()
                        .then(async () => {
                            const {idToken} = await GoogleSignin.signIn(); // Get the users ID token
                            const googleCredential =
                                auth.GoogleAuthProvider.credential(idToken); // Create a Google credential with the
                                                                             // token
                            // Sign-in the user with the credential
                            auth()
                                .signInWithCredential(googleCredential)
                                .then(async response => {
                                    setUserCred(response, loginMethods.google);
                                })
                                .catch((err) => {
                                    console.log("Erpr1 ",err)
                                    executeCancelAlert()
                                });
                        })
                        .catch((err) => {
                            console.log("Erpr2 ",err)
                            executeCancelAlert()
                        });
                })
                .catch(e => {
                    GoogleSignin.signOut()
                        .then(async () => {
                            const {idToken} = await GoogleSignin.signIn(); // Get the users ID token
                            const googleCredential =
                                auth.GoogleAuthProvider.credential(idToken); // Create a Google credential with the
                                                                             // token
                            // Sign-in the user with the credential
                            auth()
                                .signInWithCredential(googleCredential)
                                .then(async response => {
                                    setUserCred(response, loginMethods.google);
                                })
                                .catch((e) => {
                                    console.log("Erpr3 ",e)
                                    executeCancelAlert(e)
                                });
                        }).catch((e) => {
                            console.log("Erpr4 ",e)
                            executeCancelAlert(e)
                        });
                });
        } catch (e) {
            if (e.message === 'NETWORK_ERROR') {
                alert({
                    message: strings.network_error_message,
                    buttons: [{label: strings.ok, callback: () => alert.clear()}],
                });
            }
            logger.e(e);
        }
    };

    // face book login
    const onFacebookButtonPress = async () => {
        try {
            // Attempt login with permissions
            await LoginManager.logOut();
            const result = await LoginManager.logInWithPermissions([
                'email',
                'public_profile',
            ]);
            if (result.isCancelled) {
                executeCancelAlert()
            } else {
                // Once signed in, get the users AccessToken
                const data = await AccessToken.getCurrentAccessToken();
                // Create a Firebase credential with the AccessToken
                const facebookCredential = auth.FacebookAuthProvider.credential(
                    data.accessToken,
                );
                // Sign-in the user with the credential
                auth()
                    .signInWithCredential(facebookCredential)
                    .then(async response => {
                        setUserCred(response, loginMethods.facebook);
                    })
                    .catch(err => {
                        if (err.code === 'auth/account-exists-with-different-credential') {
                            onError(
                                'An account already exists with the same email address but created using different signin method (google signin or email id signin).',
                            );
                        } else {
                            onError();
                        }
                    });
            }
        } catch (e) {
            onError();
        }
    };

    // apple login
    const onAppleButtonPress = async () => {
        try {
            // Start the sign-in request
            const appleAuthRequestResponse = await appleAuth.performRequest({
                requestedOperation: appleAuth.Operation.LOGIN,
                requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
            });
            const {identityToken, nonce, isCancelled, fullName} = appleAuthRequestResponse;
            // Ensure Apple returned a user identityToken
            if (isCancelled) {
                executeCancelAlert()
            } else if (!identityToken) {
                onError('Apple Sign-In failed');
            } else {
                // Create a Firebase credential from the response
                const appleCredential = auth.AppleAuthProvider.credential(
                    identityToken,
                    nonce,
                );

                // Sign the user in with the credential
                return auth()
                    .signInWithCredential(appleCredential)
                    .then(async response => {
                        setUserCred({...response, fullName}, loginMethods.apple);
                    })
                    .catch((e) =>executeCancelAlert(e));
            }
        } catch (e) {
            onError();
        }
    };
    const handleButtonPress = type => {
        switch (type) {
            case loginMethods.facebook:
                onFacebookButtonPress().then();
                break;
            case loginMethods.apple:
                onAppleButtonPress().then();
                break;
            default:
                onGoogleButtonPress().then();
        }
    };

    const checkTermsAndConditions = type => {
        if (
            Platform.OS === 'ios' &&
            type === loginMethods.apple &&
            !appleAuth.isSupported
        ) {
            onError('Your device does not support Apple login.');
            return false;
        } else {
            if (isLogin) {
                handleButtonPress(type);
            } else {
                if (termsAndConditions) {
                    handleButtonPress(type);
                } else {
                    navigation.navigate('TermsAndConditions', {
                        socialMedia: true,
                        loginType: type,
                        callback: onTermsCallback,
                    });
                }
            }
        }
    };

    return (
        <View style={styles.socialContainer}>
            <RoundCornerButton
                style={styles.buttonGap}
                onPress={() => {
                    checkTermsAndConditions(loginMethods.facebook);
                }}
                labelStyle={{textAlign: 'center', flex: 1}}
                icon={screens.facebook}
                iconStyle={styles.socialButtonIcon}
                label={isLogin ? strings.facebook_login : strings.facebook_signup}
            />
            <RoundCornerButton
                style={styles.buttonGap}
                onPress={() => {
                    checkTermsAndConditions(loginMethods.google);
                }}
                labelStyle={{textAlign: 'center', flex: 1}}
                icon={screens.google}
                iconStyle={styles.socialButtonIcon}
                label={isLogin ? strings.google_login : strings.google_signup}
            />
            {Platform.OS === 'ios' && (
                <RoundCornerButton
                    style={styles.buttonGap}
                    onPress={() => {
                        checkTermsAndConditions(loginMethods.apple);
                    }}
                    labelStyle={{textAlign: 'center', flex: 1}}
                    icon={screens.apple}
                    iconStyle={styles.socialButtonIcon}
                    label={isLogin ? strings.apple_login : strings.apple_signup}
                />
            )}
        </View>
    );
}
