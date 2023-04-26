/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {RoundButton} from '../../../index';
import {screens} from '../../../utilities/assets';
import {strings} from '../../../constant/strings';
import {useBackHandler} from '../../../utilities/helper';
import {IconTitle} from '../../../system/ui/components';
import {ScrollView, Text, View} from 'react-native';
import {IconButton} from 'react-native-paper';
import scale from '../../../utilities/scale';
import {useTheme} from '../../../context/ThemeContext';
import ToggleSwitch from 'toggle-switch-react-native';
import Slider from '@react-native-community/slider';
import {PopupStyle} from '../../../system/styles/popupStyle';
import EthnicCommunitiesAutofillDropDown from '../../../pages/profile/components/EthnicCommunitiesAutofillDropDown';
import IndustryOfInterestAutofillDropDown from '../../../pages/profile/components/IndustryOfInterestAutofillDropDown';
import MainActivitiesAutofillDropdown from '../../../pages/profile/components/MainActivitiesAutofillDropdown';
import Toast from "react-native-simple-toast";

export default function CollabSettingsPage({config, setConfig, close}) {
    const {theme} = useTheme();
    const styles = PopupStyle(theme);
    const [locInfo, setLocInfo] = useState({
        radius: config?.radius,
        radiusIndicator: config?.radiusIndicator,
    });
    const [currentDropDown, setCurrentDropDown] = useState('');
    const {colors} = theme;
    useBackHandler(() => {
        backPressHandler();
        return true;
    });
    const backPressHandler = () => {
        close();
    };
    const setSelectedValue = (label, value) => {
        if (label === 'ethnicCommunity') {
            const ethnicity = config?.ethnicCommunity
                ? [...config?.ethnicCommunity]
                : [];
            let index = ethnicity.indexOf(value);
            if (index >= 0) {
                ethnicity.splice(index, 1);
                setConfig(s => ({...s, ethnicCommunity: ethnicity}));
            } else {
                ethnicity.push(value);
                setConfig(s => ({...s, ethnicCommunity: ethnicity}));
            }
        } else if (label === 'interestsIndustry') {
            let interestsIndustry = config?.industryList
                ? [...config?.industryList]
                : [];
            let index = interestsIndustry.indexOf(value);
            if (index >= 0) {
                interestsIndustry.splice(index, 1);
                setConfig(s => ({...s, industryList: interestsIndustry}));
            } else {
                interestsIndustry.push(value);
                setConfig(s => ({...s, industryList: interestsIndustry}));
            }
        } else if (label === 'activityList') {
            let activityList = config?.activityList ? [...config.activityList] : [];
            let index = activityList.indexOf(value);
            if (index >= 0) {
                activityList.splice(index, 1);
                setConfig(s => ({...s, [label]: activityList}));
            } else {
                activityList.push(value);
                setConfig(s => ({...s, [label]: activityList}));
            }
        }
    };

    return (
        <ScrollView>
            <View style={{flexDirection: 'row', marginRight: 15, marginVertical: 10}}>
                <IconTitle
                    title={'Idean Gallery Search Settings'}
                    icon={screens.lovits}
                    style={{flex: 1}}
                />
                <IconButton
                    icon="tune"
                    size={25}
                    style={{padding: 0, margin: 0}}
                    color={colors.buttonRed}
                />
            </View>
            <View style={styles.collabcontainer}>
                <View style={styles.switchView}>
                    <ToggleSwitch
                        isOn={locInfo.radiusIndicator}
                        onColor={colors.collabSpaceLocationOn}
                        offColor={colors.collabSpaceLocationOff}
                        label="Search within radius"
                        labelStyle={styles.switchLabel}
                        size="small"
                        onToggle={isOn => {
                            setLocInfo(s => ({...s, radiusIndicator: isOn}));
                        }}
                    />
                </View>
                {/*location slider*/}

                <View>
                    <Slider
                        style={styles.slider}
                        minimumValue={2000}
                        value={locInfo.radius}
                        step={100}
                        onSlidingComplete={val => {
                            setLocInfo(s => ({...s, radius: val}));
                        }}
                        onValueChange={val => {
                            setLocInfo(s => ({...s, radius: val}));
                        }}
                        disabled={!locInfo.radiusIndicator}
                        maximumValue={100000}
                        minimumTrackTintColor={colors.sliderColor}
                        maximumTrackTintColor={colors.sliderColor}
                        thumbTintColor={colors.sliderColor}
                    />
                    <View style={{flex: 1, padding: 5, alignSelf: 'center'}}>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Text style={styles.rangeText}>{locInfo.radius / 1000.0}</Text>
                            <Text style={styles.rangeText}>{strings.km_string}</Text>
                        </View>
                    </View>
                </View>
                <View style={[styles.buttonRow, {margin: 15}]}>
                    <RoundButton
                        style={{
                            maxWidth: 90,
                            backgroundColor: colors.radiusButtons,
                            marginRight: 15,
                        }}
                        labelStyle={{fontSize: scale.font.s}}
                        label={strings.reset}
                        onPress={() => {
                            setConfig(s => ({
                                ...s,
                                radius: 2000,
                            }));
                            setLocInfo(s => ({...s, radius: 2000}));
                        }}
                    />
                    <RoundButton
                        style={{maxWidth: 90, backgroundColor: colors.radiusButtons}}
                        labelStyle={{fontSize: scale.font.s}}
                        label={strings.save}
                        onPress={() => {
                            Toast.show(strings.radius)
                            setConfig(s => ({
                                ...s,
                                ...locInfo,
                            }));
                        }}
                    />
                </View>
            </View>

            <View style={styles.line2}/>
            <View style={{margin: 15}}>
                <EthnicCommunitiesAutofillDropDown
                    value={config.ethnicCommunity}
                    setValue={setSelectedValue}
                    current={currentDropDown}
                    setCurrent={setCurrentDropDown}
                    isCollab={true}
                />
                {config?.ethnicCommunity.length > 0 && (
                    <RoundButton
                        style={{
                            maxWidth: 90,
                            backgroundColor: colors.radiusButtons,
                            marginRight: 15,
                            alignSelf: 'flex-end',
                        }}
                        labelStyle={{fontSize: scale.font.s}}
                        label={strings.clearAll}
                        onPress={() => {
                            setConfig(s => ({...s, ethnicCommunity: []}));
                        }}
                    />
                )}
            </View>

            <View style={{margin: 15}}>
                <IndustryOfInterestAutofillDropDown
                    value={config.industryList}
                    setValue={setSelectedValue}
                    current={currentDropDown}
                    setCurrent={setCurrentDropDown}
                    isUser={false}
                    isCollab={true}
                />
                {config?.industryList.length > 0 && (
                    <RoundButton
                        style={{
                            maxWidth: 90,
                            backgroundColor: colors.radiusButtons,
                            marginRight: 15,
                            alignSelf: 'flex-end',
                        }}
                        labelStyle={{fontSize: scale.font.s}}
                        label={strings.clearAll}
                        onPress={() => {
                            setConfig(s => ({...s, industryList: []}));
                        }}
                    />
                )}
            </View>

            <View style={{margin: 15}}>
                <MainActivitiesAutofillDropdown
                    value={config.activityList}
                    setValue={setSelectedValue}
                    current={currentDropDown}
                    setCurrent={setCurrentDropDown}
                    isCollab={true}
                />
                {config?.activityList.length > 0 && (
                    <RoundButton
                        style={{
                            maxWidth: 90,
                            backgroundColor: colors.radiusButtons,
                            marginRight: 15,
                            alignSelf: 'flex-end',
                        }}
                        labelStyle={{fontSize: scale.font.s}}
                        label={strings.clearAll}
                        onPress={() => {
                            setConfig(s => ({...s, activityList: []}));
                        }}
                    />
                )}
            </View>
        </ScrollView>
    );
}
