import {StyleSheet} from 'react-native';
import scale from 'utilities/scale';
import {displayOrientation} from '../../utilities/constant';

export default function TermsStyle({colors}, width, height, orientation) {
    return StyleSheet.create({
        container: {flex: 1},
        headline: {
            fontSize: scale.font.xl,
            color: colors.textPrimaryDark,
        },
        checkBoxText: {
            textAlignVertical: 'center',
            fontSize: scale.font.l,
            color: colors.textPrimary,
        },
        subHeading: {
            fontSize: scale.font.l,
            fontWeight: 'bold',
            color: colors.textPrimaryDark,
        },
        topBar: {
            backgroundColor: colors.background,
            elevation: 0,
            zIndex: 5,
        },
        paragraph: {
            flex: 1,
            fontSize: scale.font.s,
            color: colors.textPrimary,
        },
        title: {
            fontSize: scale.font.xxl,
            paddingHorizontal: 20,
            color: colors.textPrimary,
        },
        floatActionLayout: {
            zIndex: 5,
            flexDirection: 'row',
            position: 'relative',
        },
        buttonContainer: {
            flex: 1,
            marginHorizontal: 1,
            overflow: 'hidden',
            width: scale.ms(75),
            borderRadius: 5,
            backgroundColor: colors.background,
            alignContent: 'center',
            alignItems: 'center',
        },
        acceptButton: {
            fontSize: scale.font.l,
            color: 'green',
        },
        cancelButton: {
            fontSize: scale.font.l,
            color: 'red',
        },
        viewContainerBox: {marginTop: 20, height: height / 3},
        termsBoxSeparator: {
            width: 50,
            height: 3,
            backgroundColor: colors.secondaryDark,
            marginBottom: 15,
            marginLeft: 20,
        },
        termsCheckBox: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
            marginEnd: 20,
        },
        termsScrollBox: {
            flex: 1,
            flexDirection: 'column',
            height: height / 3,
            padding: 5,
            backgroundColor: colors.surface,
        },
        nextButtonStyle: {marginTop: 30, marginBottom: 50},
        termsBoxLine: {
            width,
            height: 1,
            backgroundColor: colors.primary,
        },
        bullet: {
            alignSelf: 'flex-start',
            fontSize: 40,
            paddingTop: 12,
            textAlign: 'center',
            position: 'absolute',
            textAlignVertical: 'bottom',
            color: colors.textPrimaryDark,
        },
        bullet_2: {paddingHorizontal: 10, fontSize: scale.font.l, color: colors.textPrimary},
        bulletItem: {flexDirection: 'row', flex: 1, marginTop: 10, paddingLeft: 20},
        paragraph_line: {
            fontSize: scale.font.l,
            color: colors.textPrimaryDark,
            paddingVertical: 5,
            textDecorationLine: 'underline',
        },
    });
}
