import React, {createContext, useContext, useEffect, useState} from 'react';
import {Image, Modal, Platform, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View,} from 'react-native';
import {Icon} from 'react-native-elements';

import {appLogo, lottie} from '../utilities/assets';
import {useTheme} from './ThemeContext';
import alertStyle from '../system/styles/alertStyle';
import {AppModal, RoundButton} from '../system/ui/components';
import LottieView from 'lottie-react-native';
import apolloLib from '../lib/apolloLib';
import {queries} from '../schema';
import {strings} from '../constant/strings';
import {useSession} from "./SessionContext";
import scale from "../utilities/scale";
import Toast from "react-native-simple-toast";

export const AlertContext = createContext({});
export const useAlert = () => useContext(AlertContext);
export const AlertProvider = ({children}) => {
    const session = useSession();
    const {theme, width, height} = useTheme();
    const {colors} = theme;
    const style = alertStyle(theme, width, height);
    const [alertBox, setAlertBox] = useState({});
    const [reportReasons, setReportReasons] = useState([]);
    const [loading, setLoading] = useState(false);
    const button = [{label: 'ok', callback: null}];
    const alert = config => {
        const {
            type = 'alert',
            title = 'IDEACLIP',
            message = typeof config === 'string' ? config : '',
            buttons = button,
            cancellable = true,
            autoDismiss = true,
            source = lottie.splash,
            content = null,
        } = config;

        const msgLast = message.trim().slice(-1);
        const newMsg = msgLast !== '.' && msgLast !== '?' ? `${message}.` : message;
        setAlertBox({
            type,
            title,
            message: newMsg,
            buttons,
            cancellable,
            source,
            content,
            autoDismiss,
            visibility: false,
        });
    };

    const [selectedReason, setSelectedReason] = useState('');
    const [otherReportMsg, setOtherReportMsg] = useState('');

    alert.clear = () => {
        setAlertBox({});
    };

    alert.message = message => {
        setAlertBox(preAlert => ({...preAlert, message}));
    };

    const onCallback = callback => {
        if (typeof callback === 'function') {
            callback();
        }
        if (alertBox?.autoDismiss === true) {
            setAlertBox({});
        }
    };

    const onCancel = () => {
        if (alertBox?.cancellable === true || alertBox?.autoDismiss === true) {
            setAlertBox({});
        }
    };

    const reportSubmit = _button => {
        if(selectedReason?.length>0 || otherReportMsg?.length>0) {
            _button.callback(selectedReason, otherReportMsg ?? '');
            setAlertBox({});
            setSelectedReason('');
            setOtherReportMsg('');
        } else{
            Toast.show("Reason cannot be empty.")
        }
    };

    const renderButtons = () => {
        return alertBox?.buttons?.map((_button, index) => {
            return (
                <Text
                    key={index}
                    style={style.button}
                    onPress={
                        alertBox.type === 'report' && _button.label === strings.submit
                            ? () => reportSubmit(_button)
                            : () => onCallback(_button?.callback)
                    }>
                    {_button.label}
                </Text>
            );
        });
    };

    useEffect(() => {
        if (alertBox?.visibility === false) {
            if (Platform.OS === 'ios') {
                setTimeout(() => {
                    setAlertBox(preAlert => ({...preAlert, visibility: true}));
                }, 500);
            } else {
                setAlertBox(preAlert => ({...preAlert, visibility: true}));
            }
        }
    }, [alertBox]);

    useEffect(() => {
        if (alertBox?.type === 'report') {
            setLoading(true);
            apolloLib.client(session)
                .query({
                    fetchPolicy: 'no-cache',
                    query: queries.getReasons,
                })
                .then(({data}) => {
                    setReportReasons(data.getReasons || []);
                    setLoading(false);
                })
                .catch(() => {
                    setLoading(false);
                });
        }
    }, [alertBox?.type]);

    return (
        <AlertContext.Provider value={alert}>
            {children}
            <View>
                {alertBox?.type === 'alert' && (
                    <Modal
                        key="alert"
                        transparent={true}
                        onDismiss={onCancel}
                        onTouchCancel={onCancel}
                        onRequestClose={onCancel}
                        hardwareAccelerated={true}
                        visible={alertBox?.visibility === true}>
                        <TouchableWithoutFeedback onPress={onCancel}>
                            <View style={style.wrap}>
                                <View style={style.container}>
                                    <View style={style.titleContainer}>
                                        <Image style={style.logo} source={appLogo.min}/>
                                        <Text style={style.title}> {alertBox?.title}</Text>
                                    </View>
                                    <Text style={style.message}>{alertBox?.message}</Text>
                                    <View style={style.buttonBar}>{renderButtons()}</View>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>
                )}

                {alertBox?.type === 'chooser' && (
                    <Modal
                        key="chooser"
                        transparent={true}
                        onDismiss={onCancel}
                        onTouchCancel={onCancel}
                        onRequestClose={onCancel}
                        visible={alertBox?.visibility === true}>
                        <TouchableWithoutFeedback onPress={onCancel}>
                            <View style={style.wrap}>
                                <View style={style.container}>
                                    <Text style={style.messageChoose}> {alertBox?.message}</Text>
                                    <View style={style.buttonBarChoose}>
                                        {alertBox?.buttons?.map((_button, index) => {
                                            return (
                                                <RoundButton
                                                    key={index}
                                                    style={style.buttonChoose}
                                                    label={_button.label}
                                                    onPress={() => onCallback(_button?.callback)}
                                                />
                                            );
                                        })}
                                    </View>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>
                )}

                {alertBox?.type === 'lottie' && (
                    <Modal
                        key="lottie"
                        transparent={true}
                        onDismiss={onCancel}
                        onTouchCancel={onCancel}
                        onRequestClose={onCancel}
                        visible={alertBox?.visibility === true}>
                        <TouchableWithoutFeedback onPress={onCancel}>
                            <View style={style.wrap}>
                                <View style={style.container}>
                                    <LottieView
                                        source={alertBox?.source}
                                        style={style.lottie}
                                        autoPlay
                                        loop
                                    />
                                    <Text style={[style.message, style.lottieMessage]}>
                                        {' '}
                                        {alertBox?.message}
                                    </Text>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>
                )}

                {alertBox?.type === 'custom' && (
                    <Modal
                        key="custom"
                        transparent={true}
                        onDismiss={onCancel}
                        onTouchCancel={onCancel}
                        onRequestClose={onCancel}
                        visible={alertBox?.visibility === true}>
                        <TouchableWithoutFeedback onPress={onCancel}>
                            <View style={style.wrap}>
                                <View style={style.container}>
                                    <View style={style.titleContainer}>
                                        <Image style={style.logo} source={appLogo.min}/>
                                        <Text style={style.title}> {alertBox?.title}</Text>
                                    </View>

                                    {alertBox?.content}

                                    <View style={style.buttonBar}>{renderButtons()}</View>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>
                )}

                {alertBox?.type === 'report' && (
                    <AppModal
                        onDismiss={onCancel}
                        visibility={alertBox?.visibility === true}>
                        <TouchableWithoutFeedback onPress={onCancel}>
                            <View style={style.wrap}>
                                <View style={style.container}>
                                    <View style={style.titleContainer}>
                                        <Image style={style.logo} source={appLogo.min}/>
                                        <Text style={style.title}> {alertBox?.title}</Text>
                                    </View>

                                    <View style={StyleSheet.reasonListContainer}>
                                        {loading ? (
                                            <LottieView
                                                source={lottie.splash}
                                                style={style.lottie}
                                                autoPlay
                                                loop
                                            />
                                        ) : (
                                            reportReasons.map(reason => {
                                                return (
                                                    <View
                                                        key={reason.title}
                                                        style={style.reasonItem}>
                                                        <Icon
                                                            name={selectedReason === reason.title ? 'radio-button-checked' : 'radio-button-unchecked'}
                                                            type="material-icons"
                                                            color={colors.secondaryDark}
                                                            size={scale.icon.xs}
                                                            onPress={() => {
                                                                setSelectedReason(reason.title)
                                                            }}
                                                            // style={{marginStart: 5, alignSelf: 'center'}}
                                                        />
                                                        <Text style={style.reasonItemText}>
                                                            {reason.title}
                                                        </Text>
                                                    </View>
                                                );
                                            })
                                        )}
                                        {!loading && (
                                            <View
                                                key={'other'}
                                                style={style.reasonItem}>
                                                <Icon
                                                    name={selectedReason === '' ? 'radio-button-checked' : 'radio-button-unchecked'}
                                                    type="material-icons"
                                                    color={colors.secondaryDark}
                                                    size={scale.icon.xs}
                                                    onPress={() => {
                                                        setSelectedReason("")
                                                    }}
                                                />
                                                <Text style={style.reasonItemText}>Other</Text>
                                            </View>
                                        )}

                                        {!loading && selectedReason === '' && (
                                            <>
                                                <Text style={style.reasonText}>Reason</Text>
                                                <TextInput
                                                    multiline
                                                    numberOfLines={4}
                                                    maxLength={100}
                                                    style={style.customReasonInput}
                                                    value={otherReportMsg}
                                                    onChangeText={text => setOtherReportMsg(text)}
                                                />
                                            </>
                                        )}
                                    </View>
                                    <View style={style.buttonBar}>{renderButtons()}</View>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </AppModal>
                )}
            </View>
        </AlertContext.Provider>
    );
};
