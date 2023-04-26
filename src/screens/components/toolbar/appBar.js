import React, {useState} from 'react';
import {IconButton} from 'react-native-paper';
import {Pressable, StyleSheet, TouchableOpacity} from 'react-native';
import scale from 'utilities/scale';
import {Menu, MenuItem} from 'react-native-material-menu';
import {Text, View} from 'react-native';
import {onTrigger} from 'utilities/helper';
import {useTheme} from 'context/ThemeContext';
import ImageIcon from 'screens/components/utility/imageIcon';
import {Icon} from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';
import {LineView} from '../../../system/ui/components';
import {screens} from '../../../utilities/assets';

export default function AppBar({
                                   title,
                                   subtitle,
                                   username,
                                   icon,
                                   onBackPress,
                                   onSearch,
                                   menuItems,
                                   count,
                                   notify,
                                   avatar,
                                   showStateStatus = false,
                                   online = false,
                                   gradiant,
                                   dark,
                                   navigate,
                                   coSpace = false,
                                   profile = false,
                                    signup=false
                               }) {
    const {theme} = useTheme();
    const {colors} = theme;
    const styles = styleSheet(theme, gradiant, dark);
    const [menuVisibility, setMenuVisibility] = useState(false);
    const openMenu = () => setMenuVisibility(true);
    const closeMenu = () => setMenuVisibility(false);

    const toolBar = (
        <View style={[{flexDirection: 'column', flex: 1, paddingVertical:10},signup&&{backgroundColor:colors.signupBackground}]}>
            <View style={[styles._viewContainer]}>
                {onBackPress && (
                    <TouchableOpacity
                        style={{paddingHorizontal: 10}}
                        onPress={onBackPress}>
                        <Icon
                            color={gradiant ? '#ffffff' : colors.appbarBack}
                            name="chevron-left"
                            size={scale.icon.xs}
                            type="font-awesome-5"
                            onPress={onBackPress}
                        />
                    </TouchableOpacity>
                )}

                {icon && (
                    <View style={{marginLeft: onBackPress ? 0 : scale.space.s}}>
                        <ImageIcon size={scale.icon.s} rounded={false} source={icon}/>
                    </View>
                )}

                {avatar && (
                    <View
                        style={{
                            marginLeft: icon
                                ? scale.space.s
                                : onBackPress
                                    ? 0
                                    : scale.space.s,
                        }}>
                        <ImageIcon
                            onPress={() => onTrigger(navigate)}
                            size={scale.icon.xs}
                            source={avatar}
                        />
                        {showStateStatus && (
                            <View style={online ? styles._online : styles._offline}/>
                        )}
                    </View>
                )}
                <View style={[styles._titleWrap, {marginLeft: 5}]}>
                    <Pressable onPress={() => onTrigger(navigate)}>
                        <Text
                            numberOfLines={1}
                            style={profile ? styles._titleProfile : styles._title}>
                            {title}
                        </Text>
                        {subtitle && !profile && (
                            <Text numberOfLines={1} style={styles._subTitle}>
                                {subtitle}
                            </Text>
                        )}
                    </Pressable>
                </View>
                {onSearch && (
                    <IconButton
                        color={
                            gradiant
                                ? '#ffffff'
                                : dark
                                ? colors.customViolet
                                : colors.secondaryAccent
                        }
                        size={scale.icon.s}
                        icon="magnify"
                        onPress={() => onTrigger(onSearch)}
                    />
                )}

                {notify && (
                    <Pressable onPress={() => onTrigger(notify)}>
                        {count > 0 && (
                            <View style={styles._counter}>
                                <Text style={styles._count}>{count > 9 ? '9+' : count}</Text>
                            </View>
                        )}
                        <IconButton
                            icon="bell"
                            color={
                                gradiant
                                    ? '#ffffff'
                                    : dark
                                    ? colors.customViolet
                                    : colors.secondaryAccent
                            }
                            size={scale.icon.s}
                        />
                    </Pressable>
                )}

                {menuItems && Array.isArray(menuItems) && menuItems.length > 0 && (
                    <Menu
                        visible={menuVisibility}
                        onRequestClose={closeMenu}
                        anchor={<IconButton
                            color={
                                gradiant
                                    ? '#ffffff'
                                    : coSpace
                                    ? colors.coSpaceMenuDots
                                    : colors.menuDots
                            }
                            style={{margin: 0}}
                            size={scale.icon.s}
                            icon={'dots-horizontal'}
                            onPress={() => openMenu()}
                        />
                        }>
                        {menuItems.map((_menu, index) => {
                            return (
                                <React.Fragment key={`${_menu.label}${index}`}>
                                    {_menu.label && (
                                        <MenuItem
                                            style={styles._menuItem}
                                            onPress={() => {
                                                closeMenu();
                                                onTrigger(_menu.callback);
                                            }}>
                                            <Text style={styles._menuLabel}>{_menu.label}</Text>
                                        </MenuItem>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </Menu>
                )}
            </View>
            {profile && (
                <View style={[styles._viewContainer]}>
                    {onBackPress && (
                        <TouchableOpacity style={{paddingHorizontal: 10}}>
                            <Icon
                                color={colors.surfaceDark}
                                name="chevron-left"
                                size={scale.icon.xs}
                                type="font-awesome-5"
                            />
                        </TouchableOpacity>
                    )}

                    {icon && (
                        <View style={{marginLeft: onBackPress ? 0 : scale.space.s}}>
                            <ImageIcon
                                size={scale.icon.s}
                                rounded={false}
                                source={screens.blank}
                            />
                        </View>
                    )}

                    <View
                        style={[
                            styles._titleWrap,
                            icon || (onBackPress && {marginLeft: 0}),
                        ]}>
                        <Pressable onPress={() => onTrigger(navigate)}>
                        {console.log("first",subtitle)}
                            {(subtitle || username) && (
                                <View>
                                   
                                <Text numberOfLines={1} style={styles._subTitleProfile}>
                                    {subtitle}
                                </Text>
                                {subtitle == null ?<Text numberOfLines={1} style={styles._subTitleProfile}>
                                    {username}
                                </Text> : null}
                                </View>
                            )}
                        </Pressable>
                    </View>
                </View>
            )}
            {!gradiant && <LineView spacing={0} width={'95%'}/>}
        </View>
    );

    const gradiantBar = (
        <LinearGradient
            useAngle={true}
            angle={90}
            style={styles._backgroundStyle}
            colors={['#e50112', '#0259a8']}
            locations={[0.4, 0.9]}>
            {toolBar}
        </LinearGradient>
    );

    const defaultBar = (
        <View
            style={
                profile ? styles._backgroundStyleProfile : styles._backgroundStyle
            }>
            {toolBar}
        </View>
    );

    return gradiant ? gradiantBar : defaultBar;
}
const styleSheet = ({colors}, gradiant, dark) =>
    StyleSheet.create({
        _backgroundStyle: {
            width: '100%',
            height: scale.toolbar.l,
            backgroundColor: colors.surfaceDark,
        },
        _backgroundStyleProfile: {
            width: '100%',
            paddingVertical:25,
            height: scale.toolbar.xxl,
            backgroundColor: colors.surfaceDark,
        },
        _viewContainer: {
            flexDirection: 'row',
            alignSelf: 'center',
            alignContent: 'center',
            alignItems: 'center',
            flex: 1,
            paddingRight: 10,
        },
        _online: {
            width: 8,
            height: 8,
            position: 'absolute',
            borderRadius: 50,
            backgroundColor: 'green',
            borderWidth: 2,
            borderColor: '#ffffff',
            bottom: 0,
            right: 0,
        },
        _offline: {
            width: 8,
            height: 8,
            position: 'absolute',
            borderRadius: 50,
            backgroundColor: '#ffffff',
            borderWidth: 1,
            borderColor: '#9c9797',
            bottom: 0,
            right: 0,
        },
        _count: {
            color: colors.secondaryAccent,
            fontSize: scale.font.s,
            padding: 3,
            textAlign: 'center',
        },
        _menuItem: {
            backgroundColor: colors.menuBox,
        },
        _menuLabel: {
            fontSize: scale.font.s,
            color: colors.textPrimaryDark,
        },
        _counter: {
            position: 'absolute',
            backgroundColor: colors.surface,
            width: 20,
            height: 20,
            top: 5,
            right: 5,
            zIndex: 5,
            borderRadius: 50,
            elevation: 10,
        },
        _title: {
            textAlignVertical: 'center',
            fontSize: scale.font.xxl,
            color: gradiant
                ? '#ffffff'
                : colors.appbarTitle,
        },
        _subTitle: {
            flex: 1,
            fontSize: scale.font.s,
            textAlignVertical: 'center',
            color: gradiant
                ? '#ffffff'
                : dark
                    ? colors.textPrimary
                    : colors.secondaryDark,
        },
        _titleProfile: {
            textAlignVertical: 'center',
            fontSize: scale.font.xxl,
            color: gradiant ? '#ffffff' : colors.textPrimary,
        },
        _subTitleProfile: {
            marginLeft: 2.47,
            marginTop: -5,
            fontSize: scale.font.pxl,
            textAlignVertical: 'center',
            fontWeight:'500',
            color: colors.textPrimaryProfile
        },
        _titleWrap: {
            flex: 1,
            flexDirection: 'column',
            marginHorizontal: scale.space.s,
            paddingVertical: scale.space.m
        },
    });
