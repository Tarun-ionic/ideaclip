import {StyleSheet} from 'react-native';

const flashDealStyle = ({colors}, offset = {top: 0, right: 0}, size = 80) => {
    return StyleSheet.create({
        flashView: {
            position: 'absolute',
            zIndex: 9998,
            width: size,
            height: size,
            top: offset?.top > 0 ? offset?.top : 10,
            right: offset?.right > 0 ? offset?.right : 10,
        },
        flashImage: {
            width: size,
            height: size,
        },
    });
};

export default flashDealStyle;
