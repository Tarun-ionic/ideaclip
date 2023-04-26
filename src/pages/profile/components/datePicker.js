/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {
    DatePickerIOS,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableHighlight,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import scale from 'utilities/scale';
import {Icon} from 'react-native-elements';
import {useTheme} from '../../../context/ThemeContext';
import {LineView} from '../../../system/ui/components';

export default function DatePicker({
                                   onDismiss,
                                   visibility,
                                   dob = new Date(),
                                   setDob = ()=>{}
                               }) {
    const {theme} = useTheme();
    const {colors} = theme;
    const styles = filterStyle(theme);
    const [date, setDate] = useState(dob || new Date());
    
    useEffect(()=>{
        if(dob){
            setDate(dob)
        }
    },[dob])
  
    return (
        <Modal
            animationType={'slide'}
            transparent={true}
            visible={visibility}
            onRequestClose={() => {
                onDismiss(true);
            }}>
            <TouchableHighlight
                activeOpacity={0.0}
                underlayColor="transparent"
                onPress={() => onDismiss(true)}
                style={styles.modal}>
                <TouchableWithoutFeedback>
                    <View style={styles.container}>
                        <View style={styles.elementTitle}>
                            <Icon
                                name="tune"
                                color={colors.secondaryAccent}
                                type="material-community"
                            />
                            <Text style={styles.title}>Select dob</Text>
                        </View>
                        <LineView spacing={3}/>
                        <ScrollView>
                        <DatePickerIOS
                            style={{flex:1}}
                            date={date}
                            onDateChange={setDate}
                            mode={'date'}
                            maximumDate={new Date()}
                        />
                        </ScrollView>
                        <View style={styles.buttonRow}>
                            <View style={styles.buttonView}>
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => {
                                        setDate(dob)
                                        onDismiss(true)
                                    }}>
                                    <Text style={styles.buttonLabel}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.buttonView}>
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => {
                                       setDob(date)
                                    }}>
                                    <Text style={styles.buttonLabel}>Ok</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </TouchableHighlight>
        </Modal>
    );
}

const filterStyle = ({colors}) =>
    StyleSheet.create({
        modal: {
            flex: 1,
            alignItems: 'center',
            alignContent: 'center',
            justifyContent:'center'
        },
        container: {
            width: scale.ms(300),
            alignSelf:'center',
            flexDirection: 'column',
            backgroundColor: colors.alertBox,
            margin:20,
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
        innerContainer: {
            width: '100%',
            backgroundColor: colors.alertBox,
        },
        title: {
            flex: 1,
            fontSize: scale.font.l,
            alignItems: 'center',
            color: colors.textPrimaryDark,
            marginLeft: 5,
        },
        dateTitle: {
            fontSize: scale.font.xl,
            alignItems: 'center',
            color: colors.textPrimaryDark,
            marginLeft: 10,
        },
        elementTitle: {
            height: 30,
            margin: 10,
            flexDirection: 'row',
            alignItems: 'center',
        },
        element: {
            height: 30,
            margin: 10,
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
        },
        label: {
            flexDirection: 'row',
            alignItems: 'center',
            fontSize: scale.font.l,
            color: colors.textPrimaryDark,
            shadowOpacity: 0,
        },
        label3: {
            flexDirection: 'row',
            alignItems: 'center',
            fontSize: scale.font.l,
            color: colors.textPrimaryDark,
        },
        dateSubTitle: {
            flexDirection: 'row',
            fontSize: scale.font.s,
            margin: 10,
            color: colors.textPrimaryDark,
        },
        line: {
            width: '100%',
            height: 1,
            backgroundColor: colors.surface,
        },
        buttonRow: {
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
            textAlign: 'center',
        },
        buttonView: {
            alignSelf: 'flex-end',
            margin: 5,
        },
        button: {
            backgroundColor: colors.secondaryAccent,
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            borderRadius: 20,
            padding: 3,
        },
        buttonCancel: {
            backgroundColor: colors.datepickerCancel,
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            borderRadius: 20,
            padding: 3,
        },
        buttonLabel: {
            fontSize: scale.font.l,
            paddingHorizontal: 15,
            paddingVertical: 3,
            color: colors.textSecondaryDark,
        },
    });
