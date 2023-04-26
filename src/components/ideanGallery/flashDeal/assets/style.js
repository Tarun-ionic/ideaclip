import {StyleSheet} from 'react-native';

const flashDealStyle = ({colors}, offset = {top: 0, right: 0}, size) => {
    return StyleSheet.create({
        flashView: {
            position: 'absolute',
            zIndex: 9998,
            top: offset?.top > 0 ? offset?.top : 10,
            right: offset?.right > 0 ? offset?.right : 10,
        },
        flashImage: {
            width: size,
            height: size,
        },
        flashTimer: {
            width: size * 0.80,
            position: 'absolute',
            zIndex: 9999,
            bottom: size * 0.1850,
            right: size * 0.1050,
            fontSize: size * 0.10,
            textAlign: 'center',
            margin: 'auto',
            fontWeight: 'bold',
            color: colors.fp_timer_text,
        },
    });
};

export default flashDealStyle;
