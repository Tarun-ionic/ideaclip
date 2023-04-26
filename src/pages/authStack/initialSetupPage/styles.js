import {I18nManager, Platform, StyleSheet} from 'react-native';
import scale from '../../../utilities/scale';

export default StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: scale.font.xxxl,
        marginTop: 25,
        marginBottom: 30,
        alignSelf: 'stretch',
        textAlign: 'left',
        marginLeft: 35,
    },
    backArrowStyle: {
        resizeMode: 'contain',
        width: 25,
        height: 25,
        marginTop: Platform.OS === 'ios' ? 50 : 20,
        marginLeft: 10,
        transform: [{scaleX: I18nManager.isRTL ? -1 : 1}],
    },
    InputContainer: {
        height: 42,
        borderWidth: 1,
        paddingLeft: 20,
        width: '90%',
        alignSelf: 'center',
        marginTop: 20,
        alignItems: 'center',
        borderRadius: 25,
        textAlign: I18nManager.isRTL ? 'right' : 'left',
    },
    backgroundImageStyle: {
        flex: 1,
        alignSelf: 'center',
        width: '100%',
    },
    logo: {
        flex: 1,
        width: 200,
        alignSelf: 'center',
        margin: 10,
        resizeMode: 'contain',
    },
    saveContainer: {
        alignSelf: 'center',
        width: '70%',
        borderRadius: 25,
        padding: 10,
        marginTop: 20,
        marginBottom: 20,
    },
    saveText: {},
    saveDisabledContainer: {
        alignSelf: 'center',
        width: '70%',
        borderRadius: 25,
        padding: 10,
        marginTop: 20,
    },
    lineStyle: {
        height: 1,
        borderWidth: 0.8,
        width: '95%',
        padding: 0,
        alignSelf: 'center',
        marginStart: 10,
        marginEnd: 10,
    },
});
