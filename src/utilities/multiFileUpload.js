import path from 'react-native-path';
import storage from '@react-native-firebase/storage';
import logger from '../lib/logger';

function uploadFileToFirebase(
    type,
    cid,
    mediaPath,
    onProgress,
    onError,
    onComplete,
) {
    const storageName = path.basename(mediaPath);
    const storagePath = `${type}/${cid}/`;
    try {
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
                    logger.i('MultiFileUpload Upload is ' + progress + '% done');
                    if (typeof onProgress === 'function') {
                        onProgress(progress);
                    }
                },
                onError,
                onComplete,
            );
    } catch (e) {
        logger.e('MultiFileUpload', e);
    }
}

export default async function MultiFileUpload(
    type = 'common',
    id = 'common-',
    files = [],
    onProgress = null,
) {
    const count = files.length;
    await storage().setMaxUploadRetryTime(1000)
    const _medias = await Promise.all(
        files.map(async (file, index) => {
            const {mediaPath, mediaThumb} = file;
            const _file = await new Promise(async resolve => {
                if (file.uploaded === true) {
                    resolve({...file});
                } else {
                    uploadFileToFirebase(
                        type,
                        id,
                        mediaPath,
                        progress => {
                            if (typeof onProgress === 'function') {
                                onProgress(progress, count, index + 1);
                            }
                        },
                        error => {
                            logger.i('MultiFileUpload', 'error', error);
                            resolve({...file, uploaded: false});
                        },
                        resp => {
                            logger.i('MultiFileUpload', 'onComplete', resp.metadata.fullPath);
                            resolve({...file, mediaPath: resp.metadata.fullPath, uploaded: true});
                        },
                    );
                }
            });
            delete _file?.id;
            if (!mediaThumb) return _file;

            return await new Promise(async resolve => {
                if (_file?.thumbUploaded === true || _file?.uploaded !== true) {
                    resolve({..._file});
                } else {
                    uploadFileToFirebase(
                        type,
                        id,
                        mediaPath,
                        null,
                        error => {
                            logger.i('MultiFileThumpUpload', 'error', error);
                            resolve({..._file, thumbUploaded: true});
                        },
                        resp => {
                            logger.i(
                                'MultiFileThumpUpload',
                                'onComplete',
                                resp.metadata.fullPath,
                            );
                            resolve({..._file, mediaThumb: resp.metadata.fullPath, thumbUploaded: true});
                        },
                    );
                }
            });
        }),
    );
    const medias = _medias;
    const failedMedias = _medias.filter(m => m?.uploaded === false);
    return {medias, failedMedias};
}
