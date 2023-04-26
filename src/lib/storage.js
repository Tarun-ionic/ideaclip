/* eslint-disable radix */
// noinspection DuplicatedCode

import storage from '@react-native-firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import path from 'react-native-path';
import {fileIcons} from '../utilities/assets';
import Moment from 'moment';
import {Platform} from 'react-native';
import logger from './logger';

const RNFS = require('react-native-fs');

//uniq id
export function getUniqId() {
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
    const random = ('' + Math.random()).substring(2, 8);
    return timestamp + random;
}

export async function isCacheFileExist(
    fileName,
    type = 'clip',
    folderId = 'temp',
) {
    if (!fileName || (fileName && fileName.trim().length === 0)) {
        return false;
    }
    const cacheFilePath = `file://${RNFS.CachesDirectoryPath}/${type}/${folderId}/${fileName}`;
    return RNFS.exists(cacheFilePath);
}

//copy doc files
export function copyDocFile(filePath, label = null) {
    return new Promise(async (resolve, reject) => {
        if (!label) {
            label = path.basename(filePath);
        }
        const docFolder =
            Platform.OS === 'ios'
                ? RNFS.DocumentDirectoryPath
                : RNFS.ExternalDirectoryPath;
        const docPath = `${docFolder}/${label}`;
        await RNFS.exists(docPath)
            .then(async exists => {
                if (exists) {
                    resolve(docPath);
                } else {
                    RNFS.mkdir(docFolder)
                        .then(async () => {
                            await RNFS.copyFile(filePath, docPath)
                                .then(() => {
                                    resolve(docPath);
                                })
                                .catch(error => reject(error));
                        })
                        .catch(error => reject(error));
                }
            })
            .catch(error => reject(error));
    });
}

//copy send files
export function copyCacheFile(
    filePath,
    type = 'clip',
    folderId = 'temp',
    label = '',
) {
    return new Promise(async (resolve, reject) => {
        const cacheFolder = `${RNFS.CachesDirectoryPath}/${type}/${folderId}/`;
        const cachePath = `${cacheFolder}${getUniqId()}${
            label ? path.extname(label) : path.extname(filePath)
        }`;
        const cacheFilePath = `file://${cachePath}`;
        await RNFS.exists(cachePath)
            .then(async exists => {
                if (exists) {
                    resolve(cacheFilePath);
                } else {
                    RNFS.mkdir(cacheFolder)
                        .then(async () => {
                            await RNFS.copyFile(filePath, cachePath)
                                .then(() => {
                                    resolve(cacheFilePath);
                                })
                                .catch(error => reject(error));
                        })
                        .catch(error => reject(error));
                }
            })
            .catch(error => reject(error));
    });
}

//check and download
export function cacheFile(
    filePath,
    type = 'clip',
    progress = () => {
        logger.i('default callback');
    },
    returnUrl = false,
) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!filePath || filePath?.trim()?.length === 0) {
                reject('Invalid  path');
            }
            if (
                (filePath.includes('http://') || filePath.includes('https://')) &&
                returnUrl === true
            ) {
                resolve(filePath);
            }
            if (filePath.includes('file://')) {
                resolve(filePath);
            }
            const cacheFolder = `${RNFS.CachesDirectoryPath}/${type}/`;
            const cachePath = `${cacheFolder}${path.basename(filePath)}`;
            const cacheFilePath = `file://${cachePath}`;
            RNFS.exists(cacheFilePath)
                .then(exists => {
                    if (exists) {
                        resolve(cacheFilePath);
                    } else {
                        if (filePath.includes('http://') || filePath.includes('https://')) {
                            getCacheFile(filePath, cacheFolder, cacheFilePath, progress)
                                .then(() => resolve(cacheFilePath))
                                .catch(reject);
                        } else {
                            storage()
                                .ref(filePath)
                                .getDownloadURL()
                                .then(url =>
                                    getCacheFile(url, cacheFolder, cacheFilePath, progress)
                                        .then(() => resolve(cacheFilePath))
                                        .catch(reject),
                                )
                                .catch(() => {
                                    RNFS.unlink(cacheFilePath).then(logger.i).catch(logger.e);
                                });
                        }
                    }
                })
                .catch(reject);
        } catch (e) {
            reject(e);
        }
    }).catch(logger.e);
}

export function reCacheFile(
    filePath,
    type = 'clip',
    progress = () => {
        logger.i('default callback');
    },
    returnUrl = false,
) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!filePath || filePath?.trim()?.length === 0) {
                reject('Invalid  path');
            }
            const cacheFolder = `${RNFS.CachesDirectoryPath}/${type}/`;
            const cachePath = `${cacheFolder}${path.basename(filePath)}`;
            const cacheFilePath = `file://${cachePath}`;
            RNFS.unlink(cacheFilePath).then(logger.i).catch(logger.e);
        } catch (e) {
            reject(e);
        }
    }).catch(logger.e);
}

// download file
function getCacheFile(url, cacheFolder, cacheFilePath, progress) {
    return new Promise(async (resolve, reject) => {
        RNFS.mkdir(cacheFolder)
            .then(() => {
                RNFS.downloadFile({
                    fromUrl: url,
                    toFile: cacheFilePath,
                    progress: progress,
                })
                    .promise.then(() => {
                    resolve(cacheFilePath);
                })
                    .catch(err => {
                        logger.e('getCacheFile', err);
                        RNFS.unlink(cacheFilePath).then(logger.i).catch(logger.e);
                        reject(err);
                    });
            })
            .catch(err => {
                RNFS.unlink(cacheFilePath).then(logger.i).catch(logger.e);
                reject(err);
            });
    });
}

export async function getUniqueArray(arr, index) {
    return (
        arr
            .map(e => e[index])
            // store the keys of the unique objects
            .map((e, i, final) => final.indexOf(e) === i && i)
            // eliminate the dead keys & store unique objects
            .filter(e => arr[e])
            .map(e => arr[e])
    );
}

export function bytesToSize(size) {
    const bytes = parseInt(size) || 0;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) {
        return '0 Byte';
    }
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

export async function setUserSession(user) {
    try {
        await AsyncStorage.setItem('user_session_idea_clip', JSON.stringify(user));
    } catch (error) {
        logger.e('AsyncStorage#setItem error: ' + error.message);
        return false;
    }
}

export async function getUserSession() {
    const data = await AsyncStorage.getItem('user_session_idea_clip');
    try {
        return {session: true, ...JSON.parse(data)};
    } catch (e) {
        logger.e(
            'AsyncStorage#getItem error deserializing JSON for key: user_session_idea_clip',
            e.message,
        );
        return {session: true}
    }
}

export async function destroyUserSession() {
    return AsyncStorage.removeItem('user_session_idea_clip');
}

export function parseFileUrl(_path, _p, setter) {
    if (typeof _path === 'string') {
        if (_path !== _p) {
            if (typeof setter === 'function') {
                setter(_path);
            }
            if (_path.includes('://')) {
                return {uri: _path};
            } else {
                return storage()
                    .ref(_path)
                    .getDownloadURL()
                    .then(url => ({uri: url}));
            }
        } else {
            return _p;
        }
    } else {
        return _path;
    }
}

export function getFileIcon(url) {
    const ext = path.extname(url).toLowerCase();
    switch (ext) {
        case '.pdf':
            return fileIcons.pdf;
        case '.doc':
            return fileIcons.doc;
        case '.docx':
            return fileIcons.docx;
        case '.ppt':
            return fileIcons.ppt;
        case '.pptx':
            return fileIcons.pptx;
        case '.xls':
            return fileIcons.xls;
        case '.xlsx':
            return fileIcons.xlsx;
        case '.zip':
            return fileIcons.zip;
        case '.mp3':
            return fileIcons.mp3;
        case '.eps':
            return fileIcons.eps;
        default:
            return fileIcons.raw;
    }
}

// convert time stamp to string
export function Time2String(data) {
    const timeStamp = data?.publishedOn || data;
    let time = 'now';
    if (timeStamp === '[object Object]') {
        return time;
    } else {
        const cts = new Date();
        const ct = {
            year: Moment(cts).format('YYYY'),
            month: Moment(cts).format('MM'),
            day: Moment(cts).format('DD'),
            hour: Moment(cts).format('HH'),
            minutes: parseInt(Moment(cts).format('mm')),
            second: parseInt(Moment(cts).format('ss')),
        };
        const pts = new Date(parseFloat(timeStamp));
        const pt = {
            year: Moment(pts).format('YYYY'),
            month: Moment(pts).format('MM'),
            day: Moment(pts).format('DD'),
            hour: Moment(pts).format('HH'),
            minutes: parseInt(Moment(pts).format('mm')),
            second: parseInt(Moment(pts).format('ss')),
        };

        if (pt.year === ct.year) {
            time = Moment(pts).format('MMM Do h:mm a');
            if (pt.month === ct.month) {
                time = Moment(pts).format('ddd Do h:mm a');
                if (pt.day === ct.day) {
                    time = `Today at ${Moment(pts).format('h:mm a')}`;
                    if (pt.hour === ct.hour) {
                        const time_mss =
                            ct.minutes * 60 + ct.second - (pt.minutes * 60 + pt.second);
                        if (time_mss < 10) {
                            time = 'now';
                        } else if (time_mss / 10 < 6) {
                            time = `${Math.round(time_mss / 10) * 10} seconds ago`;
                        } else {
                            time = `${Math.round(time_mss / 60)} minutes ago`;
                        }
                    }
                }
            }
        } else {
            time = Moment(pts).format('MMM Do YYYY h:mm a');
        }
        return time;
    }
}
