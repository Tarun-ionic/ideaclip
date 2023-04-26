/* eslint-disable react-native/no-inline-styles,no-alert */
import React, {useEffect} from 'react';
import {Text, View} from 'react-native';
import {lottie} from '../../../index';
import AnimatedLoader from 'react-native-animated-loader';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useQuery} from '@apollo/client';
import {useTheme} from '../../../context/ThemeContext';
import StyleGenerator from './StyleGenerator';
import AppBar from '../../../screens/components/toolbar/appBar';
import {queries} from '../../../schema';
import {navigationReset} from "../../../utilities/helper";

const QuestionnaireLoader = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const {theme} = useTheme();
    const {colors} = theme;
    const styles = StyleGenerator(theme);
    const {data, loading} = useQuery(queries.getQuestionnaire, {
        variables: {
            isUser: true,
        },
    });
    useEffect(() => {
        if (!loading) {
            if (data) {
                if (data.questioner) {
                    navigationReset(navigation, 'Questionnaire', {
                        ...route.params,
                        questions: data.questioner,
                    });
                } else {
                    alert('Error fetching resources. Try again later');
                }
            } else {
                alert('Error fetching resources. Try again later');
            }
        }
    }, [data, loading]);

    return (
        <View style={styles.container}>
            <AppBar 
            // gradiant
             title={'Questionnaire'}/>
            <AnimatedLoader
                visible={loading}
                overlayColor="rgba(255,255,255,0)"
                source={lottie.loader}
                animationStyle={styles.lottie}
                speed={1}
                loop={true}>
                <Text style={{alignSelf: 'center', color: colors.secondary}}>
                    {' '}
                    Loading resources ...
                </Text>
            </AnimatedLoader>
        </View>
    );
};
export default QuestionnaireLoader;
