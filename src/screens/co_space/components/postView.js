/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {Pressable, View} from 'react-native';
import ContentViewer from './clip/ContentViewer';
import {cacheFile} from '../../../lib/storage';
import {useTheme} from 'context/ThemeContext';
import {placeHolders} from 'utilities/assets';
import ClipStyles from 'system/styles/clipStyles';
import {onTrigger} from 'utilities/helper';
import UserInfo from 'screens/components/toolbar/userInfo';
import {logger} from '../../../index';
import MinClip from './minClip';
import scale from '../../../utilities/scale';
import {GradiantButton} from '../../../system/ui/components';

function PostView({clip, onPress, actionMenu, reported = false, dark}) {
    const {theme, width} = useTheme();
    const clipWidth = (width * 0.96)
    const {colors} = theme;
    const styles = ClipStyles({colors, clipWidth}, width);
    const [avatarThread, setAvatarThread] = useState(placeHolders.avatar);

    useEffect(() => {
        if (clip?.parentThread?.user?.profileImageB64) {
            setAvatarThread({uri: clip?.parentThread?.user?.profileImageB64});
        } else {
            cacheFile(clip?.parentThread?.user?.profileImage, 'dp')
                .then(path => setAvatarThread({uri: path}))
                .catch(logger.e);
        }
    }, []);

    const handlePress = () => {
        onTrigger(onPress, clip);
    };

    return (
        <Pressable
            style={(reported || dark) ? styles.reportContainer : styles.container}
            onPress={() => {
                if (!reported) {
                    handlePress();
                }
            }}>
            <View
                style={[
                    (reported || dark) ? styles.reportMessage : styles.message,
                    styles.viewer,
                ]}>
                {reported ? (
                    <View style={{flexDirection: 'row'}}>
                        <UserInfo
                            user={clip?.user}
                            time={clip?.publishedOn}
                            reactionCount={clip?.reactionCount || 0}
                            actionMenu={actionMenu}
                        />
                        <View style={{alignSelf: 'center'}}>
                            <GradiantButton
                                cornerRadius={5}
                                colors={[colors.customLBlue, colors.customLBlue]}
                                iconSize={35}
                                labelStyle={{
                                    fontSize: scale.font.l,
                                    color: theme.dark ? 'white' : colors.customViolet,
                                    paddingHorizontal: 5,
                                }}
                                height={scale.ms(30)}
                                label={'view'}
                                style={{marginLeft: 0}}
                                onPress={handlePress}
                            />
                        </View>
                    </View>
                ) : (
                    <UserInfo
                        user={clip?.user}
                        time={clip?.publishedOn}
                        reactionCount={clip?.reactionCount || 0}
                        actionMenu={actionMenu}
                    />
                )}
                <View style={styles.separator}/>
                <MinClip
                    visibility={clip.parentThread && clip.parentThread?.user}
                    name={clip.parentThread?.user?.displayName || ''}
                    text={clip.parentThread?.text || ''}
                    imageUri={avatarThread}
                />
                <ContentViewer clip={clip} disableScale clipWidth={clipWidth} clipSearch={true} postView={true}/>
            </View>
        </Pressable>
    );
}

export default React.memo(PostView);
