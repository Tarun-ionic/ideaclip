/* eslint-disable react-native/no-inline-styles */
// noinspection ES6CheckImport,JSUnresolvedVariable

import React, {useEffect, useState} from 'react';
import {Image, Modal, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View} from "react-native";
import {appLogo, lottie} from "../../../utilities/assets";
import {strings} from "../../../constant/strings";
import {useSession} from "../../../context/SessionContext";
import {useTheme} from "../../../context/ThemeContext";
import alertStyle from "../../../system/styles/alertStyle";
import {AppModal} from "../../../system/ui/components";
import LottieView from "lottie-react-native";
import {Icon} from "react-native-elements";
import scale from "../../../utilities/scale";
import apolloLib from "../../../lib/apolloLib";
import {queries} from "../../../schema";
import Toast from "react-native-simple-toast";

export default function AlertPopup({
                                       type = 'alert',
                                       message = '',
                                       titleNew='',
                                       buttons = [],
                                       visibility = false,
                                       onCancel,
                                       cancellable,
                                        link='',
                                        linkOnPress=()=>{},
                                        message2=''
                                   }) {

    const session = useSession();
    const {theme, width, height} = useTheme();
    const {colors} = theme;
    const style = alertStyle(theme, width, height);
    const [reportReasons, setReportReasons] = useState([]);
    const [loading, setLoading] = useState(false);
    const button = [{label: 'ok', callback: null}];
    const [selectedReason, setSelectedReason] = useState('');
    const [otherReportMsg, setOtherReportMsg] = useState('');
    const title = 'IDEACLIP'
    const reportTitle = 'REPORT'
    const onCallback = callback => {
        if (typeof callback === 'function') {
            callback();
        }
    };
    const reportSubmit = _button => {
        if(selectedReason?.length>0 || otherReportMsg?.length>0) {
            _button.callback(selectedReason, otherReportMsg ?? '');
            setSelectedReason('');
            setOtherReportMsg('');
        } else{
            Toast.show("Reason cannot be empty.")
        }
    };
    const renderButtons = () => {
        let _buttons = buttons?.length > 0 ? buttons : button
        return _buttons?.map((_button, index) => {
            return (
                <Text
                    key={index}
                    style={style.button}
                    onPress={
                        type === 'report' && _button.label === strings.submit
                            ? () => reportSubmit(_button)
                            : () => onCallback(_button?.callback)
                    }>
                    {_button.label}
                </Text>
            );
        });
    };


    useEffect(() => {
        if (type === 'report') {
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
    }, [type]);
    return (
        <View>
            {type === 'alert' &&
            <Modal
                key="alert"
                transparent={true}
                onDismiss={() => {
                    if (cancellable)
                        onCancel()
                }}
                onTouchCancel={() => {
                    if (cancellable)
                        onCancel()
                }}
                onRequestClose={() => {
                    if (cancellable)
                        onCancel()
                }}
                hardwareAccelerated={true}
                visible={visibility === true}>
                <TouchableWithoutFeedback onPress={() => {
                    if (cancellable)
                        onCancel()
                }}>
                    <View style={style.wrap}>
                        <View style={style.container}>
                            <View style={style.titleContainer}>
                                <Image style={style.logo} source={appLogo.min}/>
                                <Text style={style.title}> {title}</Text>
                            </View>
                            <Text style={style.message}>{message} {link &&
                            <Text style={{ color: colors.link,fontSize: scale.font.l, lineHeight: 24}} onPress={linkOnPress}>{link}</Text>
                            }{message2}</Text>
                            <View style={style.buttonBar}>{renderButtons()}</View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
            }
            {type === 'report' && (
                <AppModal
                    onDismiss={onCancel}
                    visibility={visibility === true}>
                    <TouchableWithoutFeedback onPress={() => {
                        if (cancellable)
                            onCancel()
                    }}>
                        <View style={style.wrap}>
                            <View style={style.container}>
                                <View style={style.titleContainer}>
                                    <Image style={style.logo} source={appLogo.min}/>
                                    <Text style={style.title}> {titleNew?.length>0?titleNew:reportTitle}</Text>
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
    )

}


