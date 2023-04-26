/* eslint-disable react-native/no-inline-styles,react-hooks/exhaustive-deps */
import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, Text, View} from 'react-native';
import {lottie} from 'utilities/assets';
import LottieView from 'lottie-react-native';
import {queries} from 'schema';
import {useTheme} from 'context/ThemeContext';
import apolloLib from '../../../lib/apolloLib';
import {SearchListStyles} from 'system/styles/searchStyle';
import {useNavigation, useRoute} from '@react-navigation/native';
import {SafeScreenView} from 'index';
import {useBackHandler} from 'utilities/helper';
import logger from '../../../lib/logger';
import AppBar from '../../components/toolbar/appBar';
import {useSession} from '../../../context/SessionContext';
import LovitzCard from './lovitzCard';
import {clipTypes} from '../../../utilities/constant';
import ImageIcon from "../../components/utility/imageIcon";
import {lovitzIcons} from "../../../utilities/assets";
import {strings} from "../../../constant/strings";

const limit = 20;
export default function LovitzList() {
    const navigation = useNavigation();
    const {params} = useRoute();
    const {theme} = useTheme();
    const styles = SearchListStyles(theme);

    const session = useSession();
    const {user} = session;
    const [list, setList] = useState([]);
    const [count, setCount] = useState(-1);
    const [loading, setLoading] = useState(true);

    const loadingMessage = 'Loading...';
    const noResult = 'No lovitz found.';

    useEffect(() => {
        setLoading(true);
        if (params?.type === 'ideanGallery') {
            apolloLib.client(session)
                .query({
                    fetchPolicy: 'no-cache',
                    query: queries.getPersonalClipLovitz,
                    variables: {
                        uId: user.uid,
                        profileId: params.profileId,
                        id: params.id,
                    },
                })
                .then(({data, error}) => {
                    const {personalClipLovitz} = data;
                    if (personalClipLovitz) {
                        const {lovitzCount, lovitzUsers} = personalClipLovitz
                        if (lovitzUsers)
                            setList(lovitzUsers);
                        if (lovitzCount)
                            setCount(lovitzCount)
                        else
                            setCount(0)
                    }
                    if (error) {
                        logger.e(error);
                    }
                    setLoading(false);
                })
                .catch(err => {
                    logger.e(err);
                    setLoading(false);
                });
        } else {
            apolloLib.client(session)
                .query({
                    fetchPolicy: 'no-cache',
                    query:
                        params?.clipType === clipTypes.clip
                            ? queries.clipReactions
                            : queries.anClipReactions,
                    variables: {
                        id: params.id,
                    },
                })
                .then(({data, error}) => {
                    if (params?.clipType === clipTypes.clip) {
                        const {clipLovitz} = data;
                        if (clipLovitz) {
                            const {lovitzCount, lovitzUsers} = clipLovitz
                            if (lovitzUsers)
                                setList(lovitzUsers);
                            if (lovitzCount)
                                setCount(lovitzCount)
                            else
                                setCount(0)
                        }
                        if (error) {
                            logger.e(error);
                        }
                    } else {
                        const {anClipLovitz} = data;
                        if (anClipLovitz) {
                            const {lovitzCount, lovitzUsers} = anClipLovitz
                            if (lovitzUsers)
                                setList(lovitzUsers);
                            if (lovitzCount)
                                setCount(lovitzCount)
                            else
                                setCount(0)
                        }
                        if (error) {
                            logger.e(error);
                        }
                    }
                    setLoading(false);
                })
                .catch(err => {
                    setLoading(false);
                    logger.e(err);
                });
        }
    }, []);

    useBackHandler(() => {
        backPressHandler();
        return true;
    });

    const backPressHandler = () => {
        navigation.goBack(null);
    };

    const listRender = ({item}) => {
        return <LovitzCard item={item} user={user}/>;
    };

    const emptyList = useCallback(() => {
        if (loading === true) {
            return (
                <View
                    style={{
                        alignSelf: 'center',
                        height: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                    <LottieView
                        source={lottie.splash}
                        style={styles.lottie}
                        autoPlay
                        loop
                    />
                    <Text style={styles.subtext}>{loadingMessage}</Text>
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
                    <Text style={styles.subtext}>{noResult}</Text>
                </View>
            );
        }
    }, [list]);

    return (
        <SafeScreenView translucent>
            <AppBar
                title={'Check out who has given Lovitz'}
                onBackPress={backPressHandler}
            />

            {count > 0 &&
            <View style={styles.lovitzCountRow}>
                <View style={styles.lovitzCountCard}>
                    <ImageIcon
                        size={20}
                        containerStyle={{justifyContent: 'center'}}
                        source={lovitzIcons.red}
                    />
                    <Text style={styles.lovitzIconText}>
                        {strings.lovitzCountBegin}
                        <Text style={styles.lovitzIconTextActive}>{count}</Text>
                        {strings.lovitzCountEnd}
                    </Text>
                </View>
            </View>
            }
            <FlatList
                style={{flex: 1}}
                data={list}
                renderItem={listRender}
                scrollEnabled={true}
                ListEmptyComponent={emptyList}
            />
        </SafeScreenView>
    );
}

