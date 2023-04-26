/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useRef} from 'react';
import {BackHandler, Platform, Text} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import {pcTypes, userNameChars, userType, viewWidth} from './constant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import apolloLib from '../lib/apolloLib';
import {mutations} from '../schema';
import logger from '../lib/logger';

import _ from 'lodash';
import Moment from 'moment';
import FlashDeal from '../components/ideanGallery/flashDeal';
import firestore from '@react-native-firebase/firestore';
import EventBoost from '../components/ideanGallery/eventBoost';
import MyDiaryMode from '../components/ideanGallery/myDiaryMode';
import VolunteersNeeded from "../components/ideanGallery/volunteersNeeded";
import notify from "../services/notify";

export const navigationReset = (navigation, name, params = {},triggerNotify = false) => {
    if(triggerNotify === true) {
        notify.trigger(navigation).then(() => {
            navigation.reset({
                index: 0,
                routes: [{name, params}],
            });
        });
    } else {
        navigation.reset({
            index: 0,
            routes: [{name, params}],
        });
    }


}

export const split = (string, length = 15) => {
    // Split text into individual words and count length
    const words = string.split(' ');
    const count = words.length;
    const or_len = string.length;
    let split_len = 0;

    // Prepare elements and position tracker
    const elements = [];
    let position = 0;

    // Loop through words whilst position is less than count
    while (position < count) {
        // Prepare text for specified length and increment position
        const text = words.slice(position, length).join(' ');
        position += length;
        split_len += text.length;

        // Append text element
        elements.push(<Text>{text}</Text>);
    }

    if (or_len > split_len) {
        elements.push(<Text>{'...'}</Text>);
    }
    return elements;
};

export const loadPopup = (callBack, params = {}) => {
    if (typeof callBack === 'function') {
        if (Platform.OS === 'ios') {
            setTimeout(() => {
                callBack(params);
            }, 500)
        } else {
            callBack(params);
        }
    }
}


export const compareObjects = (a, b) => {
    return _.isEqual(a, b);
};
export const uniqueArray = arr => {
    return _.uniq(arr);
};

export function useBackHandler(handler, deps) {
    const isFocused = useIsFocused();
    useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', () => {
            if (isFocused) {
                handler();
            }
            return isFocused;
        });

        return () => BackHandler.removeEventListener('hardwareBackPress', handler);
    }, [deps]);
}

export const getRegion = (lat, lon, distance = 500) => {
    const circumference = 40075;
    const oneDegreeOfLatitudeInMeters = 111.32 * 1000;
    const angularDistance = distance / circumference;

    const latitudeDelta = distance / oneDegreeOfLatitudeInMeters;
    const longitudeDelta = Math.abs(
        Math.atan2(
            Math.sin(angularDistance) * Math.cos(lat),
            Math.cos(angularDistance) - Math.sin(lat) * Math.sin(lat),
        ),
    );

    return {
        latitude: lat,
        longitude: lon,
        latitudeDelta,
        longitudeDelta,
    };
};

export const checkEmail = email => {
    return new Promise((resolve, reject) => {
        const re =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[|0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (re.test(String(email).toLowerCase().trim())) {
            resolve();
        } else {
            reject();
        }
    });
};

export const checkUserName = name => {
    return new Promise((resolve, reject) => {
        let i = 0;
        let a = true;
        for (i in name) {
            if (userNameChars.indexOf(name[i]) === -1) {
                a = false;
                break;
            }
        }
        if (a) {
            if (name.split('.').length - 1 > 1) {
                reject('multi dot');
            } else {
                resolve();
            }
        } else {
            reject('incorrect character');
        }
    });
};
export const updateDeviceToken = async (uid, session) => {
    const token = await AsyncStorage.getItem('cloudMessageToken');
    const variables = {
        userId: uid,
        data: {
            token: token,
            notificationStatus: true,
            location: '',
            osType: Platform.OS,
            deviceInfo: `${await DeviceInfo.getDeviceName()} ${DeviceInfo.getBrand()} ${await DeviceInfo.getManufacturer()} ${DeviceInfo.getBundleId()} ${DeviceInfo.getBuildNumber()} ${DeviceInfo.getDeviceId()}`,
            deviceId: DeviceInfo.getUniqueId(),
        },
    };

    await apolloLib
        .client(session)
        .mutate({
            mutation: mutations.addToken,
            variables,
        })
        .then()
        .catch(error => logger.e('session context ', 'tokenUpdater', error));
};

export const onTrigger = (callBack, params) => {
    if (typeof callBack === 'function') {
        callBack(params);
    }
};
export const getUserType = type => {
    if (type === userType.business) {
        return 'business';
    } else {
        if (type === userType.charity) {
            return 'charity / NFP';
        } else {
            return 'general user';
        }
    }
};

export const showFlash = (item, width, top = 0, right = 0,onlyPrivate=false) => {
    const size = width * viewWidth.stickers
    if(onlyPrivate){
        if (item?.isPrivate === true) {
            return <MyDiaryMode size={size} offset={{top, right}}/>;
        }
    }else {
        if (item?.isPrivate === true) {
            return <MyDiaryMode size={size} offset={{top, right}}/>;
        } else if (item.type === pcTypes.flashDeal) {
            return <FlashDeal size={size} item={item} offset={{top, right}}/>;
        } else if (
            item.type === pcTypes.charityEventBoost ||
            item.type === pcTypes.businessEventBoost
        ) {
            return <EventBoost size={size} type={item.type} offset={{top, right}}/>;
        } else if (item.type === pcTypes.volunteerNeeded) {
            return <VolunteersNeeded size={size} offset={{top, right}}/>;
        } else {
            return null;
        }
    }
};


export function checkSize(data, fileSize) {
    let a = data?.filter(file => file?.size > fileSize) || []
    return a?.length > 0
}

export function userRef(uid) {
    return firestore().collection('userList').doc(uid);
}

const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

export function niceBytes(x) {

    let l = 0, n = parseInt(x, 10) || 0;

    while (n >= 1024 && ++l) {
        n = n / 1024;
    }

    return (n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l]);
}

export function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const value = parseFloat((bytes / Math.pow(k, i)).toFixed(dm))
    if (value / 100 > 1) {
        return parseFloat((bytes / Math.pow(k, i + 1)).toFixed(dm)) + ' ' + sizes[i + 1];
    } else
        return value + ' ' + sizes[i];
}

export const useDebounce = () => {
    const busy = useRef(false);
    const debounce = (callback) => {
        setTimeout(() => {
            busy.current = false;
        }, 2000);

        if (!busy.current) {
            busy.current = true;
            typeof callback === "function" && callback();
        }
    };
    return {debounce};
};