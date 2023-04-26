import {I18nManager, StyleSheet} from 'react-native';
import scale from 'utilities/scale';

export default function AutoFillStyles({colors}) {
    return StyleSheet.create({
        inputContainer: {
            width: '90%',
            marginTop: 20,
            alignSelf: 'center',
        },
        inputContainer2: {
            marginLeft: 5,
        },
        inputContainer3: {
            // marginTop: 15,
            width: '100%',
            alignSelf: 'center',
        },
        inputContainer4: {
            width: '100%',
            alignSelf: 'center',
        },

        inputBox3:{
            paddingVertical: 5,
            borderWidth: 1,
            borderColor: colors.signupInputBorder,
            backgroundColor: colors.signupInputBackground,
            color: colors.signupInputText,
            paddingHorizontal: 15,
            width: '100%',
            alignItems: 'center',
            borderRadius: 15,
            fontSize: scale.font.xl,
            textAlign: I18nManager.isRTL ? 'right' : 'left',
        },
        inputLabel: {
            flexDirection: 'row',
            width: '100%',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        inputLabel2: {
            flexDirection: 'row',
        },
        labelTextView: {
            width: "90%",
            color: colors.textPrimaryDark,
            fontSize: scale.font.xl,
        },
        labelTextView3: {
            fontSize: scale.font.l,
            color:colors.signupLabelText,
        },
        labelTextView2: {
            // flex:1,
            width: "90%",
            color: colors.textPrimaryDark,
            fontSize: scale.font.xl,
        },
        labelSubTextView: {
            color: colors.textPrimary,
            fontSize: scale.font.s,
        },
        chipsView: {
            marginBottom: 10,
        },
        chipsView3: {
        },
        actionIcon: {
            marginEnd: 5,
            alignSelf: 'center',
        },
        actionIcon2: {
            marginEnd: 5,
            marginStart: 15,
        },
        selectedContainer: {
            width: '100%',
            flexDirection: 'row',
            flexWrap: 'wrap',
        },
        lineStyle: {
            height: 1,
            width: '95%',
            padding: 0,
            alignSelf: 'center',
            borderColor: colors.secondaryDark,
            marginStart: 10,
            marginEnd: 10,
        },
        modal: {
            flex: 1,
            alignItems: 'center',
            alignContent: 'center',
            justifyContent: 'center',
            margin: 10,
        },
        loaderView: {
            height: 25,
            alignSelf: 'center',
        },
        modalContainer: {
            width: scale.ms(350),
            flexDirection: 'column',
            backgroundColor: colors.alertBox,
            margin: 20,
            maxHeight: '75%',
            borderRadius: 20,
            padding: 10,
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
        },
        searchBox: {
            height: 42,
            marginHorizontal: 10,
            marginBottom: 10,
            width: '90%',
            alignSelf: 'center',
            borderRadius: 25,
        },
        modelHeader: {
            height: 30,
            marginVertical: 10,
            marginRight: 10,
            flexDirection: 'row',
            alignItems: 'center',
        },
        modelTitle: {
            flex: 1,
            fontSize: scale.font.xl,
            alignItems: 'center',

            marginStart: 5,
            marginEnd: 10,
            color: colors.textPrimaryDark,
        },
        CheckBoxListView: {
            marginHorizontal: 10,
        },
        listItemContainer: {
            flexDirection: 'row',
            width: '100%',
            alignItems: 'flex-start',
        },
        checkBoxView: {
            marginStart: 5,
            alignSelf: 'flex-start',
            shadowOpacity: 0,
            padding: 10,
        },
        itemLabel: {
            flex: 1,
            color: colors.textPrimaryDark,
            fontSize: scale.font.xl,
            padding: 10,
        },
        separator: {
            height: 1,
            width: '95%',
            padding: 0,
            alignSelf: 'center',
            backgroundColor: colors.surface,
            marginStart: 10,
            marginEnd: 10,
        },
        emptyListStyle: {
            padding: 10,
            fontSize: scale.font.xxl,
            textAlign: 'center',
            color: colors.textPrimaryDark,
        },
        chipText: {
            color: colors.textPrimaryDark,
        },
        chipsContent: {
            margin: 5,
        },
    });
}
