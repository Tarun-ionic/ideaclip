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
import apolloLib from "../../../lib/apolloLib";
import {useSession} from "../../../context/SessionContext";

export default function EthnicCommunitiesAutofillDropDown({
                                                              value,
                                                              setValue,
                                                              refresh,
                                                              current="",
                                                              setCurrent=()=>{},
                                                              isCollab = false,
                                                              isEnabled = true,
                                                                labelString=""
                                                          }) {
    const session = useSession();
    const {theme} = useTheme();
    const {colors} = theme;
    const styles = AutoFillStyles(theme);

    const [viewDrawer, setViewDrawer] = useState(false);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true)

    const [ethnicCommunitiesList, setEthnicCommunitiesList] = useState([]);
    const [filteredEthnicCommunitiesList, setFilteredEthnicCommunitiesList] =
        useState([]);
    const [selectedList, setSelectedList] = useState([]);

    useEffect(() => {
        setEthnicCommunitiesList([]);
        setLoading(true)
        apolloLib.client(session).query({
            fetchPolicy: 'no-cache',
            query: queries.getEthnicCommunities,
            variables: {},
        }).then(({data, error}) => {
            setLoading(false)
            if (data) {
                getData(data)
            }
            if (error) {
                setEthnicCommunitiesList([]);
            }
        })
    }, [refresh]);

    useEffect(() => {
        if (current !== 'ethnicCommunity') {
            setViewDrawer(false);
        }
    }, [current]);

    useEffect(() => {
        if (current !== 'ethnicCommunity' && viewDrawer) {
            setCurrent('ethnicCommunity');
        }
    }, [viewDrawer]);


    useEffect(() => {
        if (!isEnabled) {
            setViewDrawer(false);
        }
    }, [isEnabled]);

    useEffect(() => {
        if (ethnicCommunitiesList) {
            setFilteredEthnicCommunitiesList([...ethnicCommunitiesList]);
        }
        if (value) {
            let a = [];
            let item = 0;
            for (item in value.filter(v=>v && v?.length>0)) {
                a.push(getCommunity(value[item]));
            }
            setSelectedList([...a]);
        }
    }, [ethnicCommunitiesList]);



    function getCommunity(val) {
        let community = '';
        if (ethnicCommunitiesList) {
            for (const item in ethnicCommunitiesList) {
                if (ethnicCommunitiesList[item].value === val) {
                    community = ethnicCommunitiesList[item];
                }
            }
        }
        return community;
    }

    function renderList({item, index}) {
        return (
            <View key={'EthnicCommunitiesAutofillDropDown-${index}'}>
                <TouchableOpacity
                    onPress={() => {
                        setValue('ethnicCommunity', item.value);
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
            for (const item in data.ethnicCommunities) {
                const _current = data.ethnicCommunities[item];
                newData.push({label: _current.communityName, value: _current.id});
            }
            setEthnicCommunitiesList(newData);
        } else {
            setEthnicCommunitiesList([]);
        }
    }

    useEffect(() => {
        filteredList().then(res => {
            setFilteredEthnicCommunitiesList(res);
        });
    }, [search]);

    const filteredList = async () => {
        if (search.length > 0) {
            return ethnicCommunitiesList.reduce((result, community) => {
                if (
                    check(
                        community.label.trim().toLowerCase(),
                        search.trim().toLowerCase(),
                    )
                ) {
                    result.push(community);
                }
                return result;
            }, []);
        } else {
            return ethnicCommunitiesList;
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
            for (const item in value.filter(v=>v && v?.length>0)) {
                a.push(getCommunity(value[item]));
            }
            setSelectedList([...a]);
        }
    }, [value]);

    const EmptyListMessage = () => {
        return (
            <Text style={styles.emptyListStyle}>No ethnic communities found</Text>
        );
    };

    return (
        <View style={{flex: 1}}>
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
                                    ? labels.ethnicCommunitiesCollab
                                    : labels.ethnicCommunities
                            }
                        </Text>
                        {isEnabled && (
                            // <Icon
                            //     name={'pencil'}
                            //     type="material-community"
                            //     color={colors.secondaryDark}
                            //     size={20}
                            //     style={isCollab?styles.actionIcon2:styles.actionIcon}
                            // />
                            <View
                                style={{
                                    padding: 2,
                                    justifyContent: 'center',
                                }}>
                                <Image
                                    source={icons.pen}
                                    style={[
                                        isCollab ? styles.actionIcon2 : styles.actionIcon,
                                        {tintColor: colors.secondaryDark},
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
                                                    setValue('ethnicCommunity', item.value);
                                                },
                                                color: isCollab
                                                    ? colors.secondaryDark
                                                    : colors.secondaryDark,
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
                                    : <Text
                                    style={styles.labelSubTextView}
                                    onPress={() => {
                                        if (isEnabled) {
                                            setViewDrawer(!viewDrawer);
                                        }
                                    }}>
                                    Choose ethnic communities of interest.
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
                                    <Text style={styles.modelTitle}>Ethnic Communities</Text>
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
                                            data={filteredEthnicCommunitiesList}
                                            renderItem={renderList}
                                            scrollEnabled={true}
                                            ListEmptyComponent={EmptyListMessage}
                                            nestedScrollEnabled
                                            style={{marginBottom: 10}}
                                            keyExtractor={(item, index) => index}
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
