import {StyleSheet} from 'react-native';
import scale from 'utilities/scale';

export default function ClipStyles(
    {colors, clipWidth, mode},
    width,
    paddingBubble = 5,
    marginBubble = 10,
    viewer = false,
    postView = false
) {

    return StyleSheet.create({
        infoCard: {
            flexDirection: 'row',
            padding: 15,
            backgroundColor: colors.surfaceDark,
            width: width,
            borderBottomWidth: 1,
            borderColor: colors.secondaryAccent,
        },
        orgInfo: {
            flexDirection: 'column',
            marginHorizontal: 10,
            flex: 1,
            alignSelf: 'center',
            color: colors.clipText,
        },
        text: {fontSize: scale.font.l, color: colors.clipText},
        container: {
            flex: 1,
            backgroundColor: colors.surfaceDark,
            marginHorizontal: 5,
            elevation: 5,
            shadowColor: 'rgba(0,0,0,0.8)',
            shadowOffset: {width: 2, height: 2},
            shadowRadius: 3,
            shadowOpacity: 0.5,
            padding: 5,
            borderRadius: 5,
            marginTop: 5,
        },
        reportContainer: {
            flex: 1,
            backgroundColor: colors.surfaceDarkReported,
            marginHorizontal: 5,
            elevation: 5,
            shadowColor: 'rgba(0,0,0,0.8)',
            shadowOffset: {width: 2, height: 2},
            shadowRadius: 3,
            shadowOpacity: 0.5,
            padding: 5,
            borderRadius: 5,
            marginTop: 5,
        },
        message: {
            width: '100%',
            backgroundColor: colors.surfaceDark,
            padding: scale.ms(3),
        },
        reportMessage: {
            width: '100%',
            backgroundColor: colors.surfaceDarkReported,
            padding: scale.ms(3),
        },
        avatar: {
            padding: scale.ms(5),
            flexDirection: 'row',
            flex: 1,
        },
        labelContainer: {
            flex: 1,
            flexDirection: 'column',
            marginHorizontal: 5,
        },
        label: {
            fontSize: scale.font.l,
            color: colors.clipText,
        },
        time: {
            fontSize: scale.font.s,
            marginTop: -5,
            color: colors.clipText,
        },
        line: {
            height: 5,
            backgroundColor: colors.surfaceAccent,
        },
        separator: {
            height: 2,
            backgroundColor: colors.surface,
            width: '98%',
            alignSelf: 'center',
        },
        containerStyle: {
            paddingBottom: 300,
            backgroundColor: 'transparent',
        },
        wrap: {
            flex: 1,
            padding: paddingBubble,
            paddingTop: 10
        },
        hashTagContainer: {
            marginRight: 10,
            paddingVertical: 3,
            paddingHorizontal: 10,
            borderRadius: 20,
            color: 'blue',
            fontSize: scale.font.l,
            backgroundColor: '#efefef',
        },
        playButton: {
            position: 'absolute',
            alignSelf: 'center',
        },
        thump: {
            marginBottom: marginBubble,
            backgroundColor: '#000',
            width: '100%',
            height: '100%',
        },
        defText: {
            flex: 1,
            width: '100%',
            textAlign: 'left',
            color: viewer === true ? colors.clipText : colors.clipTextSecondary,
            fontSize: scale.font.l,
        },
        defTextSearch: {
            flex: 1,
            width: '100%',
            textAlign: 'left',
            color: viewer === true ? colors.clipText : colors.searchClipSecondary,
            fontSize: scale.font.l,
        },
        plainText: {
            fontSize: scale.font.l,
            color: viewer === true ? colors.clipText : colors.clipTextSecondary,
        },
        plainTextSearch: {
            fontSize: scale.font.l,
            color: viewer === true ? colors.clipText : colors.searchClipSecondary,
        },
        defLink: {
            color: (viewer === true || (postView === true && mode === 'dark')) ? colors.textPrimaryAccent : '#0167dc',
            fontSize: scale.font.l,
        },
        defHashTag: {
            color: (viewer === true || (postView === true && mode === 'dark')) ? colors.textPrimaryAccent : '#0167dc',
            fontSize: scale.font.l,
        },
        defMention: {
            color: (viewer === true || (postView === true && mode === 'dark')) ? colors.textPrimaryAccent : '#0167dc',
            fontSize: scale.font.l,
        },
        defShowLink: {
            color: (viewer === true || (postView === true && mode === 'dark')) ? colors.showMore : colors.showMoreSecondary,
            marginLeft: 5,
            fontSize: scale.font.l,
        },
        urlPreview: {flexDirection: 'column', flex: 1, width: '100%'},
        messageBubble: {
            width: width,
            flexDirection: 'column',
            marginVertical: scale.ms(15, 0.5),
            paddingHorizontal: scale.ms(15, 0.5),
            backgroundColor: 'red'
        },
        avatarBubble: {
            flexDirection: 'row',
            flex: 1,
        },
        labelContainerBubble: {
            flex: 1,
            flexDirection: 'column',
            marginHorizontal: 5,
            justifyContent: 'center',
        },
        labelContainerBubbleShrink: {
            flexShrink: 1,
            flexGrow: 0,
            flexDirection: 'column',
            marginHorizontal: 5,
            justifyContent: 'center',
        },
        labelBubble: {
            fontSize: scale.font.l,
            lineHeight: scale.font.l,
            color: colors.textPrimary,
            alignItems: 'flex-end',
            marginBottom: 5,
        },
        timeBubble: {
            fontSize: scale.font.s,
            lineHeight: scale.font.s,
            color: colors.textPrimary,
            alignItems: 'flex-start'
        },
        viewerBubble: {
            marginLeft: 5,
            alignSelf: 'flex-end',
        },
        not_viewerBubble: {
            alignSelf: 'flex-end',
            alignItems: 'flex-end',
            marginRight: 5,
        },
        cloudBubble: {
            width: clipWidth,
            padding: scale.ms(3),
            borderRadius: scale.ms(10),
            marginTop: 3,
            marginHorizontal: 40,
        },
        textBubble: {
            paddingTop: 3,
            fontSize: scale.font.xxl,
            lineHeight: 22,
        },
        arrow_containerBubble: {
            position: 'absolute',
            top: 10,
            left: 0,
            right: 0,
            zIndex: -1,
            flex: 1,
        }, arrow_containerBubbleRemoved: {
            position: 'absolute',
            top: 3,
            left: 0,
            right: 0,
            zIndex: -1,
            flex: 1,
        },
        arrow_left_containerBubble: {
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
        },
        arrow_right_containerBubble: {
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
        },
        arrow_leftBubble: {
            left: scale.ms(-25, 0.5),
        },
        arrow_rightBubble: {
            right: scale.ms(-30, 0.5),
        },
        subHeading: {
            marginHorizontal: 5,
            marginTop: 15,
            color: colors.secondaryDark,
            borderTopColor: 'transparent',
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: colors.secondaryDark,
            borderWidth: 2,
        },
        subHeading2: {
            marginHorizontal: 5,
            marginTop: 15,
            color: colors.secondaryDark,
            borderWidth: 0,
        },
        reasonTextBox: {
            padding: 10,
            borderRadius: 5,
            borderWidth: 1,
            borderColor: colors.secondaryDark,
            maxHeight: 100,
            color: colors.textPrimaryDark,
            backgroundColor: colors.surface,
            textAlignVertical: 'top',
        },
        reasonLabel: {
            marginVertical: 5,
            color: colors.textPrimaryDark,
        },
        actionMenuView: {position: 'absolute', right: 0, top: 0, zIndex: 20},
    });
}
