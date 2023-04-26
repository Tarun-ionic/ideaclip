/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {
    I18nManager,
    Modal,
    Text,
    TextInput,
    TouchableHighlight,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import scale from 'utilities/scale';
import {Icon} from 'react-native-elements';
import {useTheme} from '../../../context/ThemeContext';
import CountryPicker, {DARK_THEME} from 'react-native-country-picker-modal';
import AutoFillStyles from '../../../system/styles/autofillStyles';

export default function Phonenumber({
                                        value,
                                        setValue,
                                        labelKey,
                                        countryCode,
                                        setCountryCode,
                                        phoneCode,
                                    }) {
    const {theme} = useTheme();
    const {colors} = theme;
    const styles = AutoFillStyles(theme);
    const [viewDrawer, setViewDrawer] = useState(false);

    return (
        <>
            <View style={{alignSelf: 'center', flexDirection: 'row'}}>
                <View style={[styles.inputContainer, {flexDirection: 'row'}]}>
                    <TouchableOpacity
                        onPress={() => setViewDrawer(true)}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            height: '100%',
                        }}>
                        <CountryPicker
                            countryCode={countryCode}
                            withFilter={true}
                            withFlag={true}
                            withCountryNameButton={false}
                            withAlphaFilter={true}
                            withCallingCode={true}
                            withEmoji={true}
                            modalProps={{transparent: false, visible: false}}
                            visible={false}
                            onOpen={() => setViewDrawer(true)}
                        />

                        <Icon
                            name="arrow-drop-down"
                            size={20}
                            color={colors.textPrimary}
                            type="material"
                        />
                    </TouchableOpacity>
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            borderColor: colors.secondary,
                            borderBottomWidth: 1,
                            flex: 1,
                        }}>
                        <Text
                            style={{
                                padding: 5,
                                textAlignVertical: 'center',
                                fontSize: scale.font.s,
                                height: '100%',
                                color: colors.textPrimaryDark,
                            }}>
                            {phoneCode}
                        </Text>
                        <TextInput
                            style={{
                                backgroundColor: colors.surfaceDark,
                                color: colors.textPrimaryDark,
                                paddingHorizontal: 10,
                                paddingVertical: 5,
                                alignSelf: 'center',
                                alignItems: 'center',
                                textAlign: I18nManager.isRTL ? 'right' : 'left',
                                flex: 1,
                            }}
                            placeholder={labelKey}
                            placeholderTextColor="#aaaaaa"
                            onChangeText={text => {
                                setValue(text.trim().replace(/[\D]+/g, ''));
                            }}
                            maxLength={15}
                            value={value}
                            keyboardType="numeric"
                            textContentType={'telephoneNumber'}
                            underlineColorAndroid="transparent"
                            autoCapitalize="none"
                        />
                    </View>
                </View>
            </View>
            {viewDrawer && (
                <Modal
                    animationType={'slide'}
                    transparent={true}
                    visible={viewDrawer}
                    onRequestClose={() => {
                        setViewDrawer(false);
                    }}>
                    <TouchableHighlight
                        activeOpacity={0.0}
                        underlayColor="transparent"
                        onPress={() => {
                            setViewDrawer(false);
                        }}
                        style={styles.modal}>
                        <TouchableWithoutFeedback>
                            <View
                                style={{
                                    flex: 1,
                                    width: '90%',
                                    flexDirection: 'column',
                                    backgroundColor: colors.surfaceDark,
                                    margin: 20,
                                    maxHeight: '75%',
                                    borderRadius: 20,
                                    padding: 10,
                                    shadowOffset: {
                                        width: 0,
                                        height: 2,
                                    },
                                    shadowOpacity: 0.25,
                                    shadowRadius: 3.84,
                                    elevation: 5,
                                }}>
                                <View style={styles.modelHeader}>
                                    <Text style={styles.modelTitle}>Select your country</Text>
                                    <Icon
                                        name="cancel"
                                        size={30}
                                        color={colors.secondaryAccent}
                                        type="material"
                                        onPress={() => setViewDrawer(false)}
                                        style={{alignSelf: 'flex-end'}}
                                    />
                                </View>

                                <CountryPicker
                                    countryCode={countryCode}
                                    withFilter={true}
                                    withFlag={true}
                                    withCountryNameButton={false}
                                    withAlphaFilter={true}
                                    withCallingCode={true}
                                    withEmoji={true}
                                    onSelect={country => setCountryCode(country)}
                                    filterProps={{style: styles.InputBoxFull}}
                                    withCloseButton={false}
                                    theme={theme.dark && DARK_THEME}
                                    onClose={() => setViewDrawer(false)}
                                    visible
                                    withModal={false}
                                />
                            </View>
                        </TouchableWithoutFeedback>
                    </TouchableHighlight>
                </Modal>
            )}
        </>
    );
}
