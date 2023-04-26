/* eslint-disable react-native/no-inline-styles */
/**
 *  show user privacy view
 * for show user  block and continue
 *
 * created by akhi
 * created on 02 june 2021
 * created for ideaclip
 */
import React from 'react';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import scale from 'utilities/scale';
import {strings} from 'constant/strings';
import {RoundCornerButton} from 'system/ui/components';
import apolloLib from '../../../lib/apolloLib';
import {mutations} from 'schema';
import {useAlert} from 'context/AlertContext';
import {useSession} from "../../../context/SessionContext";
import apiConstant from "../../../constant/apiConstant";
import {userStatus} from "../../../utilities/constant";

export default function MessengerPrivacy({
                                             theme,
                                             messenger,
                                             user,
                                             visibility,
                                             setter,
                                             blocked = false,
                                             chatBlockedBy = false,
                                             userBlocked = false,
                                             userBlockedBy = false,
                                         }) {
    const session = useSession();
    const alert = useAlert();
    const styles = style(theme);
    const updateStatus = status => {
        apolloLib.client(session)
            .mutate({
                fetchPolicy: 'no-cache',
                mutation: mutations.blockChangeChat,
                variables: {
                    id: messenger.id,
                    uId: user.uid,
                    status: status,
                },
            })
            .then(({data, error}) => {
                const {blockChangeChat} = data;
                if (blockChangeChat) {
                    setter(prev => ({
                        ...prev,
                        isBlocked: blockChangeChat.isBlocked,
                        blockedBy: blockChangeChat.blockedBy,
                    }));
                } else if (error) {
                    alert(strings.something_went_wrong);
                }
            })
            .catch(() => {
                alert(strings.something_went_wrong);
            });
    };
    if (userBlocked) {
        return (
            <SafeAreaView style={styles.userCardOverlay}>
                <Text style={styles.label}>
                    {userBlockedBy ? strings.messenger_blocked_by_user : strings.userAccessDenied}
                </Text>
            </SafeAreaView>
        );
    }  else if (messenger.isDisabled) {
        return (
            <SafeAreaView style={styles.userCardOverlay}>
                {messenger.user.status === userStatus.archived ?
                    <Text style={styles.label}>
                        {messenger.user.displayName.trim()} has
                        been {messenger.user.status !== apiConstant.userStatus.Active ? messenger.user.status || 'disabled' : 'disabled'}.
                    </Text>
                    :
                    <Text style={styles.label}>The User is unavailable for chat.</Text>
                }
            </SafeAreaView>
        );
    } else if (!visibility && blocked && chatBlockedBy) {
        return (
            <SafeAreaView style={styles.userCardOverlay}>
                <Text
                    style={
                        styles.label
                    }>{`If you unblock, ${messenger.user.displayName.trim()} will also be able to send messages.`}</Text>
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        alignSelf: 'center',
                    }}>
                    <RoundCornerButton
                        onPress={() => updateStatus(false)}
                        style={{
                            minWidth: scale.ms(150),
                            backgroundColor: '#f3f3f3',
                            alignSelf: 'center',
                        }}
                        labelStyle={{color: '#000'}}
                        label={strings.messenger_unblock}
                    />
                </View>
            </SafeAreaView>
        );
    } else if (!visibility && !blocked) {
        return (
            <SafeAreaView style={styles.userCardOverlay}>
                <Text
                    style={
                        styles.label
                    }>{`If you reply, ${messenger.user.displayName.trim()} will also be able to send messages.`}</Text>
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        alignSelf: 'center',
                    }}>
                    <RoundCornerButton
                        onPress={() => updateStatus(true)}
                        style={{backgroundColor: '#f3f3f3', alignSelf: 'center'}}
                        labelStyle={{color: '#000'}}
                        label={strings.messenger_block}
                    />
                </View>
            </SafeAreaView>
        );
    } else if (blocked) {
        return (
            <SafeAreaView style={styles.userCardOverlay}>
                <Text style={styles.label}>
                    {chatBlockedBy
                        ? strings.messenger_blocked_by_user
                        : strings.messenger_blocked}
                </Text>
            </SafeAreaView>
        );
    } else {
        return null;
    }
}

const style = ({colors}) =>
    StyleSheet.create({
        userCardOverlay: {
            padding: 20,
            backgroundColor: colors.surfaceDark,
        },
        label: {
            marginBottom: 10,
            fontSize: scale.font.s,
            textAlign: 'center',
            color: colors.textPrimaryDark,
        },
        block_button: {
            width: 200,
            alignSelf: 'center',
            marginTop: 30,
            backgroundColor: 'transparent',
        },
        button_label: {color: colors.secondaryDark},
    });
