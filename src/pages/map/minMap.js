import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import scale from 'utilities/scale';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import {getRegion} from '../../utilities/helper';
import {clipBarIco} from '../../utilities/assets';
import {Avatar} from 'react-native-elements';
import {SafeScreenView} from '../../index';

function MinMap({location}) {
    const [region, setRegion] = useState(getRegion(-33.8688, 151.2093));
    const [init, setInit] = useState(false);
    useEffect(() => {
        if (location.coordinate.latitude && location.coordinate.longitude) {
            setInit(true);
            setRegion(
                getRegion(location.coordinate.latitude, location.coordinate.longitude),
            );
        }
    }, [location]);

    return (
        <SafeScreenView style={styles.miniContainer}>
            <MapView
                provider={PROVIDER_GOOGLE}
                showsUserLocation={false}
                toolbarEnabled={false}
                showsMyLocationButton={false}
                showsPointsOfInterest={false}
                style={styles.miniMap}
                mapType={'standard'}
                initialRegion={region}
                region={region}
                moveOnMarkerPress={false}
                zoomEnabled={false}
                scrollEnabled={false}>
                {init && <Marker coordinate={region}/>}
            </MapView>

            {location.coordinate ? (
                <View style={styles.nextLayout}>
                    <Avatar source={clipBarIco.gallery} style={styles.actionButton}/>
                    <View style={styles.nextContent}>
                        <Text style={styles.nextTitle}>
                            {location?.name?.replace(/\n/g, ' ')}
                        </Text>
                    </View>
                </View>
            ) : (
                <View style={styles.nextLayout}>
                    <View style={styles.nextContent}>
                        <Text style={styles.nextTitle}>{'No location added'}</Text>
                    </View>
                </View>
            )}
        </SafeScreenView>
    );
}

const styles = StyleSheet.create({
    miniContainer: {flex: 1,aspectRatio:1},
    miniMap: {...StyleSheet.absoluteFillObject, aspectRatio:1},
    nextContent: {
        flex: 1,
        flexDirection: 'column',
        paddingLeft: 10,
        alignContent: 'center',
    },
    nextLayout: {
        bottom: 30,
        left: 30,
        right: 30,
        zIndex: 10,
        position: 'absolute',
        flexDirection: 'row',
        borderRadius: 5,
        backgroundColor: 'white',
        padding: 15,
        alignContent: 'center',
        alignItems: 'center',
    },
    actionButton: {
        height: 40,
        width: 40,
        padding: 10,
        borderRadius: 50,
        backgroundColor: '#efefef',
    },
    nextTitle: {fontSize: scale.font.s, color: 'black'},
});

export default React.memo(MinMap);
