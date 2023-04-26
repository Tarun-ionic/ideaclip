import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';
import {useBackHandler} from '../../utilities/helper';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../../context/ThemeContext';
import {SafeScreenView} from '../../index';
import PP from './pp';
import {Title} from 'react-native-paper';
import TermsStyle from '../../system/styles/termsStyle';
import AppBar from '../../screens/components/toolbar/appBar';

function PrivacyPolicy() {
    const navigation = useNavigation();
    const {theme, width, height} = useTheme();
    const styles = TermsStyle(theme, width, height);

    useBackHandler(() => {
        onBackPress();
        return true;
    }, []);

    const onBackPress = () => {
        navigation.goBack(null);
    };

    useEffect(() => {
        StatusBar.setHidden(true);
    }, []);

    return (
        <SafeScreenView>
            <AppBar 
            // gradiant 
            onBackPress={onBackPress}/>
            <Title style={styles.title}>Privacy Policy</Title>
            <PP/>
        </SafeScreenView>
    );
}

export default React.memo(PrivacyPolicy);
