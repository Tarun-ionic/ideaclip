import React from 'react';
import flashDealStyle from './assets/style';
import FastImage from 'react-native-fast-image';
import {logger} from '../../../index';
import eventBoost from './assets/eventBoost.png';
import charityEventBoost from './assets/cEventBoost.png';
import {View} from 'react-native';
import {useTheme} from '../../../context/ThemeContext';
import {pcTypes} from "../../../utilities/constant";

const EventBoost = ({type, offset, size}) => {
    const {theme} = useTheme();
    const styles = flashDealStyle(theme, offset, size);
    return (
        <View style={styles.flashView}>
            <FastImage
                style={styles.flashImage}
                source={type === pcTypes.charityEventBoost ? charityEventBoost : eventBoost}
                resizeMode={FastImage.resizeMode.contain}
                onError={error => logger.e('ImageIcon', error)}
            />
        </View>
    );
};

export default EventBoost;
