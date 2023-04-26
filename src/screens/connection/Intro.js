import React from 'react';
import AppIntroSlider from "react-native-app-intro-slider";
import {View} from "react-native";
import {Dimensions, FlatList, Image, ImageBackground} from "react-native";
import startIcon from '../../assets/intro/Intro-start-ac-min.png';
import {AnimatedTouchable} from "../../system/ui/components";
import {useNavigation, useRoute} from "@react-navigation/native";
import {navigationReset} from "../../utilities/helper";
import {useTheme} from "../../context/ThemeContext";
const slides = [
    {
        key: 1,
        top:require('../../assets/intro/introTop.png'),
        // foreground: require('../../assets/intro/Intro-page-1.png'),
        // background: require('../../assets/intro/Intro-page-bg.png'),
        foreground: require('../../assets/intro/intro1.png'),
        background: require('../../assets/intro/bg2.png'),
    },
    {
        key: 2,
        top:null,
        // foreground: require('../../assets/intro/Intro-page-2.png'),
        // background: require('../../assets/intro/Intro-page-bg.png'),
        foreground: require('../../assets/intro/intro2.png'),
        background: require('../../assets/intro/bg2.png'),
    },
    {
        key: 3,
        top:null,
        // foreground: require('../../assets/intro/Intro-page-3.png'),
        // background: require('../../assets/intro/Intro-page-bg.png'),
        foreground: require('../../assets/intro/intro3.png'),
        background: require('../../assets/intro/bg2.png'),
    },
    {
        key: 4,
        top:null,
        // foreground: require('../../assets/intro/Intro-page-4.png'),
        // background: require('../../assets/intro/Intro-page-bg.png'),
        foreground: require('../../assets/intro/intro4.png'),
        background: require('../../assets/intro/bg2.png'),
    },
]


export default function Intro() {
    const navigation = useNavigation();
    const route = useRoute();
    const size = Dimensions.get('window').width
    const redirect = () => {
            navigationReset(navigation, 'PersonalSpace', {...route.params},true);
    }

    const _renderItem = ({item}) => {
        const {foreground, background,top} = item

        return (
            <View style={{width: '100%', height: '100%'}}>

                <ImageBackground
                    source={background}
                    style={{width:'100%',height:'100%',justifyContent:'flex-end' }}
                    resizeMode={'cover'}>
                    {top &&<Image source={top} style={{
                        position:'absolute',
                        top:0,
                        width:size,
                        height:size/4.2,
                        resizeMode:'contain',
                    }}/>}
                    <Image
                        source={foreground}
                        style={{position: "absolute",
                            zIndex: 9999,
                            bottom: -1,
                            width: '100%',
                            height: '89.5%',
                            resizeMode: 'contain',
                        }}
                    />
                    {item.key === 4 &&
                    <AnimatedTouchable onPress={redirect} style={{
                        position: "absolute",
                        zIndex: 9999,
                        top: 40,
                        right: 40,
                    }}>
                        <Image
                            source={startIcon}
                            style={{
                                width: 80,
                                height: 30,
                                resizeMode: 'contain',
                            }}
                        />
                    </AnimatedTouchable>
                    }

                </ImageBackground>
            </View>
        );
    }

    return <AppIntroSlider
        renderItem={_renderItem}
        data={slides}
        showDoneButton={false}
        showPrevButton={false}
        showNextButton={false}
        showSkipButton={false}
        dotStyle={{opacity: 0, display: "none"}}
        activeDotStyle={{opacity: 0, display: "none"}}

    />

}