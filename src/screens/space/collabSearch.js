/* eslint-disable react-hooks/exhaustive-deps,react-native/no-inline-styles */
import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, Text, View} from 'react-native';
import {lottie, screens} from 'utilities/assets';
import LottieView from 'lottie-react-native';
import {queries} from 'schema';
import {useTheme} from 'context/ThemeContext';
import apolloLib from '../../lib/apolloLib';
import {SearchListStyles} from 'system/styles/searchStyle';
import CollabCard from './components/collabCard';
import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import {useSession} from 'context/SessionContext';
import CollabSearchBar from './components/collabSearchBar';
import {SafeScreenView} from 'index';
import {strings} from 'constant/strings';
import {useBackHandler} from 'utilities/helper';
import {IconTitle, ProgressLoader} from '../../system/ui/components';
import AppBar from '../components/toolbar/appBar';

export default function CollabSearch() {
    const navigation = useNavigation();
    const session = useSession();
    const {params} = useRoute();
    const {user} = session;

    const {theme} = useTheme();
    const styles = SearchListStyles(theme);
    const isFocused = useIsFocused();
    const [state, setState] = useState({
        searching: false,
        nextPageToken: '',
        searchResults: [],
    });
    const [searchObj, setSearchObj] = useState({
                keyword: '',
                location: '',
                radius: 5000,
                radiusIndicator: true,
            });

    const initialMessage = 'Start search for businesses, charities or NFPs.';
    const noResult = `Unable to find "${searchObj.keyword}" within the specified search radius. Please try again by increasing your search radius.`;
    const noResultEmpty = 'Unable to find business near by';

    useEffect(()=>{
        if(params?.searchState){
            setSearchObj(s=>({...s,...params?.searchState}))
        }
    },[params])

    const getList = npt => {
        const variables = {
            keyword: searchObj.keyword,
            location: searchObj.radiusIndicator ? searchObj.location || '' : '',
            radius: String(searchObj.radius),
            type: '',
            nextPageToken: npt,
            userId: user.uid,
        };
        if (npt === '') {
            setState({searching: true, nextPageToken: '', searchResults: []});
        } else {
            setState(prev => ({...prev, searching: true}));
        }
        apolloLib.client(session)
            .query({
                fetchPolicy: 'no-cache',
                query: queries.places,
                variables,
            })
            .then(({data}) => {
                const {places} = data;
                if (places && places.results) {
                    const results = !npt
                        ? places.results
                        : [...state.searchResults, places.results];
                    setState(prev => ({
                        ...prev,
                        searching: false,
                        searchResults: results.filter(o => o.name),
                        nextPageToken: places.nextPageToken,
                    }));
                } else {
                    setState(prev => ({...prev, searching: false}));
                }
            })
            .catch(() => {
                setState(prev => ({...prev, searching: false}));
            });
    };

    const onSearch = obj => {
        setSearchObj(s => ({...s, ...obj}));
    };

    useEffect(() => {
        if (isFocused) {
            const {keyword} = searchObj;
            if (keyword && keyword.trim().length > 0) {
                getList('');
            } else if (keyword && keyword.trim().length === 0) {
                setState({searching: false, nextPageToken: '', searchResults: []});
            }
        }
    }, [searchObj, isFocused]);

    useBackHandler(() => {
        backPressHandler();
        return true;
    }, [isFocused]);

    const backPressHandler = () => {
        navigation.goBack();
    };

    const listRender = ({item}) => {
        return <CollabCard item={item} user={user} _key={item.name}/>;
    };

    const emptyList = useCallback(() => {
        const {searching, nextPageToken} = state;
        const {keyword} = searchObj;
        if (searching) {
            return <ProgressLoader visible={searching}/>;
        } else if (!nextPageToken && keyword && keyword.length === 0) {
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
        } else if (!nextPageToken) {
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
                    <Text style={styles.subtext}>
                        {!keyword
                            ? initialMessage
                            : keyword.length > 0
                                ? noResult
                                : noResultEmpty}
                    </Text>
                </View>
            );
        } else {
            return null;
        }
    }, [state,searchObj]);

    return (
        <SafeScreenView translucent>
            <AppBar
                dark
                title={strings.collabSpace}
                onBackPress={backPressHandler}
                icon={screens.collabSpaceIco}
            />
            <CollabSearchBar onSearch={onSearch} searchObj={searchObj}/>
            {searchObj?.keyword?.length > 0 && (
                <IconTitle title={`Search result for " ${searchObj?.keyword} "`}/>
            )}
            <FlatList
                style={{flex: 1}}
                data={state.searchResults}
                renderItem={listRender}
                keyExtractor={(item, id) => {
                    return `${id}${item.name}`;
                }}
                contentContainerStyle={
                    !state.searchResults ||
                    (state?.searchResults?.length === 0 && {width: '100%', height: '100%'})
                }
                scrollEnabled={true}
                ListEmptyComponent={emptyList}
                onEndReachedThreshold={10}
                onEndReached={() => {
                    if (state.nextPageToken && state.searchResults.length >= 20) {
                        getList(state.nextPageToken);
                    }
                }}
            />
        </SafeScreenView>
    );
}
