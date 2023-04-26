/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';
import { isHashTag, isLink, isLinker, isMention, isOnlyEmoji, wordCount,} from '../../../lib/checker';
import {useTheme} from 'context/ThemeContext';
import ClipStyles from 'system/styles/clipStyles';
import PropTypes from 'prop-types';
import {Linking, Platform} from 'react-native';
import scale from '../../../utilities/scale';

IdeanGalleryText.propTypes = {
    clipSearch: PropTypes.bool,
    text: PropTypes.string.isRequired,
    viewer: PropTypes.bool.isRequired,
    hashTagStyle: PropTypes.object,
    LinkStyle: PropTypes.object,
    mentionStyle: PropTypes.object,
};

function IdeanGalleryText({
                              text,
                              textStyle,
                              hashTagStyle,
                              LinkStyle,
                              mentionStyle,
                              viewer,
                              ignoreShowMore = false,
                              clipSearch = false,
                              viewWidth = 0,
                              isChat = false,
                          }) {
    const {theme, width} = useTheme();
    const styles = ClipStyles(theme, width, null, null, viewer);
    const [show_more, setShow_more] = useState(
        ignoreShowMore ? true : text.length < 100,
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


    const handleLinkPress = link => {
        let trimmedLink = link.trim();
        let url =
            trimmedLink.length > 8 && trimmedLink.substring(0, 8).toLowerCase() === 'https://'
                ? trimmedLink
                : trimmedLink.length > 8 && trimmedLink.substring(0, 7).toLowerCase() === 'http://'
                ? trimmedLink
                : `https://${trimmedLink}`;
        Linking.openURL(url);
    };


    const HyperLink = (link, index = 0) => {
        return (
            <Text
                key={index}
                style={LinkStyle ? LinkStyle : styles.defLink}
                onPress={() => {
                    handleLinkPress(link);
                }}
            >
                {link}
            </Text>
        );
    };

    const HashTag = (_text, link, index = 0) => {
        return (
            <Text
                key={index}
                style={hashTagStyle ? hashTagStyle : styles.defHashTag}
            >{_text}{' '}</Text>
        );
    };

    const Mention = (_text, link, index = 0) => {
        return (
            <Text
                key={index}
                style={[mentionStyle ? mentionStyle : styles.defMention]}
            >
                {_text}{' '}
            </Text>
        );
    };
    const BigEmoji = (_text, index = 0) => {
        return (
            <Text
                key={index}
                style={[
                    textStyle
                        ? textStyle
                        : clipSearch
                        ? styles.plainTextSearch
                        : styles.plainText,
                    {    fontSize: Platform.OS === 'ios' ? scale.font.usl : scale.font.ssl,
                    lineHeight: Platform.OS === 'ios' ? scale.font.usxl : scale.font.ssxl},
                ]}>
                {_text}
            </Text>
        );
    };
    const PlainText = (_text, index = 0) => {
        return (
            <Text
                key={index}
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
                {ignoreShowMore ?
                    <></>
                    :
                    !_show_more ? (
                        <Text style={styles.defShowLink} onPress={() => setShow_more(true)}>
                            show more
                        </Text>
                    ) : (
                        <Text style={styles.defShowLink} onPress={() => setShow_more(false)}>
                            show less
                        </Text>
                    )}
            </React.Fragment>
        );
    };

    const TextViewerMore = (AutoLink, urls = []) => {
        return (
            <View style={{width: '100%'}}>
                <Text
                    style={[
                        textStyle
                            ? textStyle
                            : clipSearch
                            ? styles.defTextSearch
                            : styles.defText,
                        {padding: 5},
                    ]}>
                    {ignoreShowMore ? AutoLink : show_more ? AutoLink : AutoLink.slice(0, isLinker(text) ? 10 : 100)}{' '}
                    {ignoreShowMore ? '' : !show_more ? '....' : ''}
                </Text>
                {isLinker(text)
                    ? AutoLink.length > 10 && ShowMoreText(show_more)
                    : AutoLink.length > 100 && ShowMoreText(show_more)}
            </View>
        );
    };
    const wordSplitter = texts => {
        let a = texts?.split('\n');
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
        const AutoLink = [];
        let urls = [];
        if (isOnlyEmoji(text)) {
            return BigEmoji(text, '');
        } else if (isLinker(text)) {
            if (words.length === 1) {
                if (isLink(text)) {
                    return HyperLink(text);
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
                        AutoLink.push(HashTag(word, '', index));
                    } else if (isMention(word)) {
                        AutoLink.push(Mention(word, '', index));
                    } else {
                        AutoLink.push(PlainText(word, index));
                    }
                });
                return TextViewerMore(AutoLink, urls);
            }
        } else {
            return TextViewerMore(text);
        }
    };

    return <React.Fragment>{codeGenerator()}</React.Fragment>;
}

export default React.memo(IdeanGalleryText);
