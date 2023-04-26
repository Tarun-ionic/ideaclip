import React, {useEffect, useState,useRef} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import scale from 'utilities/scale';
import {useTheme} from 'context/ThemeContext';
import ImageIcon from '../../components/utility/imageIcon';
import {useIsFocused} from "@react-navigation/native";
import {useDebounce} from "../../../utilities/helper";
import LottieView from 'lottie-react-native';
import { lottie } from '../../../utilities/assets';

export default function NavBar({navList,animated=false}) {
    const {theme} = useTheme();
    const {colors} = theme
    const styles = SpaceStyle(theme);
    const {debounce} = useDebounce()
    const animation = useRef()
    const isFocused = useIsFocused();
    const interval = 60000
    const [lastPlayedAt,setLastPlayedAt] = useState(0)
    // useEffect(()=>{
    //     if(animated)
    //         animate()
    // },[])
    useEffect(()=>{
        const timer = setInterval(() => {
            animate()
        }, interval);

        if(isFocused && lastPlayedAt === 0) {
            animate()
        } else if(!isFocused){
            setLastPlayedAt(0)
        }
        return () => clearInterval(timer);
    },[isFocused])

    const animate=()=>{
        if(animated && isFocused){
                    setLastPlayedAt(new Date())
                    animation?.current?.play()
        }
    }
    const renderView = (NavItem, index) => {
        const trigger = () => {
            NavItem.navigate !== false && debounce(NavItem.func())
        }
        if(NavItem?.animationView){
            return (
                <TouchableOpacity
                    key={`nav-${index}`}
                    style={styles.pressButton}
                    onPress={trigger}>

                    <LottieView
                            source={ theme.dark ? lottie.rocketDark : lottie.rocketLight }
//                            source={Platform.OS === 'ios' ? theme.dark ? lottie.rocketDarkIos : lottie.rocketLightIos : theme.dark ? lottie.rocketDark : lottie.rocketLight }
                            // style={styles.pressButton}
                            style={{height: 40, alignSelf: 'center', backgroundColor: colors.surfaceDark}}
                            autoPlay={false}
                            loop={false}
                            ref={animation}
                        />
                    {NavItem.label && (
                        <Text
                            style={styles.iconLabel}
                            onPress={trigger}>
                            {NavItem.label}
                        </Text>
                    )}
                </TouchableOpacity>
            );
        } else{
            return (
                <TouchableOpacity
                    key={`nav-${index}`}
                    style={styles.pressButton}
                    onPress={trigger}>
                    <ImageIcon
                        size={25}
                        rounded={false}
                        source={NavItem.icon}
                        onPress={trigger}
                    />
                    {NavItem.label && (
                        <Text
                            style={styles.iconLabel}
                            onPress={trigger}>
                            {NavItem.label}
                        </Text>
                    )}
                </TouchableOpacity>
            );
        }
    }

    return (
        <View style={styles.navBar}>
            {navList && navList.map(renderView)}
        </View>
    );
}

const SpaceStyle = ({colors}) => {
    return StyleSheet.create({
        pressButton: {
            marginVertical: 10,
            flex: 1,
            alignItems: 'center',
            justifyContent:'flex-end'
        },
        navBar: {
            borderTopColor: colors.primaryLine,
            borderTopWidth: 0.5,
            flexDirection: 'row',
            elevation: 10,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: colors.surfaceDark,
        },
        iconLabel: {fontSize: scale.font.s},
    });
};
