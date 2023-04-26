/* eslint-disable react-native/no-inline-styles */
// noinspection ES6CheckImport,JSUnresolvedVariable

import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {moderateScale} from 'react-native-size-matters';
import {useTheme} from 'context/ThemeContext';
import {Icon} from 'react-native-elements';
import PropTypes from 'prop-types';
import {Avatar} from '../../../components';
import Menu, {MenuItem} from 'react-native-material-menu';
import {Appbar} from 'react-native-paper';
import {onTrigger} from '../../../utilities/helper';
import logger from '../../../lib/logger';

export default function SpaceTopBar({
                                        title = '',
                                        onBackPress = () => {
                                            logger.i('default callback');
                                        },
                                        avatar,
                                        menuItems = [],
                                        enableBackButton = false,
                                        titleStyle = {},
                                    }) {
    const {theme} = useTheme();
    const {colors} = theme;
    const styles = styleSheet(theme);
    const [menu, setMenu] = React.useState(null);
    const openMenu = () => menu.show();
    const closeMenu = () => menu.hide();
    return (
        <View style={styles.viewContainer}>
            {enableBackButton && (
                <Icon
                    color={colors.secondaryDark}
                    name="chevron-left"
                    size={20}
                    type="font-awesome-5"
                    onPress={onBackPress}
                />
            )}
            {avatar && (
                <View style={{marginLeft: 10}}>
                    <Avatar size={25} source={avatar}/>
                </View>
            )}
            <Text numberOfLines={1} style={[styles.TitleText, titleStyle]}>
                {title}
            </Text>
            {menuItems && Array.isArray(menuItems) && menuItems.length > 0 && (
                <Menu
                    ref={ref => {
                        setMenu(ref);
                    }}
                    button={
                        <Appbar.Action
                            color={colors.secondaryAccent}
                            icon={'dots-horizontal'}
                            onPress={() => openMenu()}
                        />
                    }>
                    {menuItems.map((_menu, index) => {
                        return (
                            <React.Fragment key={`${_menu.label}${index}`}>
                                {_menu.label && (
                                    <MenuItem
                                        style={styles.menuItem}
                                        onPress={() => {
                                            closeMenu();
                                            onTrigger(_menu.callback);
                                        }}>
                                        <Text style={styles.menuLabel}>{menu.label}</Text>
                                    </MenuItem>
                                )}
                            </React.Fragment>
                        );
                    })}
                </Menu>
            )}
        </View>
    );
}

SpaceTopBar.propTypes = {
    title: PropTypes.string.isRequired,
    avatar: PropTypes.object,
    titleStyle: PropTypes.object,
    menuitem: PropTypes.object,
    onBackPress: PropTypes.func.isRequired,
};

const styleSheet = ({colors, fontFamily}) =>
    StyleSheet.create({
        viewContainer: {
            width: '100%',
            height: moderateScale(50, 0.3),
            flexDirection: 'row',
            alignSelf: 'center',
            alignContent: 'center',
            alignItems: 'center',
            backgroundColor: 'white',
            paddingHorizontal: 10,
            elevation: 10,
        },
        TitleText: {
            flex: 1,
            fontFamily,
            fontSize: 18,
            letterSpacing: 1,
            marginLeft: 3,
            color: colors.textPrimary,
        },
    });
