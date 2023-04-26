// noinspection HttpUrlsUsage

import React, {useRef} from 'react';
import {useTheme} from '../../context/ThemeContext';
import WebView from 'react-native-webview';
import {webURLs} from "../../utilities/constant";
import {Linking} from "react-native";

function PP() {
    const {width, mode, theme} = useTheme();
    const {colors} = theme
    const ref = useRef()
    const uri = `${webURLs.privacyApp}?theme=${mode}`
    return (
        <WebView
            ref={ref}
            source={{uri}}
            style={{width, backgroundColor: colors.surface}}
            cacheEnabled={false}
            onNavigationStateChange={(event) => {
                if (event.url?.trim() !== uri.trim()) {
                    ref?.current?.stopLoading();
                    ref?.current?.goBack();
                    Linking.openURL(event.url).then();
                }
            }}
        />
    );
}

export default React.memo(PP);
