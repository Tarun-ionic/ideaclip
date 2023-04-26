/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {logger, SafeScreenView} from '../../index';
import {lottie, lovitzIcons, screens} from '../../utilities/assets';
import NavBar from './components/navBar';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {useSession} from '../../context/SessionContext';
import {strings} from '../../constant/strings';
import {compareObjects, useBackHandler} from '../../utilities/helper';
import CollabSearchBar from './components/collabSearchBar';
import onShare, {redirect2Messenger} from '../components/utility/share';
import {GradiantButton, IconTitle, LineView} from '../../system/ui/components';
import MostLovitsList from '../co_space/components/mostLovitsList';
import {Platform, ScrollView, StyleSheet, Text, View} from 'react-native';
import AppBar from '../components/toolbar/appBar';
import {IconButton} from 'react-native-paper';
import scale from '../../utilities/scale';
import {useTheme} from '../../context/ThemeContext';
import GetLocation from 'react-native-get-location';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import {useAlert} from '../../context/AlertContext';
import CollabSettingsPage from './components/collabSettingsPage';
import apolloLib from '../../lib/apolloLib';
import {mutations, queries} from '../../schema';
import IdeanGalleryList from './ideanGallery/ideanGalleryListing';

export default function CollabSpace() {
    const navigation = useNavigation();
    const session = useSession();
    const alert = useAlert();
    const {user} = session;
    const {theme} = useTheme();
    const {colors} = theme;
    const styles = styleSheet(theme);
    const isFocused = useIsFocused();
    const [locInfo, setLocInfo] = useState({lat: '', long: '', location: ''});
    const [locLoaded, setLocLoaded] = useState(false);
    const [settings, setSettings] = useState(false);
    const [initial, setInitial] = useState(true);
    const init = {
        radius: 2000,
        radiusIndicator: false,
        ethnicCommunity: [],
        industryList: [],
        activityList: [],
        isCompleted: false
    };
    const [config, setConfig] = useState({
        ...init,
    });
    useBackHandler(() => {
        backPressHandler();
        return true;
    }, [isFocused]);

    useEffect(() => {
        getSettings();
        getLocation();
        return () => {
            alert.clear();
        }
    }, []);

    useEffect(() => {
        if (!initial) {
            saveSettings();
        } else {
            setInitial(false);
        }
    }, [config]);

    const getSettings = () => {
        apolloLib.client(session)
            .query({
                fetchPolicy: 'no-cache',
                query: queries.getCollabSettings,
                variables: {
                    uId: user.uid,
                },
            })
            .then(({data, error}) => {
                const {collabIdeanSettings} = data;
                if (collabIdeanSettings) {
                    setTimeout(() => {
                        setConfig({
                            ...config,
                            radius: parseFloat(
                                collabIdeanSettings?.radius?.toString() || '2000',
                            ),
                            radiusIndicator: collabIdeanSettings?.radiusIndicator || false,
                            ethnicCommunity: collabIdeanSettings?.ethnicCommunity || [],
                            industryList: collabIdeanSettings?.industryList || [],
                            activityList: collabIdeanSettings?.activityList || [],
                            isCompleted: true
                        });
                    }, 500)
                }
            });
    };

    const saveSettings = () => {
        apolloLib.client(session).mutate({
            fetchPolicy: 'no-cache',
            mutation: mutations.saveCollabSettings,
            variables: {
                collabSettings: {
                    uid: user.uid,
                    radiusIndicator: config.radiusIndicator,
                    ethnicCommunity: config.ethnicCommunity,
                    industryList: config.industryList,
                    activityList: config.activityList,
                    radius: config.radius.toString(),
                },
            },
        });
    };
    useEffect(() => {
        if (!compareObjects(locInfo, {lat: '', long: '', location: ''})) {
            setLocLoaded(true);
        }
    }, [locInfo]);

    const getLocation = () => {
        if (!isFocused) {
            return false;
        }
        alert({
            type: 'lottie',
            message: strings.getting_your_location,
            source: lottie.finding_location,
            cancellable: false,
        });
        GetLocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 10000,
        })
            .then(location => {
                const loc = `${location.latitude},${location.longitude}`;
                logger.i('getCurrentPosition', loc);
                alert.clear();
                setLocInfo(preState => ({
                    ...preState,
                    location: loc,
                    lat: location.latitude,
                    long: location.longitude,
                }));
            })
            .catch(error => {
                const {code} = error;
                if (code === 'TIMEOUT' && isFocused && !trigger) {
                    retryAlert();
                } else if (code === 'UNAVAILABLE') {
                    RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
                        interval: 10000,
                        fastInterval: 5000,
                    })
                        .then(() => {
                            getLocation();
                        })
                        .catch(() => {
                            alert(strings.location_warning2);
                        });
                } else if (code === 'UNAUTHORIZED') {
                    alert(strings.location_warning3);
                } else {
                    alert.clear()
                }
            });
    };

    const backPressHandler = () => {
        if (settings) {
            setSettings(false);
        } else {
            navigation.push('PersonalSpace', {goBack: false, user})
        }
    };

    const navList = [
        {
            icon: screens.home,
            func: () => navigation.push('PersonalSpace', {goBack: false, user}),
        },
        {
            icon: screens.search,
            func: () => navigation.navigate('PersonalSearch'),
        },
        {
            icon: screens.chat,
            func: () => redirect2Messenger(navigation, user, user),
        },
        {
            icon: screens.inviteIdean,
            func: onShare,
        },
    ];

    return (
        <SafeScreenView translucent navBarEnabled={!settings}>
            <AppBar
                dark
                title={strings.collabSpace}
                enableBackButton
                onBackPress={backPressHandler}
                icon={screens.collabSpaceIco}
            />
            {!settings && (
                <CollabSearchBar
                    onSearch={searchState =>
                        navigation.navigate('CollabSearch', {searchState})
                    }
                    locInfo={locInfo}
                />
            )}
            {!settings ? (
                <ScrollView nestedScrollEnabled={true} style={{flex: 1}}>
                    <View
                        style={{flexDirection: 'row', width: '90%', alignSelf: 'center'}}>
                        <IconTitle
                            title={strings.collabSpaceIdeanGallery}
                            icon={screens.lovits}
                            style={{flex: 1, marginLeft: 0,}}
                            textStyle={{color:colors.collabSpaceTitle}}
                        />
                        <GradiantButton
                            style={{minWidth: Platform.OS=='ios'? scale.ms(35): scale.ms(40),}}
                            cornerRadius={50}
                            borderStyle={theme.dark&&{borderWidth:1,borderColor:colors.darkModeBorder}}
                            colors={[colors.collabSpaceButton,colors.collabSpaceButton]}
                            onPress={() => {
                                setSettings(true);
                            }}>
                            <IconButton
                                icon="tune"
                                size={Platform.OS=='ios'?35:25}
                                style={{padding: 0, margin: 0}}
                                color={'white'}
                                onPress={() => {
                                    setSettings(true);
                                }}
                            />
                        </GradiantButton>
                    </View>
                    <View
                        style={{
                            flexDirection: 'row',
                            marginHorizontal: 15,
                            marginVertical: 10,
                        }}>
                        <View style={{flex: 1, justifyContent: 'flex-end'}}>
                            <View style={styles.radiusIndicatorWarp}>
                                <Text style={styles.riLabel} numberOfLines={1}>
                                    {'My Ethnic Community'}
                                </Text>
                                <View
                                    style={[
                                        styles.radiusIndicator,
                                        config?.ethnicCommunity?.length > 0
                                            ? styles.radiusActive
                                            : styles.radiusInactive2,
                                    ]}
                                />
                            </View>
                            <View style={[styles.radiusIndicatorWarp, {marginTop: 10}]}>
                                <Text style={styles.riLabel} numberOfLines={1}>
                                    {'My Industry'}
                                </Text>
                                <View
                                    style={[
                                        styles.radiusIndicator,
                                        config.industryList?.length > 0
                                            ? styles.radiusActive
                                            : styles.radiusInactive2,
                                    ]}
                                />
                            </View>
                        </View>
                        <View style={{justifyContent: 'flex-end', marginLeft: 15}}>
                            <View style={styles.radiusIndicatorWarp}>
                                <Text style={styles.riLabel} numberOfLines={1}>
                                    {config.radiusIndicator
                                        ? `Radius on`
                                        : 'Radius off'}
                                </Text>
                                <View
                                    style={[
                                        styles.radiusIndicator,
                                        config.radiusIndicator
                                            ? styles.radiusActive
                                            : styles.radiusInactive2,
                                    ]}
                                />
                            </View>
                            <View style={[styles.radiusIndicatorWarp, {marginTop: 10}]}>
                                <Text style={styles.riLabel} numberOfLines={1}>
                                    {'My Charity'}
                                </Text>
                                <View
                                    style={[
                                        styles.radiusIndicator,
                                        config.activityList?.length > 0
                                            ? styles.radiusActive
                                            : styles.radiusInactive2,
                                    ]}
                                />
                            </View>
                        </View>
                    </View>
                    {locLoaded && (
                        <>
                            {config.isCompleted === true &&
                            <IdeanGalleryList
                                profile={{...user}}
                                isCollab={true}
                                filters={config}
                                locInfo={locInfo}
                                navigation={navigation}
                            />
                            }
                            <LineView/>
                            <IconTitle textStyle={{color:colors.mostLovitzHeading}} title={strings.most_lovits_heading} icon={theme.dark?lovitzIcons.grey:lovitzIcons.pink}/>
                            <MostLovitsList
                                userNav
                                spaceInfo={{spaceId: user.uid}}
                                color={'#3e0de1'}
                                isCollab={true}
                            />
                        </>
                    )}
                </ScrollView>
            ) : (
                <CollabSettingsPage
                    config={config}
                    setConfig={setConfig}
                    close={() => {
                        setSettings(false);
                    }}
                />
            )}
            {!settings && <NavBar navList={navList}/>}
        </SafeScreenView>
    );
}


const styleSheet = ({colors}) =>
    StyleSheet.create({
        radiusIndicatorWarp: {
            alignSelf: 'flex-end',
            alignItems: 'center',
            flexDirection: 'row',
        },
        radiusIndicator: {width: 12, height: 12, borderRadius: 20, marginLeft: 5},
        radiusActive: {backgroundColor: '#00f03a'},
        radiusInactive: {backgroundColor: '#ec1b21'},
        radiusInactive2: {backgroundColor: '#c2c2c2'},
        riLabel: {
            flexShrink: 1,
            fontSize: scale.font.s,
            color: colors.textPrimaryDark,
            marginTop: Platform.OS === 'ios' ? 2 : 0,
        },
        searchTitle: {
            color: colors.secondaryDark,
            width: '90%',
            marginHorizontal: '5%',
            marginBottom: 2,
            marginTop: 10,
        },
    });
