/* eslint-disable react-hooks/rules-of-hooks */
import React, {useEffect, useState} from 'react';
import {TextInput, View} from 'react-native';
import {IconButton} from 'react-native-paper';
import SearchSettings from '../popup/SettingsPopup';
import {useTheme} from '../../context/ThemeContext';
import AppBarStyle from '../../system/styles/appBarStyle';
import AsyncStorage from '@react-native-async-storage/async-storage';
import logger from '../../lib/logger';

export default function FindBar({onSearch, onSearchChange}) {
    const {theme} = useTheme();
    const styles = AppBarStyle(theme);
    const [search, setSearch] = useState('');
    const [settings, setSettings] = useState({location: true, radius: 5000});
    const [settingsVisible, setSettingsVisible] = useState(false);

    useEffect(() => {
        AsyncStorage.getItem('location_settings').then(data => {
            if (data) {
                try {
                    setSettings(JSON.parse(data));
                } catch (e) {
                    logger.e('error location_settings ');
                }
            }
        });
    }, []);

    const saveConfig = (location, radius) => {
        AsyncStorage.setItem(
            'location_settings',
            JSON.stringify({location, radius}),
        ).then(() => setSettings({location, radius}));
    };

    const onChange = text => {
        if (onSearchChange) {
            onSearchChange(text);
        }
        setSearch(text);
    };
    return (
        <View style={styles.findBar}>
            <TextInput
                style={styles.findBarInput}
                placeholder="Search.."
                placeholderTextColor={theme.colors.textPrimaryDark}
                onChangeText={text => onChange(text)}
                underlineColorAndroid="transparent"
                defaultValue={search}
                onSubmitEditing={() => onSearch(search, settings)}
            />
            <IconButton
                icon="magnify"
                color={theme.colors.secondaryAccent}
                size={25}
                onPress={() => onSearch(search, settings)}
            />
            <IconButton
                icon="cog"
                color={theme.colors.secondaryAccent}
                size={25}
                onPress={() => setSettingsVisible(true)}
            />
            {settingsVisible && (
                <SearchSettings
                    visibility={settingsVisible}
                    radius={settings.radius}
                    onDismiss={() => setSettingsVisible(false)}
                    onReset={saveConfig}
                    onSave={saveConfig}
                    location={settings.location}
                />
            )}
        </View>
    );
}
