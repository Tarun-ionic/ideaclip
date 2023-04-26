/* eslint-disable react-hooks/exhaustive-deps,react-native/no-inline-styles */
// noinspection JSUnresolvedVariable

import React, {useEffect, useState} from 'react';
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import scale from 'utilities/scale';
import {useLazyQuery} from '@apollo/client';
import LottieView from 'lottie-react-native';
import {lottie} from '../../../utilities/assets';
import {Icon} from 'react-native-elements';
import {queries} from '../../../schema';
import {useTheme} from '../../../context/ThemeContext';
import {strings} from '../../../constant/strings';
import TextInputBox from './TextInputBox';

export default function States({value, setValue, refresh}) {
    const {theme} = useTheme();
    const styles = stylesGenerator(theme);
    const {colors} = theme;
    const [viewDrawer, setViewDrawer] = useState(false);
    const [execute, {loading, data}] = useLazyQuery(queries.getStates, {
        fetchPolicy: 'no-cache',
        variables: {
            countryId: 'MRLwJ9R8vMOFgBKeWpu4',
        },
    });
    const [stateList, setStateList] = useState([]);
    useEffect(() => {
        execute();
    }, [refresh]);

    useEffect(() => {
        getData();
    }, [data]);

    function getLabel(val) {
        let currentLabel = '';
        for (const item in stateList) {
            if (stateList[item].value === val) {
                currentLabel = stateList[item].label;
            }
        }
        return currentLabel;
    }

    function renderList({item}) {
        return (
            <View>
                <TouchableOpacity
                    onPress={() => {
                        setValue({state: item.value, stateShort: item.shortName});
                        setViewDrawer(!viewDrawer);
                    }}>
                    <View
                        style={{
                            flex: 2,
                            flexDirection: 'row',
                            width: '100%',
                            alignItems: 'center',
                        }}>
                        <Icon
                            name={
                                value?.indexOf(item.value) >= 0
                                    ? 'radio-button-checked'
                                    : 'radio-button-unchecked'
                            }
                            type="material-icons"
                            color={colors.secondaryDark}
                            size={25}
                            style={{marginStart: 5, alignSelf: 'center'}}
                        />
                        <Text
                            style={{
                                color: colors.textPrimaryDark,
                                fontSize: scale.font.s,
                                padding: 10,
                            }}>
                            {item.label}
                        </Text>
                    </View>
                </TouchableOpacity>
                <View style={styles.separator}/>
            </View>
        );
    }

    function getData() {
        if (!loading) {
            if (data) {
                let newData = [];
                for (const index in data.states) {
                    let current = data.states[index];
                    newData.push({
                        label: current.stateName,
                        value: current.id,
                        shortName: current.shortName,
                    });
                }
                setStateList(newData);
            } else {
                setStateList([]);
            }
        } else {
            setStateList([]);
        }
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
                    label={strings.state}
                    value={getLabel(value)}
                    mode="outlined"
                    editable={false}
                    style={styles.InputBox}
                />
            </TouchableOpacity>
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
                        height: 150,
                        backgroundColor: colors.background,
                        width: '90%',
                        alignSelf: 'center',
                    }}>
                    {loading ? (
                        <LottieView
                            source={lottie.loader}
                            style={{height: 25, alignSelf: 'center'}}
                            autoPlay
                            loop
                        />
                    ) : (
                        <FlatList
                            data={stateList}
                            renderItem={renderList}
                            scrollEnabled={true}
                            nestedScrollEnabled
                            keyExtractor={(item, index) => index}
                        />
                    )}
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
