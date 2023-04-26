/* eslint-disable react-hooks/exhaustive-deps,react-hooks/rules-of-hooks,react-native/no-inline-styles */
// noinspection JSUnresolvedFunction

import React, {useEffect} from 'react';
import {screens} from '../../utilities/assets';
import {Image, ImageBackground, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import apollo from '../../lib/apolloLib';
import {mutations, queries} from '../../schema';
import Toast from 'react-native-simple-toast';
import {user} from '../../schema/dataDef';
import {businessData, clipTypes} from '../../utilities/constant';
import {useSession} from "../../context/SessionContext";
import {SafeScreenView} from "../../index";

export default function CoSpaceSplash() {
    const session = useSession();
    const navigation = useNavigation();
    const route = useRoute();
    const {user} = session;
    const {spaceInfo, locationInfo} = route?.params;

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = () => {
        apollo.client(session)
            .query({
                fetchPolicy: 'no-cache',
                variables: {placeId: spaceInfo.spaceId},
                query: queries.checkTempUser,
            })
            .then(({data}) => {
                if (data.status) {
                    navigation.replace('ClipCoSpace', {
                        spaceInfo: {
                            ...spaceInfo,
                            spaceId: user.uid,
                            spaceType: clipTypes.clip,
                        },
                        temporarySpace: true,
                    });
                }
                createTempUser();
            })
            .catch(() => {
                error();
            });
    };

    const error = () => {
        Toast.show('Something went wrong. Please try again later.');
        navigation.goBack(null);
    };

    const createTempUser = () => {
        const variables = {
            cuid: user.uid,
            ...businessData,
            orgName: spaceInfo.displayName,
            uid: locationInfo.place_id,
            isActive: false,
            placeId: locationInfo.place_id,
        };

        apollo.client(session)
            .mutate({
                fetchPolicy: 'no-cache',
                variables,
                mutation: mutations.createTemp,
            })
            .then(({data}) => {
                const {tempCreate} = data;
                if (tempCreate && tempCreate.uid) {
                    setTimeout(() => {
                        navigation.replace('ClipCoSpace', {
                            spaceInfo: {
                                ...spaceInfo,
                                spaceId: tempCreate.uid,
                                followStatus: true, //default value
                                blockStatus: false, //default value
                            },
                            temporarySpace: true,
                        });
                    }, 2000);
                } else {
                    error();
                }
            })
            .catch(error);
    };

    return (
        <SafeScreenView translucent={true} >
            <ImageBackground
                source={screens.coSpaceSplashBg3}
                style={{flex:1, justifyContent: 'space-between'}}
                resizeMode={'cover'}>
                <Image
                    source={screens.coSpaceSplashTextTop2}
                    style={{
                        width: '80%',
                        resizeMode: 'contain',
                        alignSelf: 'center',
                        marginHorizontal: 10,
                    }}
                />
                <Image
                    source={screens.coSpaceSplashTextBottom2}
                    style={{
                        width: '80%',
                        flexShrink: 1,
                        resizeMode: 'contain',
                        alignSelf: 'center',
                        margin: 5,
                    }}
                />
            </ImageBackground>
        </SafeScreenView>
    );
}
