/* eslint-disable react-hooks/exhaustive-deps,react-native/no-inline-styles */
// noinspection ES6CheckImport

import React, {useEffect, useState} from 'react';
import {IconButton} from 'react-native-paper';
import {StyleSheet, TextInput, View} from 'react-native';
import {onTrigger} from '../../utilities/helper';
import {useTheme} from '../../context/ThemeContext';
import ImageIcon from '../../screens/components/utility/imageIcon';
import {screens} from '../../utilities/assets';
import {strings} from '../../constant/strings';
import {GradiantButton} from '../../system/ui/components';
import {ms} from 'react-native-size-matters';

export default function SearchBar({
                                      placeHolder = 'Search',
                                      onChange,
                                      onSearch,
                                      defValue,
                                      filter = false,
                                      filterCallback = null,
                                  }) {
    const {theme} = useTheme();
    const styles = searchBarStyle(theme);
    const [searchHint, setSearchHint] = useState(defValue);

    useEffect(() => {
        onTrigger(onChange, defValue);
    }, [defValue]);

    return (
        <React.Fragment>
            <View style={styles._sBar}>
                <View style={styles._sBarWrap}>
                    <ImageIcon size={30} rounded={false} source={screens.search_ico}/>
                    <TextInput
                        style={styles._sBarInput}
                        numberOfLines={1}
                        placeholder={
                            placeHolder ? placeHolder : strings.collabSpaceSearchPlaceHolder
                        }
                        placeholderTextColor={theme.colors.textPrimary}
                        onChangeText={text => {
                            onChange(text);
                            setSearchHint(text);
                        }}
                        underlineColorAndroid="transparent"
                        defaultValue={searchHint}
                        onSubmitEditing={() => onTrigger(onSearch, searchHint)}
                    />
                </View>
                <GradiantButton
                    label={strings.search}
                    onPress={() => onTrigger(onSearch, searchHint)}
                />
                {filter && (
                    <GradiantButton
                        style={{minWidth: ms(35, 0.3)}}
                        cornerRadius={50}
                        onPress={() => onTrigger(filterCallback)}>
                        <IconButton
                            icon="tune"
                            size={25}
                            style={{padding: 0, margin: 0}}
                            color={'white'}
                            onPress={() => onTrigger(filterCallback)}
                        />
                    </GradiantButton>
                )}
            </View>
            <View style={styles._separator}/>
        </React.Fragment>
    );
}

const searchBarStyle = ({colors, fontFamily}) =>
    StyleSheet.create({
        _sBar: {
            flexDirection: 'row',
            backgroundColor: colors.surfaceDark,
            zIndex: 5,
            alignItems: 'center',
            padding: 5,
        },
        _sBarInput: {
            textAlign: 'left',
            textAlignVertical: 'top',
            flex: 1,
            height: 37,
            marginLeft: 5,
            fontFamily,
            fontSize: 14,
            width: '50%',
            color: colors.textPrimaryDark,
            backgroundColor: colors.surfaceDark,
        },
        _separator: {
            height: 0.5,
            backgroundColor: colors.primary,
            width: '96%',
            justifyContent: 'center',
            alignSelf: 'center',
        },
        _sBarWrap: {
            flex: 1,
            marginHorizontal: 5,
            flexDirection: 'row',
            borderRadius: 20,
            fontSize: 14,
            alignItems: 'center',
            overflow: 'hidden',
            borderWidth: 0.7,
            paddingHorizontal: 15,
            color: colors.textPrimaryDark,
            borderColor: colors.secondaryAccent,
            backgroundColor: colors.surfaceDark,
        },
        _viewTitle: {
            fontFamily: fontFamily,
            color: colors.secondaryDark,
            padding: 5,
            marginHorizontal: 5,
        },
    });
