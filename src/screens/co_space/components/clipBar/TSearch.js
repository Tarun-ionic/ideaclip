/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {FlatList, Text, View} from 'react-native';
import {onTrigger} from '../../../../utilities/helper';
import {TouchableOpacity} from 'react-native-gesture-handler';
import apolloLib from '../../../../lib/apolloLib';
import {queries} from '../../../../schema';
import {useTheme} from '../../../../context/ThemeContext';
import {PopUpStyles} from './MSearch';
import logger from '../../../../lib/logger';
import {useSession} from "../../../../context/SessionContext";

function TSearch({searchString, onTag}) {
    const session = useSession();
    const {theme} = useTheme();
    const styles = PopUpStyles(theme);
    const [tags, setTags] = useState([]);

    useEffect(() => {
        if (searchString?.length === 0) {
            setTags([]);
        } else {
            const keyword = searchString.substring(1);
            apolloLib.client(session)
                .query({
                    fetchPolicy: 'no-cache',
                    query: queries.hashtagSearch,
                    variables: {keyword: `#${keyword}`},
                })
                .then(({data, error}) => {
                    if (data && data.hashtagSearch.length > 0) {
                        setTags(data.hashtagSearch);
                    }
                    logger.e(error);
                })
                .catch(logger.e);
        }
    }, [searchString]);

    const listRender = ({item}) => {
        const _tags = item?.tag.replace('#', '')?.trim()?.split(' ');
        const tag = _tags[0] || '';
        if (tag !== '') {
            return (
                <TouchableOpacity onPress={() => onTagSelect(tag)}>
                    <View style={styles.card}>
                        <Text style={styles.cardInfo}>#{tag}</Text>
                    </View>
                </TouchableOpacity>
            );
        } else {
            return null;
        }
    };

    const onTagSelect = _tag => {
        onTrigger(onTag, {_tag, searchString});
        setTags([]);
    };

    return (
        <React.Fragment>
            {tags && tags.length > 0 && (
                <View style={styles.container}>
                    <FlatList
                        data={tags}
                        style={{flex: 1}}
                        inverted={true}
                        renderItem={listRender}
                        keyExtractor={item => item.uid}
                        keyboardShouldPersistTaps="always"
                        keyboardDismissMode="none"
                    />
                </View>
            )}
        </React.Fragment>
    );
}

export default React.memo(TSearch);
