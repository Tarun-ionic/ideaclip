/* eslint-disable react-hooks/exhaustive-deps,react-native/no-inline-styles,no-alert */
// noinspection DuplicatedCode,JSUnresolvedVariable

import React, {useEffect, useState} from 'react';
import {Image, Platform, ScrollView, Text, TextInput, View, Pressable, BackHandler, Linking} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {SafeScreenView, RoundButton, icons, ProgressLoader} from '../../../index';
import AppBar from '../../../screens/components/toolbar/appBar';
import {useNavigation, useRoute} from "@react-navigation/native";
import {useAlert} from "../../../context/AlertContext";
import {useTheme} from "../../../context/ThemeContext";
import {useBackHandler} from "../../../utilities/helper";
import {fonts, screens} from "../../../utilities/assets";
import {strings} from "../../../constant/strings";
import SignupStyles from "../../../system/styles/signupStyles";
import { userType} from "../../../utilities/constant";
import NickName from "../../profile/components/NickName";
import MainActivitiesAutofillDropdown from "../../profile/components/MainActivitiesAutofillDropdown";
import EthnicCommunitiesAutofillDropDown from "../../profile/components/EthnicCommunitiesAutofillDropDown";
import IndustryOfInterestAutofillDropDown from "../../profile/components/IndustryOfInterestAutofillDropDown";
import Email from "../../profile/components/email";
import MinMap from '../../map/minMap';
import Country from "../../profile/components/Country";
import Toast from "react-native-simple-toast";
import scale from "../../../utilities/scale";



export default function MinimalInitialize() {
    const route = useRoute();
    const navigation = useNavigation();
    const {theme} = useTheme();
    const {colors} = theme;
    const styles = SignupStyles(theme);
    const alert = useAlert();
    const userInfo = route?.params?.user ;

    const [user,setUser] = useState({...userInfo});
    const [originalData, setOriginalData] = useState({...userInfo});
    const [userVerified, setUserVerified] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [saving, setSaving] = useState(false);
    const [popupShow, setPopupShow] = useState(true);


    const inputTypes = {
        text: 'text',
        userName: 'userName',
        email:'email',
        country:'country',
        activities:'activities',
        industries:'industries',
        ethnic:'ethnicCommunities',
        map:'map'
    }



    useBackHandler(() => {
        return true;
    }, []);


    const fields={
        [userType.general]:{
            label:"General User",
            fields:[
                {
                    label:'Enter First Name',
                    type:inputTypes.text,
                    mandatory:true,
                    key:'firstName',
                    emptyMessage:'Enter first name.'
                },
                {
                    label:'Enter Last Name',
                    type:inputTypes.text,
                    mandatory:true,
                    key:'lastName',
                    emptyMessage:'Enter last name.'
                },
                {
                    label:'Create Username',
                    type:inputTypes.userName,
                    mandatory:true,
                    key:'displayName',
                    emptyMessage:'Enter an unique username.'
                },
                {
                    label:'Enter E-mail Address',
                    type:inputTypes.email,
                    mandatory:true,
                    key:'email',
                    emptyMessage:'Enter an unique email address.'
                },
                {
                    label:'Country you live in',
                    type:inputTypes.country,
                    mandatory:false,
                    key:'country',
                    emptyMessage:''
                }
            ]
        },
        [userType.business]:{
            label:"Business",
            fields:[
                {
                    label:'Enter Business Name',
                    type:inputTypes.text,
                    mandatory:true,
                    key:'orgName',
                    emptyMessage:'Enter business name.'
                },
                {
                    label:'Create Username',
                    type:inputTypes.userName,
                    mandatory:true,
                    key:'displayName',
                    emptyMessage:'Enter an unique username.'
                },
                {
                    label:'Enter E-mail Address',
                    type:inputTypes.email,
                    mandatory:true,
                    key:'email',
                    emptyMessage:'Enter an unique email address.'
                },
                {
                    label:'Country you live in',
                    type:inputTypes.country,
                    mandatory:false,
                    key:'country',
                    emptyMessage:''
                },
                {
                    label:'Choose Your Related Industry',
                    type:inputTypes.industries,
                    mandatory:false,
                    key:'industryList',
                    emptyMessage:''
                },
                {
                    label:'Choose Your Target Ethnic Community (if any)',
                    type:inputTypes.ethnic,
                    mandatory:false,
                    key:'ethnicCommunity',
                    emptyMessage:''
                },
                {
                    label:'',
                    type:inputTypes.map,
                    mandatory:true,
                    key:'map',
                    emptyMessage:'Please add your address from the map to conitnue.'
                }
            ]
        },
        [userType.charity]:{
            label:"Charity/NFP",
            fields:[
                {
                    label:'Enter Charity/NFP Name',
                    type:inputTypes.text,
                    mandatory:true,
                    key:'orgName',
                    emptyMessage:'Enter charity name.'
                },
                {
                    label:'Create Username',
                    type:inputTypes.userName,
                    mandatory:true,
                    key:'displayName',
                    emptyMessage:'Enter an unique username.'
                },
                {
                    label:'Enter E-mail Address',
                    type:inputTypes.email,
                    mandatory:true,
                    key:'email',
                    emptyMessage:'Enter an unique email address.'
                },
                {
                    label:'Country you live in',
                    type:inputTypes.country,
                    mandatory:false,
                    key:'country',
                    emptyMessage:''
                },
                {
                    label:'Choose Your Main Activity',
                    type:inputTypes.activities,
                    mandatory:false,
                    key:'activityList',
                    emptyMessage:''
                },
                {
                    label:'Choose Your Target Ethnic Community (if any)',
                    type:inputTypes.ethnic,
                    mandatory:false,
                    key:'ethnicCommunity',
                    emptyMessage:''
                },
                {
                    label:'',
                    type:inputTypes.map,
                    mandatory:true,
                    key:'map',
                    emptyMessage:'Please add your address from the map to conitnue.'
                }
            ]
        }
    }


    useEffect(() => {
            setUser(userInfo);
            setOriginalData(userInfo);
    }, [route.params]);

    const setValue = (data,key,type) => {

        let temp = {...user}
        if([inputTypes.activities,inputTypes.industries,inputTypes.ethnic].includes(type)){
            if(data && data?.length>0) {
                let current = temp[key] ? [...temp[key]] : []
                let index = current.indexOf(data);
                if (index >= 0) {
                    current.splice(index, 1);
                } else {
                    current.push(data);
                }
                temp[key] = current;
            }
        } else{
            temp[key]=data
        }
        setUser({...temp})
    }

    const inputField=({label,type,mandatory,key})=>{
        return(<>
            <Text                    key={`${key}label`} style={styles.labelText} on>
                {label}
            </Text>
            {type === inputTypes.userName ?
                <NickName
                    key={key}
                    verified={setUserVerified}
                    value={user[key]}
                    setValue={(label,value)=>{
                        setValue(value,label,type)
                    }}
                    styles={{}}
                    originalName={''}
                    initial={true}
                    isSignup={true}
                />:
                type === inputTypes.text ?
                <TextInput
                    key={key}
                    style={styles.inputBox}
                    placeholder={''}
                    placeholderTextColor="#aaaaaa"
                    onChangeText={(value)=>{
                        setValue(value,key,type)
                    }}
                    value={user[key]||""}
                    underlineColorAndroid="transparent"
                    autoCapitalize="none"
                />
                    :
                    type === inputTypes.country ?
                        <Country
                            key={key}
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
                            isSignup={true}
                    />
                    :
                    originalData?.email?.length>0 ?
                        <TextInput key={key}
                                   style={styles.inputBox}
                                   placeholder={''}
                                   placeholderTextColor="#aaaaaa"
                                   onChangeText={(value)=>{
                                       setValue(value,key,type)
                                   }}
                                   editable={false}
                                   value={user[key]||""}
                                   underlineColorAndroid="transparent"
                                   autoCapitalize="none"/>
                        :
                        <Email
                        key={key}
                verified={setEmailVerified}
                value={user.email||""}
                setValue={(l,value)=>{
                    setValue(value,l,type)
                }}
                original={''}
                isSignup={true}
                />


            }

        </>)
    }
    const inputSelectorField=({label,type,mandatory,key})=>{
        return(
            <View style={{marginHorizontal:10,marginTop:50}}>
                {
                    type === inputTypes.activities ?
                        <MainActivitiesAutofillDropdown
                            key={key}
                            value={user[key]||[]}
                            setValue={(label,value)=>{
                                setValue(value,key,type)
                            }}
                            labelString={label}
                            isUser={false}
                        />    
                    : type === inputTypes.ethnic ?
                        <EthnicCommunitiesAutofillDropDown
                            key={key}
                            value={user[key]||[]}
                            setValue={(label,value)=>{
                                setValue(value,key,type)
                            }}
                            labelString={label}
                        />
                    :   type === inputTypes.industries ?
                        <IndustryOfInterestAutofillDropDown
                            key={key}
                            value={user[key]||[]}
                            setValue={(label,value)=>{
                                setValue(value,key,type)
                            }}
                            labelString={label}
                            isUser={false}
                        />
                    :
                        <></>
                }   
            </View>
        )
            
    }
    const mapLocation = {
        coordinate: {
            latitude: parseFloat(user.latitude||0),
            longitude: parseFloat(user.longitude||0),
        },
        placeId: user.placeId||'',
        name: user.placesName||'',
    };
    const navigate2PlacePicker = () => {
        navigation.push('PlacePicker', {
            callback: onPlaceCallback,
            screen: 'Initial',
            country: user.countryCode||'AU',
            isCharity: user.userType===userType.charity,
        });
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

    const mapLayout=()=>{

        return(
            <View style={styles.minMapContainer}>
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
        )
}

const verifyData = async () => {
    let errorFields = []
    await fields[user.userType]?.fields?.map(fieldData => {
        if (fieldData.mandatory) {
            if(fieldData.key==='map'){
                if(!user.placeId?.length>0){
                    errorFields.push(fieldData)
                }
            } else if (!user[fieldData.key]?.length > 0) {
                errorFields.push(fieldData)
            }
        }
    })
    if(errorFields?.length>0){
        Toast.show(errorFields[0]?.emptyMessage)
    } else if(!userVerified){
        Toast.show(`Enter an unique username.`)
    } else if(emailVerified){
        Toast.show(`Enter an unique email address.`)
    } else{

        alert({
            type: 'custom',
            content:  (
                <Text style={styles.popupText}>
                    {`You can view and update profile by clicking ' `}
                    <Image source={screens.menuIcon} style={{width:scale.ms(25),height:scale.ms(6),alignSelf:'center',resizeMode:'contain',marginHorizontal:1}}/>
                    {/*<Text style={[{fontWeight:'900',fontSize:scale.font.sl,color:colors.menuDots}]}>{'...'}</Text>*/}
                    {` ' button on the top right hand side of your SPACE.`}
                </Text>
            ),
            autoDismiss: false,
            cancellable: false,
            buttons: [
                {
                    label: strings.ok,
                    callback: () => {
                        alert.clear();
                        if(popupShow){
                            createAccount()
                        setPopupShow(false)
                        }
                    },
                },
            ],
        });
    }
}

const createAccount=()=>{
    setSaving(false);
    navigation.navigate('CreateUser', {
        ...route.params,
        user: {...user},
        referralCode: route?.params?.referralCode ?? '',
        callback: uid => {
            setUser({...user, uid});
        },
    });
}
    return (
        <SafeScreenView
            style={styles.screenContainer}
            translucent={Platform.OS === 'ios'}
            locations={[0.4, 0.9]}>
            <View style={{width:'100%',height:'100%',backgroundColor:colors.signupBackground}}>
            <AppBar
                title={'Profile'}
                onBackPress={false}
                signup={true}
            />

            <ScrollView style={styles.keyboardScroll} >
                <KeyboardAwareScrollView
                    style={styles.keyboardScroll}
                    keyboardShouldPersistTaps="never"
                    nestedScrollEnabled={true}>

                     {/*Header image*/}
                    <Image source={theme.dark?screens.initializeHeaderDark : screens.initializeHeader} style={styles.headerImage}/>


                     {/*signing up intro text*/}
                    <Text style={styles.introText1}>{strings.signUpIntro}<Text style={styles.introText2}>{fields[user.userType].label}.</Text></Text>


                    {/*signup fields*/}
                    <View style={styles.inputContainer}>
                        {fields[user.userType].fields.map(fieldData=>{
                            if([inputTypes.text,inputTypes.userName,inputTypes.email,inputTypes.country].includes(fieldData.type)){
                                return inputField(fieldData)
                            } else if([inputTypes.activities,inputTypes.industries,inputTypes.ethnic].includes(fieldData.type)){
                                return inputSelectorField(fieldData)
                            }
                        })}
                    </View>
                    
                    
                    {
                       [userType.business, userType.charity].includes( user.userType) && 
                            <View style={styles.inputContainer2}>
                                <View style={styles.mapLabelContainer}>
                                    <Text style={styles.mapLabelText1}>
                                        {strings.signUpMap1}
                                        <Text style={styles.mapLabelText2}>
                                            {fields[user.userType].label}
                                            {strings.signUpMap2}
                                        </Text>
                                        {strings.signUpMap3}
                                        <Text style={styles.mapLabelText2}>
                                            {strings.signUpMap4}
                                        </Text>
                                        {strings.signUpMap5}
                                    </Text>
                                </View>
                                {mapLayout()}
                            </View>
                    }
                  
                    
                    <RoundButton
                        style={styles.createButton}
                        onPress={async ()=>{
                            verifyData()
                        }}
                        label={strings.signupCreateAccount}
                        labelStyle={styles.createButtonLabel}
                    />
                    <ProgressLoader visible={saving}/>
                </KeyboardAwareScrollView>
            </ScrollView>
            </View>
        </SafeScreenView>
    );
}
