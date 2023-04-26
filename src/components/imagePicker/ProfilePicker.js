/* eslint-disable react-hooks/exhaustive-deps,react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {Image, TouchableHighlight, TouchableOpacity, View} from 'react-native';
import {icons, lottie, placeHolders} from '../../utilities/assets';
import {Icon} from 'react-native-elements';
import {default as AttachBar} from './AttachBar';
import {uploadDP} from '../../utilities/fileUploader';
import LottieView from 'lottie-react-native';
import ImageView from 'react-native-image-viewing';
import storage from '@react-native-firebase/storage';
import imagePickerStyle from './imagePickerStyle';
import {useTheme} from '../../context/ThemeContext';
import {displayOrientation, userType as types} from '../../utilities/constant';
import apolloLib from '../../lib/apolloLib';
import {mutations} from '../../schema';
import ImageIcon from '../../screens/components/utility/imageIcon';
import {useSession} from '../../context/SessionContext';
import {copyCacheFile} from '../../lib/storage';
import path from 'react-native-path';
import ImageResizer from 'react-native-image-resizer';
import config from '../../constant/config';
import RNFS from 'react-native-fs';
import logger from '../../lib/logger';
import scale from "../../utilities/scale";

export default function ProfilePicker({
                                          uid,
                                          uploadComplete,
                                          initialImage,
                                          removeImage,
                                          userType,
                                          isCreation,
                                          saveFile,
                                      }) {
    const {theme} = useTheme();
    const imageSize = scale.ms(120)
    const styles = imagePickerStyle(theme, imageSize);
    const [attach, setAttach] = useState(false);
    const [image, setImage] = useState(initialImage);
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(false);
    const [previewEnabled, setPreviewEnabled] = useState(
        initialImage ? true : false,
    );
    const session = useSession();
    const {user} = session;

    useEffect(() => {
        if (initialImage && initialImage.trim().length > 0) {
            if (!initialImage.includes('://')) {
                setLoading(true);
                storage()
                    .ref(initialImage)
                    .getDownloadURL()
                    .then(url => {
                        setLoading(false);
                        setImage(url);
                    });
            } else if (initialImage.includes('://')) {
                setImage(initialImage);
            }
            setPreviewEnabled(true);
        }
    }, [initialImage]);

    const onRemove = () => {
        updatePic(null);
        setImage('');
        setLoading(false);
        removeImage();
    };

    const updatePic = (name, thumb) => {
        apolloLib.client(session)
            .mutate({
                fetchPolicy: 'no-cache',
                mutation: mutations.updateImage,
                variables: {
                    uid: uid,
                    profileImage: name ? `dp/${uid}/${name}.jpg` : '',
                    profileImageB64: thumb || '',
                },
            })
            .then(() => {
                setPreviewEnabled(true);
                setLoading(false);
                if (name) {
                    uploadComplete(true, name, thumb);
                }
                session.update({
                    ...user,
                    profileImage: name ? `dp/${uid}/${name}.jpg` : '',
                    profileImageB64: thumb || '',
                });
            })
            .catch(() => {
                setPreviewEnabled(true);
                setLoading(false);
                uploadComplete(false, name, thumb);
            });
    };

    const changeImage = imageFile => {
        profileThumb(imageFile).then(thumb => {
            if (isCreation && uid && uid.length > 0) {
                setImage(imageFile.path);
                setPreviewEnabled(false);
                setLoading(true);
                uploadDP(uid, imageFile.path)
                    .then(name => {
                        updatePic(name, thumb);
                    })
                    .catch(err => {
                        setPreviewEnabled(true);
                        uploadComplete(true, err);
                    });
            } else {
                setImage(imageFile.path);
                saveFile(imageFile, thumb);
            }
        });
    };

    const imagePressed = () => {
        if (image) {
            setPreview(true);
        } else {
            setAttach(true);
        }
    };

    const closeButton = () => (
        <TouchableOpacity
            style={[styles.closeButton, {alignSelf: 'flex-end'}]}
            onPress={() => setPreview(false)}>
            <Image style={styles.closeIcon} source={icons.close}/>
        </TouchableOpacity>
    );
    const getImage = () => {
        if (image) {
            return {uri: image};
        } else {
            if (userType === types.general) {
                return placeHolders.avatar;
            } else {
                return placeHolders.logo;
            }
        }
    };

    const profileThumb = file => {
        return new Promise((resolve, reject) => {
            copyCacheFile(file.path, 'dp', 'temp', file.name).then(filepath => {
                let mediaThumb = '';
                let thumbnail = '';
                ImageResizer.createResizedImage(
                    filepath,
                    config.thumbnail.maxWidth,
                    config.thumbnail.maxHeight,
                    config.thumbnail.format,
                    config.thumbnail.quality,
                    0,
                    `${RNFS.CachesDirectoryPath}/dp/`,
                    true,
                    {onlyScaleDown: true, mode: 'contain'},
                )
                    .then(response => {
                        mediaThumb = response.uri;
                        const ex = path.extname(mediaThumb).toLowerCase();
                        const extension = ex.replace('.', '');
                        if (mediaThumb) {
                            RNFS.readFile(mediaThumb, 'base64').then(resp => {
                                resolve(`data:image/${extension};base64,${resp}`);
                            });
                        }
                    })
                    .catch(logger.e);
            });
        });
    };

    return (
        <View style={styles.imageBlock}>
            <TouchableHighlight
                style={[styles.imageContainer]}
                onPress={imagePressed}>
                <View style={{flex: 1, justifyContent: 'center'}}>
                    <ImageIcon
                        size={imageSize}
                        onPress={imagePressed}
                        source={getImage()}
                    />
                    {loading && image !== null && image.trim().length > 0 && (
                        <LottieView
                            source={lottie.loader}
                            style={{height: 50, alignSelf: 'center', position: 'absolute'}}
                            autoPlay
                            loop
                        />
                    )}

                    <TouchableOpacity
                        onPress={() => {
                            setAttach(true);
                        }}
                        style={styles.addButton}>
                        <Icon name="camera" type="font-awesome" size={15} color="red"/>
                    </TouchableOpacity>
                </View>
            </TouchableHighlight>
            {attach && (
                <AttachBar
                    visibility={attach}
                    onDismiss={() => setAttach(false)}
                    changeImage={changeImage}
                    removeImage={onRemove}
                />
            )}
            {preview && previewEnabled && (
                <ImageView
                    images={image ? [{uri: image}] : []}
                    // animationType={'fade'}
                    imageIndex={0}
                    visible={preview && previewEnabled}
                    onRequestClose={() => {
                        setPreview(false);
                    }}
                />
            )}
        </View>
    );
}
