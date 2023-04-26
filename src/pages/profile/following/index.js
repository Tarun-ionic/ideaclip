// noinspection DuplicatedCode,JSUnresolvedFunction

import React from 'react';
import {StyleSheet} from 'react-native';
import FollowingList from './followingList';
import LottieView from 'lottie-react-native';
import {lottie} from '../../../utilities/assets';
import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import {useSession} from '../../../context/SessionContext';
import {useBackHandler} from '../../../utilities/helper';
import {SafeScreenView} from '../../../index';
import AppBar from '../../../screens/components/toolbar/appBar';

export default function Following() {
    const navigation = useNavigation();
    const session = useSession();
    const route = useRoute();
    const {user} = session;
    const {profileId} = route.params;
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
            <AppBar title={'Collabing List'} onBackPress={onBackPress}/>
            {user.uid ? (
                <FollowingList onPress={profile} user={user} profileId={profileId}/>
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
const styles = StyleSheet.create({
    lottie_sm: {
        height: 50,
        width: 50,
        alignSelf: 'center',
    },
});
