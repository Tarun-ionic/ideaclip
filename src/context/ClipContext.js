import React, {useContext, useState} from 'react';
import apolloLib from '../lib/apolloLib';
import {mutations} from '../schema';
import {onTrigger} from '../utilities/helper';
import logger from '../lib/logger';
import sortClips, {cacheClips, clearCacheClips, getCacheClips,} from '../screens/co_space/components/coSpaceHelper';
import {clipTypes} from '../utilities/constant';
import {useAlert} from './AlertContext';
import MultiFileUpload from '../utilities/multiFileUpload';
import apiConstant from '../constant/apiConstant';
import {useSession} from './SessionContext';

export const ClipContext = React.createContext({});

export const clipState = {
    uploadFailed: "uploadFailed",
    uploadStart: "uploadStart",
    uploadCompleted: "uploadCompleted",
    sending: "sending",
    sendingFailed: "sendingFailed",
    send: 'send'
};

export function useClip() {
    return useContext(ClipContext);
}

export const ClipProvider = ({children, spaceInfo}) => {
    const alert = useAlert();
    const [progress, setProgress] = useState({});
    const [clipData, setClipData] = useState([]);
    const [searchHint, setSearchHint] = useState('');
    const [firstIndex, setFirstIndex] = useState('');
    const session = useSession();
    const {user} = session;

    async function resetMapClip(clips) {
        const _clips = await sortClips(
            [],
            clips,
            false,
            "asc",
            'publishedOn',
            true
        );
        setFirstIndex(_clips[_clips.length - 1].id || '');
        setClipData(_clips);
    }

    async function mapClip(clips, isHistory = false, initial = false, type = '') {
        getCacheClips(type?.length > 0 ? type : spaceInfo.spaceType, spaceInfo.spaceId, user).then(
            async clipList => {
                if (Array.isArray(clips) && clips.length > 0) {
                    const _clips = await sortClips(
                        clipList,
                        clips,
                        isHistory,
                        "asc",
                        'publishedOn',
                        initial
                    );

                    if (Array.isArray(_clips) && _clips.length > 0) {
                        await cacheClips(
                            type?.length > 0 ? type : spaceInfo.spaceType,
                            spaceInfo.spaceId,
                            _clips,
                            user,
                        );
                        setFirstIndex(_clips[_clips.length - 1].id || '');
                        setClipData(_clips);
                    } else {
                        await clearCacheClips(type?.length > 0 ? type : spaceInfo.spaceType, spaceInfo.spaceId, user);
                        setFirstIndex('');
                        setClipData([]);
                    }
                }
            },
        );
    }

    //send clip
    const sendClip = async _clip => {
        const variables = {
            ..._clip,
            medias: [],
            parentThread: _clip?.parentThread?.id || '',
        };
        await apolloLib.client(session)
            .mutate({
                mutation:
                    spaceInfo.spaceType === clipTypes.announcement
                        ? mutations.anClipCreate
                        : mutations.clipCreate,
                variables,
            })
            .then(async ({data, error}) => {
                if (data) {
                    const clipD =
                        spaceInfo.spaceType === clipTypes.announcement
                            ? data.anClipCreate
                            : data.clipCreate;
                    const newClip = {
                        ...clipD,
                        attachments: _clip.attachments,
                        medias: _clip.medias,
                        user: _clip.user,
                        publishedOn: _clip.publishedOn,
                        clipState: clipState.send
                    };
                    await onUpdateClip(newClip)
                } else {
                    await mapClip([{..._clip, clipState: clipState.sendingFailed}], false);
                    logger.e('clip context', 'sendClip', error);
                }
            })
            .catch(async error => {
                await mapClip([{..._clip, clipState: clipState.sendingFailed}], false);
                logger.e('clip context', 'sendClip', error)
            });
    };
    //upload media files
    const uploadFile = async _clipData => {
        _clipData.clipState = clipState.uploadStart;
        const progressArray = [];
        await MultiFileUpload(
            'clip',
            _clipData.id,
            _clipData.attachments,
            (progressPercentage, fileCount, fileIndex) => {
                progressArray[fileIndex] = progressPercentage;
                let _progress = 90
                progressArray.map(p => {
                    _progress = _progress + p
                })
                onProgress(_clipData.id, (_progress / (fileCount + 1)) || 0);
            },
        )
            .then(async res => {
                if (res.failedMedias.length === 0) {
                    _clipData.medias = res.medias;
                    delete _clipData.attachments;
                    _clipData.clipState = clipState.uploadCompleted;
                    onProgress(_clipData.id, 100);
                    await publishClip(_clipData);
                } else {
                    _clipData.attachments = res.medias;
                    _clipData.clipState = clipState.uploadFailed;
                    onProgress(_clipData.id, 0);
                    await mapClip([_clipData], false);
                }
            })
            .catch(error => logger.e('clip context', 'uploadFile', error));
    };
    //publish media clip
    const publishClip = async _clip => {
        const medias = await _clip.medias?.map((file) => {
            delete file.uploaded;
            delete file.thumbUploaded;
            return file;
        })
        apolloLib.client(session)
            .mutate({
                mutation:
                    spaceInfo.spaceType === clipTypes.announcement
                        ? mutations.anClipEdit
                        : mutations.editClip,
                variables: {
                    id: _clip.id,
                    medias,
                    publish: true,
                },
            })
            .then(async ({data, error}) => {
                if (data) {
                    const editClip = {
                        ...data.clipEdit,
                        attachments: [],
                        user: _clip.user,
                        publishedOn: _clip.publishedOn,
                        isPublished: true,
                    };
                    onProgress(_clip.id, -1);
                    await onUpdateClip(editClip);
                } else {
                    logger.e('clip context', 'published', error);
                }
            })
            .catch(error => logger.e('clip context', 'published', error));
    };

    const onsetClip = _clip => {
        _clip.isPublished = !(_clip.attachments && _clip.attachments.length > 0);
        if (!_clip.isPublished) {
            onProgress(_clip.id, 0);
        }
        //add new clip
        mapClip([{..._clip, clipState: clipState.sending}], false).then();
        sendClip(_clip).then();
    };

    const onUpdateClip = async _clip => {

        if ([clipState.send, clipState.uploadFailed].includes(_clip.clipState) && _clip.attachments && _clip.attachments.length > 0) {
            _clip.clipState = clipState.uploadStart;
            await mapClip([_clip], false);
            onProgress(_clip.id, 0);
            uploadFile(_clip).then();
        } else if (_clip.clipState === clipState.sendingFailed) {
            _clip.clipState = clipState.sending;
            await mapClip([_clip], false);
            sendClip(_clip).then();
        }
    };

    const onProgress = (id, upProgress = 0, count = 0, index = 0) => {
        const progressData = {
            percentage: upProgress >= 1 ? upProgress : 0,
            count,
            index,
        };
        setProgress(pro => ({...pro, [id]: progressData}));
    };

    const getProgress = id => {
        return progress[id];
    };
    const onSearch = text => {
        setSearchHint(() => text);
    };

    //manage  clip status
    async function manageClipStatus(
        bid,
        clipId,
        isBlocked,
        isDeleted,
        isArchived = false,
        isReported = false,
        type = ''
    ) {
        getCacheClips(type?.length > 0 ? type : spaceInfo?.spaceType, bid, user).then(
            async clipList => {
                const index = clipList.findIndex(({id}) => id === clipId);
                if (index === -1) {
                    return false;
                }
                const current = {
                    ...clipList[index],
                    id: clipId,
                    clipState: null,
                    isBlocked,
                    isDeleted,
                    isArchived,
                    isReported,
                };
                const threads = clipList.filter(
                    ({parentThread}) => parentThread?.id === clipId,
                );
                const data = threads.map(thread => {
                    return {
                        ...thread,
                        parentThread: {
                            ...thread.parentThread,
                            isBlocked,
                            isDeleted,
                            isArchived,
                            isReported,
                        },
                    };
                });
                await mapClip([current, ...data], false, false, type?.length > 0 ? type : spaceInfo?.spaceType).then();
            })
    }

    const mutationVariable = (type, block = false) => {
        if (type?.length > 0 && type === clipTypes.announcement) {
            return block ? mutations.anClipUserBlock : mutations.anClipBlock;
        } else {
            if (spaceInfo && spaceInfo?.spaceType === clipTypes.announcement) {
                return block ? mutations.anClipUserBlock : mutations.anClipBlock;
            } else {
                return block ? mutations.clipUserBlock : mutations.clipBlock;
            }
        }
    };
    //block clip
    const blockClip = (bid, variables, type, callback = null) => {
        manageClipStatus(bid, variables.clipId, true, true, false, false, type).then(() => {
            apolloLib.client(session)
                .mutate({
                    mutation: mutationVariable(type),
                    variables,
                })
                .then(({data, error, loading}) => {
                    onTrigger(callback, {data, error, loading});
                })
                .catch(error => {
                    onTrigger(callback, {data: undefined, error, loading: false});
                });
        });
    };

    // user block clip
    const userBlockClip = (bid, variables, type, callback = null) => {
        manageClipStatus(bid, variables.clipId, true, false, false, false, type).then(() => {
            apolloLib.client(session)
                .mutate({
                    mutation: mutationVariable(type, true),
                    variables,
                })
                .then(({data, error, loading}) => {
                    onTrigger(callback, {data, error, loading});
                })
                .catch(error => {
                    onTrigger(callback, {data: undefined, error, loading: false});
                });
        });
    };

    //remove clip
    const ReportUGC = (clip, reason, otherText, callback) => {
        manageClipStatus(
            clip?.rid,
            clip?.id,
            false,
            false,
            false,
            true,
        ).then(() => {
            const type =
                spaceInfo.spaceType === clipTypes.announcement
                    ? apiConstant.spaceTypes.anCoSpace
                    : apiConstant.spaceTypes.coSpace;
            const data = {
                uid: user?.uid,
                clipId: clip?.id,
                chatRoomId: clip?.rid,
                ownerId: clip?.uid,
                reason,
                otherText,
                ownerType: clip?.user?.userType,
            };
            const variables = {data, type};
            apolloLib.client(session)
                .mutate({
                    mutation: mutations.reportUGC,
                    variables,
                })
                .then(async ({data, error, loading}) => {
                    onTrigger(callback, {_data: data?.createReport, _error: error});
                })
                .catch(error => {
                    onTrigger(callback, {data: undefined, error, loading: false});
                });
        });
    };

    const ReportClip = (clipData, reason, otherText, callback) => {
        alert.clear();
        const variables = {
            data: {
                uId: user.uid,
                isOwner: clipData.rid === clipData.uid,
                clipId: clipData.id,
                reason: reason + ' ' + otherText,
            },
        };
        apolloLib.client(session)
            .mutate({
                mutation:
                    spaceInfo.spaceType === clipTypes.announcement
                        ? mutations.anReportClip
                        : mutations.reportClip,
                variables,
            })
            .then(({data, error, loading}) => {
                ReportUGC(clipData, reason, otherText, async ({_data, _error}) => {
                    if (_data) {
                        onTrigger(callback, {data, error, loading});
                    } else {
                        onTrigger(callback, {data: undefined, _error, loading: false});
                    }
                });
            })
            .catch(error => {
                onTrigger(callback, {data: undefined, error, loading: false});
            });
    };

    //update Awesome Badge
    const updateAwesomeBadge = (variables, callback) => {
        apolloLib.client(session)
            .mutate({
                mutation:
                    spaceInfo.spaceType === clipTypes.announcement
                        ? mutations.anAwesomeBadge
                        : mutations.awesomeBadge,
                variables,
            })
            .then(({data, error, loading}) => {
                onTrigger(callback, {data, error, loading});
            })
            .catch(error => {
                onTrigger(callback, {data: undefined, error, loading: false});
            });
    };

    const clip = {
        mapClip,
        clipData,
        onsetClip,
        onUpdateClip,
        progress,
        firstIndex,
        getProgress,
        searchHint,
        onSearch,
        ReportClip,
        blockClip,
        userBlockClip,
        updateAwesomeBadge,
        manageClipStatus,
        resetMapClip
    };
    return <ClipContext.Provider value={clip}>{children}</ClipContext.Provider>;
};
