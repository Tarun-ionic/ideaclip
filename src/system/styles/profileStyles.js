import {Platform, StyleSheet} from 'react-native';
import scale from 'utilities/scale';

export default function ProfileStyles({colors}, imageSize = 0) {
    return StyleSheet.create({
        card: {
            flexDirection: 'row',
            flex: 1,
            padding: 10,
            borderRadius: 5,
        },
        modal: {
            flex: 1,
            alignItems: 'center',
            alignContent: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(52, 52, 52, 0.6)',
        },
        row: {
            flexDirection: 'row',
        },
        reasonLabel: {
            marginVertical: 5,
            color: colors.textPrimaryDark,
        },
        popUpLink: {
            color: colors.link,
        },
        badge: {
            height: 20,
            width: 20,
            marginRight: 30,
            marginStart: 10,
            marginBottom: 10,
        },
        icon: {
            marginRight: 20,
        },
        container: {
            width: scale.ms(350, 0.5),
            minHeight: '30%',
            flexDirection: 'column',
            backgroundColor: colors.surfaceDark,
            margin: 20,
            maxHeight: '90%',
            borderRadius: 20,
            padding: 10,
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
        },
        item: {
            flexDirection: 'row',
            backgroundColor: colors.surface,
            flex: 1,
            marginHorizontal: 5,
        },
        avatar: {
            backgroundColor: colors.surfaceDark,
            borderRadius: 50,
            width: 100,
            height: 100,
            alignItems: 'center',
            alignContent: 'center',
            overflow: 'hidden',
            margin: 20,
        },
        avatarFill: {
            width: 100,
            height: 100,
            resizeMode: 'contain',
        },
        info: {
            flexDirection: 'column',
            flex: 1,
            marginLeft: 5,
            alignSelf: 'center',
            alignContent: 'center',
        },
        infoTitle: {
            marginLeft: 10,

            fontSize: scale.font.l,
            paddingEnd: 15,
        },
        subTitle: {
            marginLeft: 10,
            fontSize: scale.font.s,
            paddingEnd: 15,
        },
        actionBlock: {
            flexDirection: 'row',
            padding: 5,
            marginRight: 10,
        },
        noRecord: {
            flexDirection: 'row',
            marginLeft: 5,
            textAlign: 'center',
            fontSize: scale.font.xxxl,
            padding: 5,
            marginTop: 4,
            marginBottom: 2,
            backgroundColor: colors.surface,
            color: colors.textPrimaryDark,
        },
        lineStyle: {
            height: 1,
            width: '100%',
            padding: 0,
            alignSelf: 'center',
            backgroundColor: colors.lineSeparation,
            marginStart: 10,
            marginEnd: 10,
        },
        imageContainer: {
            height: imageSize,
            width: imageSize,
            borderRadius: imageSize,
            shadowColor: '#006',
            margin: 20,
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.1,
            overflow: 'hidden',
        },
        outerButton: {
            flex: 1,
            margin: 10,
            height: 40,
            minWidth: '25%',
            justifyContent: 'center',
            backgroundColor: colors.secondaryDark,
            borderRadius: 5,
            borderWidth: Platform.OS === 'ios' ? 0.5 : 1.0,
            borderColor: colors.secondaryDark,
            alignSelf: 'center',
            paddingVertical: 5,
            paddingHorizontal: 10,
        },
        outerText: {
            fontSize: scale.font.xxl,
            textAlign: 'center',
            color: colors.textSecondaryDark,
        },
        floatCamera: {
            backgroundColor: colors.surfaceDark,
            borderRadius: 50,
            overflow: 'hidden',
        },
        counter: {
            position: 'absolute',
            backgroundColor: colors.surfaceDark,
            width: 17,
            height: 17,
            top: -5,
            right: -5,
            zIndex: 5,
            borderRadius: 50,
        },
        count: {
            color: colors.secondary,
            fontSize: scale.font.s,
            textAlign: 'center',
        },
        label: {
            textAlign: 'center',
            color: colors.textPrimaryDark,
        },
        userName: {
            marginStart: 10,
            marginEnd: 10,
            flex: 1,
            fontSize: scale.font.xxl,
            color: colors.textPrimaryDark,
        },
        centerRow: {
            alignSelf: 'center',
            flexDirection: 'row',
        },
        column: {
            marginVertical: 15,
            flexDirection: 'column',
            alignSelf: 'center',
        },
        actionBar: {
            flexDirection: 'row',
            flex: 2,
            marginTop: 5,
            marginBottom: 15,
        },
        screenContainer: {
            flex: 1,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
        },
        keyboardScroll: {
            flex: 1,
            width: '100%',
            paddingBottom: 100,
        },
        tabContainer: {
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.secondaryDark,
            backgroundColor: colors.surfaceDark,
            margin: 10,
        },
        tabHeader: {
            flex: 2,
            flexDirection: 'row',
            width: '100%',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        tabTitle: {
            color: colors.secondaryDark,
            fontSize: scale.font.xxl,
            marginTop: 10,
            marginStart: 20,
            marginBottom: 10,
        },
        tabArrow: {
            marginEnd: 5,
            alignSelf: 'center',
        },
        tabContent: {
            marginBottom: 20,
        },
        InputBox: {
            minHeight: 44,
            width: '90%',
            alignSelf: 'center',
            marginTop: 20,
            borderRadius: 25,
            borderColor: colors.textInputBackground,
        },
        saveButton: {
            marginTop: 20,
            alignSelf: 'center',
        },
        minMapContainer: {
            width: '90%',
            alignSelf: 'center',
            marginTop: 20,
        },
        minMapLabel: {
            color: colors.textPrimary,
            fontSize: scale.font.l,
            marginStart: 5,
        },
        labelTextView: {
            color: colors.textPrimaryDark,
            fontSize: scale.font.xxl,
        },
        minMap: {marginVertical: 10},
        relatedImageContainer: {
            color: colors.textPrimary,
            fontSize: scale.font.xxxl,
            marginStart: 5,
        },
        floatButton: {
            position: 'absolute',
            top: 50,
            right: 15,
            borderRadius: 50,
            elevation: 5,
            backgroundColor: colors.surfaceDark,
        },
        spacer: {
            height: 50,
            width: '100%',
        },
    });
}
