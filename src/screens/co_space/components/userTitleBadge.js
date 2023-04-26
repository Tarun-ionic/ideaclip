/* eslint-disable react-hooks/exhaustive-deps,react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {
    FlatList, Image,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableHighlight,
    TouchableOpacity,
    View,
} from 'react-native';
import scale from 'utilities/scale';
import {Icon} from 'react-native-elements';
import {mutations, queries} from 'schema';
import {useTheme} from 'context/ThemeContext';
import apollo from '../../../lib/apolloLib';
import logger from '../../../lib/logger';
import ImageIcon from '../../components/utility/imageIcon';
import {lottie, screens} from '../../../utilities/assets';
import {IconTitle, ProgressLoader} from '../../../system/ui/components';
import {clipTypes} from '../../../utilities/constant';
import LottieView from 'lottie-react-native';
import {useSession} from "../../../context/SessionContext";
import TitleListItem from "./titleListItem";

export default function UserTitleBadge({
                                           userId,
                                           clip,
                                           spaceInfo,
                                           onDismiss,
                                           setter
                                       }) {
    const {theme} = useTheme();
    const session = useSession();
    const {colors} = theme;
    const styles = userTitleStyle(theme);
    const [clipData, setClipData] = useState(clip);
    const [search, setSearch] = useState('');
    const [titlesList, setTitlesList] = useState([]);
    const [loading, setIsLoading] = useState(false);
    const [listLoading, setListsLoading] = useState(false);
    useEffect(() => {
        if (JSON.stringify(clip) !== JSON.stringify(clipData)) {
            setClipData(clip);
        }
    }, [clip]);

    const getTitles = () => {
        setListsLoading(true);
        const variables = {
            keyword: search,
            page: 0,
            limit: 30,
        };
        // setTimeout(()=>{
        apollo.client(session)
            .query({
                fetchPolicy: 'no-cache',
                variables,
                query: queries.getTitles,
            })
            .then(({data}) => {
                setListsLoading(false);
                if (!data) {
                    return;
                }
                const {titleSearch} = data;
                setTitlesList(titleSearch);
            })
            .catch(err => {
                setListsLoading(false);
                logger.e(err);
            });
        // },200)
    };
    const addTitle = item => {
        // setIsLoading(true)

        const variables = {
            uid: userId,
            titleId: item.id,
            profileId: clipData.uid,
            clipId: clipData.id,
            clipType:
                spaceInfo.spaceType === clipTypes.announcement ? 'anClip' : 'clip',
        };
        // setTimeout(()=>{
        apollo.client(session)
            .mutate({
                fetchPolicy: 'no-cache',
                variables,
                mutation: mutations.addTitle,
            })
            .then(({data}) => {
                if (!data) {
                    return false;
                }
                const {assignTitle} = data;
                if (assignTitle) {
                    setter({...clip, myTitle: {title: item, uid: userId}});
                }
                setIsLoading(false);

                onDismiss(false);
            })
            .catch(err => {
                setIsLoading(false);
                logger.e(err);
            });
        // },200)
    };

    const updateTitle = (oldTitle, item) => {
        // setIsLoading(true)

        const variables = {
            uid: userId,
            titleId: oldTitle,
            profileId: clipData.uid,
            clipId: clipData.id,
            clipType:
                spaceInfo.spaceType === clipTypes.announcement ? 'anClip' : 'clip',
        };
        // setTimeout(()=>{
        apollo.client(session)
            .mutate({
                fetchPolicy: 'no-cache',
                variables,
                mutation: mutations.removeTitle,
            })
            .then(({data}) => {
                if (!data) {
                    return false;
                }
                setIsLoading(false);
                addTitle(item);
            })
            .catch(err => {
                setIsLoading(false);
                logger.e(err);
            });
        // },200)
    };

    useEffect(() => {
        // setIsLoading(true)
        getTitles();
    }, [search]);

    const check = item => {
        setIsLoading(true);
        if (clip?.myTitle?.title) {
            updateTitle(clipData.myTitle.title.id, item);
        } else {
            addTitle(item);
        }
    };

    const EmptyListMessage = () => {
        if (!listLoading) {
            return <Text style={styles.emptyListStyle}>No results found</Text>;
        } else {
            return null;
        }
    };

    const renderList = ({item}) => {
        // return (
        //     <View>
        //         <TouchableOpacity onPress={() => check(item)}>
        //             <View style={styles.listItemContainer}>
        //                 <Text style={styles.itemLabel}>{item.name}</Text>
        //             </View>
        //         </TouchableOpacity>
        //         <View style={styles.separator}/>
        //     </View>
        // );
        return(<TitleListItem item={item} onPress={()=>{check(item)}}/> )
    };

    return (
        <Modal
            animationType={'slide'}
            transparent={true}
            visible={true}
            onRequestClose={() => {
                onDismiss(false);
            }}>
            <TouchableHighlight
                activeOpacity={0.0}
                underlayColor="transparent"
                onPress={() => {
                    onDismiss(false);
                }}
                style={styles.modal}>
                <Pressable style={styles.modalContainer}>
                    <View style={styles.floatingCloseIcon}>
                        <Icon
                            name="cancel"
                            size={30}
                            color={colors.secondaryDark}
                            type="material"
                            onPress={() => {
                                onDismiss(false);
                            }}
                        />
                    </View>
                    <IconTitle title={'Choose a Title to award:'}/>
                    <View style={styles.searchBarView}>
                        <ImageIcon size={30} rounded={false} source={screens.search_ico}/>
                        <TextInput
                            style={styles.searchBox}
                            numberOfLines={1}
                            placeholderTextColor={theme.colors.textPrimary}
                            onChangeText={text => setSearch(text)}
                            underlineColorAndroid="transparent"
                            defaultValue={search}
                            onSubmitEditing={() => getTitles()}
                        />
                    </View>
                    {listLoading && (
                        <View style={styles.loaderStyle}>
                            <LottieView
                                source={lottie.loader}
                                loop
                                autoPlay
                                style={{height: 25, width: 25}}
                            />
                        </View>
                    )}

                    <FlatList
                        contentContainerStyle={styles.CheckBoxListView}
                        data={titlesList}
                        renderItem={renderList}
                        scrollEnabled={true}
                        keyExtractor={item => item.id}
                        ListEmptyComponent={EmptyListMessage}
                        nestedScrollEnabled
                        style={{marginBottom: 10}}
                    />
                    <ProgressLoader visible={loading}/>
                </Pressable>
            </TouchableHighlight>
        </Modal>
    );
}

const userTitleStyle = ({colors}) => {
    return StyleSheet.create({
        modal: {
            flex: 1,
            alignItems: 'center',
            alignContent: 'center',
            justifyContent: 'center',
            margin: 10,
        },
        loaderStyle: {
            zIndex: 100,
            alignSelf: 'center',
            backgroundColor: colors.surfaceDark,
            borderRadius: 25,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 3,
        },
        modalContainer: {
            width: scale.ms(300, 0.5),
            flexDirection: 'column',
            backgroundColor: colors.surfaceDark,
            margin: 20,
            maxHeight: '60%',
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
        modelHeader: {
            height: 30,
            marginVertical: 10,
            marginRight: 10,
            flexDirection: 'row',
            alignItems: 'center',
        },
        modelTitle: {
            flex: 1,
            fontSize: scale.font.l,
            alignItems: 'center',
            marginLeft: 10,
            marginEnd: 10,
            color: colors.textPrimaryDark,
        },
        emptyListStyle: {
            padding: 10,
            fontSize: scale.font.s,
            textAlign: 'center',
            color: colors.secondaryDark,
        },
        listItemContainer: {
            flex: 2,
            flexDirection: 'row',
            width: '100%',
            alignItems: 'center',
        },
        itemLabel: {
            color: colors.textPrimaryDark,
            fontSize: scale.font.l,
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
        chipText: {
            color: colors.textPrimaryDark,
        },
        chipsContent: {
            height: 35,
            margin: 5,
            backgroundColor: colors.surfaceDark,
            borderColor: colors.secondaryDark,
            elevation: 5,
        },
        searchBox: {
            textAlign: 'left',
            textAlignVertical: 'top',
            flex: 1,
            height: 37,
            marginLeft: 5,
            fontSize: scale.font.s,
            width: '50%',
            color: colors.textPrimaryDark,
            backgroundColor: colors.surfaceDark,
        },
        CheckBoxListView: {
            marginHorizontal: 10,
        },
        searchBarView: {
            marginHorizontal: 5,
            marginVertical: 5,
            flexDirection: 'row',
            borderRadius: 20,
            fontSize: scale.font.s,
            alignItems: 'center',
            overflow: 'hidden',
            borderWidth: 0.7,
            paddingHorizontal: 15,
            color: colors.textPrimaryDark,
            borderColor: colors.secondaryAccent,
            backgroundColor: colors.surfaceDark,
        },
        selectedContainer: {
            width: '100%',
            flexDirection: 'row',
            flexWrap: 'wrap',
        },
        chipModel: {width: '80%'},
        floatingCloseIcon: {position: 'absolute', right: 5, top: 5},
    });
};
