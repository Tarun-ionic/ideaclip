import AsyncStorage from '@react-native-async-storage/async-storage';
import logger from '../../../lib/logger';
import {createThumbnail} from 'react-native-create-thumbnail';
import ImageResizer from 'react-native-image-resizer';
import path from 'react-native-path';
import storage from '@react-native-firebase/storage';
import {cacheFile, copyCacheFile, getFileIcon, getUniqId,} from '../../../lib/storage';
import config from '../../../constant/config';
import {lovitzIcons} from '../../../utilities/assets';

const prefix = '@ideanGallery';

const RNFS = require('react-native-fs');

export async function cacheClips(clips, user = {}) {
    let a = user.uid ? `${user.uid}/` : ''
    const raw_indexes = await AsyncStorage.getItem(
        `${a}${prefix}:index`,
    );
    const indexes = JSON.parse(raw_indexes) || [];

    for (const clip of clips) {
        let clipIndex = indexes.indexOf(clip.id)
        if (clipIndex < 0) {
            indexes.push(clip.id);
            await AsyncStorage.setItem(
                `${a}${prefix}:${clip.id}`,
                JSON.stringify(clip),
            ).catch(logger.e);
        }
    }
    await AsyncStorage.setItem(
        `${a}${prefix}:index`,
        JSON.stringify(indexes),
    ).catch(logger.e);
}

export async function parseTempClip(data, user) {
    try {
        let filePaths = await Promise.all(data?.allFiles.map(file => {
                return {
                    path: file.path,
                    type: file.type,
                    name: file.name,
                    thumb: file.thumb
                }
            }
        ))
        let clip = {
            ...data,
            id: data.id,
            uid: user.uid,
            mediafile: filePaths[0].path,
            mediaType: data.file.type,
            text: data.text,
            type: data.type,
            isPrivate: data.isPrivate,
            duration: data.duration,
            isDeleted: false,
            isPublished: true,
            isMultiple: filePaths.length > 1,
            mediaCount: filePaths.length,
            mediaFiles: await Promise.all(filePaths.map((file, index) => {
                return {
                    mediafile: file.path,
                    mediaType: file.type,
                    mediaName: file.name,
                    thumb: file.thumb
                }
            })),
            uploading: false,
            cache: true,
            thumb: filePaths[0]?.thumb || "",
            userDetails: {
                displayName: user.displayName,
                userProfile: {
                    suburb: user.userProfile.suburb,
                    countryCode: user.userProfile.countryCode,
                    state: user.userProfile.state,
                    stateShort: user.userProfile.stateShort
                },
                profileImageB64: user.profileImageB64,
                profileImage: user.profileImage
            }
        };
        return clip
    } catch (e) {
        logger.e(e)
    }
}

export async function getCacheClips(user = {}) {
    try {
        let a = user.uid ? `${user.uid}/` : ''
        const raw_indexes = await AsyncStorage.getItem(
            `${a}${prefix}:index`,
        );
        if (!raw_indexes) {
            return [];
        }
        const indexes = JSON.parse(raw_indexes);
        if (!Array.isArray(indexes)) {
            return [];
        }
        // return
        let clips = await Promise.all(indexes.map(async index => {
            const rawData = await AsyncStorage.getItem(
                `${a}${prefix}:${index}`,
            ).catch(logger.e);
            return JSON.parse(rawData);
        }))
        clips.filter(clip => clip)
        return clips
        // );
    } catch (e) {
        return [];
    }
}


export async function getCacheClip(id, user = {}) {
    try {
        let a = user.uid ? `${user.uid}/` : ''
        const rawData = await AsyncStorage.getItem(
            `${a}${prefix}:${id}`,
        ).catch(logger.e);
        return JSON.parse(rawData);
    } catch (e) {
        return [];
    }
}

export async function removeClip(clip, user = {}) {
    try {
        let a = user.uid ? `${user.uid}/` : ''
        const raw_indexes = await AsyncStorage.getItem(
            `${a}${prefix}:index`,
        );
        let aaa = JSON.parse(raw_indexes)
        let indexes = [...aaa] || [];
        let clipIndex = await indexes.indexOf(clip.id)
        await indexes.splice(clipIndex, 1)
        await AsyncStorage.setItem(
            `${a}${prefix}:index`,
            JSON.stringify(indexes),
        ).catch((err) => {
            logger.e("error setting async ", err)
        });
        await AsyncStorage.removeItem(`${a}${prefix}:${clip.id}`)
    } catch (e) {
        logger.e("error removing clip ", e)
    }
}


export async function clearCacheClips(clipType, businessId, user = {}) {
    let a = user.uid ? `${user.uid}/` : ''
    return AsyncStorage.removeItem(`${a}${prefix}:index`);
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
    sort = 'desc',
    sort_by = 'publishedOn',
) {
    const _clips = prevClips.filter(clip => clip && clip.id);
    await Promise.all(
        clips
            .filter(clip => clip && clip.id)
            .map(async clip => {
                if (typeof clip !== 'object') {
                    return [];
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
export const uploadPersonalClip = (uid, image, type = 'photo', name = 'sample', onProgress) => {
    return new Promise(async (resolve, reject) => {
        let paths = image;
        storage()
            .ref('personalClips/' + uid + '/')
            .child(name)
            .putFile(paths)
            .on('state_changed',
                snapshot => {
                    const progress = Math.round(
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
                    );
                    logger.i('MultiFileUpload Upload is ' + progress + '% done');
                    if (typeof onProgress === 'function') {
                        onProgress(progress);
                    }
                },
                (err) => {
                    logger.e(err);
                    reject(err);
                },
                () => {
                    if (type === 'video') {
                        createThumbnail({
                            url: paths,
                            timeStamp: 10000,
                        })
                            .then(response => {
                                storage()
                                    .ref('personalClips/' + uid + '/')
                                    // .child('thumb_' + n + '.' + extension)
                                    .child('thumb_' + name)
                                    .putFile(response.path)
                                    .then(async () => {
                                        resolve(`personalClips/${uid}/${name}`);
                                    })
                                    .catch(err => {
                                        logger.e(err);
                                        reject(err);
                                    });
                            })
                            .catch(err => {
                                logger.e(err);
                                reject(err);
                            });
                    } else {
                        resolve(`personalClips/${uid}/${name}`);
                    }
                })
    });
};

export const getLovitzIcon = (darkMode, status) => {
    return darkMode ? status ? lovitzIcons.pink : lovitzIcons.white : status ? lovitzIcons.red : lovitzIcons.grey
}