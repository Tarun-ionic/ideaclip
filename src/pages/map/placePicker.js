/* eslint-disable react-hooks/exhaustive-deps */
// noinspection JSUnresolvedVariable,NpmUsedModulesInstalled

import React, {useEffect, useRef, useState} from 'react';
import logger from '../../lib/logger';
import {StyleSheet, View} from 'react-native';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import {MAP_AUTO_COMPLETE_KEY} from '@env';
import {ProgressLoader, SafeScreenView} from '../../index';
import {useBackHandler} from '../../utilities/helper';
import {useAlert} from '../../context/AlertContext';
import Button from 'react-native-button';
import {useTheme} from '../../context/ThemeContext';
import {useNavigation, useRoute} from '@react-navigation/native';
import apolloLib from '../../lib/apolloLib';
import {queries} from '../../schema';
import {strings} from '../../constant/strings';
import AppBar from '../../screens/components/toolbar/appBar';
import scale from '../../utilities/scale';
import {useSession} from "../../context/SessionContext";

function PlacePicker() {
    const session = useSession();

    const alert = useAlert();
    const navigation = useNavigation();
    const route = useRoute();
    const {callback, screen, country, isCharity} = route.params;
    const {theme} = useTheme();
    const styles = PlacePickerStyles(theme);
    const mapStyles = MapStyles(theme);
    const [place, setPlace] = useState({});
    const [loading, setLoading] = useState(false);
    const ref = useRef();
    const onBackPress = () => {
        navigation.goBack(null);
    };
    useBackHandler(() => {
        onBackPress();
    }, []);

    const redirectToBase = () => {
        if (typeof callback === 'function') {
            callback(place);
            navigation.goBack(null);
        } else {
            navigation.navigate(screen ? screen : 'InitialSetupBusiness', {
                ...route.params,
                selectedPlace: place,
            });
        }
    };

    const skip = () => {
        navigation.navigate(screen ? screen : 'InitialSetupBusiness', {
            ...route.params,
            selectedPlace: {},
        });
    };

    const businessCheck = (place_id, _callback) => {
        setLoading(true);
        apolloLib.client(session)
            .query({
                fetchPolicy: 'no-cache',
                query: queries.placeStatus,
                variables: {place_id},
            })
            .then(({data, error}) => {
                setLoading(false);
                if (data.placeStatus) {
                    _callback(data.placeStatus.isUsed);
                }
                if (error) {
                    alert(strings.something_went_wrong);
                }
            })
            .catch(logger.e);
    };

    useEffect(() => {
        if (place.name) {
            businessCheck(place.placeId, isUsed => {
                ref.current?.clear();
                if (isUsed) {
                    alert({
                        title: strings.location_mismatch,
                        message: `The following address is already used in another account.\n\n${place.name}\n${place.address}\n\n${
                            isCharity
                                ? strings.alread_used_message_charity
                                : strings.alread_used_message_business
                        }`,
                    });
                } else {
                    alert({
                        title: isCharity
                            ? strings.confirm_location_charity
                            : strings.confirm_location,
                        message: `${
                            isCharity
                                ? strings.confirm_location_alert_charity
                                : strings.confirm_location_alert
                        }\n\n${place.name}\n${place.address}`,
                        buttons: [
                            {label: strings.no, callback: () => setPlace({})},
                            {label: strings.yes, callback: redirectToBase},
                        ],
                    });
                }
            });
        }
    }, [place]);

    return (
        <SafeScreenView secondary translucent={typeof callback === 'function'}>
            <AppBar
                // gradiant={!callback}
                title={`Find Your ${isCharity ? 'Charity/NFP' : 'Business'}`}
                onBackPress={callback ? onBackPress : false}
            />
            <View style={styles.autoSearch}>
                <GooglePlacesAutocomplete
                    ref={ref}
                    styles={mapStyles}
                    currentLocation={true}
                    enableHighAccuracyLocation={true}
                    placeholder={`Search for Your ${isCharity ? 'Charity/NFP' : 'Business'}`}
                    minLength={2} // minimum length of text to search
                    autoFocus={true}
                    returnKeyType={'search'}
                    fetchDetails={true}
                    renderDescription={row => row.description}
                    enablePoweredByContainer={false}
                    listUnderlayColor="lightgrey"
                    onPress={(data, details) => {
                        const location = details.geometry.location;
                        const coordinate = {
                            latitude: location.lat,
                            longitude: location.lng,
                        };
                        setPlace({
                            coordinate,
                            name: details.name,
                            placeId: details.place_id,
                            address: details.formatted_address,
                        });
                    }}
                    autoFillOnNotFound
                    onFail={error => logger.e('error', error, MAP_AUTO_COMPLETE_KEY)}
                    query={{
                        key: MAP_AUTO_COMPLETE_KEY,
                        language: 'en',
                        components: country.length > 0 ? `country:${country}` : '',
                    }}
                />

                {!callback && (
                    <View style={styles.skipLayout}>
                        <View style={styles.nextContent}>
                            <Button
                                containerStyle={styles.skipContainer}
                                style={styles.nextButton}
                                onPress={skip}>
                                skip{' '}
                            </Button>
                        </View>
                    </View>
                )}
            </View>
            <ProgressLoader visible={loading}/>
        </SafeScreenView>
    );
}

const PlacePickerStyles = ({colors}) =>
    StyleSheet.create({
        autoSearch: {
            overflow: 'hidden',
            zIndex: 2,
            height: '100%',
            width: '100%',
            backgroundColor: colors.primaryDark,
        },
        skipLayout: {right: 30, bottom: 100, zIndex: 5, position: 'absolute'},
        skipContainer: {
            padding: 10,
            overflow: 'hidden',
            width: scale.ms(75),
            borderRadius: 5,
            backgroundColor: colors.primary,
            alignContent: 'center',
            alignItems: 'center',
        },
        nextButton: {fontSize: scale.font.s, color: colors.textPrimaryDark},
    });

const MapStyles = ({colors}) =>
    StyleSheet.create({
        container: {
            flex: 1,
            height: '100%',
        },
        textInputContainer: {
            flexDirection: 'row',
        },
        textInput: {
            backgroundColor: colors.primary,
            borderColor: colors.secondaryDark,
            color: colors.textPrimaryDark,
            borderWidth: 1,
            height: 44,
            borderRadius: 20,
            paddingVertical: 10,
            paddingHorizontal: 10,
            fontSize: scale.font.s,
            margin: 10,
            flex: 1,
        },
        poweredContainer: {
            justifyContent: 'flex-end',
            alignItems: 'center',
            borderBottomRightRadius: 5,
            borderBottomLeftRadius: 5,
            borderColor: '#c8c7cc',
            borderTopWidth: 0.5,
        },
        powered: {},
        listView: {
            height: 225,
            marginHorizontal: 10,
            marginTop: 5,
            // borderColor:colors.secondaryDark,
            // borderWidth:1
        },
        row: {
            backgroundColor: colors.primary,
            padding: 13,
            height: 44,
            flexDirection: 'row',
        },
        separator: {
            height: 0.5,
            backgroundColor: '#c8c7cc',
        },
        description: {
            color: colors.textPrimaryDark,
        },
        loader: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            height: 20,
        },
    });

export default React.memo(PlacePicker);
