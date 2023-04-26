/* eslint-disable react-native/no-inline-styles */
// noinspection DuplicatedCode

import React, {useEffect, useState} from 'react';
import {Platform, ScrollView, StatusBar, Text, TouchableOpacity, View,} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useTheme} from '../../context/ThemeContext';
import TermsStyle from '../../system/styles/termsStyle';
import {RoundButton, SafeScreenView} from '../../index';
import {useBackHandler} from '../../utilities/helper';
import PP from './pp';
import TC from './tc';
import {strings} from '../../constant/strings';
import Toast from 'react-native-simple-toast';
import AppBar from '../../screens/components/toolbar/appBar';
import {Icon} from 'react-native-elements';

function Terms() {
    const navigation = useNavigation();
    const route = useRoute();
    const {theme, width, height, orientation} = useTheme();
    const styles = TermsStyle(theme, width, height, orientation);
    const [state, setState] = useState({pp: '', tc: ''});
    const [toastShown, setToastShown] = useState(false);

    useBackHandler(() => {
        navigation.goBack(null);
        return true;
    }, []);

    useEffect(() => {
        StatusBar.setHidden(true);
    }, []);
    const showMessage = () => {
        let message = 'Please agree to the';
        if (state.tc !== 'agree') {
            message = message + ' "Terms & Conditions"';
            if (state.pp !== 'agree') {
                message = message + ' and';
            }
        }
        if (state.pp !== 'agree') {
            message = message + ' "Privacy Policy"';
        }
        message = message + ' to continue.';

        if (!toastShown) {
            setToastShown(true);
            Toast.show(message);
            setTimeout(() => setToastShown(false), 2500);
        }
    };
    const redirect = callback => {
        if (route?.params?.socialMedia) {
            navigation.goBack();
            if (typeof callback === 'function') {
                callback(true, route?.params?.loginType);
            }
        } else {
            if (typeof callback === 'function') {
                callback(true);
            }
            navigation.navigate('InitializeUser', {...route.params});
        }
    };
    const actionHandler = () => {
        const callback = route?.params?.callback;
        const {pp, tc} = state;
        if (tc !== 'agree' || pp !== 'agree') {
            showMessage();
        } else {
            redirect(callback);
        }
    };
    return (
        <SafeScreenView translucent={Platform.OS === 'ios'}>
            <AppBar 
            // gradiant
             title={''} onBackPress={() => navigation.goBack('')}/>
            <View style={{height: '100%', display: "flex", flexDirection: 'column'}}>
                <View style={styles.viewContainerBox}>
                    <View style={styles.termsBoxLine}/>
                    <View style={styles.termsBoxSeparator}/>
                    <Text style={styles.title}>{strings.terms_and_condition}</Text>
                    <View style={styles.termsScrollBox}>
                        <TC/>
                    </View>
                    <View style={styles.termsCheckBox}>
                        <TouchableOpacity
                            onPress={() => {
                                setState(p => ({...p, tc: 'agree'}));
                            }}
                            style={styles.addButton}>
                            <Icon
                                name={
                                    state.tc === 'agree' ? 'check-box' : 'check-box-outline-blank'
                                }
                                type={'MaterialIcons'}
                                size={25}
                                color={'red'}
                            />
                        </TouchableOpacity>
                        <Text style={styles.checkBoxText}>{strings.agree} </Text>
                        <TouchableOpacity
                            onPress={() => {
                                setState(p => ({...p, tc: 'dis_agree'}));
                            }}
                            style={styles.addButton}>
                            <Icon
                                name={
                                    state.tc === 'dis_agree'
                                        ? 'check-box'
                                        : 'check-box-outline-blank'
                                }
                                type={'MaterialIcons'}
                                size={25}
                                color={'red'}
                            />
                        </TouchableOpacity>
                        <Text style={styles.checkBoxText}>{strings.dis_agree} </Text>
                    </View>
                </View>

                <View style={styles.viewContainerBox}>
                    <View style={styles.termsBoxLine}/>
                    <View style={styles.termsBoxSeparator}/>
                    <Text style={styles.title}>Privacy Policy</Text>
                    <View style={styles.termsScrollBox}>
                        <PP/>
                    </View>
                    <View style={styles.termsCheckBox}>
                        <TouchableOpacity
                            onPress={() => {
                                setState(p => ({...p, pp: 'agree'}));
                            }}
                            style={styles.addButton}>
                            <Icon
                                name={
                                    state.pp === 'agree' ? 'check-box' : 'check-box-outline-blank'
                                }
                                type={'MaterialIcons'}
                                size={25}
                                color={'red'}
                            />
                        </TouchableOpacity>
                        <Text style={styles.checkBoxText}>{strings.agree} </Text>
                        <TouchableOpacity
                            onPress={() => {
                                setState(p => ({...p, pp: 'dis_agree'}));
                            }}
                            style={styles.addButton}>
                            <Icon
                                name={
                                    state.pp === 'dis_agree'
                                        ? 'check-box'
                                        : 'check-box-outline-blank'
                                }
                                type={'MaterialIcons'}
                                size={25}
                                color={'red'}
                            />
                        </TouchableOpacity>
                        <Text style={styles.checkBoxText}>{strings.dis_agree} </Text>
                    </View>
                </View>

                <RoundButton
                    label={strings.continue}
                    style={styles.nextButtonStyle}
                    onPress={actionHandler}
                />
            </View>
        </SafeScreenView>
    );
}

export default React.memo(Terms);
