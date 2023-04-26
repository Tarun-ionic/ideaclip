/* eslint-disable react-native/no-inline-styles,react-hooks/rules-of-hooks */
import React, {useState} from 'react';
import {Modal, ScrollView, Text, TouchableHighlight, TouchableWithoutFeedback, View,} from 'react-native';
import scale from 'utilities/scale';
import {Icon} from 'react-native-elements';
import Slider from '@react-native-community/slider';
import {useTheme} from 'context/ThemeContext';
import {RoundButton} from 'system/ui/components';
import {PopupStyle} from 'system/styles/popupStyle';
import {strings} from 'constant/strings';
import ToggleSwitch from 'toggle-switch-react-native';

export default function SettingsPopup({
                                          initConfig,
                                          onDismiss,
                                          visibility,
                                          onSave,
                                      }) {
    const {theme} = useTheme();
    const {colors} = theme;
    const styles = PopupStyle(theme);
    const [config, setConfig] = useState(initConfig);

    return (
        <Modal
            animationType={'slide'}
            transparent={true}
            visible={visibility}
            onRequestClose={() => {
                onDismiss(true);
            }}>
            <TouchableHighlight
                activeOpacity={0.0}
                underlayColor="transparent"
                onPress={() => onDismiss(true)}
                style={styles.modal}>
                <TouchableWithoutFeedback>
                    <View style={styles.container}>
                        <View style={styles.elementTitle}>
                            <Icon
                                name="cog"
                                color={colors.secondaryAccent}
                                type="material-community"
                            />
                            <Text style={styles.popupTitle}>Search settings</Text>
                            {/* <Icon name="cancel" size={30} color={colors.secondaryAccent} type="material"
                    onPress={() => onDismiss(true)} />*/}
                        </View>
                        <View style={styles.line}/>
                        <ScrollView>
                            <View>
                                {/*  <View style={styles.switchView}>
                  <ToggleSwitch
                    isOn={config.deviceLocation}
                    onColor={colors.secondaryAccent}
                    offColor={colors.secondaryDark}
                    label="Location based search."
                    labelStyle={styles.switchLabel}
                    size="small"
                    onToggle={isOn => {setConfig(s => ({ ...s, deviceLocation: isOn })) }}
                  />
                </View>*/}
                                <View style={styles.switchView}>
                                    <ToggleSwitch
                                        isOn={config.radiusIndicator}
                                        onColor={'#00f03a'}
                                        offColor={'#9B9B9B'}
                                        label="Search within radius"
                                        labelStyle={styles.switchLabel}
                                        size="small"
                                        onToggle={isOn => {
                                            setConfig(s => ({...s, radiusIndicator: isOn}));
                                        }}
                                    />
                                </View>
                                {/*location slider*/}
                                {config.radiusIndicator === true && (
                                    <View>
                                        <Text style={styles.searchLabel}>Search radius</Text>
                                        <Slider
                                            style={styles.slider}
                                            minimumValue={5000}
                                            value={config.radius}
                                            step={100}
                                            onSlidingComplete={val => {
                                                setConfig(s => ({...s, radius: val}));
                                            }}
                                            onValueChange={val => {
                                                setConfig(s => ({...s, radius: val}));
                                            }}
                                            maximumValue={100000}
                                            minimumTrackTintColor={colors.sliderColor}
                                            maximumTrackTintColor={colors.sliderColor}
                                            thumbTintColor={colors.sliderColor}
                                        />
                                        <View style={{flex: 1, padding: 5, alignSelf: 'center'}}>
                                            <View
                                                style={{flexDirection: 'row', alignItems: 'center'}}>
                                                <Text style={styles.rangeText}>
                                                    {config.radius / 1000.0}
                                                </Text>
                                                <Text style={styles.rangeText}>
                                                    {strings.km_string}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                )}
                            </View>
                        </ScrollView>
                        <View style={styles.line}/>
                        <View style={styles.buttonRow}>
                            <RoundButton
                                style={{maxWidth: 90, backgroundColor: colors.radiusButtons}}
                                labelStyle={{fontSize: scale.font.s}}
                                label={strings.reset}
                                onPress={() => {
                                    setConfig(s => ({
                                        ...s,
                                        radius: 5000,
                                        deviceLocation: true,
                                        radiusIndicator: true,
                                    }));
                                }}
                            />
                            <RoundButton
                                style={{maxWidth: 90, backgroundColor: colors.radiusButtons}}
                                labelStyle={{fontSize: scale.font.s}}
                                label={strings.save}
                                onPress={() => {
                                    if (onSave) {
                                        onSave(config);
                                    }
                                    onDismiss(true);
                                }}
                            />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </TouchableHighlight>
        </Modal>
    );
}
