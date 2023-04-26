import {StyleSheet} from 'react-native';
import scale from "../../../utilities/scale";

export const UserListStyle = ({colors}) =>
    StyleSheet.create({
        container: {
            flexDirection: 'column',
            backgroundColor: colors.surface,
            height: '100%',
        },
        container2: {
            backgroundColor: colors.surfaceDark,
            flex: 1,
        },
        subtext: {
            fontSize: scale.font.l,
            alignSelf: 'center',
            textAlign: 'center',
            margin: 10,
            color: colors.textPrimaryDark,
        },
        roundedButtonWrap: {
            alignSelf: 'center',
            flexDirection: 'row',
            alignItems: 'center',
            alignContent: 'center',
        },
        roundedButtonLabel: {
            color: colors.textSecondaryDark,
            textAlign: 'center',
            textAlignVertical: 'center',
            fontSize: scale.font.s,
            flex: 1,
        },
        lottie: {
            height: 100,
            alignSelf: 'center',
        },
        card: {
            flexDirection: 'row',
            justifyContent: 'center',
            backgroundColor: colors.surfaceDark,
            elevation: 5,
            marginHorizontal: 8,
            marginTop: 4,
            borderRadius: 5,
            paddingVertical: 10,
            paddingHorizontal: 5,
        },
        card2: {
            flexDirection: 'row',
            flex: 1,
            marginHorizontal: 20,
            marginTop: 10,
            borderColor: '#acacac',
            borderRadius: 15,
            borderWidth: 0.5,
            paddingVertical: 5,
            paddingHorizontal: 12,
        },

        cardInfo: {
            flexDirection: 'row',
            flex: 1,
        },
        organization: {
            flexDirection: 'row',
            flex: 1,
            marginHorizontal: 2,
        },
        avatar: {
            backgroundColor: colors.surfaceAccent,
            borderRadius: 50,
            width: 40,
            height: 40,
            alignItems: 'center',
            alignContent: 'center',
            alignSelf: "center",
            overflow: 'hidden',
        },
        avatarImage: {
            marginVertical: 7,
            width: 23,
            height: 23,
            resizeMode: 'contain',
        },
        avatarFill: {
            width: 40,
            height: 40,
            resizeMode: 'cover',
        },
        info: {
            flexDirection: 'column',
            flex: 1,
            marginLeft: 5,
            alignSelf: 'center',
            alignContent: 'center',
        },
        info2: {
            height: '100%',
            flexDirection: 'column',
            marginLeft: 5,
            alignSelf: 'center',
            alignContent: 'center',
        },

        infoTitle: {
            marginLeft: 10,
            fontSize: scale.font.l,
            paddingEnd: 15,
            color: colors.textPrimaryDark,
        },
        subTitle: {
            marginLeft: 10,
            fontSize: scale.font.s,
            paddingEnd: 15,
            color: colors.textPrimary,
        },
        actionBlock: {
            flexDirection: 'row',
            padding: 5,
            marginRight: 10,
        },
        actionText: {
            flexDirection: 'row',
            marginLeft: 5,
            color: 'black',
            fontSize: scale.font.xxxl,
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
            borderWidth: 0.8,
            width: '95%',
            padding: 0,
            alignSelf: 'center',
            borderColor: colors.secondaryDark,
            marginStart: 10,
            marginEnd: 10,
        },
        lottie_sm: {
            height: 50,
            width: 50,
            alignSelf: 'center',
        },
        lottie_pagination: {
            height: 25,
            width: 25,
            alignSelf: 'center',
        },
        loader_container_bottom: {
            position: 'absolute',
            bottom: 20,
            opacity: 1,
            alignSelf: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 30,
            backgroundColor: colors.surface,
            padding: 3,
            zIndex: 500,
        },
        loader_container_top: {
            position: 'absolute',
            top: 10,
            opacity: 1,
            alignSelf: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 30,
            backgroundColor: colors.surface,
            padding: 3,
            zIndex: 500,
        },
        unRead: {
            backgroundColor: colors.notificationListDot,
            width: 10,
            height: 10,
            zIndex: 5,
            alignSelf: "flex-end",
            borderRadius: 50,
        },
        time: {
            height: 50,
            alignSelf: "flex-end",
        },
        lovitzCountRow: {
            borderBottomColor: colors.secondaryLine,
            borderBottomWidth: 0.5,
            padding: 10,
            marginHorizontal: 10,
            marginBottom: 10
        },
        lovitzCountCard: {
            display: 'flex',
            flexDirection: "row",
            marginLeft: 20,
        },
        lovitzCountCard2: {
            display: 'flex',
            flexDirection: "row",
            marginLeft: 20,
            justifyContent: 'center'
        },
        lovitzIcon: {
            backgroundColor: colors.surfaceAccent,
            borderRadius: 30,
            alignItems: 'center',
            alignContent: 'center',
            overflow: 'hidden',
        },
        lovitzIconText: {
            color: colors.textPrimary,
            paddingHorizontal: 10,
            marginTop: 3,
            fontSize: scale.font.l,
            textAlignVertical: "center"
        },
        lovitzIconTextActive: {
            color: colors.secondary
        }
    });
