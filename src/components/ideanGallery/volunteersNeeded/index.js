import React from 'react';
import flashDealStyle from './assets/style';
import FastImage from 'react-native-fast-image';
import {logger} from '../../../index';
import volunteers_needed from './assets/volunteers_needed.png';
import {View} from 'react-native';
import {useTheme} from '../../../context/ThemeContext';

const VolunteersNeeded = ({offset, size}) => {
    const {theme} = useTheme();
    const styles = flashDealStyle(theme, offset, size);
    return (
        <View style={styles.flashView}>
            <FastImage
                style={styles.flashImage}
                source={volunteers_needed}
                resizeMode={FastImage.resizeMode.contain}
                onError={error => logger.e('ImageIcon', error)}
            />
        </View>
    );
};

export default VolunteersNeeded;
