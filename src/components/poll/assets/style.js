import {Platform, StyleSheet} from 'react-native';
import scale from 'utilities/scale';

export default function generatorStyle({colors}, width, height) {
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
            zIndex: 100,
            elevation: 5,
            shadowColor: 'rgba(0,0,0,0.8)',
            shadowOffset: {width: 5, height: 5},
            shadowRadius: 3,
            shadowOpacity: 0.5,
            overflow: "hidden",
            width: scale.ms(300),
            justifyContent: 'center',
            flexDirection: 'column',
            alignSelf: 'center',
            alignContent: 'center',
            paddingTop: 15,
            paddingHorizontal: 10,
            paddingBottom: 10,
            borderRadius: 10,
            backgroundColor: colors.poll_surface,
        },
        titleContainer: {
            flexDirection: 'row',
            width: "100%",
            paddingHorizontal: 15
        },
        logo: {
            width: 20,
            height: 20,
            marginTop: 5,
            resizeMode: 'contain',
        },

        title: {
            flex: 1,
            marginLeft: 5,
            color: colors.poll_title,
            fontSize: scale.font.l,
            lineHeight: 20,
            alignSelf: 'center',
        },
        body: {
            padding: 15,
        },
        roundButton: {
            maxWidth: 90,
            backgroundColor: colors.poll_btn,
            color: colors.fp_btnText,
            marginTop: 30,
            fontSize: scale.font.l,
            fontWeight: 'bold',
        },

        // --------------- new------------------------

        inputContainer: {
            flexDirection: 'column',
            minHeight: 100,
        },
        inputWrap: {
            borderWidth: 1,
            borderRadius: 15,
            minHeight: 50,
            backgroundColor: colors.poll_inputBg,
            borderColor: colors.poll_inputBoarder,
            marginTop: 7,
            padding: 15,
        },
        option: {
            textAlignVertical: "center",
            paddingVertical: 5,
            paddingHorizontal: 20
        },
        option1: {
            backgroundColor: colors.poll_optionBg1,
            borderColor: colors.poll_optionBoarder1,
            color: colors.poll_inputText,
        },
        option2: {
            backgroundColor: colors.poll_optionBg2,
            borderColor: colors.poll_optionBoarder2,
            color: colors.poll_inputText,
        },
        option3: {
            backgroundColor: colors.poll_optionBg3,
            borderColor: colors.poll_optionBoarder3,
            color: colors.poll_inputText,
        },

        inputQuestion: {
            flex: 1,
            padding: 0,
            minHeight: 20,
            textAlign: 'center',
            color: colors.poll_inputText,
            lineHeight: 20,
            margin: 0,
        },

        inputInfo: {
            width: '100%',
            padding: 0,
            minHeight: 20,
            textAlign: 'center',
            color: colors.poll_inputInfo,
            lineHeight: 20,
            margin: 0,
        },

        /// preview
        previewContainer: {
            backgroundColor: colors.poll_preview_bg,
            elevation: 5,
            shadowColor: 'rgba(0,0,0,0.8)',
            shadowOffset: {width: 5, height: 5},
            shadowRadius: 3,
            shadowOpacity: 0.5,
        },
        back: {
            width: 30,
            height: 50,
            padding: 10,
            marginTop: 3,
            resizeMode: 'contain',
        },
        vote: {
            height: 50,
            width: "100%",
            marginTop: 3,
            resizeMode: 'contain',
        },
        optionContainer: {
            marginTop: 15,
            display: 'flex',
            alignItems: "center",
            flexDirection: 'row',
            shadowOpacity: 0,
            shadowRadius: 0
        },

        quizWrap: {
            borderWidth: 1,
            borderRadius: 15,
            backgroundColor: colors.poll_inputBg,
            borderColor: colors.poll_inputBoarder,
            marginTop: 7,
            padding: 15,
            shadowOpacity: 0,
            shadowRadius: 0
        },

        questionText: {
            padding: 0,
            minHeight: 20,
            textAlign: 'center',
            textAlignVertical: 'center',
            fontWeight: "bold",
            color: colors.poll_inputText,
            lineHeight: 20,
            margin: 0,
        },
        optionIconWrap: {
            height: 50,
            display: 'flex',
            flexDirection: 'column',
            //alignItems: "center",
            alignSelf: "center",
            // justifyContent: "center",
            marginRight: 5,
            marginVertical: 2,
        },
        optionWrap: {
            flex: 1,
            borderWidth: 1,
            borderRadius: 15,
            backgroundColor: colors.poll_inputBg,
            borderColor: colors.poll_inputBoarder,
            marginTop: 7,
            padding: Platform.OS === "ios" ? 12 : 0,
            minHeight: 50,
            overflow: 'hidden',
            flexDirection: 'row',
        },
        optionIcon: {
            width: 30,
            height: 30,
            marginTop: 3,
            resizeMode: 'contain',
        },
        optionIconText: {
            marginTop: 2,
            color: '#000',
            textAlign: "center"
        },
        //// Poll view
        pollView: {
            zIndex: 100,
            shadowColor: 'rgba(0,0,0,0.8)',
            shadowOffset: {width: 2, height: 2},
            shadowRadius: 3,
            shadowOpacity: 0.5,
            justifyContent: 'center',
            flexDirection: 'column',
            alignSelf: 'center',
            alignContent: 'center',
            paddingTop: 15,
            paddingHorizontal: 10,
            paddingBottom: 10,
            borderRadius: 10,
            width: "100%",
            marginTop: 10,
        },
        viewContainer: {
            zIndex: 100,
            shadowColor: 'rgba(0,0,0,0.8)',
            shadowOffset: {width: 2, height: 2},
            shadowRadius: 3,
            shadowOpacity: 0.5,
            justifyContent: 'center',
            flexDirection: 'column',
            alignSelf: 'center',
            alignContent: 'center',
            paddingTop: 15,
            paddingHorizontal: 10,
            paddingBottom: 10,
            borderRadius: 10,
            width: "100%",
            backgroundColor: colors.poll_surface,
        },
        arrow: {
            position: 'absolute',
            top: 10,
            left: 0,
            right: 0,
            zIndex: -1,
        },
        arrow_left_container: {
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
        },
        arrow_right_container: {
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
        },
        arrow_leftBubble: {
            left: scale.ms(-25, 0.5),
        },
        arrow_rightBubble: {
            right: scale.ms(-30, 0.5),
        }, backBtnWrap: {position: "absolute", left: 15, zIndex: 10}

    });
}
