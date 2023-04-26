/* eslint-disable react-hooks/exhaustive-deps,react-native/no-inline-styles */
// noinspection JSUnresolvedVariable

import React, {useEffect, useLayoutEffect, useState} from 'react';
import {ScrollView, Text, View} from 'react-native';
import PropTypes from 'prop-types';
import AppIntroSlider from 'react-native-app-intro-slider';
import Button from 'react-native-button';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useTheme} from '../../../context/ThemeContext';
import StyleGenerator from './StyleGenerator';
import {SafeScreenView} from '../../../index';
import AppBar from '../../../screens/components/toolbar/appBar';
import {navigationReset, useBackHandler} from '../../../utilities/helper';

const Questionnaire = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const {theme} = useTheme();
    const styles = StyleGenerator(theme);

    const [questions, setQuestions] = useState([]);
    useEffect(() => {
        if (route.params.questions && isLoading) {
            setQuestions(route.params.questions);
            let a = [];
            route.params.questions.map(q => {
                a.push({
                    id: q.questionerId,
                    answer: [],
                });
            });
            setAnswers(a);
            setIsLoading(false);
        }
    }, []);
    const [answers, setAnswers] = useState([]);

    const [isLoading, setIsLoading] = useState(true);

    const slides = questions.map((q, index) => {
        return {
            key: index.toString(),
            question: q.question,
            options: q.questionOptions,
            isMultiple: q.isMultiple,
        };
    });
    useBackHandler(() => {
        return true;
    }, [route]);

    const _onDone = () => {
        navigationReset(navigation, 'Intro', {...route.params, goBack: false});
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, [navigation]);

    const _renderItem = ({item, dimensions}) => (
        <View key={'layout' + item.id} style={[styles.container, dimensions]}>
            <View key={'titleLayout' + item.id}>
                <Text key={'title' + item.id} style={styles.title}>
                    {item.question}
                    {item.isMultiple && '\n(You can choose more than one)'}
                </Text>
            </View>
            <ScrollView scrollEnabled={true}>
                <View
                    key={'optionsLayout' + item.id}
                    style={{
                        marginHorizontal: 5,
                        flex: 1,
                        paddingBottom: 100,
                    }}>
                    {item.options.map(function (option, index) {
                        return (
                            <Button
                                key={'option-' + item.id + '-' + index}
                                name={item.key + '.' + index}
                                containerStyle={
                                    checkClicked(item.key, index)
                                        ? styles.buttonContainer2
                                        : styles.buttonContainer1
                                }
                                style={
                                    checkClicked(item.key, index) ? styles.text2 : styles.text1
                                }
                                onPress={() => {
                                    onClickButton(item.key, index);
                                }}>
                                {option}
                            </Button>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );

    function checkClicked(key, index) {
        if (answers.length > key) {
            let answerIndex = answers[key].answer.indexOf(index);
            return answerIndex !== -1;
        } else {
            return false;
        }
    }

    function onClickButton(key, index) {
        let a = [...answers];
        let answerIndex = answers[key].answer.indexOf(index);
        let answeredCount = answers[key].answer.length;
        if (questions[key].isMultiple) {
            if (answerIndex === -1) {
                if (answeredCount < questions[key].multipleCount) {
                    a[key].answer.push(index);
                    setAnswers(a);
                }
            } else {
                a[key].answer.splice(answerIndex, 1);
                setAnswers(a);
            }
        } else {
            if (answerIndex === -1) {
                if (answeredCount === 0) {
                    a[key].answer.push(index);
                    setAnswers(a);
                } else {
                    a[key].answer.splice(0, 1);
                    a[key].answer.push(index);
                    setAnswers(a);
                }
            } else {
                a[key].answer.splice(answerIndex, 1);
                setAnswers(a);
            }
        }
    }

    const _renderNextButton = () => {
        return <Text style={styles.button}>{'Next'}</Text>;
    };

    const _renderPrevButton = () => {
        return <Text style={styles.button}>{'Previous'}</Text>;
    };

    const _renderDoneButton = () => {
        return <Text style={styles.button}>{'Done'}</Text>;
    };

    return (
        <SafeScreenView
            translucent
            colors={['#e50012', '#0359a7']}
            locations={[0.4, 0.9]}>
            <AppBar 
            // gradiant
             title={'Questionnaire'}/>
            <AppIntroSlider
                back
                data={slides}
                slides={slides}
                onDone={_onDone}
                renderItem={_renderItem}
                scrollEnabled={true}
                // nestedScrollEnabled={true}
                //Handler for the done On last slide
                showSkipButton={false}
                showPrevButton={true}
                // onSkip={_onDone}
                renderNextButton={_renderNextButton}
                renderPrevButton={_renderPrevButton}
                // renderSkipButton={_renderSkipButton}
                renderDoneButton={_renderDoneButton}
            />
        </SafeScreenView>
    );
};

Questionnaire.propTypes = {
    navigation: PropTypes.object,
};

export default Questionnaire;
