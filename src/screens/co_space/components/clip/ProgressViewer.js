/* eslint-disable react-hooks/exhaustive-deps,react-native/no-inline-styles */
import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useClip} from '../../../../context/ClipContext';
import {AnimatedCircularProgress} from "react-native-circular-progress";
import {useTheme} from "../../../../context/ThemeContext";

function ProgressViewer({clipId, mediaHeight, mediaWidth, children}) {
    const {theme: {colors}} = useTheme()
    const {progress, getProgress} = useClip();

    const styles = progressStyle(colors, mediaWidth, mediaHeight);
    const percentage = useMemo(
        () => (getProgress ? getProgress(clipId)?.percentage || 0 : 100),
        [progress]);
    return (
        <View>
            {!!percentage && percentage >= 0 && percentage < 100 && (
                <View style={styles.floatContainer}>
                    <View style={styles.floatProgress}>
                        <AnimatedCircularProgress
                            size={30}
                            width={2}
                            fill={percentage}
                            tintColor={colors.progressTint}
                            backgroundColor={colors.progressBackground}>
                            {
                                (_) => (<Text style={{color: colors.progressTint, fontSize: 8}}>
                                        {percentage.toFixed(0)}%
                                    </Text>
                                )
                            }
                        </AnimatedCircularProgress>
                    </View>
                </View>
            )}
            {children}
        </View>
    );
}

const progressStyle = (colors, mediaWidth, mediaHeight) =>
    StyleSheet.create({
        floatContainer: {
            position: 'absolute',
            alignSelf: 'center',
            zIndex: 10,
            width: mediaWidth - 20,
            height: mediaHeight - (20 / (mediaWidth / mediaHeight)),
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
        },
        floatProgress: {
            alignSelf: 'center',
            alignItems: 'center',
            alignContent: 'center',
            padding: 2,
            borderRadius: 30,
            backgroundColor: colors.progressOverlay,
        },
    });

export default React.memo(ProgressViewer);
