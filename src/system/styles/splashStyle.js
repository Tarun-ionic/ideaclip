import {StyleSheet} from 'react-native';
import scale from 'utilities/scale';

export default function SplashStyle({colors}) {
    return StyleSheet.create({
        container: {
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            alignContent: 'space-around',
        },
        lottie: {
            width: 75,
            height: 75,
            position: 'absolute',
            bottom: 25,
        },
        logo: {
            resizeMode: 'contain',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 20,
        },
        tagline: {
            width: '100%',
            fontSize: scale.font.xxxl,
            color: colors.textPrimaryDark,
            marginVertical: 10,
            textAlign: 'center',
        },
        version: {
            position: 'absolute',
            bottom: 10,
            width: '100%',
            fontSize: scale.font.s,
            color: colors.textPrimaryDark,
            marginVertical: 10,
            textAlign: 'center',
        },
    });
}
