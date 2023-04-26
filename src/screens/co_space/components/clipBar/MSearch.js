/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import scale from 'utilities/scale';
import {onTrigger} from '../../../../utilities/helper';
import {TouchableOpacity} from 'react-native-gesture-handler';
import apolloLib from '../../../../lib/apolloLib';
import {queries} from '../../../../schema';
import {useTheme} from '../../../../context/ThemeContext';
import logger from '../../../../lib/logger';
import ImageIcon from '../../../components/utility/imageIcon';
import {placeHolders} from '../../../../utilities/assets';
import {useSession} from "../../../../context/SessionContext";

function MSearch({searchString, onMention}) {
    const session = useSession();
    const {theme} = useTheme();
    const styles = PopUpStyles(theme);
    const [mention, setMention] = useState([]);

    useEffect(() => {
        if (searchString?.length === 0) {
            setMention([]);
        } else {
            const keyword = searchString.substring(1);
            apolloLib.client(session)
                .query({
                    fetchPolicy: 'no-cache',
                    query: queries.mensionSearch,
                    variables: {keyword},
                })
                .then(({data}) => {
                    if (data?.mensionSearch.length > 0) {
                        setMention(data.mensionSearch);
                    }
                })
                .catch(error => logger.e('MSearch', error));
        }
    }, [searchString]);

    const listRender = ({item}) => {
        const words = item?.displayName?.trim()?.split(' ');
        const displayName = words[0] || '';
        if (displayName !== '') {
            return (
                <TouchableOpacity onPress={() => onMentionSelect(displayName)}>
                    <View style={styles.card}>
                        <View style={styles.avatarContainer}>
                            <ImageIcon size={30} source={placeHolders.avatar}/>
                        </View>
                        <Text style={styles.cardInfo}>{displayName}</Text>
                    </View>
                </TouchableOpacity>
            );
        } else {
            return null;
        }
    };

    const onMentionSelect = displayName => {
        onTrigger(onMention, {displayName, searchString});
        setMention([]);
    };

    return (
        <React.Fragment>
            {mention && mention.length > 0 && (
                <View style={styles.container}>
                    <FlatList
                        data={mention}
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

export default React.memo(MSearch);

export const PopUpStyles = ({colors}) =>
    StyleSheet.create({
        container: {
            width: '50%',
            height: 200,
            zIndex: 40,
            bottom: 10,
            left: 25,
            right: 25,
        },
        card: {
            backgroundColor: 'rgba(232,232,232,0.38)',
            paddingVertical: 5,
            paddingHorizontal: 10,
            flexDirection: 'row',
        },
        cardInfo: {
            fontSize: scale.font.s,
            alignSelf: 'center',
            textAlignVertical: 'center',
            minHeight: 30,
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
