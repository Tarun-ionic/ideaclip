/* eslint-disable react-hooks/exhaustive-deps,react-native/no-inline-styles */
// noinspection DuplicatedCode,JSUnresolvedVariable

import React, {useEffect, useState} from 'react';
import {
    FlatList,
    Image,
    Modal,
    ScrollView,
    Text,
    TouchableHighlight,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import LottieView from 'lottie-react-native';
import {icons, lottie} from '../../../utilities/assets';
import {Chip, Icon} from 'react-native-elements';
import {queries} from '../../../schema';
import {useTheme} from '../../../context/ThemeContext';
import AutoFillStyles from '../../../system/styles/autofillStyles';
import {labels, strings} from '../../../constant/strings';
import TextInputBox from './TextInputBox';
import {useSession} from "../../../context/SessionContext";
import apolloLib from "../../../lib/apolloLib";

export default function IndustryOfInterestAutofillDropDown({
                                                               value,
                                                               setValue,
                                                               refresh,
                                                               current="",
                                                               setCurrent=()=>{},
                                                               isUser = true,
                                                               isCollab = false,
                                                               isEnabled = true,
                                                                labelString = ""
                                                           }) {
    const session = useSession();
    const {theme} = useTheme();
    const {colors} = theme;
    const styles = AutoFillStyles(theme);
    const [viewDrawer, setViewDrawer] = useState(false);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true)

    const [industryList, setIndustryList] = useState([]);
    const [filteredIndustryList, setFilteredIndustryList] = useState([]);

    const [selectedList, setSelectedList] = useState([]);

    useEffect(() => {
        setIndustryList([])
        setLoading(true)
        apolloLib.client(session).query({
            fetchPolicy: 'no-cache',
            query: queries.getIndustries,
            variables: {},
        }).then(({data, error}) => {
            setLoading(false)
            if (data) {
                getData(data)
            }
            if (error) {
                setIndustryList([])
            }
        })

    }, [refresh]);

    useEffect(() => {
        if (current !== 'interestsIndustry') {
            setViewDrawer(false);
        }
    }, [current]);

    useEffect(() => {
        if (current !== 'interestsIndustry' && viewDrawer) {
            setCurrent('interestsIndustry');
        }
    }, [viewDrawer]);

    // useEffect(() => {
    //   getData();
    // }, [data]);

    useEffect(() => {
        if (industryList) {
            setFilteredIndustryList([...industryList]);
        }
        if (value) {
            let a = [];
            let item = 0;
            for (item in value.filter(v=>v && v?.length>0)) {
                a.push(getIndustries(value[item]));
            }
            setSelectedList([...a]);
        }
    }, [industryList]);



    function getIndustries(val) {
        let industry = '';
        let item = 0;
        if (industryList) {
            for (item in industryList) {
                if (industryList[item].value === val) {
                    industry = industryList[item];
                }
            }
        }
        return industry;
    }

    function renderList({item}) {
        return (
            <View>
                <TouchableOpacity
                    onPress={() => {
                        setValue('interestsIndustry', item.value);
                    }}>
                    <View style={styles.listItemContainer}>
                        <Icon
                            name={
                                value?.indexOf(item.value) >= 0
                                    ? 'check-box'
                                    : 'check-box-outline-blank'
                            }
                            type="material-icons"
                            color={colors.secondary}
                            size={25}
                            style={styles.checkBoxView}
                        />
                        <Text style={styles.itemLabel}>{item.label}</Text>
                    </View>
                </TouchableOpacity>
                <View style={styles.separator}/>
            </View>
        );
    }

    function getData(data) {
        if (data) {
            let newData = [];
            let index = 0;
            for (index in data.industries) {
                let _current = data.industries[index];
                newData.push({label: _current.industryName, value: _current.id});
            }
            setIndustryList(newData);
        } else {
            setIndustryList([]);
        }
    }

    useEffect(() => {
        filteredList().then(res => {
            setFilteredIndustryList(res);
        });
    }, [search]);

    const filteredList = async () => {
        if (search.length > 0) {
            return industryList.reduce((result, industry) => {
                if (
                    check(
                        industry.label.trim().toLowerCase(),
                        search.trim().toLowerCase(),
                    )
                ) {
                    result.push(industry);
                }
                return result;
            }, []);
        } else {
            return industryList;
        }
    };

    const check = (string, keywords) => {
        let k = keywords.split(' ');
        if (k.length > 0) {
            let flag = true;
            k.map(async keyWord => {
                if (!string.includes(keyWord.trim())) {
                    flag = false;
                }
            });
            return flag;
        } else {
            return string.includes(keywords);
        }
    };

    useEffect(() => {
        if (value) {
            let a = [];
            let item = 0;
            for (item in value.filter(v=>v && v?.length>0)) {
                a.push(getIndustries(value[item]));
            }
            setSelectedList([...a]);
        }
    }, [value]);
    useEffect(() => {
        if (!isEnabled) {
            setViewDrawer(false);
        }
    }, [isEnabled]);

    const EmptyListMessage = () => {
        return <Text style={styles.emptyListStyle}>No industries found</Text>;
    };

    return (
        <View style={[{flex: 1},labelString&&{width:'100%'}]}>
            <View style={labelString ? styles.inputContainer3 : isCollab ? styles.inputContainer2 : styles.inputContainer}>
                <TouchableOpacity
                    onPress={() => {
                        if (isEnabled) {
                            setViewDrawer(!viewDrawer);
                        }
                    }}>
                    <View style={isCollab ? styles.inputLabel2 : styles.inputLabel}>
                        <Text
                            style={labelString ? styles.labelTextView3 : isCollab ? styles.labelTextView2 : styles.labelTextView}>
                            {labelString ?
                                labelString
                                :
                                isCollab
                                    ? labels.interestedIndustriesCollab
                                    : isUser
                                        ? labels.interestedIndustries
                                        : labels.relatedIndustries
                            }
                        </Text>
                        {isEnabled && (
                            // <Icon
                            //     name={'pencil'}
                            //     type="material-community"
                            //     color={colors.secondaryDark}
                            //     size={20}
                            //     style={ isCollab?styles.actionIcon2:styles.actionIcon}
                            // />
                            <View
                                style={{
                                    padding: 2,
                                    justifyContent: 'center',
                                }}>
                                <Image
                                    source={icons.pen}
                                    style={[
                                        {tintColor: colors.secondaryDark},
                                        isCollab ? styles.actionIcon2 : styles.actionIcon,
                                    ]}
                                    height={18}
                                    width={18}
                                    resizeMode="contain"
                                />
                            </View>
                        )}
                    </View>
                </TouchableOpacity>

                <View style={labelString ?styles.chipsView3:styles.chipsView}>
                    <ScrollView nestedScrollEnabled={true}>
                        <View style={styles.selectedContainer}>
                            {selectedList.length > 0 ? (
                                selectedList.map((item,index) => {
                                    return (
                                        <Chip
                                            key={index}
                                            style={{paddingHorizontal: 10}}
                                            title={item.label}
                                            type={'outline'}
                                            icon={{
                                                name: 'close-circle',
                                                type: 'material-community',
                                                onPress: () => {
                                                    setValue('interestsIndustry', item.value);
                                                },
                                                color: colors.secondaryDark,
                                            }}
                                            iconRight
                                            titleStyle={{
                                                color: colors.secondaryText,
                                                maxWidth: '90%',
                                            }}
                                            buttonStyle={{
                                                backgroundColor: colors.surfaceDark,
                                                borderColor: colors.secondaryDark,
                                            }}
                                            containerStyle={styles.chipsContent}
                                        />
                                    );
                                })
                            ) : (
                                labelString?
                                    <></>
                                    :
                                    <Text
                                            style={styles.labelSubTextView}
                                            onPress={() => {
                                                if (isEnabled) {
                                                    setViewDrawer(!viewDrawer);
                                                }
                                            }}>
                                            {strings.selectIndustry(isUser)}
                                        </Text>



                            )}
                        </View>
                    </ScrollView>
                </View>
            </View>

            <View style={styles.lineStyle}/>

            {viewDrawer && (
                <Modal
                    animationType={'slide'}
                    transparent={true}
                    visible={viewDrawer}
                    onRequestClose={() => {
                        setViewDrawer(false);
                    }}>
                    <TouchableHighlight
                        activeOpacity={0.0}
                        underlayColor="transparent"
                        onPress={() => {
                            setViewDrawer(false);
                            setSearch('');
                        }}
                        style={styles.modal}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContainer}>
                                <View style={styles.modelHeader}>
                                    <Text style={styles.modelTitle}>Industries</Text>
                                    <Icon
                                        name="cancel"
                                        size={30}
                                        color={colors.secondaryDark}
                                        type="material"
                                        onPress={() => {
                                            setSearch('');
                                            setViewDrawer(false);
                                        }}
                                    />
                                </View>
                                <View style={styles.line}/>

                                {loading ? (
                                    <LottieView
                                        source={lottie.loader}
                                        style={styles.loaderView}
                                        autoPlay
                                        loop
                                    />
                                ) : (
                                    <>
                                        <TextInputBox
                                            colors={colors}
                                            label={strings.search}
                                            value={search}
                                            mode="outlined"
                                            multiLine={true}
                                            onChangeText={text => {
                                                setSearch(text);
                                            }}
                                            style={styles.searchBox}
                                        />

                                        <FlatList
                                            contentContainerStyle={styles.CheckBoxListView}
                                            data={filteredIndustryList}
                                            renderItem={renderList}
                                            scrollEnabled={true}
                                            nestedScrollEnabled
                                            ListEmptyComponent={EmptyListMessage}
                                            keyExtractor={(item, index) => index}
                                            style={{marginBottom: 10}}
                                        />
                                    </>
                                )}
                            </View>
                        </TouchableWithoutFeedback>
                    </TouchableHighlight>
                </Modal>
            )}
        </View>
    );
}
