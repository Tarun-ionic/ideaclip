// noinspection ES6CheckImport

import {Dimensions} from 'react-native';
import PixelRatio from 'react-native/Libraries/Utilities/PixelRatio';
import {moderateScale} from 'react-native-size-matters';

const {fontScale} = Dimensions.get('window');
const moderate = (size, ratio) => {
    if (ratio) {
        return size * ratio;
    } else {
        return PixelRatio.getPixelSizeForLayoutSize(size);
    }
};
const moderateFont = size => {
    return fontScale > 1 ? size * 1 : size * fontScale;
};
const ms = (size, ration = 0.3) => moderateScale(size, ration);
const font = {
    xxs: moderateFont(10),
    xs: moderateFont(12),
    s: moderateFont(14),
    l: moderateFont(16),
    xl: moderateFont(18),
    pxl: moderateFont(22),
    xxl: moderateFont(20),
    xxxl: moderateFont(24),
    sl: moderateFont(50),
    ssl: moderateFont(25),
    sxl: moderateFont(70),
    ssxl: moderateFont(45),
    ul: moderateFont(90),
    usl: moderateFont(30),
    uxl: moderateFont(110),
    usxl: moderateFont(50),
};

const toolbar = {
    xs: ms(40, 0.3),
    s: ms(56, 0.3),
    m: ms(60, 0.3),
    l: ms(70, 0.3),
    xl: ms(70, 4.0),
    xxl: ms(100, 2.2)
};

const icon = {
    xxs: ms(15, 0.3),
    xs: ms(20, 0.3),
    s: ms(25, 0.3),
    l: ms(30, 0.3),
    xl: ms(35, 0.3),
};

const space = {
    xxs: ms(2.5, 0.3),
    xs: ms(20, 0.3),
    s: ms(10, 0.3),
    l: ms(15, 0.3),
    xl: ms(20, 0.3),
    xxl: ms(2, 0.3),
};

const scale = {
    icon,
    font,
    moderate,
    toolbar,
    space,
    ms,
};
export default scale;
