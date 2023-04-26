/* eslint-disable react-hooks/exhaustive-deps,react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';
import {lottie, uploadDP} from '../../index';
import AnimatedLoader from 'react-native-animated-loader';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useTheme} from '../../context/ThemeContext';
import StyleGenerator from './questionnaire/StyleGenerator';
import auth from '@react-native-firebase/auth';
import {userType} from '../../utilities/constant';
import {strings} from '../../constant/strings';
import {mutations} from '../../schema';
import {useSession} from '../../context/SessionContext';
import {useAlert} from '../../context/AlertContext';
import {navigationReset, useBackHandler} from '../../utilities/helper';
import apollo from '../../lib/apolloLib';

const CreateUser = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const {theme} = useTheme();
    const {colors} = theme;
    const styles = StyleGenerator(theme);
    const session = useSession();
    const [loading, setLoading] = useState(true);
    const alert = useAlert();

    const navigate2survey = async user => {
        await session.login({...user});
        setLoading(false);
        setTimeout(() => {
            navigationReset(navigation, 'QuestionnaireLoader', {
                user: {...user},
            });
        }, 300)
    };

    const handleUserCreate = (mutation, user, callback) => {
        apollo.client(session)
            .mutate({
                mutation,
                variables: route?.params?.referralCode
                    ? {...user, referralCode: route.params.referralCode}
                    : {...user},
            })
            .then(async data1 => {
                const {profileCreate} = data1?.data;
                if (!profileCreate) {
                    return warning(strings.user_creation_failed, user, callback);
                }
                user.uid = profileCreate.uid;
                user.referralCode = profileCreate.referralCode;
                const {imageFile} = route.params;
                if (imageFile != null) {
                    uploadImage(profileCreate, imageFile);
                } else {
                    await navigate2survey(profileCreate);
                }
            })
            .catch((err) => {
                console.log("error ",err)
                warning(strings.user_creation_failed, user, callback);
            });
    };

    const warning = (message, user, callback) => {
        setLoading(false);
        if (callback) {
            callback(user.uid);
        }
        alert({
            message,
            buttons: [
                {
                    label: strings.ok,
                    callback: () => {
                        if (user?.uid) {
                            navigation.navigate('Register', {userLoginType: user.userType});
                        } else {
                            navigation.goBack();
                        }
                    },
                },
            ],
            cancellable: false,
        });
        return false;
    };

    const uploadImage = (user, imageFile) => {
        if(imageFile?.path) {
            uploadDP(user.uid, imageFile?.path)
                .then(name => {
                    updateDp(user, name);
                })
                .catch(async () => {
                    await navigate2survey(user);
                });
        }
    };

    const updateDp = (user, fileName) => {
        const {imageFileThumb} = route.params;
        session.update({
            ...user,
            profileImage: fileName ? `dp/${user.uid}/${fileName}.jpg` : '',
            profileImageB64: imageFileThumb || '',
        });
        apollo.client(session)
            .mutate({
                mutation: mutations.updateImage,
                fetchPolicy: 'no-cache',
                variables: {
                    uid: user.uid,
                    profileImage: `dp/${user.uid}/${fileName}.jpg`,
                    profileImageB64: imageFileThumb || '',
                },
            })
            .then(async () => {
                await navigate2survey({
                    ...user,
                    profileImage: fileName ? `dp/${user.uid}/${fileName}.jpg` : '',
                    profileImageB64: imageFileThumb || '',
                });
            })
            .catch(async () => {
                session.update({
                    ...user,
                    profileImage: '',
                    profileImageB64: '',
                });
                await navigate2survey(user);
            });
    };

    const redirect2fun = (user, callback) => {
        switch (user.userType) {
            case userType.business:
                handleUserCreate(mutations.createBusiness, user, callback);
                break;
            case userType.charity:
                handleUserCreate(mutations.createCharity, user, callback);
                break;
            default:
                handleUserCreate(mutations.createUser, user, callback);
                break;
        }
    };

    useEffect(() => {
        const {user, password, callback} = route.params;
        if (user && user.uid && user.uid.length > 0) {
            redirect2fun(user, callback);
        } else {
            auth()
                .createUserWithEmailAndPassword(user.email, password)
                .then(response => {
                    user.uid = response.user.uid;
                    redirect2fun(user, callback);
                })
                .catch(error => {
                    warning(error, user);
                });
        }
    }, [route.params]);

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
                    Setting up your account ...
                </Text>
            </AnimatedLoader>
        </View>
    );
};
export default CreateUser;
