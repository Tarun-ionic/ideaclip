import {Dimensions, I18nManager, Platform, StyleSheet} from 'react-native';
import scale from 'utilities/scale';

export default function SignupStyles({colors}) {
    const screenWidth=Dimensions.get('window').width
    return StyleSheet.create({
        screenContainer: {
            flex: 1,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
        },
        container: {
            width:'100%',
            height:'100%',
            backgroundColor:colors.signupBackground
        },
        keyboardScroll: {
            flex: 1,
            width: '100%',
            paddingBottom: 100,
        },
        headerImage: {
            width:(screenWidth*0.65),
            height:(screenWidth*0.65)/2.15,
            marginVertical:30,
            resizeMode:'contain',
            alignSelf:'center'
        },
        introText1: {
            marginTop:15,
            marginBottom:15,
            color:colors.signupIntroText1,
            alignSelf:'center',
            fontSize: scale.font.l,
        },
        introText2: {
            color:colors.signupIntroText2,
            fontSize: scale.font.l,
        },
        popupText: {
            width:'90%',
            alignSelf:'center',
            // textAlign:'center',
            margin: 5,
            lineHeight:20 ,
            color: colors.textPrimaryDark,
            justifyContent:'center'
        },
        inputContainer: {
            width:'80%',
            marginTop:15,
            alignSelf:'center'
        },
        inputContainer2: {
            width:'90%',
            marginTop:40,
            alignSelf:'center',
        },
        labelText: {
            marginTop:15,
            marginBottom:5,
            marginHorizontal:10,
            fontSize: scale.font.l,
            color:colors.signupLabelText
        },
        inputBox: {
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
        createButton:{
            marginTop:25,
            marginBottom:25,
            width:'80%',
            alignSelf:'center',
            backgroundColor:colors.signupCreateButton,
        },
        createButtonLabel:{
            color:colors.signupCreateButtonText
        },
        minMapContainer: {
            alignSelf: 'center',
            width:'100%',
            backgroundColor:'white',
        },
        labelTextView: {
            color: colors.textPrimaryDark,
            fontSize: scale.font.xxl,
        },
        minMap: {
            margin: 10,
        },
        floatButton: {
            position: 'absolute',
            top: 20,
            right: 20,
            borderRadius: 50,
            elevation: 5,
            backgroundColor: '#fff',
        },
        mapLabelContainer:{
            marginHorizontal:15,
            marginBottom:10
        },
        mapLabelText1: {
            fontSize: scale.font.l,
            color:colors.signupIntroText1,
            alignSelf:'center',
            textAlign:'center'
        },
        mapLabelText2: {
            fontSize: scale.font.l,
            color:colors.signupIntroText2,
        },
    });
}
