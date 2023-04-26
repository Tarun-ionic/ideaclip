/* eslint-disable react-hooks/rules-of-hooks,react-native/no-inline-styles */
import React, {useState} from 'react';
import {
    FlatList,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableHighlight,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import {RadioButton} from 'react-native-paper';
import {Icon} from 'react-native-elements';
import {useTheme} from '../../context/ThemeContext';
import scale from '../../utilities/scale';

const FilterOptions = [
    {
        type: 'keys',
        label: 'Keyword',
        value: 'keyword',
    },
    {
        type: 'keys',
        label: 'Industry',
        value: 'industry',
    },
    {
        type: 'keys',
        label: 'Ethnic community groups',
        value: 'ethnicCommunityGroups',
    },
    {
        type: 'keys',
        label: 'Post code',
        value: 'postCode',
    },
    {
        type: 'keys',
        label: 'Suburb',
        value: 'suburb',
    },
    {
        type: 'keys',
        label: 'Business name',
        value: 'businessName',
    },
];

const LocationOptions = [
    {
        type: 'location',
        label: 'Australia',
        value: 'australia',
    },
    {
        type: 'location',
        label: 'NSW',
        value: 'nsw',
    },
    {
        type: 'location',
        label: 'Sydney',
        value: 'sydney',
    },
];

export default function filter({
                                   defChecked,
                                   onDismiss,
                                   visibility,
                                   onFilter,
                                   onClear,
                               }) {
    const {theme} = useTheme();
    const {colors} = theme;
    const styles = filterStyle(theme);
    const [checked, setChecked] = useState(defChecked);

    const optionRender = ({item}) => {
        return (
            <Pressable style={styles.element} onPress={() => setChecked(item)}>
                <RadioButton
                    value={item.value}
                    color={colors.textPrimaryDark}
                    uncheckedColor={colors.secondaryDark}
                    style={{color: '#000'}}
                    status={checked === item ? 'checked' : 'unchecked'}
                    onPress={() => setChecked(item)}
                />
                <Text style={styles.label}>{item.label}</Text>
            </Pressable>
        );
    };

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
                                color={colors.secondaryDark}
                                type="material-community"
                            />
                            <Text style={styles.title}>Filter</Text>
                            <Icon
                                name="cancel"
                                size={30}
                                color={colors.secondaryDark}
                                type="material"
                                onPress={() => onDismiss(true)}
                            />
                        </View>
                        <View style={styles.line}/>
                        <ScrollView>
                            <FlatList
                                data={FilterOptions}
                                renderItem={optionRender}
                                keyExtractor={item => item.id}
                            />
                            <View style={styles.line}/>
                            <FlatList
                                data={LocationOptions}
                                renderItem={optionRender}
                                keyExtractor={item => item.id}
                            />
                        </ScrollView>
                        <View style={styles.line}/>
                        <View style={styles.buttonRow}>
                            <View style={styles.buttonView}>
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => {
                                        if (onClear) {
                                            onClear();
                                        }
                                        onDismiss(true);
                                    }}>
                                    <Text style={styles.buttonLabel}>Clear</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.buttonView}>
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => {
                                        if (onFilter) {
                                            onFilter(checked);
                                        }
                                        onDismiss(true);
                                    }}>
                                    <Text style={styles.buttonLabel}>Filter</Text>
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
        },
        container: {
            width: scale.ms(250),
            flexDirection: 'column',
            backgroundColor: '#fff',
            marginTop: 120,
            marginLeft: 40,
            marginRight: 40,
            marginBottom: 120,
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
        title: {
            flex: 1,
            fontSize: scale.font.xxxl,
            alignItems: 'center',
            marginLeft: 20,
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
            fontSize: scale.font.xxl,
        },
        line: {
            width: '100%',
            height: 1,
            backgroundColor: colors.secondaryDark,
        },
        buttonRow: {
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
            textAlign: 'center',
        },
        buttonView: {
            alignSelf: 'flex-end',
            margin: 10,
        },
        button: {
            backgroundColor: colors.secondaryDark,
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            borderRadius: 20,
            padding: 3,
        },
        buttonLabel: {
            fontSize: scale.font.xxl,
            paddingTop: 5,
            paddingBottom: 5,
            paddingLeft: 15,
            paddingRight: 15,
            color: colors.textSecondaryDark,
        },
    });
