/* eslint-disable react-hooks/exhaustive-deps,no-shadow,no-alert */
// noinspection DuplicatedCode,JSUnresolvedFunction,JSUnresolvedVariable

import React, {useEffect, useRef, useState} from 'react';
import {Clipboard, Image, Platform, Pressable, ScrollView, Text, TouchableOpacity, View,} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useNavigation, useRoute} from '@react-navigation/native';
import {ImagePicker} from '../../../components';
import {Icon} from 'react-native-elements';
import {loginMethods, businessData, stringKeys, userType} from '../../../utilities/constant';
import Toast from 'react-native-simple-toast';
import Dropdown from '../../../components/dropdown/Dropdown';
import States from '../../profile/components/States';
import AuthenticatingTextBox from '../../profile/components/AuthenticatingTextBox';
import {mutations, queries} from '../../../schema';
import {useTheme} from '../../../context/ThemeContext';
import ProfileStyles from '../../../system/styles/profileStyles';
import MinMap from '../../map/minMap';
import {useSession} from '../../../context/SessionContext';
import {strings} from '../../../constant/strings';
import ABNTextBox from '../../profile/components/ABNTextBox';
import IndustryOfInterestAutofillDropDown from '../../profile/components/IndustryOfInterestAutofillDropDown';
import Country from '../../profile/components/Country';
import Phonenumber from '../../profile/components/Phonenumber';
import {icons, ProgressLoader, RoundButton, SafeScreenView} from '../../../index';
import apollo from '../../../lib/apolloLib';
import {useBackHandler} from '../../../utilities/helper';
import AppBar from '../../../screens/components/toolbar/appBar';

import EthnicCommunitiesAutofillDropDown from '../../profile/components/EthnicCommunitiesAutofillDropDown';
import NickName from '../../profile/components/NickName';
import TextInputBox from '../../profile/components/TextInputBox';
import {useAlert} from '../../../context/AlertContext';
import onShare from "../../../screens/components/utility/share";
import Email from "../../profile/components/email";

export default function BusinessProfileInitialize() {
    const scroll = useRef();
    const alert = useAlert();
    const navigation = useNavigation();
    const {theme} = useTheme();
    const {colors} = theme;
    const styles = ProfileStyles(theme);
    const route = useRoute();
    const session = useSession();
    const [user, setUser] = useState({...businessData});
    const [originalData, setOriginalData] = useState({...businessData});
    const [saving, setSaving] = useState(false);
    const [ABNErrors, setABNErrors] = useState(false);
    const [currentTab, setCurrentTab] = useState('basicInfo');
    const [currentDropDown, setCurrentDropDown] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imageFileThumb, setImageFileThumb] = useState(null);
    const userInfo = route.params?.user || {};
    const {selectedPlace, isEdit} = route.params;
    const [nicknameError, setNicknameError] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [userVerified, setUserVerified] = useState(isEdit);
    const [emailVerified, setEmailVerified] = useState(isEdit);
    const [ABNVerified, setABNVerified] = useState(true);
    const [referralCode, setReferralCode] = useState('');

    const businessChannelOptions = [
        {label: 'Physical location', value: 'physicalLocation'},
        {label: 'Online', value: 'online'},
        {label: 'Social media platform', value: 'socialMediaPlatform'},
        {label: 'Door to door sales', value: 'doorToDoorSales'},
        {label: 'Other', value: 'other'},
    ];

    const emptyMessage = {
        orgName: 'Registered business name field should not be empty.',
        firstName: 'First name field should not be empty.',
        lastName: 'Last name field should not be empty.',
        phoneNumber: '',
    };

    const errorMessage = {
        orgName: '',
        firstName: '',
        lastName: '',
        phoneNumber: 'Mobile number should be a 10 digit number',
    };

    const errorKey = {
        firstName: 'firstNameError',
        lastName: 'lastNameError',
        phoneNumber: 'phoneNumberError',
        displayName: 'nickNameError',
        ABN: 'ABNError',
        email: 'emailError'
    };

    useBackHandler(() => {
        onBackPress();
        return route.name === 'InitialSetupBusiness';
    }, []);

    useEffect(() => {
        if (currentTab && currentTab !== '') {
            scroll?.current?.scrollTo({y: 0, animated: true});
        }
    }, [currentTab]);

    useEffect(() => {
        if (
            user.email &&
            !user.placeId &&
            selectedPlace &&
            Object.keys(selectedPlace).length > 0
        ) {
            const userData = {
                ...user,
                displayName: selectedPlace.name.replace(/\n/g, ' '),
                placeId: selectedPlace.placeId,
            };
            setUser({...userData});
            setOriginalData({...userData});
        }
    }, [user]);

    useEffect(() => {
        const _user = route.params.user;
        if (_user) {
            addUserData(_user);
            if (isEdit) {
                getUser(_user.uid);
            }
        }
    }, [route.params]);

    const onBackPress = () => {
        if (isEdit) {
            navigation.goBack(null);
        }
    };

    function addUserData(_userInfo) {
        if (selectedPlace && Object.keys(selectedPlace).length > 0) {
            const userData = {
                ..._userInfo,
                displayName: selectedPlace.name.replace(/\n/g, ' '),
                placeId: selectedPlace.placeId,
                placesName: selectedPlace.name,
                latitude: String(selectedPlace.coordinate.latitude),
                longitude: String(selectedPlace.coordinate.longitude),
            };
            setUser(userData);
            setOriginalData(userData);
        } else {
            setUser(_userInfo);
            setOriginalData(_userInfo);
        }
    }

    const convertBusinessData = data => {
        const {userProfile} = data;
        const phone = {
            phNumber: userProfile?.phoneNumber?.phNumber,
            countryCode: userProfile?.phoneNumber?.countryCode || 'AU',
            phoneCode: userProfile?.phoneNumber?.phoneCode || '+61',
        };
        const orgPhone = {
            phNumber: userProfile?.orgMobile?.phNumber,
            countryCode: userProfile?.orgMobile?.countryCode || 'AU',
            phoneCode: userProfile?.orgMobile?.phoneCode || '+61',
        };
        const userData = {
            ...user,
            uid: data.uid,
            userType: data.userType,
            loginMethod: data.loginMethod,
            displayName: data.displayName,
            profileImage: data.profileImage,
            email: data.email,
            orgName: data.orgName,
            ...userProfile,
            phoneNumber: phone,
            orgMobile: orgPhone,
        };
        setUser({...userData});
        setOriginalData({...userData});
    };

    const getUser = uid => {
        apollo
            .client(session)
            .query({
                fetchPolicy: 'no-cache',
                variables: {id: uid},
                query: queries.getBusinessProfile,
            })
            .then(({data}) => {
                if (data) {
                    setReferralCode(data?.profile?.referralCode || 'Not found');
                    convertBusinessData(data?.profile);
                }
            })
            .catch();
    };

    const imageUploaded = (status, name, thumb) => {
        if (status) {
            const dp = { profileImage: 'dp/' + userInfo.uid + '/' + name + '.jpg',profileImageB64: thumb}
            session.update({...originalData,...dp});
            setUser({...user,...dp});
            setOriginalData({...originalData,...dp});
        }
    };

    const imageRemove = () => {
        setUser({...user, profileImage: '', profileImageB64: ''});
    };

    function setSelectedValue(label, value) {
        if (label === 'ethnicCommunity') {
            if(value && value?.length>0) {
                const ethnicity = user?.ethnicCommunity ? [...user?.ethnicCommunity] : [];
                let index = ethnicity.indexOf(value);
                if (index >= 0) {
                    ethnicity.splice(index, 1);
                    setUser({...user, [label]: ethnicity});
                } else {
                    ethnicity.push(value);
                    setUser({...user, [label]: ethnicity});
                }
            }
        } else if (label === 'businessChannel') {
            setUser({...user, [label]: [value]});
        } else if (label === 'interestsIndustry') {
            if (value && value?.length > 0) {
                let interestsIndustry = user?.industryList ? [...user?.industryList] : [];
                let index = interestsIndustry.indexOf(value);
                if (index >= 0) {
                    interestsIndustry.splice(index, 1);
                    setUser({...user, industryList: interestsIndustry});
                } else {
                    interestsIndustry.push(value);
                    setUser({...user, industryList: interestsIndustry});
                }
            }
            // else if (label === errorKey.ABN) {
            //     setABNErrors(value);
            // }
        }
        else if (label === errorKey.displayName) {
            setNicknameError(value);
        } else if (label === errorKey.email) {
            setEmailError(value);
        } else {
            setUser({...user, [label]: value});
        }
    }

    function openedDropDown(name) {
        setCurrentDropDown(name);
    }

    const updateUser = () => {
        setSaving(true);
        apollo
            .client(session)
            .mutate({
                fetchPolicy: 'no-cache',
                variables: {
                    ...user,
                    userType: userType.business,
                },
                mutation: mutations.updateBusiness,
            })
            .then(() => {
                Toast.show(strings.profile_updated);
                session.update({...user});
                setTimeout(() => {
                    setSaving(false);
                    setOriginalData(user);
                }, 3000)

            })
            .catch(() => {
                setSaving(false);
                alert(strings.profile_update_failed);
            });
    };

    const redirect = () => {
        setSaving(false);
        navigation.navigate('CreateUser', {
            ...route.params,
            user: {...user, userType: userType.business},
            referralCode: route?.params?.referralCode ?? '',
            imageFile,
            imageFileThumb,
            callback: uid => {
                setUser({...user, uid});
            },
        });
    };

    function checkFormData() {
        if (!user.orgName) {
            Toast.show(strings.enter_business_name);
        } else if (nicknameError || !userVerified) {
            Toast.show('Enter a unique username');
        } else if (!user.displayName) {
            Toast.show('Enter a unique username');
        } else if (emailError) {
            Toast.show('Enter an unique email address');
        } else if (!user.email || !emailVerified) {
            Toast.show('Enter an unique email address');
        }
        // else if (ABNErrors || !ABNVerified) {
        //     Toast.show(strings.enter_valid_ABN);
        // } else if (!user.ABN) {
        //     Toast.show(strings.enter_ABN);
        // }
        else if (isEdit) {
            updateUser();
        } else {
            redirect();
        }
    }

    const changeTab = tab => {
        setCurrentTab(currentTab === tab ? '' : tab);
    };

    const onPlaceCallback = place => {
        if (place && Object.keys(place).length > 0) {
            setUser({
                ...user,
                placeId: place.placeId,
                latitude: `${place.coordinate.latitude}`,
                longitude: `${place.coordinate.longitude}`,
                placesName: place.name,
            });
        }
    };

    const mapLocation = {
        coordinate: {
            latitude: parseFloat(user.latitude),
            longitude: parseFloat(user.longitude),
        },
        placeId: user.placeId,
        name: user.placesName,
    };

    const setCountryCode = (country, type) => {
        const code = user[type] || {};
        if (country.callingCode && country.callingCode.length > 0) {
            code.phoneCode = `+${country.callingCode[0]}`;
            code.countryCode = country.cca2;
            setUser({...user, [type]: code});
        } else {
            code.countryCode = country.cca2;
            setUser({...user, [type]: code});
        }
    };

    const navigate2PlacePicker = () => {
        navigation.push('PlacePicker', {
            callback: onPlaceCallback,
            screen: 'InitialSetupBusiness',
            country: user.countryCode,
            isCharity: false,
        });
    };

    const emailEditor = () => {
        if (isEdit === true) {
            return <TextInputBox
                colors={colors}
                label="E-mail Address"
                value={user.email}
                onChangeText={text => setUser({...user, email: text})}
                mode="outlined"
                editable={false}
                style={styles.InputBox}
            />
        } else if (originalData?.loginMethod, (!originalData?.email || (originalData?.email && originalData?.email?.trim().length === 0))) {
            return <Email
                verified={setEmailVerified}
                value={user.email}
                setValue={setSelectedValue}
                original={originalData.email}
            />
        } else {
            return <TextInputBox
                colors={colors}
                label="E-mail Address"
                value={user.email}
                onChangeText={text => setUser({...user, email: text})}
                mode="outlined"
                editable={false}
                style={styles.InputBox}
            />
        }
    }

    return (
        <SafeScreenView
            style={styles.screenContainer}
            translucent={isEdit ? true : Platform.OS === 'ios'}
            colors={['#e50012', '#0359a7']}
            locations={[0.4, 0.9]}>
            <AppBar
                // gradiant={!isEdit}
                title={'Profile'}
                onBackPress={isEdit ? onBackPress : false}
            />

            <ScrollView style={styles.keyboardScroll} ref={scroll}>
                <KeyboardAwareScrollView
                    style={styles.keyboardScroll}
                    keyboardShouldPersistTaps="never"
                    nestedScrollEnabled={true}>
                    {/*Profile Image Picker*/}
                    <ImagePicker
                        uid={userInfo.uid}
                        uploadComplete={imageUploaded}
                        initialImage={user.profileImage}
                        initialImageThumb={user.profileImageB64}
                        removeImage={imageRemove}
                        userType={user.userType}
                        isCreation={isEdit}
                        saveFile={(file, thumb) => {
                            setImageFile(file);
                            setImageFileThumb(thumb);
                        }}
                    />

                    {/*Basic info*/}
                    <View style={styles.tabContainer}>
                        <TouchableOpacity onPress={() => changeTab('basicInfo')}>
                            <View style={styles.tabHeader}>
                                <Text style={styles.tabTitle}>Basic info</Text>
                                <Icon
                                    name={
                                        currentTab === 'basicInfo' ? 'chevron-up' : 'chevron-down'
                                    }
                                    type="material-community"
                                    color={colors.secondaryDark}
                                    size={20}
                                    style={styles.tabArrow}
                                />
                            </View>
                        </TouchableOpacity>

                        {currentTab === 'basicInfo' && (
                            <View style={styles.tabContent}>
                                <View style={[styles.lineStyle]}/>
                                <AuthenticatingTextBox
                                    label={strings.registered_business_account}
                                    value={user.orgName}
                                    setValue={setSelectedValue}
                                    emptyMessage={emptyMessage.orgName}
                                    errorMessage={errorMessage.orgName}
                                    originalValue={originalData.orgName}
                                    validate={text => {
                                        return new Promise(resolve => {
                                            if (text) {
                                                resolve(false);
                                            } else {
                                                resolve(true);
                                            }
                                        });
                                    }}
                                    labelKey={'orgName'}
                                />
                                <NickName
                                    verified={setUserVerified}
                                    value={user.displayName}
                                    setValue={setSelectedValue}
                                    originalName={originalData.displayName}
                                    initial={!isEdit}
                                />
                                <TextInputBox
                                    colors={colors}
                                    label="Business Tagline"
                                    value={user.slogan}
                                    onChangeText={text => setUser({...user, slogan: text})}
                                    maxLength={30}
                                    numberOfLines={2}
                                    mode="outlined"
                                    style={styles.InputBox}
                                />

                                <TextInputBox
                                    colors={colors}
                                    label="Website URL"
                                    value={user.websiteURL}
                                    onChangeText={text => setUser({...user, websiteURL: text})}
                                    mode="outlined"
                                    style={styles.InputBox}
                                />
                                <ABNTextBox
                                    verified={setABNVerified}
                                    value={user.ABN}
                                    setValue={setSelectedValue}
                                    originalValue={originalData.ABN}
                                    labelKey={'ABN'}
                                />
                                <Dropdown
                                    data={businessChannelOptions}
                                    other={user.businessChannelOther}
                                    label={strings.business_channel}
                                    value={
                                        user?.businessChannel && user.businessChannel.length > 0
                                            ? user.businessChannel[0]
                                            : ''
                                    }
                                    setValue={setSelectedValue}
                                    dataLabel={'businessChannel'}
                                    multiple={false}
                                />
                                <IndustryOfInterestAutofillDropDown
                                    value={user.industryList}
                                    setValue={setSelectedValue}
                                    current={currentDropDown}
                                    setCurrent={openedDropDown}
                                    isUser={false}
                                />
                                <EthnicCommunitiesAutofillDropDown
                                    value={user.ethnicCommunity}
                                    setValue={setSelectedValue}
                                    current={currentDropDown}
                                    setCurrent={openedDropDown}
                                />
                            </View>
                        )}
                    </View>

                    {/*Contact info*/}
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            onPress={() => {
                                changeTab('contactInfo');
                            }}>
                            <View style={styles.tabHeader}>
                                <Text style={styles.tabTitle}>Contact info</Text>
                                <Icon
                                    name={
                                        currentTab === 'contactInfo' ? 'chevron-up' : 'chevron-down'
                                    }
                                    type="material-community"
                                    color={colors.secondaryDark}
                                    size={20}
                                    style={styles.tabArrow}
                                />
                            </View>
                        </TouchableOpacity>

                        {currentTab === 'contactInfo' && (
                            <View style={styles.tabContent}>
                                <View style={[styles.lineStyle]}/>

                                <TextInputBox
                                    colors={colors}
                                    label="Representative's first name"
                                    value={user.firstName}
                                    onChangeText={text => setUser({...user, firstName: text})}
                                    mode="outlined"
                                    style={styles.InputBox}
                                />
                                <TextInputBox
                                    colors={colors}
                                    label="Representative's last name"
                                    value={user.lastName}
                                    onChangeText={text => setUser({...user, lastName: text})}
                                    mode="outlined"
                                    style={styles.InputBox}
                                />
                                <Phonenumber
                                    value={user?.phoneNumber?.phNumber}
                                    setValue={value => {
                                        let a = user.phoneNumber || '';
                                        a.phNumber = value;
                                        setUser({...user, phoneNumber: a});
                                    }}
                                    countryCode={user?.phoneNumber?.countryCode}
                                    setCountryCode={country =>
                                        setCountryCode(country, 'phoneNumber')
                                    }
                                    labelKey={'Mobile number'}
                                    phoneCode={user?.phoneNumber?.phoneCode}
                                />

                                {emailEditor()}

                                <TextInputBox
                                    colors={colors}
                                    label="Suburb"
                                    value={user.suburb}
                                    onChangeText={text => setUser({...user, suburb: text})}
                                    mode="outlined"
                                    style={styles.InputBox}
                                />
                                <TextInputBox
                                    colors={colors}
                                    label="City"
                                    value={user.location}
                                    onChangeText={text => setUser({...user, location: text})}
                                    mode="outlined"
                                    style={styles.InputBox}
                                />
                                {user.countryCode === stringKeys.countryCode ? (
                                    <States
                                        value={user.state}
                                        setValue={_state => setUser({...user, ..._state})}
                                    />
                                ) : (
                                    <TextInputBox
                                        colors={colors}
                                        label={strings.state}
                                        value={user.state}
                                        onChangeText={text =>
                                            setUser({...user, state: text, stateShort: null})
                                        }
                                        mode="outlined"
                                        style={styles.InputBox}
                                    />
                                )}

                                <Country
                                    code={user.countryCode}
                                    name={user.country}
                                    setValue={country => {
                                        setUser({
                                            ...user,
                                            state: '',
                                            countryCode: country.cca2,
                                            phoneCode: country.phoneCode,
                                            country: country.name,
                                            stateShort: null,
                                        });
                                    }}
                                />

                                <TextInputBox
                                    colors={colors}
                                    label="Post code"
                                    value={user.postCode}
                                    onChangeText={text => setUser({...user, postCode: text})}
                                    mode="outlined"
                                    style={styles.InputBox}
                                />

                                <Phonenumber
                                    value={user?.orgMobile?.phNumber}
                                    setValue={value => {
                                        let a = user.orgMobile;
                                        a.phNumber = value;
                                        setUser({...user, orgMobile: a});
                                    }}
                                    countryCode={user?.orgMobile?.countryCode}
                                    setCountryCode={country =>
                                        setCountryCode(country, 'orgMobile')
                                    }
                                    labelKey={'Business phone number'}
                                    phoneCode={user?.orgMobile?.phoneCode || ''}
                                />

                                {/*Place picker*/}
                                <View style={styles.minMapContainer}>
                                    <Text style={styles.labelTextView}>Business location</Text>
                                    <View style={styles.minMap}>
                                        <MinMap location={mapLocation}/>
                                    </View>


                                    <Pressable
                                        onPress={navigate2PlacePicker}
                                        style={styles.floatButton}>
                                        <Image
                                            source={icons.pen}
                                            style={{tintColor: colors.secondaryDark, margin: 7}}
                                            height={18}
                                            width={18}
                                            resizeMode="contain"
                                        />
                                    </Pressable>


                                </View>
                            </View>
                        )}
                    </View>

                    {/*Social Links*/}
                    <View style={styles.tabContainer}>
                        <TouchableOpacity onPress={() => changeTab('socialLinks')}>
                            <View style={styles.tabHeader}>
                                <Text style={styles.tabTitle}>Social Media (optional)</Text>
                                <Icon
                                    name={
                                        currentTab === 'socialLinks' ? 'chevron-up' : 'chevron-down'
                                    }
                                    type="material-community"
                                    color={colors.secondaryDark}
                                    size={20}
                                    style={styles.tabArrow}
                                />
                            </View>
                        </TouchableOpacity>
                        {currentTab === 'socialLinks' && (
                            <View style={styles.tabContent}>
                                <View style={[styles.lineStyle]}/>
                                <TextInputBox
                                    colors={colors}
                                    label="Facebook URL"
                                    value={user.fbLink}
                                    onChangeText={text => setUser({...user, fbLink: text})}
                                    mode="outlined"
                                    style={styles.InputBox}
                                />
                                <TextInputBox
                                    colors={colors}
                                    label="Twitter URL"
                                    value={user.twitterLink}
                                    onChangeText={text => setUser({...user, twitterLink: text})}
                                    mode="outlined"
                                    style={styles.InputBox}
                                />

                                <TextInputBox
                                    colors={colors}
                                    label="LinkedIn URL"
                                    value={user.linkedInLink}
                                    onChangeText={text => setUser({...user, linkedInLink: text})}
                                    mode="outlined"
                                    style={styles.InputBox}
                                />

                                <TextInputBox
                                    colors={colors}
                                    label="Youtube URL"
                                    value={user.youtubeLink}
                                    onChangeText={text => setUser({...user, youtubeLink: text})}
                                    mode="outlined"
                                    style={styles.InputBox}
                                />
                            </View>
                        )}
                    </View>

                    {/*Referral Code*/}
                    {isEdit && (
                        <View style={styles.tabContainer}>
                            <TouchableOpacity onPress={() => changeTab('referralCode')}>
                                <View style={styles.tabHeader}>
                                    <Text style={styles.tabTitle}>Referral Code</Text>
                                    <Icon
                                        name={
                                            currentTab === 'referralCode'
                                                ? 'chevron-up'
                                                : 'chevron-down'
                                        }
                                        type="material-community"
                                        color={colors.secondaryDark}
                                        size={20}
                                        style={styles.tabArrow}
                                    />
                                </View>
                            </TouchableOpacity>
                            {currentTab === 'referralCode' && (
                                <View style={styles.tabContent}>
                                    <View style={[styles.lineStyle]}/>
                                    <TextInputBox
                                        colors={colors}
                                        label="Referral Code"
                                        value={referralCode}
                                        mode="outlined"
                                        style={styles.InputBox}
                                        disabled
                                    />
                                    <View
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            marginTop: 5,
                                            paddingLeft: 14,
                                        }}>
                                        <RoundButton
                                            style={{width: 100}}
                                            labelStyle={{fontSize: 14}}
                                            onPress={() => {
                                                Clipboard.setString(referralCode);
                                                alert('Referral Code Copied');
                                            }}
                                            label={'Copy'}
                                        />
                                        <RoundButton
                                            style={{width: 100}}
                                            labelStyle={{fontSize: 14}}
                                            onPress={async () => {
                                                await onShare()
                                            }}
                                            label={'Share'}
                                        />
                                    </View>
                                </View>
                            )}
                        </View>
                    )}

                    <RoundButton
                        style={styles.saveButton}
                        onPress={checkFormData}
                        label={strings.save}
                    />
                    <ProgressLoader visible={saving}/>
                    <View style={styles.spacer}/>
                </KeyboardAwareScrollView>
            </ScrollView>
        </SafeScreenView>
    );
}
