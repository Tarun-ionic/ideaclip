/* eslint-disable react-hooks/exhaustive-deps */
// noinspection BadExpressionStatementJS

import React, {useContext, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {destroyUserSession, getUserSession, setUserSession,} from '../lib/storage';
import {AppState, Platform} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import apolloLib from '../lib/apolloLib';
import {mutations} from '../schema';
import auth from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-community/google-signin';
import logger from '../lib/logger';
import database from '@react-native-firebase/database';
import {messengerUserStateRef} from '../screens/messenger/messengerHelper';
import {LoginManager} from 'react-native-fbsdk';
// import notify from '../services/notify';
import KickOutModal from '../system/ui/KickOutModal';
import {userRef} from '../utilities/helper';
import notify from "../services/notify";
import {userStatus} from "../utilities/constant";

export const SessionContext = React.createContext({});

export function useSession() {
    return useContext(SessionContext);
}

export const SessionProvider = ({children}) => {
    let checkStatus = false;
    const [sessionUser, setSessionUser] = useState({session: false});
    const [navigation, setNavigation] = useState(null);
    const [kickOutUser, setKickOutUser] = useState('');
    const [appState, setAppState] = useState(AppState.currentState);

    useEffect(() => {
        getUserSession().then(setSessionUser)
    }, [])

    useEffect(() => {
        if (sessionUser && Object.keys(sessionUser).length > 0) {
            const subscription = AppState.addEventListener('change', appHandler);
            const userStateCheck = userRef(sessionUser?.uid).onSnapshot(
                documentSnapshot => {
                    const status = documentSnapshot?.data()?.status;
                    if (checkStatus && (status === 'Archived' || status === 'Disabled')) {
                        checkStatus = false;
                        kickOut(status);
                    }
                    checkStatus = !status || status === 'Active' || status === '';
                },
            );
            return () => {
                subscription.remove()
                userStateCheck();
            };
        }
    }, [sessionUser]);

    useEffect(() => {
        let interval;
        if (appState === 'active' && sessionUser && sessionUser.uid) {
            messengerUserStateRef(sessionUser.uid).set(database.ServerValue.TIMESTAMP).then();
            interval = setInterval(() => {
                messengerUserStateRef(sessionUser.uid).set(database.ServerValue.TIMESTAMP).then();
            }, 30 * 1000);
        } else if (interval) {
            clearInterval(interval);
        }

        return () => clearInterval(interval);
    }, [appState, sessionUser]);

    const appHandler = async nextAppState => {
        setAppState(nextAppState);
    };

    const login = async user => {
        await setUserSession({...user, bid: user.uid})
        await tokenUpdater(user.uid)
        setSessionUser({...user, bid: user.uid});
    };

    const update = async (user,shouldSet = true) => {
        if(sessionUser?.uid === user?.uid) {
            await setUserSession({...sessionUser, ...user, bid: user.uid})
            shouldSet === true && await setSessionUser(prev => ({...prev, ...user, bid: user.uid}));
        }
    };

    const tokenUpdater = async (uid) => {
        const token = await AsyncStorage.getItem('cloudMessageToken');
        getUserSession()
            .then(async user => {
                if (user?.uid !== uid) {
                    return false;
                } else if (user?.userToken === token) {
                     return false;
                }else{
                    // update token
                    const variables = {
                        userId:  user?.uid,
                        data: {
                            token: token,
                            notificationStatus: true,
                            location: '',
                            osType: Platform.OS,
                            deviceInfo: `${await DeviceInfo.getDeviceName()} ${DeviceInfo.getBrand()} ${await DeviceInfo.getManufacturer()} ${DeviceInfo.getBundleId()} ${DeviceInfo.getBuildNumber()} ${DeviceInfo.getDeviceId()}`,
                            deviceId: DeviceInfo.getUniqueId(),
                        },
                    };
                    await apolloLib
                        .client(session)
                        .mutate({
                            mutation: mutations.addToken,
                            variables,
                        })
                        .then(() => {
                            update({...user,userToken:token},false)
                        })
                        .catch(error => logger.e('session context', 'tokenUpdater', error));
                }
            })
            .catch(error => logger.e('session context', 'tokenUpdater', error));
    };

    const redirect = (kickOut = false) => {
        if (kickOut === false && kickOutUser === true) {
            return false;
        }
        navigation?.reset({
            index: 0,
            routes: [{name: 'Landing'}],
        });
    };

    const logout = () => {
        //delete cloud token
        getUserSession()
            .then(async userSession => {
                if (userSession.session === true && userSession.uid) {
                    const variables = {
                        userId: userSession.uid,
                        deviceId: DeviceInfo.getUniqueId(),
                    };
                    apolloLib
                        .client(session)
                        .mutate({
                            mutation: mutations.deleteToken,
                            variables,
                        })
                        .then(async () => {
                            await revokeAccess();
                        })
                        .catch(async error => {
                            logger.e('session context', 'logout', error);
                            await revokeAccess();
                        });
                }else  await revokeAccess();
            })
            .catch(async error => {
                logger.e('session context', 'logout', error);
                await revokeAccess();
            });
    };

    //revoke access

    const signOutSocialLogin = async () => {
        try {
            const isSigned = await GoogleSignin.isSignedIn()
            isSigned && await GoogleSignin.signOut();
            await LoginManager.logOut();
            redirect();
        }catch (e) {
            redirect();
        }
    }

    const revokeAccess = async () => {
        //Remove notification
        await notify.signout();
        // destroy user session
        await destroyUserSession()
        // logout
        auth()
            .signOut()
            .then(() => {
                signOutSocialLogin()
            })
            .catch(error => {
                logger.e('session context', 'revokeAccess', error);
                signOutSocialLogin()
            });
    };

    const kickOut = (status = '') => {
        kickOutUser !== status && setKickOutUser(status);
    };

    useEffect(() => {
        if (kickOutUser === true && session && Object.keys(session).length > 0) {
            logout()
        }
    }, [kickOutUser]);

    const session = {
        logout,
        kickOut,
        user: sessionUser,
        organization: sessionUser,
        login,
        update,
        tokenUpdater,
        setNavigation,
    };
    return (
        <SessionContext.Provider value={session}>
            {(kickOutUser === userStatus.archived || kickOutUser === userStatus.disabled) && (
                <KickOutModal
                    status={kickOutUser}
                    onRedirect={() => {
                        setKickOutUser('');
                        logout()
                    }}
                />
            )}
            {children}
        </SessionContext.Provider>
    );
};
