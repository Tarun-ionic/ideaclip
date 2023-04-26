import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, ScrollView, Text, View} from 'react-native';
import {Icon} from 'react-native-elements';
import AutoHeightImage from 'react-native-auto-height-image';
import {getUniqId} from '../../../lib/storage';
import {useTheme} from '../../../context/ThemeContext';
import VideoThumbnail from '../../components/utility/VideoThumbnail';
import {BarModelStyles} from "../../co_space/components/clipBar/AttachBar";
import config from "../../../constant/config";
import {screens} from "../../../utilities/assets";
import {checkSize, formatBytes} from "../../../utilities/helper";
import {strings} from "../../../constant/strings";

function AttachPreview({files, onRemove}) {
    const {theme} = useTheme();
    const {colors} = theme;
    const styles = BarModelStyles(theme);
    const [attachData, setAttachData] = useState(files);

    const listRender = useCallback(
        ({index, item}) => {
            switch (item.type) {
                case 'photo':
                    return (
                        <Wrapper id={index} source={{uri: item.path}} type={item.type}
                                 invalid={item.size ? item.size > config.fileSize.ideanGallery : false}
                                 size={item.size}/>
                    );
                case 'video':
                    return (
                        <Wrapper id={index} source={{uri: item.path}} type={item.type}
                                 invalid={item.size ? item.size > config.fileSize.ideanGallery : false}
                                 thumb={item.thumb} size={item.size}/>
                    );
                default:
                    return (
                        <Wrapper
                            id={index}
                            // source={getFileIcon(item.name)}
                            source={screens.audioThumb}
                            type={item.type}
                            invalid={item.size ? item.size > config.fileSize.ideanGallery : false}
                            size={item.size}
                        />
                    );
            }
        },
        [attachData],
    );

    useEffect(() => {
        if (attachData.length !== files?.length) {
            setAttachData(files);
        }
    }, [files]);

    const Wrapper = useCallback(
        ({id, source, type, invalid, thumb, size}) => {
            return (
                <View>
                    <View>
                        {type === 'video' ? (
                            <VideoThumbnail
                                style={styles.preview}
                                width={60}
                                source={source.uri}
                                thumbnail={thumb}
                            />
                        ) : (
                            <AutoHeightImage
                                style={styles.preview}
                                width={60}
                                source={source}
                            />
                        )}
                        <View style={styles.action}>
                            <Icon
                                name={invalid ? "error" : "cancel"}
                                size={25}
                                color={invalid ? colors.fileErrorCoSpace : colors.secondary}
                                type="material"
                                onPress={() => {
                                    onRemove(id)
                                }}
                            />
                        </View>
                    </View>
                    <Text style={{
                        textAlign: "center",
                        margin: 5,
                        color: invalid ? colors.warning : colors.textPrimary
                    }}>{formatBytes(size)}</Text>
                </View>
            );
        },
        [attachData],
    );


    return (
        <React.Fragment>
            {files && files.length > 0 && (
                <ScrollView style={styles.FilesContainer}>
                    <FlatList
                        horizontal
                        data={attachData}
                        renderItem={listRender}
                        keyExtractor={() => getUniqId()}
                    />
                    {checkSize(attachData, config.fileSize.ideanGallery) &&
                    <Text style={{color: colors.secondaryDark, textAlign: 'center'}}>
                        {strings.fileSizeExceed}
                    </Text>
                    }
                </ScrollView>
            )}
        </React.Fragment>
    );
}

export default React.memo(AttachPreview);
