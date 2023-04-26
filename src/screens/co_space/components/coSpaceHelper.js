import AsyncStorage from '@react-native-async-storage/async-storage';
import logger from '../../../lib/logger';
import {createThumbnail} from 'react-native-create-thumbnail';
import ImageResizer from 'react-native-image-resizer';
import path from 'react-native-path';
import storage from '@react-native-firebase/storage';
import {cacheFile, copyCacheFile, getFileIcon, getUniqId,} from '../../../lib/storage';
import config from '../../../constant/config';
import {clipState} from "../../../context/ClipContext";

const prefix = '@coSpace';

const RNFS = require('react-native-fs');

export async function cacheClips(clipType, businessId, clips, user = {}) {
    let a = user.uid ? `${user.uid}/` : ''
    const indexes = [];
    for (const clip of clips) {
        indexes.push(clip.id);
    }
    await AsyncStorage.setItem(
        `${a}${prefix}${clipType}_${businessId}:index`,
        JSON.stringify(indexes),
    ).catch(logger.e);
    await Promise.all(
        clips.map(async clip => {
            await AsyncStorage.setItem(
                `${a}${prefix}${clipType}_${businessId}:${clip.id}`,
                JSON.stringify(clip),
            ).catch(logger.e);
        }),
    );
}

export async function getCacheClips(clipType, businessId, user = {}) {
    try {
        let a = user.uid ? `${user.uid}/` : ''
        const raw_indexes = await AsyncStorage.getItem(
            `${a}${prefix}${clipType}_${businessId}:index`,
        );
        if (!raw_indexes) {
            return [];
        }
        const indexes = JSON.parse(raw_indexes);
        if (!Array.isArray(indexes)) {
            return [];
        }
        return Promise.all(
            indexes.map(async index => {
                const rawData = await AsyncStorage.getItem(
                    `${a}${prefix}${clipType}_${businessId}:${index}`,
                ).catch(logger.e);
                return JSON.parse(rawData);
            }),
        );
    } catch (e) {
        return [];
    }
}

export async function clearCacheClips(clipType, businessId, user = {}) {
    let a = user.uid ? `${user.uid}/` : ''
    return AsyncStorage.removeItem(`${a}${prefix}${clipType}_${businessId}:index`);
}

// map all media files
export async function mediaMapper(attachments) {
    return Promise.all(
        attachments.map(async file => {
            const filepath = await copyCacheFile(
                file.path,
                'clip',
                'temp',
                file.name,
            );
            let mediaThumb = '';
            let thumbnail = '';
            if (file.type === 'video') {
                mediaThumb = await createThumbnail({
                    url: filepath,
                    timeStamp: 10000,
                })
                    .then(async response => {
                        return ImageResizer.createResizedImage(
                            response.path,
                            config.thumbnail.maxWidth,
                            config.thumbnail.maxHeight,
                            config.thumbnail.format,
                            config.thumbnail.quality,
                            0,
                            `${RNFS.CachesDirectoryPath}/clip/`,
                            true,
                            {onlyScaleDown: true, mode: 'contain'},
                        )
                            .then(res => res.uri)
                            .catch(logger.e);
                    })
                    .catch(err => {
                        logger.e(err);
                    });
            } else if (file.type === 'photo') {
                const ex = path.extname(filepath).toLowerCase().trim();
                if (ex === '.gif' && file.size < config.thumbnail.maxSize) {
                    mediaThumb = filepath;
                } else {
                    mediaThumb = await ImageResizer.createResizedImage(
                        filepath,
                        config.thumbnail.maxWidth,
                        config.thumbnail.maxHeight,
                        config.thumbnail.format,
                        config.thumbnail.quality,
                        0,
                        `${RNFS.CachesDirectoryPath}/clip/`,
                        true,
                        {onlyScaleDown: true, mode: 'contain'},
                    )
                        .then(response => response.uri)
                        .catch(logger.e);
                }
            }

            if (config.thumbnail.base64 === true) {
                const ex = path.extname(mediaThumb).toLowerCase();
                const extension = ex.replace('.', '');
                if (mediaThumb) {
                    thumbnail = await RNFS.readFile(mediaThumb, 'base64').then(
                        resp => `data:image/${extension};base64,${resp}`,
                    );
                }
            }

            return {
                id: `${file.type}${getUniqId()}`,
                mediaPath: filepath,
                mediaType: file.type,
                mediaThumb,
                thumbnail,
                mediaLabel: file.name,
                mediaSize: String(file.size),
            };
        }),
    );
}

// media to url

export async function media2url(clip) {
    if (clip && clip.medias && Array.isArray(clip.medias)) {
        clip.medias = await Promise.all(
            clip.medias.map(async file => {
                let mediaUri = file.mediaPath;
                if (file.mediaPath && !file.mediaPath.includes('://')) {
                    try {
                        mediaUri = await storage().ref(file.mediaPath).getDownloadURL();
                    } catch (e) {
                        logger.e(e);
                    }
                }

                if (file.mediaType === 'file') {
                    return {
                        ...file,
                        mediaThumb: getFileIcon(file.mediaLabel),
                        mediaUri,
                    };
                } else if (file.thumbnail && !file.thumbnail.includes('file://')) {
                    return {...file, mediaUri};
                } else {
                    const thumbPath = file.mediaThumb ? file.mediaThumb : file.mediaPath;

                    return cacheFile(thumbPath, 'clip')
                        .then(p => ({
                            ...file,
                            mediaThumb: p,
                            mediaUri,
                        }))
                        .catch(() => {
                            return {...file, mediaUri};
                        });
                }
            }),
        );
    }
    return clip.medias;
}

// reformat clip
export default async function sortClips(
    prevClips,
    clips,
    isHistory = false,
    sort = 'asc',
    sort_by = 'publishedOn',
    initial = false
) {
    let _clips = prevClips.filter(clip => clip && clip.id);
    await Promise.all(
        clips
            .filter(clip => clip && clip.id)
            .map(async clip => {
                if (typeof clip !== 'object') {
                    return [];
                }
                if (initial === true) {
                    if (clips.clipState === clipState.sending) clips.clipState = clipState.sendingFailed
                    if (clips.clipState === clipState.uploadStart) clips.clipState = clipState.uploadFailed
                }
                const index = _clips.findIndex(_clip => {
                    return _clip.id === clip.id;
                });

                if (index >= 0) {
                    _clips[index] = clip;
                } else if (isHistory) {
                    _clips.unshift(clip);
                } else {
                    _clips.push(clip);
                }
            }),
    );

    _clips = _clips.filter((value, index, self) =>
        index === self.findIndex((t) => (
            t.id === value.id
        ))
    )

    if (sort === null) {
        return _clips;
    }
    return _clips.slice().sort((x, y) => {
        if (sort_by === 'publishedOn' && sort === 'desc') {
            return (
                new Date(parseFloat(x[sort_by])) - new Date(parseFloat(y[sort_by]))
            );
        } else if (sort_by === 'publishedOn') {
            return (
                new Date(parseFloat(y[sort_by])) - new Date(parseFloat(x[sort_by]))
            );
        } else if (sort === 'desc') {
            return y[sort_by] > x[sort_by];
        } else {
            return y[sort_by] < x[sort_by];
        }
    });
}
