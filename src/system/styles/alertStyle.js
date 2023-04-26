import {StyleSheet} from 'react-native';
import scale from 'utilities/scale';

export default function alertStyle({colors}, width, height) {
    return StyleSheet.create({
        wrap: {
            justifyContent: 'center',
            alignSelf: 'center',
            alignContent: 'center',
            flexDirection: 'column',
            width: width,
            height: height,
            backgroundColor: 'transparent',
        },
        container: {
            elevation: 5,
            shadowColor: 'rgba(0,0,0,0.8)',
            shadowOffset: {width: 2, height: 2},
            shadowRadius: 3,
            shadowOpacity: 0.5,
            width: scale.ms(300),
            justifyContent: 'center',
            flexDirection: 'column',
            alignSelf: 'center',
            alignContent: 'center',
            padding: 10,
            borderRadius: 10,
            backgroundColor: colors.alertBox,
        },
        contentStyle: {
            backgroundColor: colors.alertBox,
            margin: 0,
        },
        headerStyle: {
            margin: 0,
            padding: 0,
        },
        titleContainer: {
            flexDirection: 'row'
        },
        title: {
            flex: 1,
            textAlignVertical: "bottom",
            color: colors.textPrimaryDark,
            fontSize: scale.font.l,
            textTransform: 'uppercase',
            alignSelf: 'center',
        },
        message: {
            color: colors.textPrimaryDark,
            alignItems: 'flex-end',
            margin: 10,
            fontSize: scale.font.l,
            lineHeight: 24
        },
        messageChoose: {
            color: colors.textPrimaryDark,
            fontSize: scale.font.l,
            textTransform: 'uppercase',
            alignSelf: 'center',
            padding: 10,
        },
        logo: {
            width: 25,
            height: 25,
            resizeMode: 'contain',
            alignSelf: 'center'
        },
        line: {
            width: '80%',
            height: 1,
            marginTop: 15,
            backgroundColor: colors.secondaryDark,
        },
        buttonBar: {
            flexDirection: 'row',
            alignSelf: 'flex-end',
        },
        buttonBarChoose: {
            flexDirection: 'column',
            alignSelf: 'center',
        },
        button: {
            color: colors.secondaryText,
            fontSize: scale.font.l,
            padding: 10,
            marginLeft: 10,
        },
        buttonChoose: {
            color: colors.textSecondaryDark,
            fontSize: scale.font.l,
            padding: 10,
            marginLeft: 10,
        },
        lottie: {
            width: 100,
            height: 100,
            alignSelf: 'center',
        },
        lottieMessage: {
            alignSelf: 'center',
            textTransform: 'capitalize',
        },
        reasonListContainer: {marginTop: 10},
        reasonItem: {flexDirection: 'row', marginTop: 5, alignItems: 'center'},
        reasonRadioBtn: {
            marginStart: 5,
            alignSelf: 'center',
            borderColor: colors.textPrimaryDark,
            borderWidth: StyleSheet.hairlineWidth,
            padding: 1,
            borderRadius: 10,
            marginRight: 10,
        },
        reasonItemText: {color: colors.textPrimaryDark, fontSize: scale.font.s, marginLeft: 5},
        reasonText: {
            color: colors.textPrimaryDark,
            marginVertical: 5,
            fontSize: scale.font.l,
        },
        customReasonInput: {
            color: colors.textPrimaryDark,
            width: '100%',
            borderWidth: 1,
            borderColor: colors.secondaryDark,
            padding: 5,
            borderRadius: 5,
            fontSize: scale.font.s,
            height: 80,
        },
    });
}
