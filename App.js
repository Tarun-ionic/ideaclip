import React, {useEffect} from 'react';
import {ApolloProvider} from '@apollo/client';
import apolloLib from './src/lib/apolloLib';
import ThemeManager from './src/context/ThemeContext';
import {AlertProvider} from './src/context/AlertContext';
import {SessionProvider} from './src/context/SessionContext';
import {LogBox, Platform, StatusBar, Text, TextInput} from 'react-native';
import {setCustomText, setCustomTextInput} from 'react-native-global-props';
import {DefaultTheme, Provider as PaperProvider} from 'react-native-paper';
import {fonts, theme} from './src';
import AppContainer from './src/pages/AppContainer';
import notify from './src/services/notify';
import scale from './src/utilities/scale';
import { NativeBaseProvider } from 'native-base';

export default function App() {
  /* set custom font */
  setCustomText({
    style: {fontFamily: fonts.Bahnschrift, fontSize: scale.font.s},
    maxFontSizeMultiplier:
      Platform.OS === 'ios' ? (Platform.isPad ? 0 : 1.2) : 0,
  });

  setCustomTextInput({
    style: {fontFamily: fonts.Bahnschrift, fontSize: scale.font.s},
    maxFontSizeMultiplier:
      Platform.OS === 'ios' ? (Platform.isPad ? 0 : 1.2) : 0,
  });

  Text.defaultProps.maxFontSizeMultiplier =
    Platform.OS === 'ios' ? (Platform.isPad ? 0 : 1.2) : 0;
  TextInput.defaultProps.maxFontSizeMultiplier =
    Platform.OS === 'ios' ? (Platform.isPad ? 0 : 1.2) : 0;
  /* ignore log box */
  LogBox.ignoreAllLogs(true);
  /* def papper theme*/

  const paperTheme = {
    ...DefaultTheme,
    roundness: 2,
    colors: {
      ...DefaultTheme.colors,
      primary: theme.light.colors.secondaryDark,
      accent: theme.light.colors.secondaryDark,
    },
  };
  useEffect(() => {
    StatusBar.setHidden(true);
    (async () => await notify.init())();
  }, []);

  return (
	  <NativeBaseProvider>
        <ThemeManager>
            <SessionProvider>
              <ApolloProvider client={apolloLib.client({})}>
                <AlertProvider>
                <AppContainer />
                </AlertProvider>
              </ApolloProvider>
            </SessionProvider>
        </ThemeManager>
	  </NativeBaseProvider>
  );
}
