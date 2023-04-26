import logger from '../lib/logger';
import {Platform} from "react-native";
import Toast from "react-native-simple-toast";
import {PERMISSIONS, request, RESULTS} from "react-native-permissions";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";

const RNFS = require('react-native-fs');

function downloadDoc(name, url) {
    return new Promise((resolve, reject) => {
        RNFS.downloadFile({
            fromUrl: url,
            toFile: `${RNFS.DocumentDirectoryPath}/${name}`,
        })
            .promise.then(() => {
            resolve({status: true, path: `${RNFS.DocumentDirectoryPath}/${name}`});
        })
            .catch(err => {
                logger.e('file download error', err);
                reject({status: false, error: err});
            });
    });
}

const handleProgress = ({contentLength, bytesWritten}, progress) => {
    progress(parseFloat((100 * bytesWritten) / contentLength.toFixed(1)))
}

function saveToGallery(type, name, url, progress, resolve, reject) {
    const path = `${Platform.OS === "ios" ? RNFS.LibraryDirectoryPath : RNFS.DownloadDirectoryPath}/IDEACLIP/`;
    const filePath = path[path.length-1] == '/'?`${path}${name}`:`${path}/${name}`;
    RNFS.mkdir(path).then(() => {
        RNFS.downloadFile({
            fromUrl: url,
            toFile: filePath,
            begin: (e) => handleProgress(e, progress),
            progress: (e) => handleProgress(e, progress),
        }).promise.then((r) => {
            console.log("r ",r)
            progress(-1)
            if (Platform.OS === "ios") {
                CameraRoll.save(filePath).then(function (result) {
                    Toast.show("File downloaded!")
                    resolve({status: true, path: filePath});
                }).catch(function (error) {
                    logger.e('file download error', error);
                    Toast.show("please click download icon again as network error occurred.")
                    reject({status: false, error: error});
                });
            } else {
                Toast.show("File downloaded!")
                resolve({status: true, path: filePath});
            }
        })
            .catch((err) => {
                logger.e('file download error', err);
                Toast.show("please click download icon again as network error occurred.")
                reject({status: false, error: err});
            });
    }).catch(function (error) {
        logger.e('file download error', error);
        Toast.show("please click download icon again as network error occurred.")
        reject({status: false, error: error});
    });
}

function downloadImage(type, name, url, progress) {
    return new Promise(async (resolve, reject) => {
        if (Platform.OS === 'ios') {
            saveToGallery(type, name, url, progress, resolve, reject)
        } else {
            await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE).then(async (result) => {
                if (result === RESULTS.GRANTED) {
                    saveToGallery(type, name, url, progress, resolve, reject)
                } else {
                    reject({status: false, error: "invalid permission"});
                }
            })
        }
    })
}

export {downloadDoc, downloadImage};
