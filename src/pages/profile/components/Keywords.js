/* eslint-disable react-native/no-inline-styles */
// noinspection JSUnresolvedVariable

import React, {useState} from 'react';
import {Modal, ScrollView, Text, TextInput, TouchableHighlight, TouchableWithoutFeedback, View,} from 'react-native';
import {Chip, Icon} from 'react-native-elements';
import {useTheme} from '../../../context/ThemeContext';
import {PopupStyle} from '../../../system/styles/popupStyle';

import {GradiantButton, ProgressLoader} from '../../../system/ui/components';
import {useMutation} from '@apollo/client';
import {mutations} from '../../../schema';
import Toast from 'react-native-simple-toast';

export default function Keywords({onDismiss, visibility, keywords, edit, uid}) {
    const {theme} = useTheme();
    const {colors} = theme;
    const styles = PopupStyle(theme);
    const [keyword, setKeyword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [addKeyword] = useMutation(mutations.updateKeywords);
    const [removeKeyword] = useMutation(mutations.removeKeywords);
    const saveKeyword = () => {
        setIsLoading(true);
        let a = keywords ? [...keywords] : [];
        let b = keyword[0] === '#' ? keyword : `#${keyword.replace(/[\s]+/g, '')}`;
        a.push(b);
        addKeyword({
            fetchPolicy: 'no-cache',
            variables: {
                uid: uid,
                keywords: [b],
            },
        })
            .then(() => {
                updateKeywords(a);
            })
            .catch(() => {
                Toast.show('Error updating keyword clip');
                setIsLoading(false);
            });
    };

    const updateKeywords = data => {
        setKeyword('');
        edit(data);
        setIsLoading(false);
    };

    return (
        <Modal
            animationType={'slide'}
            transparent={true}
            visible={visibility}
            onRequestClose={() => {
                onDismiss(true);
            }}>
            <TouchableHighlight
                activeOpacity={0.0}
                underlayColor="transparent"
                onPress={() => {
                    setKeyword('');
                    onDismiss(true);
                }}
                style={styles.modal}>
                <TouchableWithoutFeedback>
                    <View style={styles.container}>
                        <View style={styles.elementTitle}>
                            <Icon
                                name="cog"
                                color={colors.secondary}
                                type="material-community"
                            />
                            <Text style={styles.title}>Keywords</Text>
                            <Icon
                                name="cancel"
                                size={30}
                                color={colors.secondary}
                                type="material"
                                onPress={() => {
                                    setKeyword('');
                                    onDismiss(true);
                                }}
                            />
                        </View>
                        <View style={styles.line}/>
                        <View style={styles.searchBar}>
                            <View style={styles.searchBarWrap}>
                                <TextInput
                                    style={styles.searchBarInput}
                                    numberOfLines={1}
                                    placeholder={'#keyword'}
                                    placeholderTextColor={theme.colors.textPrimary}
                                    onChangeText={text => setKeyword(text.replace(/[\s]+/g, ''))}
                                    underlineColorAndroid="transparent"
                                    value={keyword}
                                    onSubmitEditing={() => saveKeyword()}
                                />
                            </View>

                            <GradiantButton
                                label={'Add'}
                                onPress={() => saveKeyword()}
                                disabled={
                                    (keywords &&
                                        (keywords.length === 5 ||
                                            keywords.indexOf(keyword) >= 0 ||
                                            keywords.indexOf('#' + keyword) >= 0)) ||
                                    keyword.length === 0
                                }
                            />
                        </View>
                        <View style={styles.chipsView}>
                            <ScrollView nestedScrollEnabled={true}>
                                <View style={styles.selectedContainer}>
                                    {keywords && keywords.length > 0 ? (
                                        keywords.map((item, i) => {
                                            return (
                                                <Chip
                                                    key={i}
                                                    style={{paddingHorizontal: 10}}
                                                    title={item}
                                                    type={'outline'}
                                                    icon={{
                                                        name: 'close-circle',
                                                        type: 'material-community',
                                                        onPress: () => {
                                                            setIsLoading(true);
                                                            let a = keywords ? [...keywords] : [];
                                                            a.splice(keywords.indexOf(item), 1);
                                                            removeKeyword({
                                                                fetchPolicy: 'no-cache',
                                                                variables: {
                                                                    uid: uid,
                                                                    keywords: [item],
                                                                },
                                                            })
                                                                .then(() => {
                                                                    updateKeywords(a);
                                                                })
                                                                .catch(() => {
                                                                    Toast.show('Error updating keyword clip');
                                                                    setIsLoading(false);
                                                                });
                                                        },
                                                        color: colors.interestTagsText,
                                                    }}
                                                    iconRight
                                                    titleStyle={{
                                                        color: colors.interestTagsText,
                                                        maxWidth: '90%',
                                                    }}
                                                    buttonStyle={{
                                                        backgroundColor: colors.surfaceDark,
                                                        borderColor: colors.secondaryDark,
                                                    }}
                                                    containerStyle={{margin: 5}}
                                                />
                                            );
                                        })
                                    ) : (
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                marginVertical: 10,
                                                marginHorizontal: 15,
                                            }}>
                                            <Text style={styles.staticText}>
                                                Highlight your 5 areas of
                                            </Text>
                                            <Text style={styles.keywordText}>{' #interest '}</Text>
                                            <Text style={styles.staticText}>here.</Text>
                                        </View>
                                    )}
                                </View>
                            </ScrollView>
                        </View>
                        <ProgressLoader visible={isLoading}/>
                    </View>
                </TouchableWithoutFeedback>
            </TouchableHighlight>
        </Modal>
    );
}
