/* eslint-disable react-hooks/exhaustive-deps,react-native/no-inline-styles */
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Pressable, View} from 'react-native';
import DocViewer from './DocViewer';
import GalleryGridView from '../../../components/utility/GalleryGridView';
import TextViewer from '../../../components/utility/textViewer';
import Loader from './ProgressViewer';
import {useTheme} from 'context/ThemeContext';
import ClipStyles from 'system/styles/clipStyles';
import {CopyText} from '../../../components/utility/share';
import {media2url} from '../coSpaceHelper';
import UrlPreview from "../../../../components/urlPreview";
import ProgressViewer from "./ProgressViewer";

const paddingBubble = 5;
const marginBubble = 10;

function ContentViewer({
                           clip,
                           viewer,
                           disableAction,
                           blockAction,
                           clipSearch = false,
                           clipWidth,
                           postView
                       }) {
    const {theme, width} = useTheme();
    const styles = ClipStyles(theme, width, paddingBubble, marginBubble, viewer, postView);
    const {text, linkPreview} = clip;
    const [medias, setMedias] = useState([]);

    const galleryFiles = clip.medias?.filter(
        file =>
            file?.mediaType?.toLowerCase() === 'video' ||
            file?.mediaType?.toLowerCase() === 'photo',
    );
    const otherFiles = clip.medias?.filter(
        file => file?.mediaType?.toLowerCase() === 'file',
    );

    const mediaHeight = useMemo(() => {
        if (galleryFiles.length > 1 && galleryFiles.length < 4)
            return (clipWidth / 2)
        else
            return clipWidth
    }, [])

    const fileHeight = useMemo(() => {
        return (70 * otherFiles.length)
    }, [])

    const progressWidth = useMemo(() => {
        if(galleryFiles.length > 0 && otherFiles.length > 0){
            return mediaHeight+fileHeight+(otherFiles.length*10);
        }else if(galleryFiles.length > 0){
            return mediaHeight+0;
        }else if(otherFiles.length > 0){
            return fileHeight+0;
        }else return 0
    }, [])



    const GalleryViewer = useCallback(() => {
            if (medias && Array.isArray(medias) && medias.length > 0) {
                return <GalleryGridView
                    files={galleryFiles}
                    width={clipWidth - 20}
                    square={true}
                    disableAction={disableAction}
                    blockAction={blockAction}
                />
            } else
                return null
        }, [medias],
    );

    const FileViewer = useCallback(() => {
            if (medias && Array.isArray(medias) && medias.length > 0) {
                return <DocViewer files={otherFiles} disableAction={disableAction} blockAction={blockAction}/>
            } else
                return null
        }, [medias]
    );
    useEffect(() => {
        let mounted = true;
        media2url(clip).then(med => {
            if (mounted) {
                setMedias(med);
            }
        });
        return () => (mounted = false);
    }, []);

    return (
        <Pressable style={styles.wrap}>
            {linkPreview?.url?.length > 0 &&
            <UrlPreview linkPreview={linkPreview}
                        size={clipWidth - 16}
                        textContainerStyle={{
                            marginHorizontal: 10,
                        }}
            />
            }
            {typeof text === "string" && (
                <Pressable
                    style={{flexDirection: 'row',}}
                    onLongPress={() => CopyText(text)}>
                    <TextViewer viewer={viewer} text={text} clipSearch={clipSearch} viewWidth={clipWidth - 10}
                                postView={postView} linkPreview={linkPreview?.url?.length > 0}/>
                </Pressable>
            )}
            <ProgressViewer clipId={clip.id} isPublished={clip?.isPublished} mediaWidth={clipWidth}
                            mediaHeight={progressWidth}>
                {galleryFiles.length > 0 &&
                <View style={{height: mediaHeight}}>
                    {GalleryViewer()}
                </View>
                }
                {otherFiles.length > 0 &&
                <View style={{height:fileHeight}}>
                    {FileViewer()}
                </View>
                }
            </ProgressViewer>
        </Pressable>
    );
}

export default React.memo(ContentViewer);
