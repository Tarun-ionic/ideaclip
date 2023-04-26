import storage from '@react-native-firebase/storage';
import {newMedia} from './constant';
import path from 'react-native-path';
import logger from '../lib/logger';
import {copyCacheFile} from '../lib/storage';
import {createThumbnail} from 'react-native-create-thumbnail';

const uploadDP = (uid, image) => {
    return new Promise(async (resolve, reject) => {
        await createName().then(name => {
            storage()
                .ref('dp/' + uid + '/')
                .child(name + '.jpg')
                .putFile(image)
                .then(() => {
                    resolve(name);
                })
                .catch(err => {
                    logger.e(err);
                    reject(err);
                });
        });
    });
};

const uploadPersonalClip = (uid, image, type = 'photo', name = 'sample') => {
    return new Promise(async (resolve, reject) => {
        let paths = image;
        // let paths = type === 'audio' ? '' : image;
        // if (type === 'audio' || type === 'video') {
        //     // paths = await copyCacheFile(image, 'personalClip', 'temp', name);
        // }
        // await createName().then(async n => {
        //     let extension = name.split('.');
        //     extension = extension[extension.length - 1];

        storage()
            .ref('personalClips/' + uid + '/')
            .child(name)
            // .child(n + '.' + extension)
            .putFile(paths)
            .then(() => {
                if (type === 'video') {
                    // if()
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
                                    // resolve(`personalClips/${uid}/${n}.${extension}`);
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
                    // resolve(`personalClips/${uid}/${n}.${extension}`);
                }
                // })
                // .catch(err => {
                //     logger.e(err);
                //     reject(err);
                // });
            });
    });
};


const cacheClipFiles = (uid, image, type = 'photo', name = 'sample') => {
    return new Promise(async (resolve, reject) => {

        await createName().then(async n => {
            let extension = name.split('.');
            extension = extension[extension.length - 1];
            let paths = await copyCacheFile(image, 'personalClip', 'temp', n + '.' + extension);
            resolve({path: paths, name: n + '.' + extension})
        });
    });
};


const uploadRelatedImage = (uid, image) => {
    return new Promise(async (resolve, reject) => {
        await createName(image.path).then(name => {
            storage()
                .ref('RelatedImages/' + uid + '/')
                .child(name)
                .putFile(image.path)
                .then(() => {
                    resolve(name);
                })
                .catch(err => {
                    logger.e(err);
                    reject(err);
                });
        });
    });
};

function createName(p) {
    return new Promise(resolve => {
        let result = '';
        const characters =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let charactersLength = characters.length;
        for (let i = 0; i < 16; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        if (p) {
            let extension = p.split('/');
            extension = extension[extension.length - 1];
            extension = extension.split('.');
            extension = extension[extension.length - 1];
            if (extension === 'jpeg') {
                extension = 'jpg';
            }
            resolve(result + '.' + extension);
        } else {
            resolve(result);
        }
    });
}

const multiFileUpload = (
    cid,
    files,
    index = 0,
    medias = [],
    retry = 0,
    errors = [],
    onProgress = null,
) => {
    return new Promise(async (resolve, reject) => {
        const fileCount = files.length;
        const fileIndex = index + 1;
        if (fileCount > index) {
            const file = files[index];
            const {mediaPath} = file;
            logger.i('multiFileUpload', mediaPath);
            //empty path
            if (mediaPath === '') {
                if (retry > 2) {
                    errors.push({file: file, error: 'path empty'});
                    index++;
                    resolve(
                        multiFileUpload(cid, files, index, medias, 0, errors, onProgress),
                    );
                } else {
                    retry++;
                    resolve(
                        multiFileUpload(
                            cid,
                            files,
                            index,
                            medias,
                            retry,
                            errors,
                            onProgress,
                        ),
                    );
                }
            } else {
                const storageName = path.basename(mediaPath);
                const storagePath = `clip/${cid}/`;
                const storageFile = `clip/${cid}/${path.basename(mediaPath)}`;
                storage()
                    .ref(storagePath)
                    .child(storageName)
                    .putFile(mediaPath)
                    .on(
                        'state_changed',
                        snapshot => {
                            const progress = Math.round(
                                (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
                            );
                            logger.i('Upload is ' + progress + '% done');
                            if (typeof onProgress === 'function') {
                                onProgress(progress, fileCount, fileIndex);
                            }
                            switch (snapshot.state) {
                                case storage.TaskState.PAUSED: // or 'paused'
                                    logger.i('Upload is paused');
                                    break;
                                case storage.TaskState.RUNNING: // or 'running'
                                    logger.i('Upload is running');
                                    break;
                            }
                        },
                        error => {
                            if (retry > 2) {
                                errors.push({file: file, error: error});
                                index++;
                                resolve(
                                    multiFileUpload(
                                        cid,
                                        files,
                                        index,
                                        medias,
                                        0,
                                        errors,
                                        onProgress,
                                    ),
                                );
                            } else {
                                retry++;
                                resolve(
                                    multiFileUpload(
                                        cid,
                                        files,
                                        index,
                                        medias,
                                        retry,
                                        errors,
                                        onProgress,
                                    ),
                                );
                            }
                        },
                        () => {
                            const media = {...newMedia};
                            media.mediaPath = storageFile;
                            media.mediaType = file.mediaType;
                            media.mediaLabel = file.mediaLabel || '';
                            media.mediaSize = `${file.mediaSize}`;
                            media.thumbnail = `${file.thumbnail}`;

                            logger.i('File upload complete ::', storageFile);
                            index++;
                            resolve(
                                multiFileUpload(
                                    cid,
                                    files,
                                    index,
                                    [...medias, media],
                                    0,
                                    errors,
                                    onProgress,
                                ),
                            );
                        },
                    );
            }
        } else {
            if (index !== 0) {
                resolve({message: 'files uploaded', medias});
            } else {
                reject({message: 'files uploaded', medias});
            }
        }
    });
};

export {uploadDP, multiFileUpload, uploadRelatedImage, uploadPersonalClip, cacheClipFiles};
