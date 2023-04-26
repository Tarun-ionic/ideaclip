/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {Platform, Pressable, StyleSheet, Text, View} from 'react-native';
import scale from 'utilities/scale';

import {useTheme} from 'context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {logger} from '../../../index';
import {strings} from 'constant/strings';
import {lottie} from 'utilities/assets';
import GetLocation from 'react-native-get-location';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import {useIsFocused} from '@react-navigation/native';
import {useAlert} from 'context/AlertContext';
import {LineView} from 'system/ui/components';
import SearchBar from '../../components/toolbar/searchBar';
import SettingsPopup from '../../../components/popup/SettingsPopup';

export default function CollabSearchBar({onSearch, searchObj = {}, locInfo}) {
    const {theme} = useTheme();
    const alert = useAlert();
    const styles = styleSheet(theme);
    const [state, setState] = useState( {
                radius: 5000,
                location: '',
                keyword: '',
                radiusIndicator: true,
                deviceLocation: true
            ,...searchObj});
    const isFocused = useIsFocused();
    const [settingsVisible, setSettingsVisible] = useState(false);

    useEffect(() => {
        setState(prevState => ({...prevState, location: locInfo?.location}));
    }, [locInfo]);

    useEffect(() => {
     Object.keys(searchObj).length > 0 &&  JSON.stringify(searchObj) !== JSON.stringify(state) && setState(s=>({...s,...searchObj}));
    }, [searchObj]);
    useEffect(() => {
        // getLocation();
        AsyncStorage.getItem('location_settings').then(data => {
            if (data) {
                try {
                    setState(s=>({...s,...JSON.parse(data)}));
                } catch (e) {
                    logger.e('error location_settings ');
                }
            }
        });
    }, [isFocused]);

    const saveConfig = locationConfig => {
        AsyncStorage.setItem(
            'location_settings',
            JSON.stringify({
                radius: locationConfig.radius,
                radiusIndicator: locationConfig.radiusIndicator,
            }),
        ).then(() =>
            setState(s=>({...s,
                radius: locationConfig.radius,
                radiusIndicator: locationConfig.radiusIndicator,
            })),
        );
    };

    const onChange = text => {
        setState(s => ({...s, keyword: text}));
    };

    const retryAlert = () => {
        alert({
            message: strings.confirm_location_retry,
            buttons: [{label: strings.ok}],
        });
    };

    const getLocation = (_searchObj, trigger = true) => {
        if (!isFocused) {
            return false;
        }
        if (!trigger) {
            alert({
                type: 'lottie',
                message: strings.getting_your_location,
                source: lottie.finding_location,
                cancellable: false,
            });
        }

        // get  location
        GetLocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 10000,
        })
            .then(location => {
                const loc = `${location.latitude},${location.longitude}`;
                logger.i('getCurrentPosition', loc);
                alert.clear();
                if (!trigger) {
                    onSearch({..._searchObj, location: loc});
                }
                setState(preState => ({...preState, location: loc}));
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
                            if (!trigger) {
                                getLocation(_searchObj, trigger);
                            }
                        })
                        .catch(() => {
                            alert(strings.location_warning);
                        });
                }
            });
    };

    const handleSearch = () => {
        const {location} = state;
        if (
            state.radiusIndicator &&
            (!location || (location && location.trim().length === 0))
        ) {
            getLocation(state, false);
        } else {
            onSearch(state);
        }
    };

    return (
        <React.Fragment>
            <Text style={styles.searchTitle}>
                {/*{'Search for business/charity/NFP here:'}*/}
                {'Search for Business/Charity/NFP to Collab:'}
            </Text>
            <SearchBar
                placeholder={strings.collabSpaceSearchPlaceHolder}
                onChange={onChange}
                defValue={state.keyword}
                onSearch={handleSearch}
                isCollab={true}
            />

            {state.radius && (
                <Pressable
                    onPress={() => setSettingsVisible(true)}
                    style={styles.radiusIndicatorWarp}>
                    <Text style={styles.riLabel}>{`Within ${
                        state.radius / 1000
                    } km radius`}</Text>
                    <View
                        style={[
                            styles.radiusIndicator,
                            state.radiusIndicator === true
                                ? styles.radiusActive
                                : styles.radiusInactive2,
                        ]}
                    />
                </Pressable>
            )}
            <LineView spacing={5}/>
            {settingsVisible && (
                <SettingsPopup
                    visibility={true}
                    initConfig={state}
                    onDismiss={() => setSettingsVisible(false)}
                    onSave={saveConfig}
                />
            )}
        </React.Fragment>
    );
}

const styleSheet = ({colors}) =>
    StyleSheet.create({
        radiusIndicatorWarp: {
            alignSelf: 'flex-end',
            alignItems: 'center',
            justifyContent: 'center',
            alignContent: 'center',
            marginHorizontal: '5%',
            flexDirection: 'row',
        },
        radiusIndicator: {width: 12, height: 12, borderRadius: 20, marginLeft: 5},
        radiusActive: {backgroundColor: '#00f03a'},
        radiusInactive: {backgroundColor: '#ec1b21'},
        radiusInactive2: {backgroundColor: '#c2c2c2'},
        riLabel: {
            fontSize: scale.font.s,
            color: colors.textPrimaryDark,
            marginTop: Platform.OS === 'ios' ? 2 : 0,
        },
        searchTitle: {
            color: colors.collabSpaceTitle,
            width: '90%',
            marginHorizontal: '5%',
            marginBottom: 10,
            marginTop: 10,
            fontSize: scale.font.l,
        },
    });
