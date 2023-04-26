// noinspection DuplicatedCode,JSUnresolvedFunction

import React from 'react';
import {StyleSheet} from 'react-native';
import FollowerList from './followerList';
import LottieView from 'lottie-react-native';
import {lottie} from '../../../utilities/assets';
import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import {useSession} from '../../../context/SessionContext';
import {useBackHandler} from '../../../utilities/helper';
import {SafeScreenView} from '../../../index';
import AppBar from '../../../screens/components/toolbar/appBar';
import {useTheme} from '../../../context/ThemeContext';

export default function Followers() {
    const navigation = useNavigation();
    const session = useSession();
    const route = useRoute();
    const {user} = session;
    const {profileId} = route.params;
    const {width, height} = useTheme();
    const styles = stylesMaker(width, height);
    const isFocused = useIsFocused()
    useBackHandler(() => {
        onBackPress();
        return true;
    }, [isFocused]);

    const onBackPress = () => {
        if (profileId === user.uid) {
            navigation.push('PersonalSpace', {goBack: false, user})
        } else {
            navigation.goBack();
        }
    };

    const profile = item => {
        navigation.push('PersonalSpace', {
            user,
            profile: {...item.details},
            goBack: true,
        });
    };

    return (
        <SafeScreenView translucent>
            <AppBar title={'Collaber List'} onBackPress={onBackPress}/>
            {user.uid ? (
                <FollowerList onPress={profile} user={user} profileId={profileId}/>
            ) : (
                <LottieView
                    source={lottie.loader}
                    autoPlay
                    loop
                    style={styles.lottie_sm}
                />
            )}
        </SafeScreenView>
    );
}
const stylesMaker = (width, height) =>
    StyleSheet.create({
        container: {
            flexDirection: 'column',
            height: '100%',
        },
        list: {
            padding: 5,
        },
        listItem: {
            paddingBottom: 300,
        },
        lottie: {
            height: height,
            width: width,
            alignSelf: 'center',
            bottom: 50,
        },
        lottie_sm: {
            height: 50,
            width: 50,
            alignSelf: 'center',
        },
    });
