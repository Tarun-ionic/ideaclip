/* eslint-disable react-native/no-inline-styles */
// noinspection JSUnresolvedFunction

/**
 *  show user Profile view
 * for show user  block and continue
 *
 * created by akhi
 * created on 14 july 2021
 * created for ideaclip
 */
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import scale from 'utilities/scale';
import {RoundButton} from 'system/ui/components';
import ImageIcon from '../../components/utility/imageIcon';
import {useNavigation} from '@react-navigation/native';

export default function MessengerProfile({
                                             theme,
                                             user,
                                             avatar,
                                             messenger,
                                             visibility,
                                             blocked,
                                         }) {
    const navigation = useNavigation();
    const styles = style(theme);
    const navigate = () => {
        navigation.push('PersonalSpace', {
            user,
            profile: messenger?.user,
            goBack: true,
        });
    };

    if (!visibility && !blocked) {
        return (
            <View style={styles.userCardOverlay}>
                <ImageIcon size={80} source={avatar}/>
                <Text style={styles.label}>{messenger.user.displayName}</Text>
                {/* <Text style={styles.content}>{""}</Text>
      <Text style={styles.content}>{""}</Text>*/}
                <RoundButton
                    onPress={navigate}
                    style={{backgroundColor: '#f3f3f3', width: 150}}
                    labelStyle={{color: '#000'}}
                    label={'view profile'}
                />
            </View>
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
            alignSelf: 'center',
            alignItems: 'center',
            flexDirection: 'column',
        },
        label: {
            fontSize: scale.font.xxxl,
            marginTop: 40,
            textAlign: 'center',
            color: colors.textPrimaryDark,
        },
        content: {
            fontSize: scale.font.s,
            padding: 5,
            textAlign: 'center',
            color: colors.textPrimaryDark,
        },
    });
