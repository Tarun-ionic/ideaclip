/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View} from 'react-native';
import {screens} from 'utilities/assets';
import {SafeScreenView} from 'index';
import CoSpaceInfo from './components/coSpaceInfo';
import {useBackHandler} from 'utilities/helper';
import {useNavigation, useRoute} from '@react-navigation/native';
import {strings} from 'constant/strings';
import {useTheme} from '../../context/ThemeContext';
import MostLovitsList from './components/mostLovitsList';
import {IconTitle} from 'system/ui/components';
import {clipTypes} from '../../utilities/constant';
import AppBar from '../components/toolbar/appBar';

export default function MostLovitsSpace() {
    const navigation = useNavigation();
    const {params} = useRoute();
    const {spaceInfo} = params;
    const {theme} = useTheme();
    const temp = params?.temporarySpace || false;

    useBackHandler(() => {
        backPressHandler();
        return true;
    });

    const backPressHandler = () => {
        navigation.goBack(null);
    };

    return (
        <SafeScreenView translucent>
            <AppBar
                icon={screens.co_space_ico}
                onBackPress={backPressHandler}
                title={
                    clipTypes.announcement === spaceInfo.spaceType
                        ? strings.announcement_co_space
                        : strings.idea_clip_co_space
                }
                titleStyle={{color: theme.colors.secondaryDark}}
            />

            <CoSpaceInfo
                isMostLovits={true}
                spaceInfo={spaceInfo}
                temporarySpace={temp}
            />
            <View
                style={{
                    flexDirection: 'row',
                    padding: 5,
                    marginRight: 25,
                    alignSelf: 'flex-end',
                }}>
                <IconTitle title={strings.most_lovit_clips} icon={screens.lovits}/>
            </View>
            <View style={{flex: 1}}>
                <MostLovitsList
                    bid={spaceInfo.spaceId}
                    spaceInfo={spaceInfo}
                    userNav
                    color={'#7a00aa'}
                    messengerView
                    isCollab={true}
                    flip={true}
                />
            </View>
        </SafeScreenView>
    );
}
