/* eslint-disable no-shadow,react-native/no-inline-styles */
import React, {useState} from 'react';
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import scale from 'utilities/scale';
import {Icon} from 'react-native-elements';
import AuthenticatingTextBox from '../../pages/profile/components/AuthenticatingTextBox';
import {useTheme} from '../../context/ThemeContext';
import {strings} from '../../constant/strings';
import TextInputBox from '../../pages/profile/components/TextInputBox';

export default function Dropdown({
                                     item = {},
                                     label,
                                     data,
                                     value,
                                     setValue,
                                     dataLabel,
                                     other,
                                     multiple,
                                 }) {
    const [viewDrawer, setViewDrawer] = useState(false);
    const {theme} = useTheme();
    const styles = stylesGenerator(theme);
    const {colors} = theme;

    function getLabel(val) {
        if (!multiple) {
            let currentLabel = '';
            for (item in data) {
                if (data[item].value === val) {
                    currentLabel = data[item].label;
                }
            }
            return currentLabel;
        } else {
            let currentLabel = '';
            for (item in val) {
                if (currentLabel) {
                    currentLabel = currentLabel + ', ' + getOptionName(val[item]);
                } else {
                    currentLabel = getOptionName(val[item]);
                }
            }
            return currentLabel;
        }
    }

    function getOptionName(val) {
        let community = '';
        if (data) {
            for (item in data) {
                if (data[item].value === val) {
                    community = data[item].label;
                }
            }
        }
        return community;
    }

    function checkBoxIcon(_item) {
        if (value?.indexOf(_item.value) >= 0) {
            return 'check-box';
        } else {
            return 'check-box-outline-blank';
        }
    }

    function radioButtonIcon(_item) {
        if (value === _item.value) {
            return 'radio-button-checked';
        } else {
            return 'radio-button-unchecked';
        }
    }

    function renderList(props) {
        let _item = props.item;
        return (
            <View>
                <TouchableOpacity
                    onPress={() => {
                        setValue(dataLabel, _item.value);
                        if (!multiple) {
                            setViewDrawer(!viewDrawer);
                        }
                    }}>
                    <View
                        style={{
                            flex: 2,
                            flexDirection: 'row',
                            width: '100%',
                            alignItems: 'center',
                        }}>
                        {multiple ? (
                            <Icon
                                name={checkBoxIcon(_item)}
                                type="material-icons"
                                color={colors.secondaryDark}
                                size={scale.icon.xs}
                                style={{marginStart: 5, alignSelf: 'center'}}
                            />
                        ) : (
                            <Icon
                                name={radioButtonIcon(_item)}
                                type="material-icons"
                                color={colors.secondaryDark}
                                size={scale.icon.xs}
                                style={{marginStart: 5, alignSelf: 'center'}}
                            />
                        )}
                        <Text
                            style={{
                                color: colors.textPrimaryDark,
                                fontSize: scale.font.xs,
                                padding: 10,
                            }}>
                            {_item.label}
                        </Text>
                    </View>
                </TouchableOpacity>
                <View style={styles.separator}/>
            </View>
        );
    }

    return (
        <View>
            <TouchableOpacity
                onPress={() => {
                    setViewDrawer(!viewDrawer);
                }}>
                <TextInputBox
                    colors={colors}
                    pointerEvents={'none'}
                    label={label}
                    value={getLabel(value)}
                    mode="outlined"
                    editable={false}
                    style={styles.InputBox}
                />
            </TouchableOpacity>
            {!viewDrawer && value?.indexOf('other') !== -1 && (
                <AuthenticatingTextBox
                    label={'Other'}
                    value={other}
                    setValue={(_label, _value) => {
                        if (_label === 'other') {
                            setValue(dataLabel + 'Other', _value);
                        } else {
                            setValue(dataLabel + _label, _value);
                        }
                    }}
                    emptyMessage={strings.other_fields_empty_warning}
                    errorMessage={strings.other_fields_empty_warning}
                    originalValue={''}
                    validate={text => {
                        return new Promise(resolve => {
                            if (text) {
                                resolve(false);
                            } else {
                                resolve(true);
                            }
                        });
                    }}
                    labelKey={'other'}
                />
            )}
            {viewDrawer && (
                <View
                    style={{
                        borderWidth: 1,
                        borderLeftColor: colors.secondaryDark,
                        borderBottomColor: colors.secondaryDark,
                        borderRightColor: colors.secondaryDark,
                        borderTopColor: 'transparent',
                        borderBottomLeftRadius: 5,
                        borderBottomRightRadius: 5,
                        backgroundColor: colors.surfaceDark,
                        width: '90%',
                        alignSelf: 'center',
                    }}>
                    <FlatList
                        data={data}
                        renderItem={renderList}
                        keyExtractor={(item, index) => index}
                    />
                </View>
            )}
        </View>
    );
}

const stylesGenerator = ({colors}) =>
    StyleSheet.create({
        InputBox: {
            minHeight: 44,
            width: '90%',
            alignSelf: 'center',
            marginTop: 20,
            borderRadius: 25,
            color: colors.textPrimaryDark,
        },
        separator: {
            height: 1,
            borderWidth: 0.5,
            width: '95%',
            padding: 0,
            alignSelf: 'center',
            borderColor: colors.secondaryDark,
            marginStart: 10,
            marginEnd: 10,
        },
    });
