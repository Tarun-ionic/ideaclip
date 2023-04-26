import {StyleSheet} from 'react-native';
import scale from 'utilities/scale';

export default function SettingsStyle({colors}) {
    return StyleSheet.create({
        container: {
            flexDirection: 'row',
            marginTop: 2,
            height: 60,
            marginHorizontal: 5,
            backgroundColor: colors.surfaceDark,
        },
        icon: {
            height: 25,
            width: 25,
            marginStart: 10,
            alignSelf: 'center',
            tintColor: colors.secondaryDark,
        },
        label: {
            justifyContent: 'center',
            alignSelf: 'center',
            marginStart: 15,
            fontSize: scale.font.l,
            color: colors.textPrimaryDark,
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
