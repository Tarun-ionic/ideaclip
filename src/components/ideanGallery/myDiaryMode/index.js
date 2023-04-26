import React from 'react';
import flashDealStyle from './assets/style';
import FastImage from 'react-native-fast-image';
import {logger} from '../../../index';
import my_diary_mode from './assets/my_diary_mode.png';
import {View} from 'react-native';
import {useTheme} from '../../../context/ThemeContext';

const MyDiaryMode = ({offset, size}) => {
    const {theme} = useTheme();
    const styles = flashDealStyle(theme, offset, size);
    return (
        <View style={styles.flashView}>
            <FastImage
                style={styles.flashImage}
                source={my_diary_mode}
                resizeMode={FastImage.resizeMode.contain}
                onError={error => logger.e('ImageIcon', error)}
            />
        </View>
    );
};

export default MyDiaryMode;
