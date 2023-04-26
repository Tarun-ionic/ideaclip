import {StyleSheet} from 'react-native';

export default function AppBarStyle({colors, fontFamily}) {
    return StyleSheet.create({
        appAuthBar: {
            backgroundColor: colors.surfaceDark,
            elevation: 0,
            alignContent: 'center',
        },
        appBar: {
            backgroundColor: colors.surfaceDark,
            zIndex: 25,
        },
        authBarLogo: {
            width: 30,
            height: 30,
            resizeMode: 'contain',
        },
        searchInput: {
            flex: 1,
            height: 40,
            marginLeft: 5,
            width: '50%',
            borderRadius: 10,
            borderWidth: 0.8,
            paddingHorizontal: 15,
            color: colors.textPrimaryDark,
            borderColor: colors.secondaryDark,
            backgroundColor: colors.surfaceDark,
        },
        logo: {
            width: 150,
            height: 50,
            resizeMode: 'contain',
            marginHorizontal: 10,
        },
        content: {
            marginLeft: -15,
        },
        title: {
            width: '100%',
            fontSize: 18,
            marginLeft: 10,

            color: colors.textPrimaryDark,
        },
        subTitle: {
            width: '100%',
            fontSize: 14,
            marginLeft: 10,

            color: colors.textPrimary,
        },
        counter: {
            position: 'absolute',
            backgroundColor: colors.surface,
            width: 20,
            height: 20,
            top: 5,
            right: 5,
            zIndex: 5,
            borderRadius: 50,
            elevation: 10,
        },
        count: {
            color: colors.secondaryAccent,
            fontSize: 10,
            fontFamily,

            padding: 3,
            textAlign: 'center',
        },
        menuItem: {
            backgroundColor: colors.surfaceDark,
        },
        menuLabel: {
            fontFamily,
            fontSize: 12,
            letterSpacing: 1,
            color: colors.textPrimaryDark,
        },
        findBar: {
            flexDirection: 'row',
            backgroundColor: colors.surfaceDark,
            zIndex: 5,
            alignItems: 'center',
            elevation: 3,
            margin: 10,
            borderRadius: 40,
        },
        findBarInput: {
            flex: 1,
            height: 40,
            marginLeft: 5,
            width: '50%',
            borderRadius: 25,
            borderWidth: 2,
            paddingHorizontal: 15,
            color: colors.textPrimaryDark,
            borderColor: colors.secondaryAccent,
            backgroundColor: colors.surfaceDark,
        },
        online: {
            width: 13,
            height: 13,
            position: 'absolute',
            borderRadius: 50,
            backgroundColor: 'green',
            borderWidth: 2,
            borderColor: 'white',
            bottom: 0,
            right: 0,
        },
        offline: {
            width: 13,
            height: 13,
            position: 'absolute',
            borderRadius: 50,
            backgroundColor: 'white',
            borderWidth: 2,
            borderColor: '#9c9797',
            bottom: 0,
            right: 0,
        },
        backButtonArrow: {paddingLeft: 10, paddingVertical: 10, paddingRight: 15},
    });
}
