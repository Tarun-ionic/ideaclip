/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableHighlight,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import scale from 'utilities/scale';
import apolloLib from '../../../lib/apolloLib';
import {queries} from '../../../schema';
import {useTheme} from '../../../context/ThemeContext';
import {Icon} from 'react-native-elements';
import {strings} from '../../../constant/strings';
import {LineView} from '../../../system/ui/components';
import CollabSearchItem from './collabSearchItem';
import {useSession} from "../../../context/SessionContext";

function CollaberSearch({
                            keyword,
                            setKeyword,
                            onClose,
                            setCollaber,
                            spaceInfo,
                        }) {
    const session = useSession();
    const {theme} = useTheme();
    const styles = PopUpStyles(theme);
    const {colors} = theme;
    const [collaberList, setCollaberList] = useState([]);
    const [loader, setLoader] = useState(true);

    useEffect(() => {
        apolloLib.client(session)
            .query({
                fetchPolicy: 'no-cache',
                query: queries.searchCollabers,
                variables: {keyword, uId: spaceInfo.spaceId},
            })
            .then(({data}) => {
                if (data?.searchCollabers.length > 0) {
                    setLoader(false);
                    setCollaberList(data.searchCollabers);
                }
            })
            .catch(() => {
                setLoader(false);
            });
    }, [keyword]);

    const listRender = ({item}) => {
        return item?.displayName ? (
            <CollabSearchItem
                setCollaber={setCollaber}
                onClose={onClose}
                collaber={item}
            />
        ) : null;
    };

    const EmptyListMessage = () => {
        if (loader) {
            return null;
        }
        return <Text style={styles.emptyListStyle}>No collabers found</Text>;
    };
    return (
        <Modal transparent={true}>
            <TouchableHighlight
                activeOpacity={0.0}
                underlayColor="transparent"
                onPress={() => onClose()}
                style={styles.modal}>
                <TouchableWithoutFeedback>
                    <View style={styles.container}>
                        <View style={styles.elementTitle}>
                            <Icon
                                name="tune"
                                color={colors.secondaryDark}
                                type="material-community"
                            />
                            <Text style={styles.title}>Select collaber</Text>
                        </View>
                        <LineView spacing={3}/>
                        <TextInput
                            style={styles.searchBox}
                            numberOfLines={1}
                            placeholder={strings.search}
                            placeholderTextColor={theme.colors.textPrimary}
                            onChangeText={text => setKeyword(text)}
                            underlineColorAndroid="transparent"
                            defaultValue={keyword}
                        />
                        <LineView spacing={3}/>
                        <FlatList
                            data={collaberList}
                            renderItem={listRender}
                            contentContainerStyle={{paddingBottom: 50}}
                            keyExtractor={item => item.id}
                            ListEmptyComponent={EmptyListMessage}
                        />
                    </View>
                </TouchableWithoutFeedback>
            </TouchableHighlight>
        </Modal>
    );
}

export default CollaberSearch;

export const PopUpStyles = ({colors}) =>
    StyleSheet.create({
        modal: {
            flex: 1,
            alignItems: 'center',
            alignContent: 'center',
        },
        emptyListStyle: {
            padding: 10,
            fontSize: scale.font.s,
            textAlign: 'center',
            color: colors.textPrimaryDark,
        },
        searchBox: {
            textAlign: 'left',
            textAlignVertical: 'center',
            width: '100%',
            height: scale.ms(35),
            fontSize: scale.font.s,
            borderWidth: 1,
            borderRadius: 20,
            paddingHorizontal: 10,
            borderColor: colors.secondaryDark,
            color: colors.textPrimaryDark,
            backgroundColor: colors.surface,
        },
        container: {
            flex: 1,
            width: scale.ms(250),
            flexDirection: 'column',
            backgroundColor: colors.surface,
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
            backgroundColor: colors.surface,
        },
        title: {
            flex: 1,
            fontSize: scale.font.xl,
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
            fontSize: scale.font.xl,

            color: colors.textPrimaryDark,
        },
        label3: {
            flexDirection: 'row',
            alignItems: 'center',
            fontSize: scale.font.l,
            color: colors.textPrimaryDark,
        },
        dateSubTitle: {
            flexDirection: 'row',
            fontSize: scale.font.xl,
            margin: 10,
            color: colors.textPrimaryDark,
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
            fontSize: scale.font.xl,
            paddingTop: 5,
            paddingBottom: 5,
            paddingLeft: 15,
            paddingRight: 15,
            color: colors.textSecondaryDark,
        },
        lineStyle: {
            flex: 1,
            height: 1,
            width: '100%',
            borderWidth: 0.8,
            padding: 0,
            alignSelf: 'center',
            borderColor: colors.secondaryDark,
            marginStart: 5,
            marginEnd: 5,
        },
        card: {
            backgroundColor: colors.surfaceDark,
            padding: 5,
            marginVertical: 3,
            flexDirection: 'row',
        },
        cardInfo: {
            fontSize: scale.font.s,
            alignSelf: 'center',
            marginLeft: 5,
            color: colors.textPrimaryDark,
        },
        avatarContainer: {
            backgroundColor: colors.surfaceDark,
            borderRadius: 50,
            width: 35,
            height: 35,
            padding: 2,
            alignItems: 'center',
            alignContent: 'center',
            overflow: 'hidden',
        },
        avatarImage: {
            width: 40,
            height: 40,
            resizeMode: 'cover',
        },
    });
