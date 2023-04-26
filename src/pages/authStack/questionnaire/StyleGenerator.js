import {Platform, StyleSheet} from 'react-native';
import scale from 'utilities/scale';

export default function StyleGenerator({colors}) {
    return StyleSheet.create({
        lottie: {
            width: 50,
            height: 50,
        },
        logo: {
            flex: 1,
            width: 200,
            height: 100,
            alignSelf: 'center',
            margin: 10,
            resizeMode: 'contain',
        },
        title: {
            marginVertical: 15,
            marginHorizontal: 10,
            fontSize: scale.font.xl,
            textAlign: 'left',
            color: colors.textPrimary,
        },
        container: {
            flex: 1,
        },
        button: {
            fontSize: scale.font.l,
            color: colors.secondaryDark,
            marginTop: 10,
        },
        buttonContainer1: {
            width: '90%',
            minHeight: 45,
            borderRadius: 10,
            borderWidth: Platform.OS === 'ios' ? 0.5 : 2.0,
            borderColor: colors.textPrimary,
            padding: 10,
            margin: 5,
            justifyContent: Platform.OS === 'ios' ? 'center' : "space-evenly",
        },
        buttonContainer2: {
            width: '90%',
            minHeight: 45,
            backgroundColor: colors.textPrimary,
            borderRadius: 10,
            borderWidth: Platform.OS === 'ios' ? 0.5 : 1.0,
            borderColor: colors.primaryDark,
            padding: 10,
            margin: 5,
            justifyContent: Platform.OS === 'ios' ? 'center' : "space-evenly",
        },
        text1: {
            textAlign: 'left',
            color: colors.textPrimary,
            width: '100%', lineHeight: 25
        },
        text2: {
            textAlign: 'left',
            color: colors.primaryDark,
            width: '100%', lineHeight: 25
        },
    });
}
