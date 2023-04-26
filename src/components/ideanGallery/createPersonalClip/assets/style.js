import {Platform, StyleSheet} from 'react-native';
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
            paddingTop: 15,
            paddingHorizontal: 10,
            paddingBottom: 10,
            borderRadius: 10,
            backgroundColor: colors.fp_surface,
        },
        titleContainer: {
            flexDirection: 'row',
        },
        logo: {
            width: 20,
            height: 20,
            marginTop: 5,
            marginLeft: 5,
            resizeMode: 'contain',
        },
        title: {
            flex: 1,
            marginLeft: 5,
            color: colors.fp_title,
            fontSize: scale.font.l,
            textTransform: 'uppercase',
            alignSelf: 'center',
        },

        radioButtonContainer: {marginTop: 10, marginLeft: 15},
        radioBtnRow: {flexDirection: 'row', marginTop: 5, alignItems: 'center', marginRight: 10, marginBottom: 15},
        radioBtnText: {
            color: colors.fp_radioBtnLabel,
            fontSize: scale.font.s,
            marginLeft: 5,
            textAlignVertical: 'center'
        },
        timeSetterText: {
            margin: 5,
            fontSize: scale.font.l,
            color: colors.fp_timer,
            height: 35,
            textAlignVertical: 'center',
        },
        roundButton: {
            maxWidth: 90,
            backgroundColor: colors.fp_btn,
            color: colors.fp_btnText,
            marginTop: 30,
            fontSize: scale.font.l,
            fontWeight: 'bold',
        },
        subTitle: {
            flex: 1,
            marginLeft: 5,
            marginTop: 10,
            marginBottom: 10,
            color: colors.fp_title,
            fontSize: scale.font.s,
        },
        optionContainer: {
            flexDirection: 'row',
            display: 'flex',
            marginLeft: 30,
            marginTop: 10,
        }, optionContainer2: {
            flexDirection: 'row',
            display: 'flex',
            marginLeft: 20,
        },
        radioRow: {
            flexDirection: 'row',
            display: 'flex',
            borderWidth: 1,
            borderRadius: 10,
            height: 30,
            backgroundColor: colors.fp_inputBg,
            borderColor: colors.fp_inputBorder,
            paddingLeft: 15,
            paddingRight: 15,
            marginTop: Platform.OS === 'ios' ? 0 : 7,
        },
        radioInput: {
            minWidth: 20,
            padding: 0,
            color: colors.fp_inputBorder,
            lineHeight: 15,
            height: 30,

        },
        middleText: {
            minWidth: 30,
            paddingTop: Platform.OS === "ios" ? 4 : 0,
            lineHeight: 20,
            height: 30,
            fontWeight: "bold",
            fontSize: 16,
            color: colors.fp_colan,
            textAlign: "center",
            textAlignVertical: "center"
        },
        maxButton: {
            textAlign: 'left',
            marginLeft: "35%",
            fontSize: scale.font.l,
            color: colors.fp_timerMax,
            height: 35,
        },
    });
}
