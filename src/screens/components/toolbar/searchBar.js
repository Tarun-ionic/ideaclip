/* eslint-disable react-hooks/exhaustive-deps,react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {IconButton} from 'react-native-paper';
import {StyleSheet, TextInput, View} from 'react-native';
import scale from 'utilities/scale';
import {onTrigger} from '../../../utilities/helper';
import {useTheme} from '../../../context/ThemeContext';
import ImageIcon from '../utility/imageIcon';
import {screens} from '../../../utilities/assets';
import {strings} from '../../../constant/strings';
import {GradiantButton} from '../../../system/ui/components';

export default function SearchBar({
                                      placeHolder = 'Search',
                                      onChange,
                                      onSearch,
                                      defValue,
                                      filter = false,
                                      filterCallback = null,
                                      isCollab=false
                                  }) {
    const {theme} = useTheme();
    const {colors} = theme
    const styles = searchBarStyle(theme);
    const [searchHint, setSearchHint] = useState(defValue);

    useEffect(() => {
        setSearchHint(defValue)
    }, [defValue]);

    return (
        <React.Fragment>
            <View style={styles._sBar}>
                <View style={styles._sBarWrap}>
                    <ImageIcon size={25} rounded={false} source={screens.search_ico}/>
                    <View style={{flex: 1, justifyContent: 'center'}}>
                        <TextInput
                            style={styles._sBarInput}
                            numberOfLines={1}
                            multiline={false}
                            placeholder={
                                placeHolder ? placeHolder : strings.collabSpaceSearchPlaceHolder
                            }
                            placeholderTextColor={theme.colors.textPrimary}
                            onChangeText={text => {
                                onTrigger(onChange,text.trim());
                                setSearchHint(text.trim());
                            }}
                            underlineColorAndroid="transparent"
                            defaultValue={searchHint}
                            onSubmitEditing={() => onTrigger(onSearch, searchHint)}
                        />
                    </View>
                </View>
                <GradiantButton
                    colors={isCollab ? [colors.collabSpaceButton,colors.collabSpaceButton]:[]}
                    label={strings.search}
                    borderStyle={theme.dark&&isCollab&&{borderWidth:1,borderColor:colors.darkModeBorder}}
                    onPress={() => onTrigger(onSearch, searchHint)}
                />
                {filter && (

                    <GradiantButton
                        style={{minWidth: scale.ms(35)}}
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
        </React.Fragment>
    );
}

const searchBarStyle = ({colors}) =>
    StyleSheet.create({
        _sBar: {
            flexDirection: 'row',
            backgroundColor: colors.surfaceDark,
            zIndex: 5,
            alignSelf: 'center',
            alignContent: 'center',
            alignItems: 'center',
            width: '90%',
        },
        _sBarInput: {
            textAlign: 'left',
            textAlignVertical: 'center',
            width: '100%',
            padding: 0,
            minHeight: 35,
            maxHeight: 10,
            fontSize: scale.font.s,
            lineHeight: 15,
            color: colors.textPrimaryDark,
            backgroundColor: colors.surfaceDark,
        },
        _sBarWrap: {
            flex: 1,
            flexDirection: 'row',
            borderRadius: 20,
            alignItems: 'center',
            overflow: 'hidden',
            borderWidth: 0.7,
            paddingHorizontal: 15,
            color: colors.textPrimaryDark,
            borderColor: colors.secondaryAccent,
            backgroundColor: colors.surfaceDark,
        },
        _viewTitle: {color: colors.secondaryDark, padding: 5, marginHorizontal: 5},
    });
