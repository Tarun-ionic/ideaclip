/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';
import {isHashTag, isLink, isLinker, isMention, isOnlyEmoji, wordCount,} from '../../../lib/checker';
import {useTheme} from 'context/ThemeContext';
import ClipStyles from 'system/styles/clipStyles';
import {useClip} from 'context/ClipContext';
import PropTypes from 'prop-types';
import {Linking, Platform} from 'react-native';
import {LinkPreview} from '@flyerhq/react-native-link-preview';
import scale from '../../../utilities/scale';
import config from "../../../constant/config";
import {CopyText} from "./share";
import UrlPreview from "../../../components/urlPreview";

TextViewer.propTypes = {
    keyCode: PropTypes.string,
    clipSearch: PropTypes.bool,
    text: PropTypes.string.isRequired,
    viewer: PropTypes.bool.isRequired,
    hashTagStyle: PropTypes.object,
    LinkStyle: PropTypes.object,
    mentionStyle: PropTypes.object,
};
TextViewer.defaultProps = {
    keyCode: "key-code"
}

function TextViewer({
                        keyCode,
                        text,
                        textStyle,
                        hashTagStyle,
                        LinkStyle,
                        mentionStyle,
                        viewer,
                        postView = false,
                        ignoreShowMore = false,
                        clipSearch = false,
                        viewWidth = 0,
                        isChat = false,
                        chatSpace = false,
                        minView = false,
                        linkPreview = false
                    }) {
    const {theme, mode, width} = useTheme();
    const styles = ClipStyles({...theme, mode}, width, null, null, viewer, postView);
    const {onSearch} = useClip();
    const [show_more, setShow_more] = useState(
        ignoreShowMore ? true : chatSpace ? text.trim().length < config.showMore.chat : text.trim().length < config.showMore.coSpace,
    );
    useEffect(() => {

        if (!ignoreShowMore) {
            if (isLinker(text)) {
                if (wordCount(text) < 10) {
                    setShow_more(true);
                } else {
                    setShow_more(false);
                }
            }
        }
    }, [ignoreShowMore]);

    const singleUrlPreview = link => {
        if (minView === true) {
            return HyperLink(link);
        } else {
            return (
                <View
                    style={[
                        styles.urlPreview,
                        {width: viewWidth, paddingVertical: 2},
                    ]}>

                    {!linkPreview &&
                    <UrlPreview
                        url={link}
                        fetchData={true}
                        chatSpace ={chatSpace}
                        size={chatSpace?viewWidth-10:viewWidth - 5}
                        textContainerStyle={{
                            marginHorizontal: chatSpace ? 5 : 10,
                        }}
                    />
                    }
                    {HyperLink(link)}
                </View>
            );
        }
    };

    const handleLinkPress = link => {
        let trimmedLink = link.trim();
        let url =
            trimmedLink.length > 8 && trimmedLink.substring(0, 8).toLowerCase() === 'https://'
                ? trimmedLink
                : trimmedLink.length > 8 && trimmedLink.substring(0, 7).toLowerCase() === 'http://'
                ? trimmedLink
                : `https://${trimmedLink}`;
        Linking.openURL(url).then();
    };

    const MultiUrlPreview = link => {
        if (minView === true) {
            return null
        } else {
            return (
                <View
                    style={[
                        styles.urlPreview,
                        {width: viewWidth > 0 ? viewWidth : '100%'},
                    ]}>


                    {!linkPreview &&
                    <UrlPreview
                        url={link}
                        chatSpace ={chatSpace}
                        fetchData={true}
                        size={chatSpace?viewWidth-10:viewWidth - 5}
                        // size={viewWidth - 5}
                        textContainerStyle={{
                            marginHorizontal: chatSpace ? 5 : 10,
                        }}
                        />
                    }
                </View>
            );
        }
    };

    const HyperLink = (link, index = 0) => {
        return (
            <Text
                key={`${keyCode}-${index}-href-text`}
                onLongPress={() => CopyText(link)}
                style={[LinkStyle ? LinkStyle : styles.defLink, {marginHorizontal: 2}]}
                onPress={() => {
                    handleLinkPress(link);
                }}>
                {link}
            </Text>
        );
    };

    const HashTag = (_text, index = 0) => {
        return (
            <Text
                key={`${keyCode}-${index}-hash-tag-text`}
                style={hashTagStyle ? hashTagStyle : styles.defHashTag}
                onPress={() => {
                    handleSearch(_text);
                }}>
                {_text}{_text !== '\n' && _text !== '\t' && ' '}
            </Text>
        );
    };

    const handleSearch = _text => {
        if (onSearch) {
            onSearch(_text);
        }
    };
    const Mention = (_text, index = 0) => {
        return (
            <Text
                key={`${keyCode}-${index}-mention-text`}
                style={[mentionStyle ? mentionStyle : styles.defMention]}
                onPress={() => {
                    handleSearch(_text);
                }}>
                {_text}{' '}
            </Text>
        );
    };
    const BigEmoji = (_text, index = 0) => {
        return (
            <Text
                key={`${keyCode}-${index}-big-emoji-text`}
                style={[
                    textStyle
                        ? textStyle
                        : clipSearch
                        ? styles.plainTextSearch
                        : styles.plainText,
                    {
                        fontSize: Platform.OS === 'ios' ? scale.font.ul : scale.font.sl,
                        lineHeight: Platform.OS === 'ios' ? scale.font.uxl : scale.font.sxl
                    },
                ]}>
                {_text}
            </Text>
        );
    };
    const PlainText = (_text, index = 0) => {
        return (
            <Text
                key={`${keyCode}-${index}-plain-text`}
                style={
                    textStyle
                        ? textStyle
                        : clipSearch
                        ? styles.plainTextSearch
                        : styles.plainText
                }>
                {_text}{_text !== '\n' && _text !== '\t' && ' '}
            </Text>
        );
    };

    const ShowMoreText = _show_more => {
        return (
            <React.Fragment>
                {!_show_more ? (
                    <Text key={`${keyCode}-hash-more-text`} style={styles.defShowLink}
                          onPress={() => setShow_more(true)}>
                        show more
                    </Text>
                ) : (
                    <Text key={`${keyCode}-more-less-text`} style={styles.defShowLink}
                          onPress={() => setShow_more(false)}>
                        show less
                    </Text>
                )}
            </React.Fragment>
        );
    };

    const TextViewerMore = (AutoLink, urls = [], splitCount = 0) => {

        return (
            <View style={{width: '100%'}}>
                {urls?.length > 0 && MultiUrlPreview(urls[0])}
                <Text
                    key={`${keyCode}-more-text`}
                    style={[
                        textStyle
                            ? textStyle
                            : clipSearch
                            ? styles.defTextSearch
                            : styles.defText,
                        {padding: 5},
                    ]}>

                    {show_more ? AutoLink : splitCount > 0 ? AutoLink.slice(0, splitCount) : AutoLink}
                    {splitCount > 0 && !show_more ? ' ....' : ''}
                </Text>
                {splitCount > 0 && ShowMoreText(show_more)}
            </View>
        );
    }

    const wordSplitter = texts => {
        let a = texts.split('\n');
        let b = [];
        let i = 0;
        for (i in a) {
            let c = a[i].split('\t');
            let j = 0;
            for (j in c) {
                b.push(...c[j].split(' '));
                if (j < c.length - 1) {
                    b.push('\t');
                }
            }
            if (i < a.length - 1) {
                b.push('\n');
            }
        }
        return b;
    };

    const codeGenerator = () => {
        const words = wordSplitter(text?.trim());
        const showWordsCount = wordSplitter(text?.trim().slice(0, chatSpace ? config.showMore.chat : config.showMore.coSpace)).length;
        const AutoLink = [];
        let urls = [];
        if (isOnlyEmoji(text)) {
            return BigEmoji(text, '');
        } else if (isLinker(text)) {
            if (words.length === 1) {
                if (isLink(text)) {
                    return singleUrlPreview(text);
                } else if (isHashTag(text)) {
                    return HashTag(text, '');
                } else if (isMention(text)) {
                    return Mention(text, '');
                } else {
                    return PlainText(text);
                }
            } else {
                words.forEach((word, index) => {
                    if (isLink(word)) {
                        urls.push(word);
                        AutoLink.push(HyperLink(word, index));
                    } else if (isHashTag(word)) {
                        AutoLink.push(HashTag(word, index));
                    } else if (isMention(word)) {
                        AutoLink.push(Mention(word, index));
                    } else {
                        AutoLink.push(PlainText(word, index));
                    }
                });
                return TextViewerMore(AutoLink, urls, showWordsCount === words.length ? 0 : showWordsCount);
            }
        } else {
            return TextViewerMore(text, [], showWordsCount === words.length ? 0 : chatSpace ? config.showMore.chat : config.showMore.coSpace);
        }
    };

    return <React.Fragment>{codeGenerator()}</React.Fragment>;
}

export default React.memo(TextViewer);
