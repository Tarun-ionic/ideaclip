/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {Text, View} from "react-native";
import {Appbar, IconButton} from 'react-native-paper';
import {Image, Platform, Pressable, TouchableOpacity} from 'react-native';
import Menu, {MenuItem} from 'react-native-material-menu';
// import {Text, View} from 'native-base';
import {onTrigger} from 'utilities/helper';
import {useTheme} from 'context/ThemeContext';
import AppBarStyle from 'system/styles/appBarStyle';
import ImageIcon from 'screens/components/utility/imageIcon';
import {Icon} from 'react-native-elements';

const MORE_ICON = Platform.OS === 'ios' ? 'dots-horizontal' : 'dots-vertical';
export default function AppBar({
                                   title,
                                   subtitle,
                                   icon,
                                   onBackPress,
                                   onSearch,
                                   menuItems,
                                   count,
                                   notify,
                                   avatar,
                                   showStateStatus = false,
                                   online = false,
                                   disableElevation = false,
                               }) {
    const {theme} = useTheme();
    const {colors} = theme;
    const styles = AppBarStyle(theme);
    const [menu, setMenu] = React.useState(null);
    const openMenu = () => menu.show();
    const closeMenu = () => menu.hide();
    return (
        <Appbar style={[styles.appBar, {elevation: disableElevation ? 0 : 10}]}>
            {onBackPress && (
                <Pressable style={styles.backButtonArrow} onPress={onBackPress}>
                    <Icon
                        color={colors.secondaryDark}
                        name="chevron-left"
                        size={25}
                        type="font-awesome-5"
                        onPress={onBackPress}
                    />
                </Pressable>
            )}
            {icon && <Image source={icon} style={styles.logo}/>}
            {avatar && (
                <View>
                    <ImageIcon size={40} source={avatar}/>
                    {showStateStatus && (
                        <View style={online ? styles.online : styles.offline}/>
                    )}
                </View>
            )}

            <Appbar.Content
                style={styles.content}
                titleStyle={styles.title}
                subtitleStyle={styles.subTitle}
                size={25}
                title={title}
                subtitle={subtitle}
            />
            {onSearch && (
                <Appbar.Action
                    color={colors.secondaryAccent}
                    icon="magnify"
                    onPress={() => onTrigger(onSearch)}
                />
            )}
            {notify && (
                <TouchableOpacity
                    style={styles.notify}
                    onPress={() => onTrigger(notify)}>
                    {count > 0 && (
                        <View style={styles.counter}>
                            <Text style={styles.count}>{count > 9 ? '9+' : count}</Text>
                        </View>
                    )}
                    <IconButton icon="bell" size={25} color={colors.secondaryAccent}/>
                </TouchableOpacity>
            )}
            {menuItems && Array.isArray(menuItems) && menuItems.length > 0 && (
                <Menu
                    ref={ref => {
                        setMenu(ref);
                    }}
                    button={
                        <Appbar.Action
                            color={colors.secondaryAccent}
                            icon={MORE_ICON}
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
                                        <Text style={styles.menuLabel}>{_menu.label}</Text>
                                    </MenuItem>
                                )}
                            </React.Fragment>
                        );
                    })}
                </Menu>
            )}
        </Appbar>
    );
}
