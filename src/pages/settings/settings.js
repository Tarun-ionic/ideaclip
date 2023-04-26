/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {FlatList, Image, Linking, Pressable, Text, View} from 'react-native';

import {loadPopup, useBackHandler} from '../../utilities/helper';
import {apollo, icons, lottie, SafeScreenView} from '../../index';
import {loginMethods, webURLs} from '../../utilities/constant';
import {useTheme} from '../../context/ThemeContext';
import SettingsStyle from '../../system/styles/settingsStyle';
import {useNavigation, useRoute} from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import AppBar from '../../screens/components/toolbar/appBar';
import {useSession} from "../../context/SessionContext";
import {queries} from "../../schema";
import ArchiveRequestReason from "../../components/settings/archiveRequestReason";
import LottieView from "lottie-react-native";
import logger from "../../lib/logger";
import SimpleToast from "react-native-simple-toast";
import AlertPopup from "../../screens/components/utility/alertPopup";
import {strings} from "../../constant/strings";
import {admin} from "../../../../api/functions/system/core/firebase";

export default function Settings() {
    const navigation = useNavigation();
    const route = useRoute();
    const session = useSession()
    const {user} = route.params;
    const {theme} = useTheme();
    const styles = SettingsStyle(theme);
    const [isArchived, setIsArchived] = useState(false)
    const [showArchivePopup, setShowArchivePopup] = useState(false)
    const [contactData, setContactData] = useState({})
    const [loading, setLoading] = useState(true)
//alert states
    const [alertVisibility, setAlertVisibility] = useState(false);
    const [link, setLink] = useState('');
    const onBackPress = () => navigation.goBack(null);
    useBackHandler(() => {
        onBackPress();
    }, []);

    useEffect(() => {
        apollo.client(session)
            .query({
                fetchPolicy: 'no-cache',
                query: queries.isArchiveRequested,
                variables: {
                    userId: user.uid
                }
            }).then(({data}) => {
            const {isRequested} = data
            setIsArchived(isRequested ?? false)
            setLoading(false)
        })
    }, [])

    useEffect(() => {
        apollo.client(session)
            .query({
                fetchPolicy: 'no-cache',
                query: queries.getContactInfo,
            }).then(({data}) => {
            const {getContactInfo} = data
            setContactData(getContactInfo)
        })
    }, [])

    const settingsItems = () => {
        let a = [];
        if (route?.params?.user?.loginMethod === loginMethods.email) {
            a.push({
                label: 'Change password',
                icon: icons.changePassword,
                iconStyle: {},
                callback: () => {
                    navigation.navigate('ChangePassword', {user: {...user}});
                },
            });
        }
        a.push({
            label: 'Resource Download',
            icon: icons.download,
            iconStyle: {},
            callback: () => {
                Linking.canOpenURL(webURLs.resourceUrl).then(supported => {
                    if (supported) {
                        Linking.openURL(webURLs.resourceUrl).then()
                    } else {
                        logger.i("Unable to open URI: " + webURLs.resourceUrl);
                    }
                });
            },
        });

        a.push({
            label: 'Contact Us',
            icon: icons.contactus2,
            iconStyle: {},
            callback: () => {
                if (Object.keys(contactData).length > 0 && contactData?.uid !== null) {
                    navigation.push('PersonalSpace', {
                        user: user,
                        profile: contactData,
                        goBack: true,
                    });
                } else {
                    SimpleToast.show("Something went wrong. please try again later.")
                }
            },
        });

        a.push(
            {
                label: 'FAQ',
                icon: icons.faq,
                iconStyle: {},
                callback: () => {
                    Linking.openURL(webURLs.faq).then();
                },
            },
            {
                label: 'Watch Explainer Animation',
                icon: icons.about,
                iconStyle: {},
                callback: () => {
                    Linking.openURL(webURLs.home).then();
                },
            },
            {
                label: isArchived ? 'Request Submitted for Archival' : 'Request Archival of My Account',
                icon: icons.archive,
                iconStyle: {},
                callback: () => {
                    if (!isArchived) {
                        setShowArchivePopup(true)
                    } else{
                        loadPopup(setAlertVisibility, true)
                    }
                },
            },
        );
        return a;
    };


    const listRender = ({item}) => {
        return (
            <Pressable onPress={item.callback}>
                <View style={styles.container}>
                    <Image source={item.icon} style={[styles.icon, item.iconStyle]}/>
                    <Text style={styles.label}>{item.label}</Text>
                </View>
            </Pressable>
        );
    };

    return (
        <SafeScreenView translucent>
            <AppBar title={'Help'} onBackPress={() => navigation.goBack('')}/>
            {loading ?
                <LottieView
                    source={lottie.loader}
                    style={{margin: 10, height: 25, alignSelf: 'center'}}
                    autoPlay
                    loop
                />
                :
                <>
                    <FlatList
                        contentContainerStyle={{paddingBottom: 300}}
                        data={settingsItems()}
                        renderItem={listRender}
                        keyExtractor={(item, index) => {
                            return `${item.id}${item.name}${index}`;
                        }}
                        scrollEnabled={true}
                    />
                    <Text style={styles.version}>version {DeviceInfo.getVersion()} </Text>
                    {showArchivePopup &&
                    <ArchiveRequestReason onDismiss={() => {
                        setShowArchivePopup(false)
                    }} onRequestSuccess={() => {
                        setIsArchived(true)
                    }
                    }/>
                    }
                    {
                        alertVisibility &&
                        <AlertPopup buttons={[{label: strings.ok, callback: () => {
                                    loadPopup(setAlertVisibility, false)
                                }}]} message={strings.archiveSubmittedMessage1} type={'alert'} visibility={alertVisibility}
                                    onCancel={()=>{loadPopup(setAlertVisibility(false))}} cancellable={false}  message2={strings.archiveSubmittedMessage3} link={strings.archiveSubmittedMessage2} linkOnPress={()=>{
                            Linking.openURL(webURLs.adminMail);
                        }}/>
                    }
                </>
            }

        </SafeScreenView>
    );
}
