// noinspection JSUnresolvedFunction,JSUnresolvedVariable

import React, {useEffect, useState} from 'react';
import {Image, Pressable, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import scale from 'utilities/scale';
import {useTheme} from 'context/ThemeContext';
import {useIsFocused} from '@react-navigation/native';
import {screens} from "../../../utilities/assets";
import {compareObjects} from "../../../utilities/helper";
import storage from '@react-native-firebase/storage';

export default function TitleListItem({item,onPress}) {
    const {theme} = useTheme();
    const styles = titleListItemStyle(theme);
    const [itemIcon, setItemIcon] = useState(screens.titles);
    const [currentItem, setCurrentItem] = useState({});
    const isFocused = useIsFocused()

    useEffect(()=>{
        if(!compareObjects(item,currentItem)){
            setCurrentItem(item)
        }
    },[item,isFocused])
    useEffect(()=>{
        if(currentItem?.iconB64){
            setItemIcon({uri:currentItem?.iconB64})
        } else if(currentItem?.iconFile){
            storage()
                .ref(currentItem?.iconFile)
                .getDownloadURL()
                .then(url => {
                    setItemIcon({uri: url});
                })
                .catch(err => {
                    setItemIcon(screens.titles);
                });
        } else{
            console.log("item ",currentItem)
            setItemIcon(screens.titles);
        }
    },[currentItem])

    return (
        <View>
            <TouchableOpacity onPress={onPress}>
                <View style={styles.listItemContainer}>
                    <Image style={styles.iconContainerImage} source={itemIcon||screens.titles}/>
                    <Text style={styles.itemLabel}>{item.name}</Text>
                </View>
            </TouchableOpacity>
            <View style={styles.separator}/>
        </View>
    );
}

const titleListItemStyle = ({colors}) => {
    return StyleSheet.create({
        listItemContainer: {
            flex: 2,
            flexDirection: 'row',
            width: '100%',
            alignItems: 'center',
            paddingLeft:15
        },
        itemLabel: {
            color: colors.textPrimaryDark,
            fontSize: scale.font.l,
            padding: 10,
        },

        separator: {
            height: 1,
            width: '95%',
            padding: 0,
            alignSelf: 'center',
            backgroundColor: colors.surface,
            marginStart: 10,
            marginEnd: 10,
        },
        iconContainerImage: {
            marginVertical: 10,
            width: scale.ms(25),
            height: scale.ms(25),
            resizeMode: 'contain',
        },
    });
};

