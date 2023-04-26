import React, {createContext, useContext, useEffect, useState} from 'react';
import {Appearance, Dimensions, Platform, StatusBar} from 'react-native';
import {theme} from '../index';
import logger from '../lib/logger';
import useWindowDimensions from 'react-native/Libraries/Utilities/useWindowDimensions';
import {displayOrientation} from '../utilities/constant';

const defaultMode = Appearance.getColorScheme() || 'light';

export const ThemeContext = createContext({
    mode: defaultMode,
    setMode: () => {
    },
});
export const useTheme = () => useContext(ThemeContext);

const ManageThemeProvider = ({children}) => {
    const [dimension, setDimension] = useState(useWindowDimensions())
    const [themeMode, setThemeMode] = useState(Appearance.getColorScheme() || 'light');
    const [tempThemeMode, setTempThemeMode] = useState("");
    const isPortrait = () => {
        const dim = Dimensions.get('screen');
        return dim.height >= dim.width;
    };

    const [orientation, setOrientation] = useState(
        isPortrait() ? displayOrientation.portrait : displayOrientation.landscape,
    );
    const setMode = mode => {
        setThemeMode(mode);
    };

    useEffect(() => {
        const scale = Dimensions.get('screen').scale / Dimensions.get('window').scale;
        setDimension({width: Dimensions.get('window').width * scale, height: Dimensions.get('window').height * scale})
    }, [])

    useEffect(() => {
        let mount = true;
        const reCheck = () => setTimeout(() => {
            const colorScheme = Appearance.getColorScheme()
            if (mount && tempThemeMode === colorScheme) {
                setThemeMode(colorScheme)
            }
        }, 1500)
        reCheck()

        return () => {
            mount = false;
        };
    }, [tempThemeMode])

    useEffect(() => {
        let mount = true;
        const subscription = Appearance.addChangeListener(({colorScheme}) => {
            if (Platform.OS === "ios")
                setTempThemeMode(colorScheme)
            else
                setThemeMode(colorScheme)
        });
        Dimensions.addEventListener('change', () => {
            if (mount) {
                setOrientation(
                    isPortrait()
                        ? displayOrientation.portrait
                        : displayOrientation.landscape,
                );
            }
        });

        return () => {
            mount = false;
            subscription.remove();
        };
    }, []);

    return (
        <ThemeContext.Provider
            value={{
                width: dimension.width,
                height: dimension.height,
                mode: themeMode,
                orientation,
                theme: themeMode === 'dark' ? theme.dark : theme.light,
                setMode,
            }}>
            <StatusBar
                barStyle={themeMode === 'dark' ? 'dark-content' : 'light-content'}
            />
            {children}
        </ThemeContext.Provider>
    );
};

const ThemeManager = ({children}) => (
    <ManageThemeProvider>
        {children}
    </ManageThemeProvider>
);

export default ThemeManager;
