/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {
    FlatList,
    Image,
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
import scale from 'utilities/scale';
import Toast from 'react-native-simple-toast';
import {Icon} from 'react-native-elements';
import {useTheme} from '../../../context/ThemeContext';
import DateRangePicker from './DateRangePicker';
import {onTrigger} from '../../../utilities/helper';
import {dateFilter} from '../../../utilities/constant';
import CollaberSearch from './CollaberSearch';
import {LineView} from '../../../system/ui/components';
import {icons} from '../../../utilities/assets';

export default function Filter({
                                   onDismiss,
                                   initialState = null,
                                   visibility,
                                   onFilter,
                                   spaceInfo,
                                   temporarySpace = false
                               }) {
    const {theme} = useTheme();
    const {colors} = theme;
    const styles = filterStyle(theme);
    const [, setSelectedFilter] = useState('date');
    const [dateRange, setDateRange] = useState({...dateFilter});
    const [dateRangeEnabled, setDateRangeEnabled] = useState(false);
    const [collaber, setCollaber] = useState({name: '', id: ''});
    const [collaberFilterEnabled, setCollaberFilterEnabled] = useState(false);
    const [collaberPickerEnabled, setCollaberPickerEnabled] = useState(false);
    const [loveitsEnabled, setLoveitsEnabled] = useState(false);
    const [datePickerVisible, setDatePickerVisible] = useState(false);
    const [currentRange, setCurrentRange] = useState([]);
    const [collaberSearchKeyword, setCollaberSearchKeyword] = useState('');

    const FilterOptions = [
        {
            type: 'keys',
            label: 'Most lovitz',
            value: 'loveit',
            subEnabled: false,
            subFields: null,
        },
        {
            type: 'keys',
            label: 'Search by dates',
            value: 'dates',
            subEnabled: true,
            subFields: datesFilter(),
        },

    ];
    if (!temporarySpace)
        FilterOptions.push({
            type: 'keys',
            label: 'Search by collaber',
            value: 'collaber',
            subEnabled: true,
            subFields: collaberFilter(),
        })
    const clearOptions = () => {
        setSelectedFilter('date');
        setDateRangeEnabled(false);
        setLoveitsEnabled(false);
        setCollaberFilterEnabled(false);
        setDateRange(null);
        setCollaber({name: '', id: ''});
    };
    useEffect(() => {
        if (initialState) {
            setSelectedFilter(initialState.loveitsFilter ? 'loveit' : 'date');
            setLoveitsEnabled(!!initialState?.loveitsFilter);
            setDateRangeEnabled(initialState.dateFilterEnabled);
            setCollaberFilterEnabled(initialState.collaberFilterEnabled);
            setCollaber(initialState.collaber);
            if (
                initialState.dateFilter &&
                initialState.dateFilter.from &&
                initialState.dateFilter.to
            ) {
                let dateFrom = new Date(initialState.dateFilter.from);
                let dateTo = new Date(initialState.dateFilter.to);
                let fromYear = dateFrom.getFullYear();
                let fromMonth = dateFrom.getMonth() + 1;
                let fromDay = dateFrom.getDate();
                let toYear = dateTo.getFullYear();
                let toMonth = dateTo.getMonth() + 1;
                let toDay = dateTo.getDate();
                let fromString = `${fromYear}-${fromMonth < 9 ? '0' : ''}${fromMonth}-${
                    fromDay < 9 ? '0' : ''
                }${fromDay}`;
                let toString = `${toYear}-${toMonth < 9 ? '0' : ''}${toMonth}-${
                    toDay < 9 ? '0' : ''
                }${toDay}`;
                setCurrentRange([fromString, toString]);
                setDateRange(initialState.dateFilter);
            }
        }
    }, [initialState]);

    function formatDate(string) {
        const timeStamp = new Date(string)
        return `${timeStamp.getDate() < 10 ? "0" : ''}${timeStamp.getDate()}-${(timeStamp.getMonth() + 1) < 10 ? "0" : ''}${timeStamp.getMonth() + 1}-${timeStamp.getFullYear()}`;
    }

    function datesFilter() {
        return (
            <View style={styles.innerContainer}>
                {dateRangeEnabled && (
                    <>
                        {currentRange && currentRange.length === 2 ? (
                            currentRange[0] === currentRange[1] ? (
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        margin: 10,
                                    }}>
                                    <Text
                                        style={{
                                            fontSize: scale.font.s,
                                            marginEnd: 5,
                                            flex: 1,
                                            color: colors.textPrimaryDark,
                                        }}>{`On ${formatDate(currentRange[0])}`}</Text>
                                    <Pressable
                                        style={{
                                            alignSelf: 'flex-end',
                                            padding: 2,
                                            justifyContent: 'center',
                                        }}
                                        onPress={() => {
                                            setDatePickerVisible(true);
                                        }}>
                                        <Image
                                            source={icons.pen}
                                            style={[{tintColor: colors.secondaryDark}]}
                                            height={13}
                                            width={13}
                                            resizeMode="contain"
                                        />
                                    </Pressable>
                                </View>
                            ) : (
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        margin: 10,
                                    }}>
                                    <Text
                                        style={{
                                            fontSize: scale.font.s,
                                            marginEnd: 10,
                                            flex: 1,
                                            color: colors.textPrimaryDark,
                                        }}>{`From ${formatDate(currentRange[0])} to ${formatDate(currentRange[1])}`}</Text>

                                    <Pressable
                                        style={{
                                            alignSelf: 'flex-end',
                                            padding: 2,
                                            justifyContent: 'center',
                                        }}
                                        onPress={() => {
                                            setDatePickerVisible(true);
                                        }}>
                                        <Image
                                            source={icons.pen}
                                            style={[{tintColor: colors.secondaryDark}]}
                                            height={13}
                                            width={13}
                                            resizeMode="contain"
                                        />
                                    </Pressable>
                                </View>
                            )
                        ) : (
                            <Pressable onPress={() => setDatePickerVisible(true)}>
                                <Text
                                    style={{
                                        marginLeft: 10,
                                        marginBottom: 10,
                                        marginTop: 10,
                                        fontSize: scale.font.s,
                                        color: colors.textPrimaryDark,
                                    }}>
                                    Select date range
                                </Text>
                            </Pressable>
                        )}
                    </>
                )}
                {dateRangeEnabled && datePickerVisible && (
                    <Modal transparent={true}>
                        <TouchableHighlight
                            activeOpacity={0.0}
                            underlayColor="transparent"
                            onPress={() => setDatePickerVisible(false)}
                            style={styles.modal}>
                            <TouchableWithoutFeedback>
                                <View style={styles.container}>
                                    <View style={styles.elementTitle}>
                                        <Icon
                                            name="tune"
                                            color={colors.secondaryDark}
                                            type="material-community"
                                        />
                                        <Text style={styles.title}>Select dates</Text>
                                    </View>
                                    <View style={styles.line}/>
                                    <ScrollView>
                                        <View>
                                            <Text style={styles.dateSubTitle}>
                                                Select start and end date. Press on date twice to select
                                                single day.
                                            </Text>
                                            <DateRangePicker
                                                initialRange={currentRange.length > 0 && currentRange}
                                                onSuccess={(s, e) => {
                                                    let dateArray = s.split('-');
                                                    let date2Array = e.split('-');
                                                    let date = new Date(
                                                        dateArray[0],
                                                        dateArray[1] - 1,
                                                        dateArray[2],
                                                        0,
                                                        0,
                                                        0,
                                                        0,
                                                    );
                                                    let date2 = new Date(
                                                        date2Array[0],
                                                        date2Array[1] - 1,
                                                        date2Array[2],
                                                        23,
                                                        59,
                                                        59,
                                                        999,
                                                    );
                                                    setDatePickerVisible(false);
                                                    setDateRange({from: date, to: date2});
                                                    setCurrentRange([s, e]);
                                                }}
                                                theme={{
                                                    markColor: colors.dateSelection,
                                                    markTextColor: 'white',
                                                    calendarBackground: colors.datepickerBox,
                                                    textSectionTitleColor: colors.datepickerText,
                                                    monthTextColor: colors.datepickerText,
                                                    todayTextColor: colors.datepickerText,
                                                    dayTextColor: colors.datepickerText,
                                                    textDisabledColor: colors.datepickerText,
                                                }}
                                            />
                                            <View
                                                style={{
                                                    margin: 20,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}>
                                                <TouchableOpacity
                                                    style={styles.buttonCancel}
                                                    onPress={() => {
                                                        setDatePickerVisible(false);
                                                    }}>
                                                    <Text style={styles.buttonLabel}>Cancel</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </ScrollView>
                                </View>
                            </TouchableWithoutFeedback>
                        </TouchableHighlight>
                    </Modal>
                )}
            </View>
        );
    }

    function collaberFilter() {
        return (
            <View style={styles.innerContainer}>
                {collaberFilterEnabled && (
                    <>
                        {collaber.name && collaber.name.length > 0 ? (
                            <View
                                style={{
                                    flexDirection: 'row',
                                    marginLeft: 10,
                                    marginBottom: 10,
                                    marginTop: 10,
                                }}>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        flex: 1,
                                    }}>
                                    <Text
                                        style={{
                                            fontSize: scale.font.s,
                                            color: colors.textPrimaryDark,
                                        }}>{`Clips by ${collaber.name}`}</Text>
                                </View>
                                <View
                                    style={{
                                        justifyContent: 'flex-start',
                                        marginHorizontal: 10,
                                    }}>
                                    {/*<Icon*/}
                                    {/*  name={'pencil'}*/}
                                    {/*  onPress={() => {*/}
                                    {/*    setCollaberPickerEnabled(true);*/}
                                    {/*  }}*/}
                                    {/*  type="material-community"*/}
                                    {/*  color={colors.secondaryDark}*/}
                                    {/*  size={15}*/}
                                    {/*  style={{marginLeft: 10}}*/}
                                    {/*/>*/}
                                    <Pressable
                                        style={{
                                            alignSelf: 'flex-end',
                                            padding: 2,
                                            justifyContent: 'center',
                                        }}
                                        onPress={() => {
                                            setCollaberPickerEnabled(true);
                                        }}>
                                        <Image
                                            source={icons.pen}
                                            style={[
                                                {tintColor: colors.secondaryDark, marginLeft: 10},
                                            ]}
                                            height={13}
                                            width={13}
                                            resizeMode="contain"
                                        />
                                    </Pressable>
                                </View>
                            </View>
                        ) : (
                            <Pressable onPress={() => setCollaberPickerEnabled(true)}>
                                <Text
                                    style={{
                                        marginLeft: 10,
                                        marginBottom: 10,
                                        marginTop: 10,
                                        fontSize: scale.font.s,
                                        color: colors.textPrimaryDark,
                                    }}>
                                    Select collaber
                                </Text>
                            </Pressable>
                        )}
                    </>
                )}
                {collaberFilterEnabled && collaberPickerEnabled && (
                    <CollaberSearch
                        spaceInfo={spaceInfo}
                        keyword={collaberSearchKeyword}
                        setKeyword={setCollaberSearchKeyword}
                        onClose={() => setCollaberPickerEnabled(false)}
                        setCollaber={setCollaber}
                    />
                )}
            </View>
        );
    }

    const optionRender = ({item}) => {
        return (
            <View>
                <View style={styles.innerContainer}>
                    <View
                        style={{
                            zIndex: 2,
                        }}>
                        <Pressable
                            style={styles.element}
                            onPress={() => {
                                if (item.value === 'loveit') {
                                    setLoveitsEnabled(!loveitsEnabled);
                                } else {
                                    if (item.value === 'dates') {
                                        setDateRangeEnabled(!dateRangeEnabled);
                                    } else {
                                        if (item.value === 'collaber') {
                                            setCollaberFilterEnabled(!collaberFilterEnabled);
                                        }
                                    }
                                }
                            }}>
                            <Icon
                                name={
                                    item.value === 'dates'
                                        ? dateRangeEnabled
                                        ? 'check-box'
                                        : 'check-box-outline-blank'
                                        : item.value === 'loveit' && loveitsEnabled
                                        ? 'check-box'
                                        : item.value === 'collaber' && collaberFilterEnabled
                                            ? 'check-box'
                                            : 'check-box-outline-blank'
                                }
                                type="material-icons"
                                color={colors.secondaryAccent}
                                size={25}
                                style={styles.checkBoxView}
                            />
                            <Text style={styles.label}>{item.label}</Text>
                        </Pressable>
                    </View>
                    {item.subEnabled && item.subFields}
                </View>

                <LineView spacing={3}/>
            </View>
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
                                color={colors.secondaryAccent}
                                type="material-community"
                            />
                            <Text style={styles.title}>Search settings</Text>
                        </View>
                        <LineView spacing={3}/>
                        <ScrollView>
                            <FlatList
                                data={FilterOptions}
                                renderItem={optionRender}
                                keyExtractor={item => item.id}
                            />
                        </ScrollView>
                        <View style={styles.buttonRow}>
                            <View style={styles.buttonView}>
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => {
                                        clearOptions();
                                    }}>
                                    <Text style={styles.buttonLabel}>Clear</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.buttonView}>
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => {
                                        if (onFilter) {
                                            if (dateRangeEnabled) {
                                                if (currentRange && currentRange.length === 2) {
                                                    onTrigger(onFilter, {
                                                        loveitsFilter: loveitsEnabled,
                                                        // order: order,
                                                        dateRange: dateRange,
                                                        dateRangeEnabled: dateRangeEnabled,
                                                        collaberFilterEnabled: collaberFilterEnabled,
                                                        collaber: collaber,
                                                    });
                                                    onDismiss(true);
                                                } else {
                                                    Toast.show('Select date range');
                                                }
                                            } else {
                                                if (collaberFilterEnabled) {
                                                    if (collaber.name && collaber.name.length > 0) {
                                                        onTrigger(onFilter, {
                                                            loveitsFilter: loveitsEnabled,
                                                            // order: order,
                                                            dateRange: dateRange,
                                                            dateRangeEnabled: dateRangeEnabled,
                                                            collaberFilterEnabled: collaberFilterEnabled,
                                                            collaber: collaber,
                                                        });
                                                        onDismiss(true);
                                                    } else {
                                                        Toast.show('Select collaber');
                                                    }
                                                } else {
                                                    onTrigger(onFilter, {
                                                        loveitsFilter: loveitsEnabled,
                                                        // order: order,
                                                        dateRange: dateRange,
                                                        dateRangeEnabled: dateRangeEnabled,
                                                        collaberFilterEnabled: collaberFilterEnabled,
                                                        collaber: collaber,
                                                    });
                                                    onDismiss(true);
                                                }
                                            }
                                        }
                                    }}>
                                    <Text style={styles.buttonLabel}>Search</Text>
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
            width: scale.ms(250, 0.3),
            flexDirection: 'column',
            backgroundColor: colors.alertBox,
            marginTop: 70,
            marginLeft: 40,
            marginRight: 40,
            marginBottom: 70,
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
