/* eslint-disable react-native/no-inline-styles */
// noinspection ES6CheckImport

import React, {useState} from 'react';
import {
    Modal,
    Text,
    TextInput,
    TouchableHighlight,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import {Icon} from 'react-native-elements';
import {useTheme} from '../../../context/ThemeContext';
import AutoFillStyles from '../../../system/styles/autofillStyles';
import CountryPicker, {DARK_THEME} from 'react-native-country-picker-modal';
import TextInputBox from './TextInputBox';

export default function Country({code, name, setValue,isSignup=false}) {
    const {theme} = useTheme();
    const {colors} = theme;
    const styles = AutoFillStyles(theme);

    const [viewDrawer, setViewDrawer] = useState(false);

    const onSelect = country => {
        setValue(country);
        setViewDrawer(false);
    };

    return (
        <View>
            <View style={isSignup?styles.inputContainer4:styles.inputContainer}>
                <TouchableOpacity onPress={() => setViewDrawer(!viewDrawer)}>
                    {isSignup?
                        <TextInput
                            label="Country"
                            value={name}
                            editable={false}
                            pointerEvents={'none'}
                            style={styles.inputBox3}
                        />
                        :
                        <TextInputBox
                        colors={colors}
                        label="Country"
                        value={name}
                        editable={false}
                        pointerEvents={'none'}
                        mode="outlined"
                    />
                    }
                </TouchableOpacity>
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
                                    countryCode={code}
                                    withFilter={true}
                                    withFlag={true}
                                    withCountryNameButton={false}
                                    withAlphaFilter={true}
                                    withCallingCode={true}
                                    withEmoji={true}
                                    onSelect={onSelect}
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
        </View>
    );
}
