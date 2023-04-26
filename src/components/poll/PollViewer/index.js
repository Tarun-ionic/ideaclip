import {Image, Platform, Pressable, Text, View,} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import styles from '../assets/style';
import {useTheme} from '../../../context/ThemeContext';
import PropTypes from 'prop-types';
import vote from '../assets/pollVote.png';
import option1icon from '../assets/pollIcon1.png';
import option2icon from '../assets/pollIcon2.png';
import option3icon from '../assets/pollIcon3.png';
import Svg, {Path} from "react-native-svg";
import scale from "../../../utilities/scale";
import LinearGradient from "react-native-linear-gradient";
import ImageIcon from "../../../screens/components/utility/imageIcon";
import {cacheFile, Time2String} from "../../../lib/storage";
import ClipStyles from 'system/styles/clipStyles';
import {placeHolders} from "../../../utilities/assets";
import logger from "../../../lib/logger";
import {useNavigation} from "@react-navigation/native";
import apolloLib from "../../../lib/apolloLib";
import {useSession} from "../../../context/SessionContext";
import {mutations} from "../../../schema";

PollViewer.propTypes = {
    isViewer: PropTypes.bool,
    index: PropTypes.number,
    spaceInfo: PropTypes.object,
    item: PropTypes.object,
};

export default function PollViewer({item, spaceInfo, index, isViewer, color}) {
    const session = useSession();
    const {user} = session
    const {theme, width, height, mode} = useTheme();
    const {colors} = theme;
    const navigation = useNavigation();
    const style = styles(theme, width, height);
    const _style = ClipStyles({...theme, mode}, width);
    const [pollData, setPollData] = useState(item);
    const [state] = useState(item?.pollData || {})
    const [avatar, setAvatar] = useState(placeHolders.avatar);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        let mount = true;
        if (pollData?.user?.profileImage) {
            if (pollData?.user?.profileImageB64) {
                setAvatar({uri: pollData?.user?.profileImageB64});
            } else {
                cacheFile(pollData?.user?.profileImage, 'dp')
                    .then(path => {
                        mount && setAvatar({uri: path})
                    }).catch(error => logger.e('clip avatar', error));
            }
        }
        return () => (mount = false);
    }, []);

    useEffect(() => {
        if (JSON.stringify(item) !== JSON.stringify(pollData)) {
            setPollData(item);
        }
    }, [item]);

    const profileNavigation = () => {
        navigation.push('PersonalSpace', {
            user,
            profile: pollData?.user,
            goBack: true,
        });
    };

    const updateOption = (option) => {
        if (isUpdating) return false;
        setIsUpdating(true)
        apolloLib.client(session).mutate({
            fetchPolicy: 'no-cache',
            mutation: mutations.updatePollCount,
            variables: {
                userId: user.uid,
                option,
                pollId: item.id,
                spaceId: spaceInfo.spaceId
            }
        }).then(({data}) => {
            const {updatePollCount} = data
            setIsUpdating(false)
            setPollData({...pollData, pollCount: updatePollCount})
        }).catch(e => {
            logger.e("poll-count", e)
            setIsUpdating(false)
        })
    }

    const getCount = (option) => {
        return pollData?.pollCount?.[option] || 0;
    }

    const contentView = useMemo(() => {
        return (
            <Pressable style={style.pollView}>
                <View style={style.titleContainer}>
                    <Image style={style.vote} source={vote}/>
                </View>
                <View style={style.body}>
                    <View style={style.quizWrap}>
                        <Text style={style.questionText}>{state.question}</Text>
                    </View>

                    <View style={style.optionContainer}>
                        <Pressable style={style.optionIconWrap} onPress={() => updateOption("option1")}>
                            <Image style={style.optionIcon} source={option1icon}/>
                            <Text style={style.optionIconText}>+ {getCount('option1')}</Text>
                        </Pressable>
                        <Pressable style={[style.optionWrap, style.option1]} onPress={() => updateOption("option1")}>
                            <Text style={[style.option, style.option1]}>{state.option1}</Text>
                        </Pressable>
                    </View>

                    <View style={style.optionContainer}>
                        <Pressable style={style.optionIconWrap} onPress={() => updateOption("option2")}>
                            <Image style={style.optionIcon} source={option2icon}/>
                            <Text style={style.optionIconText}>+ {getCount('option2')}</Text>
                        </Pressable>
                        <Pressable style={[style.optionWrap, style.option2]} onPress={() => updateOption("option2")}>
                            <Text style={[style.option, style.option2]}>{state.option2}</Text>
                        </Pressable>
                    </View>

                    <View style={style.optionContainer}>
                        <Pressable style={style.optionIconWrap} onPress={() => updateOption("option3")}>
                            <Image style={style.optionIcon} source={option3icon}/>
                            <Text style={style.optionIconText}>+ {getCount('option3')}</Text>
                        </Pressable>
                        <Pressable style={[style.optionWrap, style.option3]} onPress={() => updateOption("option3")}>
                            <Text style={[style.option, style.option3]}>{state.option3}</Text>
                        </Pressable>
                    </View>
                </View>
            </Pressable>
        )
    }, [pollData])

    const arrow = Platform.OS === "ios" ? null : (
        <Svg
            style={
                isViewer ? _style.arrow_leftBubble : _style.arrow_rightBubble
            }
            width={scale.ms(50, 0.5)}
            height={scale.ms(50, 0.5)}
            viewBox="0 0 210 297"
            enable-background="new 32.485 17.5 15.515 17.5">
            <Path
                d={
                    isViewer
                        ? 'M 164.04706,51.791817 27.527421,9.3394213 128.47182,145.41547 164.747,145.07381 Z'
                        : 'M 28.227365,51.791817 164.747,9.3394213 63.802601,145.41547 27.527421,145.07381 Z'
                }
                fill={colors.poll_preview_bg}
                stroke={'#646464'}
                strokeWidth={1}
                x="0"
                y="0"
            />
        </Svg>
    )


    return (
        <View style={[_style.messageBubble, isViewer ? _style.viewerBubble : _style.not_viewerBubble]}>
            <View style={_style.avatarBubble}>
                <ImageIcon
                    size={40}
                    source={avatar}
                    style={{opacity: isViewer ? 1 : 0, backgroundColor: colors.surfaceAccent}}
                    onPress={() => {
                        isViewer && profileNavigation();
                    }}
                />
                <View style={_style.labelContainerBubbleShrink}>
                    <Text
                        style={[_style.labelBubble, {textAlign: isViewer ? 'left' : 'right'}]}
                        onPress={() => {
                            profileNavigation();
                        }}>
                        {pollData?.user?.displayName}
                    </Text>
                    <Text
                        style={[_style.timeBubble, {textAlign: isViewer ? 'left' : 'right'}]}>
                        {Time2String(pollData)}
                    </Text>
                </View>
                <ImageIcon
                    size={40}
                    source={avatar}
                    style={{
                        opacity: isViewer ? 0 : 1,
                        backgroundColor: colors.surfaceAccent,
                    }}
                />
            </View>
            <LinearGradient
                colors={[colors.poll_preview_bg, colors.poll_preview_bg]}
                style={[_style.cloudBubble, {borderWidth: 1, borderColor: colors.poll_preview_bg_border}]}>
                <View
                    style={[
                        _style.arrow_containerBubble,
                        isViewer
                            ? _style.arrow_left_containerBubble
                            : _style.arrow_right_containerBubble,
                    ]}>
                    {arrow}
                </View>
                {contentView}
            </LinearGradient>
        </View>
    );
}
