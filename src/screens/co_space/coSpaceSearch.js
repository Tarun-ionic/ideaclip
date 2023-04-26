/* eslint-disable react-hooks/exhaustive-deps,react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {FlatList, Text, View} from 'react-native';
import SearchBar from 'screens/components/toolbar/searchBar';
import apolloLib from '../../lib/apolloLib';
import {queries} from 'schema';
import {lottie, placeHolders} from 'utilities/assets';
import {ClipProvider} from 'context/ClipContext';
import {useBackHandler} from 'utilities/helper';
import {SafeScreenView} from 'index';
import LottieView from 'lottie-react-native';
import {useTheme} from 'context/ThemeContext';
import {SearchListStyles} from 'system/styles/searchStyle';
import logger from '../../lib/logger';
import Filter from 'pages/profile/components/Filter';
import {clipTypes, dateFilter} from 'utilities/constant';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSession} from 'context/SessionContext';
import {cacheFile} from '../../lib/storage';
import PostView from './components/postView';
import {LineView, ProgressLoader, Splitter} from '../../system/ui/components';
import AppBar from '../components/toolbar/appBar';

export default function CoSpaceSearch() {
    const navigation = useNavigation();
    const {params} = useRoute();
    const {spaceInfo, searchHint} = params;
    const session = useSession();
    const {user} = session;
    const {theme} = useTheme();
    const styles = SearchListStyles(theme);

    const [keyword, setKeyword] = useState(searchHint || '');
    const [pageIndex, setPageIndex] = useState([]);
    const [posts, setPosts] = useState([]);
    const [originalPosts, setOriginalPosts] = useState([]);
    const [loader, setLoader] = useState(false);
    const [filtering, setFiltering] = useState({
        loveitsFilter: false,
        collaber: {name: '', id: ''},
        collaberFilterEnabled: false,
        dateFilter: {...dateFilter},
        dateFilterEnabled: false,
    });
    const [filterPopup, setFilterPopup] = useState(false);
    const [avatar, setAvatar] = useState(placeHolders.avatar);

    useBackHandler(() => {
        navigation.goBack(null);
        return true;
    }, []);

    useEffect(() => {
        if (keyword && keyword.trim().length > 0) {
            setLoader(true);
            // search();
        }
    }, [keyword]);

    useEffect(() => {
        if (
            filtering.dateFilterEnabled ||
            filtering.loveitsFilter ||
            filtering.collaberFilterEnabled
        ) {
            setLoader(true);
            // search();
        }
    }, [filtering]);
    useEffect(() => {
        if (loader) {
            search();
        }
    }, [loader]);

    useEffect(() => {
        if (params?.temporarySpace) {
            setAvatar(placeHolders.tempLogo)
        } else {
            if (spaceInfo && spaceInfo.profileImage) {
                if (spaceInfo.profileImageB64) {
                    setAvatar({uri: spaceInfo.profileImageB64});
                } else {
                    cacheFile(spaceInfo.profileImage, 'dp')
                        .then(path => setAvatar({uri: path}))
                        .catch(logger.e);
                }
            }
        }
    }, [spaceInfo]);
    const clipResolver = async (clips, page = 0, isHistory = false) => {
        const _clips = isHistory
            ? [...originalPosts, ...clips.filter(clip => clip && clip.id)]
            : clips.filter(clip => clip && clip.id);
        const filteredClips = _clips.filter(
            clip => !clip.isBlocked && !clip.isDeleted,
        );
        setOriginalPosts(clips);
        setPosts(filteredClips);
    };

    const search = (page = 0, isHistory = false) => {
        if (page === 0) {
            setPosts([]);
            setOriginalPosts([]);
        }
        apolloLib.client(session)
            .query({
                fetchPolicy: 'no-cache',
                query:
                    spaceInfo.spaceType === clipTypes.announcement
                        ? queries.anClipSearch
                        : queries.clipSearch,
                variables: {
                    rid: spaceInfo.spaceId,
                    currentUser: user.uid,
                    keyword,
                    limit: 15,
                    page,
                    uid: filtering.collaberFilterEnabled ? filtering.collaber.id : '',
                    loveitsSort: filtering.loveitsFilter,
                    dateFilter: filtering.dateFilterEnabled
                        ? filtering.dateFilter
                        : dateFilter,
                },
            })
            .then(({data}) => {
                const clipData =
                    spaceInfo.spaceType === clipTypes.announcement
                        ? data.anClipSearch
                        : data.clipSearch;
                if (Array.isArray(clipData) && clipData.length > 0) {
                    clipResolver(clipData, page, isHistory).then(() => {
                        setPageIndex(page);
                    });
                }
                setLoader(false);
            })
            .catch(() => {
                setLoader(false);
            });
    };

    const itemRender = ({item}) => {
        if (!item.isBlocked && !item.isDeleted) {
            return <PostView clip={item} dark={true}/>;
        } else {
            return <></>;
        }
    };

    const emptyList = () => {
        if (!loader) {
            if (keyword && keyword?.trim()?.length > 0) {
                return (
                    <View>
                        <LottieView
                            source={lottie.searchEmpty}
                            style={styles.lottie}
                            autoPlay
                            loop
                        />
                        <Text
                            style={
                                styles.subtext
                            }>{`No result found with "${keyword.trim()}"`}</Text>
                    </View>
                );
            } else if (
                filtering.dateFilterEnabled ||
                filtering.loveitsFilter ||
                filtering.collaberFilterEnabled
            ) {
                return (
                    <View>
                        <LottieView
                            source={lottie.searchEmpty}
                            style={styles.lottie}
                            autoPlay
                            loop
                        />
                        <Text style={styles.subtext}>{'No result found'}</Text>
                    </View>
                );
            } else {
                return null;
            }
        } else {
            return null;
        }
    };

    const filterCallback = () => {
        setFilterPopup(true);
    };

    const filter = props => {
        setFiltering({
            loveitsFilter: props.loveitsFilter,
            collaber: props.collaber,
            collaberFilterEnabled: props.collaberFilterEnabled,
            dateFilter: props.dateRange,
            dateFilterEnabled: props.dateRangeEnabled,
        });
    };

    const showLoader = () => {
        if (loader === true) {
            return <ProgressLoader visible={loader ? loader : false}/>;
        } else {
            return null;
        }
    };

    return (
        <ClipProvider>
            <SafeScreenView translucent>
                <AppBar
                    dark
                    avatar={avatar}
                    onBackPress={() => navigation.goBack('')}
                    title={spaceInfo.displayName}
                    titleStyle={{color: theme.colors.secondaryDark}}
                />
                <Splitter height={10}/>
                <SearchBar
                    onBackPress={() => navigation.goBack('')}
                    defValue={keyword}
                    onSearch={setKeyword}
                    filter={true}
                    filterCallback={filterCallback}
                />
                <LineView spacing={5}/>
                <FlatList
                    data={posts}
                    style={{width: theme.width, flex: 1}}
                    contentContainerStyle={{paddingBottom: 100}}
                    renderItem={itemRender}
                    keyExtractor={item => item.id}
                    scrollEnabled={true}
                    onEndReachedThreshold={2}
                    onEndReached={() => {
                        if (originalPosts?.length >= 15 && !loader) {
                            search(pageIndex + 1, true);
                        }
                    }}
                    ListEmptyComponent={emptyList}
                />
                <Filter
                    onDismiss={() => {
                        setFilterPopup(false);
                    }}
                    initialState={filtering}
                    onFilter={props => {
                        setTimeout(() => {
                            filter(props);
                        }, 500);
                    }}
                    spaceInfo={spaceInfo}
                    visibility={filterPopup}
                    temporarySpace={params?.temporarySpace}
                />
                {showLoader()}
            </SafeScreenView>
        </ClipProvider>
    );
}
