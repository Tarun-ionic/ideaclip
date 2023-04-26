/* eslint-disable react-hooks/exhaustive-deps,react-native/no-inline-styles,no-alert */
// noinspection DuplicatedCode,JSUnresolvedVariable

import React, {useEffect, useRef, useState} from 'react';
import {Clipboard, Linking, Platform, ScrollView, Text, TouchableOpacity, View,} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useNavigation, useRoute} from '@react-navigation/native';
import {ImagePicker} from '../../../components';
import Moment from 'moment';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Icon} from 'react-native-elements';
import {loginMethods, stringKeys, userData, userStatus, userType, webURLs} from '../../../utilities/constant';
import Toast from 'react-native-simple-toast';
import EthnicCommunitiesAutofillDropDown from '../../profile/components/EthnicCommunitiesAutofillDropDown';
import IndustryOfInterestAutofillDropDown from '../../profile/components/IndustryOfInterestAutofillDropDown';
import States from '../../profile/components/States';
import NickName from '../../profile/components/NickName';
import AuthenticatingTextBox from '../../profile/components/AuthenticatingTextBox';
import {mutations, queries} from '../../../schema';
import {useTheme} from '../../../context/ThemeContext';
import ProfileStyles from '../../../system/styles/profileStyles';
import {ProgressLoader, RoundButton, SafeScreenView} from '../../../index';
import {useSession} from '../../../context/SessionContext';
import {strings} from '../../../constant/strings';
import Dropdown from '../../../components/dropdown/Dropdown';
import Phonenumber from '../../profile/components/Phonenumber';
import Country from '../../profile/components/Country';
import {useBackHandler} from '../../../utilities/helper';
import apollo from '../../../lib/apolloLib';
import AppBar from '../../../screens/components/toolbar/appBar';
import TextInputBox from '../../profile/components/TextInputBox';
import {useAlert} from '../../../context/AlertContext';
import onShare from "../../../screens/components/utility/share";
import Email from "../../profile/components/email";
import DatePicker from '../../profile/components/datePicker';

export default function UserProfileInitialize() {
    const scroll = useRef();
    const alert = useAlert();
    const navigation = useNavigation();
    const {theme} = useTheme();
    const {colors} = theme;
    const styles = ProfileStyles(theme);
    const route = useRoute();
    const session = useSession();
    const [user, setUser] = useState({...userData});
    const [originalData, setOriginalData] = useState({...userData});
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [saving, setSaving] = useState(false);
    const [nicknameError, setNicknameError] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [currentTab, setCurrentTab] = useState('basicInfo');
    const [currentDropDown, setCurrentDropDown] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imageFileThumb, setImageFileThumb] = useState(null);
    const userInfo = route.params?.user || {};
    const {isEdit} = route.params;
    const [userVerified, setUserVerified] = useState(isEdit);
    const [emailVerified, setEmailVerified] = useState(isEdit);
    const [referralCode, setReferralCode] = useState('');

    const genderOptions = [
        {label: 'Male', value: 'male'},
        {label: 'Female', value: 'female'},
        {label: 'Non-Binary', value: 'nonBinary'},
        {label: 'Prefer not to say', value: 'private'},
    ];

    const emptyMessage = {
        firstName: 'First name field should not be empty.',
        lastName: 'Last name field should not be empty.',
        phoneNumber: '',
    };

    const errorMessage = {
        firstName: '',
        lastName: '',
        phoneNumber: 'Mobile number should be a 10 digit number',
    };

    const errorKey = {
        firstName: 'firstNameError',
        lastName: 'lastNameError',
        displayName: 'nickNameError',
        phoneNumber: 'phoneNumberError',
        email: 'emailError'
    };

    useBackHandler(() => {
        onBackPress();
        return route.name === 'InitialSetup';
    }, []);

    useEffect(() => {
        if (currentTab && currentTab !== '') {
            scroll?.current?.scrollTo({y: 0, animated: true});
        }
    }, [currentTab]);

    useEffect(() => {
        if (isEdit) {
            getUser(userInfo.uid);
        } else {
            setUser(userInfo);
            setOriginalData(userInfo);
        }
    }, [route.params]);

    const onBackPress = () => {
        if (isEdit) {
            navigation.goBack(null);
        }
    };

    const convertUserData = data => {
        const {userProfile} = data;
        const phone = {
            phNumber: userProfile?.phoneNumber?.phNumber,
            countryCode: userProfile?.phoneNumber?.countryCode || 'AU',
            phoneCode: userProfile?.phoneNumber?.phoneCode || '+61',
        };
        const _userData = {
            ...userInfo,
            uid: data.uid,
            userType: data.userType,
            loginMethod: data.loginMethod,
            displayName: data.displayName,
            profileImage: data.profileImage,
            email: data.email,
            ...userProfile,
            phoneNumber: phone,
        };
        setUser({..._userData});
        setOriginalData({..._userData});
    };
    useEffect(()=>{
        if(user?.dob)
            if(date !== user?.dob)
                setDate(new Date(user.dob))
    },[user])

    const getUser = uid => {
        apollo
            .client(session)
            .query({
                fetchPolicy: 'no-cache',
                variables: {id: uid},
                query: queries.getUserProfile,
            })
            .then(({data}) => {
                if (data) {
                    setReferralCode(data?.profile?.referralCode || 'Not found');
                    convertUserData(data?.profile);
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

    const underAgeAlert = ()=>{
        alert({
            type: 'custom',
            title: 'IDEACLIP',
            content:
                (<Text style={styles.reasonLabel}>
                    {strings.underAgeMessage1}
                        <Text
                        style={styles.popUpLink}
                        onPress={() => {
                            alert.clear();
                            Linking.openURL(webURLs.privacyPolicy);
                        }}>
                            {strings.underAgeMessage2}
                    </Text>
                        {strings.underAgeMessage3}
                </Text>
            ),
            autoDismiss: false,
            cancellable: false,
            buttons: [
                {
                    label: strings.ok,
                    callback: () => {
                        alert.clear();
                    },
                },
            ],
        });
    }

    const onChange_dob_ios = (selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            const currentDate = selectedDate;
            let db_date = Moment(currentDate).format('DD MMM yyy');
            db_date = db_date.toString();
            setUser({...user, dob: db_date});
            setDate(currentDate);


            let dateObj = new Date();
            let currentMonth = dateObj.getUTCMonth() + 1; //months from 1-12
            let currentDay = dateObj.getUTCDate();
            let currentYear = dateObj.getUTCFullYear();
            let month = selectedDate.getUTCMonth() + 1; //months from 1-12
            let day = selectedDate.getUTCDate();
            let year = selectedDate.getUTCFullYear();
            if(currentYear-year<13){
                underAgeAlert()
            } else{
                if(currentYear-year==13) {
                    if (currentMonth < month) {
                        underAgeAlert()
                    } else {
                        if (currentMonth == month) {
                            if (currentDay < day) {
                                underAgeAlert()
                            }
                        }
                    }
                }
            }
        }
    };
    const onChange_dob = (event,selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            const currentDate = selectedDate;
            let db_date = Moment(currentDate).format('DD MMM yyy');
            db_date = db_date.toString();
            setUser({...user, dob: db_date});
            setDate(currentDate);


            let dateObj = new Date();
            let currentMonth = dateObj.getUTCMonth() + 1; //months from 1-12
            let currentDay = dateObj.getUTCDate();
            let currentYear = dateObj.getUTCFullYear();
            let month = selectedDate.getUTCMonth() + 1; //months from 1-12
            let day = selectedDate.getUTCDate();
            let year = selectedDate.getUTCFullYear();
            if(currentYear-year<13){
                underAgeAlert()
            } else{
                if(currentYear-year==13) {
                    if (currentMonth < month) {
                        underAgeAlert()
                    } else {
                        if (currentMonth == month) {
                            if (currentDay < day) {
                                underAgeAlert()
                            }
                        }
                    }
                }
            }
        }
    };

    const showDatepicker = () => {
        setShowDatePicker(true);
    };

    function setSelectedValue(label, value) {
        if (label === 'ethnicCommunity') {
           if(value && value?.length >0) {
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
        } else if (label === 'interestsIndustry') {
            const interestsIndustry = user?.interestsIndustry
                ? [...user?.interestsIndustry]
                : [];
            let index = interestsIndustry.indexOf(value);
            if (index >= 0) {
                interestsIndustry.splice(index, 1);
                setUser({...user, [label]: interestsIndustry});
            } else {
                interestsIndustry.push(value);
                setUser({...user, [label]: interestsIndustry});
            }
        } else if (label === 'displayName' || label === 'email') {
            setUser({...user, [label]: value});
        } else if (label === errorKey.displayName) {
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
                    userType: userType.general,
                },
                mutation: mutations.updateUser,
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
            user: {...user, userType: userType.general},
            referralCode: route?.params?.referralCode ?? '',
            imageFile,
            imageFileThumb,
            callback: uid => {
                setUser({...user, uid});
            },
        });
    };

    function checkFormData() {
        if (!user.firstName) {
            Toast.show('Enter  first name');
        } else if (!user.lastName) {
            Toast.show('Enter last name');
        } else if (nicknameError || !userVerified) {
            Toast.show('Enter an unique username');
        } else if (!user.displayName) {
            Toast.show('Enter an unique username');
        } else if (emailError) {
            Toast.show('Enter an unique email address');
        } else if (!user.email || !emailVerified) {
            Toast.show('Enter an unique email address');
        } else if (isEdit) {
            updateUser();
        } else {
            redirect();
        }
    }

    const changeTab = tab => {
        setCurrentTab(currentTab === tab ? '' : tab);
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
    const validateName = text => {
        return new Promise(resolve => {
            if (text) {
                resolve(false);
            } else {
                resolve(true);
            }
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
                            <View style={{marginBottom: 20}}>
                                <View style={[styles.lineStyle]}/>
                                <AuthenticatingTextBox
                                    label={strings.first_name}
                                    value={user.firstName}
                                    setValue={setSelectedValue}
                                    emptyMessage={emptyMessage.firstName}
                                    errorMessage={errorMessage.firstName}
                                    originalValue={originalData.firstName}
                                    validate={validateName}
                                    labelKey={'firstName'}
                                />

                                <AuthenticatingTextBox
                                    label={strings.last_name}
                                    value={user.lastName}
                                    setValue={setSelectedValue}
                                    emptyMessage={emptyMessage.lastName}
                                    errorMessage={errorMessage.lastName}
                                    originalValue={originalData.lastName}
                                    validate={validateName}
                                    labelKey={'lastName'}
                                />

                                <NickName
                                    verified={setUserVerified}
                                    value={user.displayName}
                                    setValue={setSelectedValue}
                                    originalName={originalData.displayName}
                                    initial={!isEdit}
                                />


                                <TouchableOpacity onPress={showDatepicker}>
                                    <TextInputBox
                                        colors={colors}
                                        pointerEvents={'none'}
                                        label="Date of Birth"
                                        value={user.dob}
                                        onChangeText={text => setUser({...user, dob: text})}
                                        mode="outlined"
                                        editable={false}
                                        style={styles.InputBox}
                                    />

                                    {showDatePicker ?
                                    Platform.OS === 'ios'?
                                        <DatePicker visibility={showDatePicker} onDismiss={()=>{setShowDatePicker(false)}} dob={date} setDob={onChange_dob_ios}/>
                                    :
                                        <DateTimePicker
                                            testID="dateTimePicker"
                                            value={date}
                                            mode={'date'}
                                            is24Hour={true}
                                            display="default"
                                            onChange={onChange_dob}
                                            maximumDate={new Date()}
                                        />
                                        :<></>
                                    }
                                </TouchableOpacity>
                                <Dropdown
                                    data={genderOptions}
                                    label={'Gender'}
                                    value={user?.gender}
                                    setValue={setSelectedValue}
                                    dataLabel={strings.gender}
                                />
                            </View>
                        )}
                    </View>

                    {/*Contact info*/}
                    <View style={styles.tabContainer}>
                        <TouchableOpacity onPress={() => changeTab('contactInfo')}>
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
                            <View style={{marginBottom: 20}}>
                                <View style={[styles.lineStyle]}/>
                                <Phonenumber
                                    value={user?.phoneNumber?.phNumber}
                                    setValue={value => {
                                        let a = user.phoneNumber;
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
                            </View>
                        )}
                    </View>

                    {/*Other Info*/}

                    <View style={styles.tabContainer}>
                        <TouchableOpacity onPress={() => changeTab('otherInfo')}>
                            <View style={styles.tabHeader}>
                                <Text style={styles.tabTitle}>Other info</Text>
                                <Icon
                                    name={
                                        currentTab === 'otherInfo' ? 'chevron-up' : 'chevron-down'
                                    }
                                    type="material-community"
                                    color={colors.secondaryDark}
                                    size={20}
                                    style={styles.tabArrow}
                                />
                            </View>
                        </TouchableOpacity>
                        {currentTab === 'otherInfo' && (
                            <View style={{marginBottom: 20}}>
                                <View style={[styles.lineStyle]}/>
                                <TextInputBox
                                    colors={colors}
                                    label="Life motto"
                                    value={user.lifeMotto}
                                    onChangeText={text => setUser({...user, lifeMotto: text})}
                                    mode="outlined"
                                    maxLength={30}
                                    style={styles.InputBox}
                                />

                                <EthnicCommunitiesAutofillDropDown
                                    value={user.ethnicCommunity}
                                    setValue={setSelectedValue}
                                    current={currentDropDown}
                                    setCurrent={openedDropDown}
                                />
                                <IndustryOfInterestAutofillDropDown
                                    value={user.interestsIndustry}
                                    setValue={setSelectedValue}
                                    current={currentDropDown}
                                    setCurrent={openedDropDown}
                                />
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
                            <View style={{marginBottom: 20}}>
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

                                <TextInputBox
                                    colors={colors}
                                    label="Personal blog URL"
                                    value={user.personalBlog}
                                    onChangeText={text => setUser({...user, personalBlog: text})}
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
