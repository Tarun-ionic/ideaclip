/* eslint-disable react-native/no-inline-styles,react-hooks/exhaustive-deps */
import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, Text, View} from 'react-native';
import {lottie} from 'utilities/assets';
import LottieView from 'lottie-react-native';
import {queries} from 'schema';
import {useTheme} from 'context/ThemeContext';
import apolloLib from '../../lib/apolloLib';
import {SearchListStyles} from 'system/styles/searchStyle';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSession} from 'context/SessionContext';
import {SafeScreenView} from 'index';
import {useBackHandler} from 'utilities/helper';
import PersonalSearchBar from './components/personalSearchBar';
import logger from '../../lib/logger';
import UserCard from './components/userCard';
import AppBar from '../components/toolbar/appBar';
import {IconTitle, ProgressLoader, Splitter} from '../../system/ui/components';

const limit = 20;
export default function PersonalSearch() {
    const navigation = useNavigation();
    const session = useSession();
    const {params} = useRoute();
    const {user} = session;

    const {theme} = useTheme();
    const styles = SearchListStyles(theme);
    const [state, setState] = useState({searching: false, searchResults: []});
    const [searchObj, setSearchObj] = useState(
        params?.searchState ? params?.searchState : {keyword: ''},
    );

    const initialMessage = 'Check out who has joined IDEACLIP!';
    const noResult = `Unable to find ${searchObj.keyword}.`;

    const getList = (page = 0) => {
        const variables = {
            keyword: searchObj.keyword,
            page,
            limit,
        };
        setState(prev => ({...prev, searching: true}));
        apolloLib.client(session)
            .query({
                fetchPolicy: 'no-cache',
                query: queries.userSearch,
                variables,
            })
            .then(({data}) => {
                if (data?.mensionSearch.length > 0) {
                    const users =
                        page === 0
                            ? data?.mensionSearch
                            : [...state.searchResults, ...data?.mensionSearch];
                    let a = users.filter(
                        _user => _user && _user?.displayName?.length > 0,
                    );
                    setState(() => ({searching: false, searchResults: a}));
                } else if (page === 0) {
                    setState(() => ({searching: false, searchResults: []}));
                } else {
                    setState(prev => ({...prev, searching: false}));
                }
            })
            .catch(error => logger.e('MSearch', error));
    };

    const onSearch = obj => {
        setSearchObj(() => obj);
    };

    useEffect(() => {
        const {keyword} = searchObj;
        if (keyword && keyword.trim().length > 0) {
            getList(0);
        } else if (keyword && keyword.trim().length === 0) {
            setState({searching: false, searchResults: []});
        }
    }, [searchObj]);

    useBackHandler(() => {
        backPressHandler();
        return true;
    });

    const backPressHandler = () => {
        navigation.goBack(null);
    };

    const listRender = ({item}) => {
        return <UserCard item={item} user={user} _key={item.name}/>;
    };

    const emptyList = useCallback(() => {
        const {searching} = state;
        const {keyword} = searchObj;
        if (searching) {
            return <ProgressLoader visible={searching}/>;
        } else if (keyword.length === 0) {
            return (
                <View
                    style={{
                        alignSelf: 'center',
                        height: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                    <LottieView
                        source={lottie.startSearch}
                        style={styles.lottie}
                        autoPlay
                        loop
                    />
                    <Text style={styles.subtext}>{initialMessage}</Text>
                </View>
            );
        } else {
            return (
                <View
                    style={{
                        alignSelf: 'center',
                        height: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                    <LottieView
                        source={!keyword ? lottie.startSearch : lottie.searchEmpty}
                        style={styles.lottie}
                        autoPlay
                        loop
                    />
                    <Text style={styles.subtext}>{noResult}</Text>
                </View>
            );
        }
    }, [state]);

    return (
        <SafeScreenView translucent>
            <AppBar title={'Search for Collabers'} onBackPress={backPressHandler}/>
            <Splitter height={10}/>
            <PersonalSearchBar
                title={'Search by username, name, business/charity name or suburb:'}
                placeHolder={'Enter here'}
                onSearch={onSearch}
                searchObj={searchObj}
            />
            <IconTitle title={'Search results : '} style={{marginVertical: 10}}/>
            <FlatList
                keyboardShouldPersistTaps={'always'}
                style={{flex: 1}}
                data={state.searchResults}
                renderItem={listRender}
                keyExtractor={(item, id) => {
                    return `${id}${item.name}`;
                }}
                scrollEnabled={true}
                ListEmptyComponent={emptyList}
                onEndReachedThreshold={10}
                contentContainerStyle={
                    !state.searchResults ||
                    (state?.searchResults?.length == 0 && {width: '100%', height: '100%'})
                }
                onEndReached={() => {
                    if (
                        state.searching === false &&
                        state.searchResults.length >= limit
                    ) {
                        getList(state.searchResults.length / limit);
                    }
                }}
            />
        </SafeScreenView>
    );
}
