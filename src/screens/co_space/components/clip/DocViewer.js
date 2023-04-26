/* eslint-disable react-hooks/exhaustive-deps,react-native/no-inline-styles */
import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, Image, Text, TouchableWithoutFeedback, View,} from 'react-native';
import scale from 'utilities/scale';
import FileViewer from 'react-native-file-viewer';
import {bytesToSize, cacheFile, copyDocFile, isCacheFileExist,} from '../../../../lib/storage';
import {IconButton} from 'react-native-paper';
import Toast from 'react-native-simple-toast';
import path from 'react-native-path';
import {strings} from '../../../../constant/strings';
import logger from '../../../../lib/logger';
import {useAlert} from '../../../../context/AlertContext';
import {useTheme} from '../../../../context/ThemeContext';
import {AnimatedCircularProgress} from "react-native-circular-progress";

function DocViewer({files, disableAction,blockAction}) {
    const listRender = useCallback(
        ({item}) => <FileRender file={item} disableAction={disableAction} blockAction={blockAction}/>,
        [files],
    );

    return (
        <FlatList
            data={files}
            renderItem={listRender}
            keyExtractor={(item, index) => `${index}}`}
        />
    );
}

function FileRender({file, disableAction,blockAction}) {
    const alert = useAlert();
    const {theme} = useTheme();
    const {colors} = theme;
    const [progress, setProgress] = useState(0);
    const [fileStatus, setFileStatus] = useState(true);
    const name = path.basename(file.mediaPath);
    const progressManager = p => {
        const pr = Math.round(
            (p.bytesWritten / 1024 / (p.contentLength / 1024)) * 100,
        );
        setProgress(pr);
    };

    useEffect(() => {
        async function status() {
            setFileStatus(await isCacheFileExist(name));
        }

        status().then();
        return () => status;
    }, []);

    const start = async () => {
        await cacheFile(file.mediaPath, 'clip', progressManager)
            .then(async filepath => {
                setFileStatus(true);
                setProgress(100);
                await copyDocFile(filepath, file.mediaLabel).then(docPath => {
                    FileViewer.open(docPath, {showOpenWithDialog: true})
                        .then(res => {
                            logger.i(res, docPath);
                        })
                        .catch(err => {
                            logger.e(err, docPath);
                            Toast.show(strings.no_application_found, Toast.SHORT);
                        });
                });
            })
            .catch(({p, status}) => {
                logger.e('downloading file error', status, p);
            });
    };
    const initiateDownload = () => {
        if (disableAction || blockAction) {
            alert({
                message: blockAction? strings.userAccessDenied : strings.collabAlertMessage,
                buttons: [{label: strings.ok, callback: () => alert.clear()}],
                autoDismiss: false,
                cancellable: false,
            });
        } else {
            start();
        }
    };

    return (
        <TouchableWithoutFeedback onPress={initiateDownload}>
            <View style={styles.fileCard}>
                <Image source={file.mediaThumb} style={styles.fileThump}/>
                <View style={styles.fileInfo}>
                    <Text style={[styles.fileLabel, {color: colors.clipTextSecondary}]}>
                        <Text style={[styles.fileName, {color: colors.clipTextSecondary}]}>
                            {file.mediaLabel}
                        </Text>
                        {'\n'}
                        {bytesToSize(file.mediaSize)}
                    </Text>
                </View>

                <View
                    style={[styles.fileAction, !fileStatus ? styles.view : styles.hide]}>
                    {progress > 0 && progress < 100 && !fileStatus && (
                        <AnimatedCircularProgress
                            size={30}
                            width={2}
                            fill={progress}
                            tintColor={colors.progressTint}
                            backgroundColor={colors.progressBackground}>
                            {
                                (_) => (<Text style={{color: colors.progressTint, fontSize: 8}}>
                                        {progress.toFixed(0)}%
                                    </Text>
                                )
                            }
                        </AnimatedCircularProgress>

                    )}
                    {progress === 0 && !fileStatus && (
                        <IconButton
                            icon="download"
                            color={'#de1212'}
                            size={20}
                            onPress={initiateDownload}
                        />
                    )}
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = {
    fileCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 5,
        marginBottom: 15,
        borderRadius: 10,
        height: 60
    },
    fileThump: {width: 50, height: 50, resizeMode: 'contain'},
    fileInfo: {alignItems: 'flex-start', flexDirection: 'column', flex: 1},
    fileLabel: {fontSize: scale.font.s, flex: 1, padding: 5},
    fileName: {fontSize: scale.font.s, width: '100%'},
    fileAction: {
        alignContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    },
    view: {opacity: 1},
    hide: {opacity: 0},
};

export default React.memo(DocViewer);
