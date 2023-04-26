import logger from '../lib/logger';
import {pageTypes} from '../utilities/constant';

const RNFS = require('react-native-fs');

const filePath = '/currentPageData.json';
const profilePath = '/currentProfileData.json';
const myProfilePath = '/currentMyProfileData.json';
const notificationPath = '/notificationData.json';

const updateFileMessage = 'page data updated.';
const updateNotificationMessage = 'notification data updated.';
const clearFileMessage = 'page data cleared.';
const clearNotificationMessage = 'notification data cleared.';

export function writePageData(type, id) {
    let json = JSON.stringify({
        status: true,
        type: type,
        id: id,
    });

    let path = RNFS.DocumentDirectoryPath + filePath;
    RNFS.exists(path)
        .then(res => {
            if (res) {
                RNFS.unlink(path)
                    .then(() => {
                        updateFile(path, json, updateFileMessage);
                    })
                    .catch(() => {
                        updateFile(path, json, updateFileMessage);
                    });
            } else {
                updateFile(path, json, updateFileMessage);
            }
        })
        .catch(() => {
            updateFile(path, json, updateFileMessage);
        });
}

export function writeProfileData(id, me = true) {
    let json = JSON.stringify({
        status: true,
        type: pageTypes.profile,
        id: id,
    });

    let path = `${RNFS.DocumentDirectoryPath}${me ? myProfilePath : profilePath}`;

    RNFS.exists(path)
        .then(res => {
            if (res) {
                RNFS.unlink(path)
                    .then(() => {
                        updateFile(path, json, updateFileMessage);
                    })
                    .catch(() => {
                        updateFile(path, json, updateFileMessage);
                    });
            } else {
                updateFile(path, json, updateFileMessage);
            }
        })
        .catch(() => {
            updateFile(path, json, updateFileMessage);
        });
}

const updateFile = (path, json, message) => {
    RNFS.writeFile(path, json, 'utf8')
        .then(success => {
            logger.l("written in ", path)
            logger.l("written ", json)
            logger.l(message);
        })
        .catch(err => {
            logger.l("write error ", err)
            logger.e(err.message);
        });
};

export function clearAllPageData() {
    clearCurrentProfileData()
    clearCurrentProfileData(false)
    clearCurrentPageData()
}


export function clearCurrentPageData() {
    let json = JSON.stringify({
        status: false,
        type: '',
        id: '',
    });

    let path = RNFS.DocumentDirectoryPath + filePath;
    RNFS.exists(path)
        .then(res => {
            if (res) {
                RNFS.unlink(path)
                    .then(() => {
                        updateFile(path, json, clearFileMessage);
                    })
                    .catch(() => {
                        updateFile(path, json, clearFileMessage);
                    });
            } else {
                updateFile(path, json, clearFileMessage);
            }
        })
        .catch(() => {
            updateFile(path, json, clearFileMessage);
        });
}

export function clearCurrentProfileData(me = true) {
    let json = JSON.stringify({
        status: false,
        type: '',
        id: '',
    });

    let path = `${RNFS.DocumentDirectoryPath}${me ? myProfilePath : profilePath}`;

    RNFS.exists(path)
        .then(res => {
            if (res) {
                RNFS.unlink(path)
                    .then(() => {
                        updateFile(path, json, clearFileMessage);
                    })
                    .catch(() => {
                        updateFile(path, json, clearFileMessage);
                    });
            } else {
                updateFile(path, json, clearFileMessage);
            }
        })
        .catch(() => {
            updateFile(path, json, clearFileMessage);
        });
}


export function checkPageActive(type, id, clipType = "") {
    logger.l("type ", type)
    logger.l("id ", id)
    if (type === pageTypes.coSpace || type === pageTypes.news_asks || type === pageTypes.chat) {
        return new Promise((resolve, reject) => {
            let path = RNFS.DocumentDirectoryPath + filePath;
            RNFS.readFile(path, 'utf8')
                .then(res => {
                    let data = JSON.parse(res);
                    logger.l("data ", data)
                    logger.l("clip notification ")
                    if (data.type === type && data.id === id) {
                        resolve();
                    } else {
                        reject();
                    }
                })
                .catch(err => {
                    logger.e(err.message);
                    reject();
                });
        });
    } else if (type === 'badge' || type === 'anBadge') {
        return new Promise((resolve, reject) => {
            let path = RNFS.DocumentDirectoryPath + filePath;
            RNFS.readFile(path, 'utf8')
                .then(res => {
                    let data = JSON.parse(res);
                    logger.l("data ", data)
                    logger.l("clip notification ")
                    const pageType = type === 'badge' ? pageTypes.coSpace : pageTypes.news_asks
                    if (data.type === pageType && data.id === id) {
                        resolve();
                    } else {
                        reject();
                    }
                })
                .catch(err => {
                    logger.e(err.message);
                    reject();
                });
        });
    } else if (type === 'lovitz' && (clipType === 'clip' || clipType === 'anClip')) {
        return new Promise((resolve, reject) => {
            let path = RNFS.DocumentDirectoryPath + filePath;
            RNFS.readFile(path, 'utf8')
                .then(res => {
                    let data = JSON.parse(res);
                    logger.l("data ", data)
                    logger.l("clip notification ")
                    const pageType = clipType === 'clip' ? pageTypes.coSpace : pageTypes.news_asks
                    if (data.type === pageType && data.id === id) {
                        resolve();
                    } else {
                        reject();
                    }
                })
                .catch(err => {
                    logger.e(err.message);
                    reject();
                });
        });
    } else {
        return new Promise((resolve, reject) => {
            let path1 = RNFS.DocumentDirectoryPath + profilePath;
            let path2 = RNFS.DocumentDirectoryPath + myProfilePath;
            RNFS.readFile(path1, 'utf8')
                .then(res => {
                    let data = JSON.parse(res);
                    logger.l("data ", data)
                    if (data.id === id) {
                        resolve();
                    } else {
                        RNFS.readFile(path2, 'utf8')
                            .then(res => {
                                let data = JSON.parse(res);
                                logger.l("data ", data)
                                if (data.id === id) {
                                    resolve();
                                } else {
                                    reject()
                                }
                            })
                            .catch(err => {
                                logger.e(err.message);
                                reject();
                            });
                    }
                })
                .catch(err => {
                    logger.e(err.message);
                    reject();
                });
        });

    }
}


export function writeNotificationStatus(id, user) {
    let json = JSON.stringify({
        status: true,
        user: user,
        id: id,
    });
    let path = RNFS.DocumentDirectoryPath + notificationPath;
    RNFS.exists(path)
        .then(res => {
            if (res) {
                RNFS.unlink(path)
                    .then(() => {
                        updateFile(path, json, updateNotificationMessage);
                    })
                    .catch(() => {
                        updateFile(path, json, updateNotificationMessage);
                    });
            } else {
                updateFile(path, json, updateNotificationMessage);
            }
        })
        .catch(() => {
            updateFile(path, json, updateNotificationMessage);
        });
}

export function checkNotificationStatus(id, user) {
    return new Promise((resolve, reject) => {
        let path = RNFS.DocumentDirectoryPath + notificationPath;
        RNFS.readFile(path, 'utf8')
            .then(res => {
                let data = JSON.parse(res);
                logger.l("data ", data)
                if (data.id === id && data.user === user) {
                    resolve();
                } else {
                    reject();
                }
            })
            .catch(err => {
                logger.e(err.message);
                reject();
            });
    });
}
