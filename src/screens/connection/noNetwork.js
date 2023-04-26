import React, {useEffect, useState} from "react";
import {logger, SafeScreenView} from "../../index";
import FastImage from "react-native-fast-image";
import no_internet from "./assets/no-internet.png";
import {useTheme} from "../../context/ThemeContext";
import NetInfo from "@react-native-community/netinfo";
import {useIsFocused, useNavigation} from "@react-navigation/native";

function noNetwork() {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const {theme, width, height} = useTheme()
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (isFocused) {
            const unsubscribe = NetInfo.addEventListener(state => {
                setIsConnected(state.isConnected && state.isInternetReachable);
            });
            return () => unsubscribe();
        }
    }, [isFocused]);

    useEffect(() => {
        if (isConnected) navigation.push('Splash')
    }, [isConnected])


    return (
        <SafeScreenView>
            <FastImage
                style={{width, height, backgroundColor: theme.colors.background}}
                source={no_internet}
                resizeMode={FastImage.resizeMode.contain}
                onError={error => logger.e('no_internet', error)}
            />
        </SafeScreenView>
    )
}

export default React.memo(noNetwork);
