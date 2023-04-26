/* eslint-disable react-native/no-inline-styles */
import {Menu, MenuItem} from 'react-native-material-menu';
import {IconButton} from 'react-native-paper';
import React, {useState} from 'react';
import {onTrigger} from '../../utilities/helper';
import {Platform, StyleSheet, Text, View} from 'react-native';
import scale from 'utilities/scale';
import {useTheme} from '../../context/ThemeContext';
import {toggleState} from '../../utilities/constant';
import {Icon} from 'react-native-elements';

export default function ActionMenu({items, color}) {
    const {theme} = useTheme();
    const {colors} = theme;
    const styles = MenuStyle(theme);
    const [menuVisibility, setMenuVisibility] = useState(false);
    const openMenu = () => setMenuVisibility(true);
    const closeMenu = () => setMenuVisibility(false);

    if (items && Array.isArray(items)) {
        return (
            <Menu
                visible={menuVisibility}
                onRequestClose={closeMenu}
                anchor={<IconButton
                    style={{marginTop: -5, padding: 0}}
                    color={color}
                    icon={'dots-horizontal'}
                    onPress={() => openMenu()}
                />
                }>
                {items.map((_menu, index) => {
                    return (
                        <React.Fragment key={`${_menu.label}${index}`}>
                            {_menu.label && (
                                <MenuItem
                                    style={styles.menuItem}
                                    onPress={() => {
                                        closeMenu();
                                        onTrigger(_menu.callback);
                                    }}>
                                    <View
                                        style={{
                                            width: "100%",
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'flex-start',
                                            padding: Platform.OS === 'ios' ? 15 : 5,
                                        }}>
                                        <Text style={styles.menuLabel}>
                                            {_menu.label}{' '}
                                            <Text
                                                style={[
                                                    styles.menuLabel,
                                                    {
                                                        color:
                                                            _menu.state === toggleState.on
                                                                ? colors.myDiaryOn
                                                                : colors.myDiaryOff,
                                                    },
                                                ]}>
                                                {_menu.state}{' '}
                                            </Text>
                                        </Text>
                                        {_menu.state && (
                                            <Icon
                                                name={
                                                    _menu.state === toggleState.on
                                                        ? 'toggle-on'
                                                        : 'toggle-off'
                                                }
                                                type="material-icons"
                                                color={
                                                    _menu.state === toggleState.on
                                                        ? colors.myDiaryOn
                                                        : colors.myDiaryOff
                                                }
                                                style={Platform.OS === "ios" ? {height: 30} : {}}
                                                size={30}
                                                onPress={() => {
                                                    closeMenu();
                                                    onTrigger(_menu.callback);
                                                }}
                                            />
                                        )}
                                    </View>
                                </MenuItem>
                            )}
                        </React.Fragment>
                    );
                })}
            </Menu>
        );
    } else {
        return null;
    }
}

const MenuStyle = ({colors}) =>
    StyleSheet.create({
        menuItem: {
            backgroundColor: colors.menuBox,
        },
        menuLabel: {
            fontSize: scale.font.s,
            color: colors.textPrimaryDark,
        },
    });
