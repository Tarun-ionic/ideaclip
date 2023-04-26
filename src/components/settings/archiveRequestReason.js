/* eslint-disable react-hooks/rules-of-hooks,react-native/no-inline-styles */
import React, {useState} from 'react';
import {Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,} from 'react-native';
import {Icon} from 'react-native-elements';
import {useTheme} from '../../context/ThemeContext';
import scale from '../../utilities/scale';
import Toast from "react-native-simple-toast";
import {apollo} from "../../index";
import {useSession} from "../../context/SessionContext";
import {mutations} from "../../schema";
import {strings} from "../../constant/strings";
import {webURLs} from "../../utilities/constant";
import {AppModal} from "../../system/ui/components";

export default function ArchiveRequestReason({
                                                 onDismiss,
                                                 onRequestSuccess
                                             }) {
    const {theme, width, height} = useTheme();
    const {colors} = theme;
    const session = useSession()
    const {user} = session
    const styles = filterStyle(theme, width, height);
    const [reason, setReason] = useState("")
    const [disabled, setDisabled] = useState(false)
    const [completedMessage, setCompletedMessage] = useState(false)
    const sendArchiveRequest = () => {
            apollo.client(session)
                .mutate({
                    fetchPolicy: 'no-cache',
                    mutation: mutations.requestArchival,
                    variables: {
                        userId: user.uid,
                        reason: reason.trim().length === 0 ? 'No reason provided.' : reason
                    }
                }).then(({data}) => {
                const {requestArchival} = data
                if (requestArchival === true) {
                    onRequestSuccess()
                    setCompletedMessage(true)
                    Toast.show("Request submitted successfully.")
                } else {
                    Toast.show("Failed to request archival. Please try again after sometime.")
                }
                setDisabled(false)
            })
    
    }

    return (
        <AppModal visibility={true} nestedScroll={true}>
            <View style={styles.wrap}>
                <View style={styles.container}>
                    <View style={styles.elementTitle}>
                        <Text style={styles.title}>{completedMessage ? "Request Submitted" : "Request archival"}</Text>
                        <Icon
                            name="cancel"
                            size={30}
                            color={colors.secondaryDark}
                            type="material"
                            disabled={disabled}
                            disabledStyle={{backgroundColor: 'transparent'}}
                            onPress={() => onDismiss(true)}
                        />
                    </View>
                    <View style={styles.line}/>
                    {completedMessage ?
                        <Text style={styles.messageTest}>
                            {strings.archiveRequestCompleteMessage}
                        </Text>
                        :
                        <>
                            <Text style={{fontSize: scale.font.s,color:colors.textPrimary, marginTop: 10}}>
                                Reason
                            </Text>
                            <TextInput
                                multiline
                                editable={!disabled}
                                numberOfLines={4}
                                maxLength={150}
                                placeholderTextColor={colors.textPrimary}
                                style={styles.customReasonInput}
                                placeholder={"Enter reason for request if needed (optional)."}
                                value={reason}
                                onChangeText={text => setReason(text)}
                            />
                            <ScrollView style={{height:200}} nestedScrollEnabled={true}>
                            <View><Text style={styles.messageTest}>
                                You have the right to request deletion of your account, subject to certain exceptions.
                                Once We receive and confirm your request, We will archive (and direct Our Service
                                Providers to archive) your
                                Personal information from Our records
                                <Text style={[styles.messageTest, styles.messageTestBold]}> permanently.
                                    ‘Archival’ </Text>refers to your account being no longer visible
                                to any other users on the IDEACLIP Platform nor can a user login or sign up a new
                                account
                                using the same email address, phone number, ABN or ACN, business address or username.
                                We cannot hard delete a user’s account instantly in case We need to retain your
                                data to comply with applicable laws, resolve disputes, and enforce Our legal agreements
                                and
                                policies. Once the ‘Request for Archival’ form is submitted with reasons, an email will
                                be sent
                                to You notifying successful archival of your account. It may take up to 5 working days
                                to archive
                                your account by Us. Please refer to our
                                <Text style={[styles.messageTest, styles.messageTestLink]}
                                      onPress={() => Linking.openURL(webURLs.privacyPolicy).then()}> Privacy
                                    Policy </Text>for detailed information.
                            </Text>
                            </View>
                            </ScrollView>
                        </>
                    }
                    <View style={styles.line}/>
                    {completedMessage ?
                        <View style={styles.buttonRow}>
                            <View style={styles.buttonView}>
                                <TouchableOpacity
                                    disabled={disabled}
                                    style={styles.button}
                                    onPress={() => {
                                        onDismiss(true);
                                    }}>
                                    <Text style={styles.buttonLabel}>OK</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        :
                        <View style={styles.buttonRow}>
                            <View style={styles.buttonView}>
                                <TouchableOpacity
                                    disabled={disabled}
                                    style={styles.button}
                                    onPress={() => {
                                        onDismiss(true);
                                    }}>
                                    <Text style={styles.buttonLabel}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.buttonView}>
                                <TouchableOpacity
                                    disabled={disabled}
                                    style={styles.button}
                                    onPress={() => {
                                        setDisabled(true)
                                            sendArchiveRequest()
                                    }}>
                                    <Text style={styles.buttonLabel}>Submit</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    }
                </View>
            </View>
        </AppModal>
    );
}

const filterStyle = ({colors}, width, height) =>
    StyleSheet.create({
        wrap: {
            display: "flex",
            justifyContent: 'center',
            alignSelf: 'center',
            alignContent: 'center',
            flexDirection: 'column',
            width,
            height,
            backgroundColor: 'transparent',
        },
        container: {
            elevation: 5,
            shadowColor: 'rgba(0,0,0,0.8)',
            shadowOffset: {width: 2, height: 2},
            shadowRadius: 3,
            shadowOpacity: 0.5,
            width: scale.ms(300),
            justifyContent: 'center',
            flexDirection: 'column',
            alignSelf: 'center',
            alignContent: 'center',
            padding: 10,
            borderRadius: 10,
            backgroundColor: colors.alertBox,
        },
        title: {
            flex: 1,
            fontSize: scale.font.l,
            alignItems: 'center',
            color: colors.textPrimary
        },
        elementTitle: {
            height: 30,
            margin: 10,
            flexDirection: 'row',
            alignItems: 'center',
        },
        element: {
            height: 30,
            margin: 10,
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
        },
        line: {
            width: '100%',
            height: 1,
            backgroundColor: colors.secondaryDark,
        },
        buttonRow: {
            flexDirection: 'row',
            justifyContent: 'center',
        },
        buttonView: {
            margin: 10,
        },
        button: {
            backgroundColor: colors.secondaryDark,
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            borderRadius: 20,
            padding: 3,
        },
        buttonLabel: {
            fontSize: scale.font.s,
            paddingTop: 5,
            paddingBottom: 5,
            paddingLeft: 15,
            paddingRight: 15,
            color: colors.textSecondaryDark,
        },
        customReasonInput: {
            marginVertical: 10,
            width: '100%',
            borderWidth: 1,
            borderColor: colors.secondaryDark,
            color: colors.textPrimary,
            padding: 5,
            borderRadius: 5,
            fontSize: scale.font.s,
            height: 80,
        }, messageTest: {
            fontSize: scale.font.xs,
            marginBottom: 10,
            fontWeight: '400',
            textAlign: 'justify',
            letterSpacing: 1,
            lineHeight: 18,
            color: colors.textPrimary,
        },
        messageTestBold: {
            fontWeight: 'bold',
        },
        messageTestLink: {
            color: colors.link,
        }
    });
