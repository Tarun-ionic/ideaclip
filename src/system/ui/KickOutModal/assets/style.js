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
            // justifyContent: 'center',
            flexDirection: 'column',
            alignSelf: 'center',
            justifyContent: 'center',
            paddingTop: 5,
            paddingHorizontal: 10,
            paddingBottom: 10,
            borderRadius: 10,
            backgroundColor: colors.alertBox,
        },
        titleContainer: {
            flexDirection: 'row',
            marginTop: 15
        },
        logo: {
            width: 20,
            height: 20,
            marginTop: 3,
            resizeMode: 'contain',
        },
        title: {
            flex: 1,
            marginLeft: 5,
            color: colors.textPrimaryDark,
            fontSize: scale.font.l,
            textTransform: 'uppercase',
            alignSelf: 'center',
        },

        radioButtonContainer: {marginTop: 10, marginLeft: 15},
        radioBtnRow: {
            flexDirection: 'row',
            marginTop: 5,
            marginRight: 10,
            alignItems: 'center',
        },


        radioBtnText: {
            margin: 5,
            fontSize: scale.font.l,
            color: colors.secondary,
            height: 35,
            textAlignVertical: 'center',
        },
        roundButton: {
            maxWidth: 90,
            backgroundColor: colors.radiusButtons,
            marginTop: 30,
        },
        subTitle: {
            flex: 1,
            marginLeft: 5,
            marginTop: 10,
            marginBottom: 10,
            color: colors.textPrimaryDark,
            fontSize: scale.font.s,
            // textAlign: 'center',
        },
        optionContainer: {
            flexDirection: 'row',
            display: 'flex',
            marginLeft: 30,
            marginTop: 15,
        },
        radioRow: {
            flexDirection: 'row',
            display: 'flex',
            backgroundColor: '#fdf8bd',
            borderColor: colors.secondary,
            borderWidth: 1,
            borderRadius: 10,
            height: 30,
            marginTop: 7,
            paddingLeft: 15,
            paddingRight: 15,
        },
        radioInput: {
            minWidth: 20,
            padding: 0,
            lineHeight: 20,
            height: 30,
            margin: 0,
        },
        middleText: {
            minWidth: 20,
            padding: 0,
            textAlignVertical: 'center',
            lineHeight: 20,
            height: 30,
            margin: 0,
        },
        maxButton: {textAlign: 'right', marginRight: 10},
    });
}
