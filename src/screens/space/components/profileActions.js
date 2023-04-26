/* eslint-disable react-hooks/exhaustive-deps,react-native/no-inline-styles */
// noinspection JSUnresolvedFunction

import React, {useEffect, useState} from 'react';
import {Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View,} from 'react-native';
import scale from 'utilities/scale';
import {useTheme} from 'context/ThemeContext';
import {strings} from 'constant/strings';
import {GradiantButton, LineView} from 'system/ui/components';
import {useNavigation} from '@react-navigation/native';
import {clipTypes, userType} from '../../../utilities/constant';
import {useSession} from '../../../context/SessionContext';
import Keywords from '../../../pages/profile/components/Keywords';
import {useAlert} from '../../../context/AlertContext';
import {icons,personalSpaceIcons} from '../../../utilities/assets';

export default function ProfileActions({profile}) {
    const navigation = useNavigation();
    const {theme} = useTheme();
    const {colors} = theme;
    const alert = useAlert();
    const session = useSession();
    const {user} = session;
    const styles = actionStyle(theme);
    const [profileInfo, setProfileInfo] = useState({...profile});
    const [keywordsView, setKeywordsView] = useState(false);
    const iconAssets = personalSpaceIcons(theme.dark)

    useEffect(() => {
        setProfileInfo({...profile});
    }, [profile]);

    const getKeywords = () => {
        let a = '';
        let i = 0;
        if (profileInfo.keywords) {
            for (i in profileInfo.keywords) {
                if (a.length === 0) {
                    a = a + profileInfo.keywords[i];
                } else {
                    a = a + ' ' + profileInfo.keywords[i];
                }
            }
        }
        return a;
    };

    const clipRoom = spaceType => {
        navigation.push('ClipCoSpace', {
            spaceInfo: {
                ...profileInfo,
                spaceId: profileInfo.uid,
                spaceType,
            },
        });
    };

    return (
        <View>
            {profile.userType !== userType.general && (
                <View style={styles.buttonActionBar}>
                    <GradiantButton
                        cornerRadius={5}
                        colors={[colors.coSpaceButton, colors.coSpaceButton]}
                        labelStyle={{fontSize: scale.font.s, paddingHorizontal: 5}}
                        label={strings.coSpaceButton}
                        borderStyle={theme.dark?{borderWidth:1,borderColor:colors.darkModeBorder,borderRadius:5}:{}}
                        onPress={() => {
                            if (profileInfo.blockStatus && user.uid !== profileInfo.uid) {
                                alert(strings.collabPending);
                            } else {
                                clipRoom(clipTypes.clip);
                            }
                        }}
                        style={{flex: 1}}
                    />
                    <GradiantButton
                        cornerRadius={5}
                        colors={[colors.newsAndAsksButton,colors.newsAndAsksButton]}
                        labelStyle={{fontSize: scale.font.s, paddingHorizontal: 5}}
                        label={strings.announcement_co_space}
                        borderStyle={theme.dark?{borderWidth:1,borderColor:colors.darkModeBorder,borderRadius:5}:{}}
                        onPress={() => {
                            if (profileInfo.blockStatus && user.uid !== profileInfo.uid) {
                                alert(strings.collabPending);
                            } else {
                                clipRoom(clipTypes.announcement);
                            }
                        }}
                        style={{flex: 1}}
                    />
                </View>
            )}

            {profile.userType === userType.general && (
                <View>
                    <View style={{flexDirection: 'row', marginStart: 25, marginEnd: 5}}>
                        {/* <GradiantButton
                            cornerRadius={5}
                            colors={['#d1094f', '#881b7e']}
                            labelStyle={{fontSize: scale.font.s, paddingHorizontal: 15}}
                            label={"I'm Idean in ..."}
                            height={scale.ms(30)}
                            style={{marginLeft: 0}}
                        /> */}
                        {/* <TouchableOpacity style={{height:scale.ms(30),minWidth: scale.ms(80)}} > */}
                        <Image source={iconAssets.myInterest} style={{height:scale.ms(35), maxWidth: scale.ms(80),resizeMode:'contain'}} resizeMode={'contain'}/>
                        {/* </TouchableOpacity> */}
                        <View style={styles.iamIdean}>
                            {profileInfo.keywords && profileInfo.keywords.length !== 0 ? (
                                <ScrollView
                                    horizontal={true}
                                    scrollEnabled={true}
                                    showsHorizontalScrollIndicator={false}
                                    style={{flex: 1}}>
                                    <TouchableWithoutFeedback>
                                        <Text style={styles.keywordText}>{getKeywords()}</Text>
                                    </TouchableWithoutFeedback>
                                </ScrollView>
                            ) : (
                                <View style={{flexDirection: 'row', flex: 1, flexWrap: 'wrap'}}>
                                    <Text style={styles.staticText}>
                                        Highlight your 5 areas of
                                    </Text>
                                    <Text style={styles.keywordStaticText}>{' #interest '}</Text>
                                    <Text style={styles.staticText}>here.</Text>
                                </View>
                            )}
                            {profileInfo.uid === user.uid && (
                                <View style={styles.keywordsList}>
                                    {/*<Icon*/}
                                    {/*  name={'pencil'}*/}
                                    {/*  type="material-community"*/}
                                    {/*  color={colors.textPrimary}*/}
                                    {/*  size={20}*/}
                                    {/*  onPress={() => {*/}
                                    {/*    setKeywordsView(true);*/}
                                    {/*  }}*/}
                                    {/*/>*/}
                                    <Pressable
                                        style={{
                                            alignSelf: 'flex-end',
                                            padding: 2,
                                            justifyContent: 'center',
                                        }}
                                        onPress={() => {
                                            setKeywordsView(true);
                                        }}>
                                        <Image
                                            source={icons.pen}
                                            style={[{tintColor: colors.textPrimary}]}
                                            height={18}
                                            width={18}
                                            resizeMode="contain"
                                        />
                                    </Pressable>
                                </View>
                            )}
                        </View>
                    </View>
                    <Keywords
                        visibility={keywordsView}
                        onDismiss={() => setKeywordsView(false)}
                        keywords={profileInfo.keywords}
                        edit={data => {
                            setProfileInfo({...profileInfo, keywords: data});
                        }}
                        uid={user.uid}
                    />
                </View>
            )}
            <LineView/>
        </View>
    );
}

const actionStyle = ({colors}) => {
    return StyleSheet.create({
        buttonActionBar: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: '5%',
        },
        keywordsList: {
            alignSelf: 'flex-end',
            justifyContent: 'flex-start',
            height: '100%',
        },
        iamIdean: {
            marginStart: 5,
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
        },
        staticText: {
            fontSize: scale.font.s,
            color: colors.textPrimaryDark,
        },
        keywordText: {
            color: colors.interestTagsText,
            fontSize: scale.font.s,
            paddingEnd: 10,
        },
        keywordStaticText: {
            color: colors.interestTagsText,
            fontSize: scale.font.s,
        },
    });
};
