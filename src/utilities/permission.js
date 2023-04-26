import {PERMISSIONS, request, RESULTS} from "react-native-permissions";
import {Platform} from "react-native";

const permissions = {
    android: {
        camera: PERMISSIONS.ANDROID.CAMERA,
        gallery: PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
        media: PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
    },
    ios: {
        camera: PERMISSIONS.IOS.CAMERA,
        gallery: PERMISSIONS.IOS.PHOTO_LIBRARY,
        media: PERMISSIONS.IOS.MEDIA_LIBRARY,
    }
}

export default function checkPermission(permission) {
    return new Promise((resolved, rejected) => {
        try {
            const _permission = permissions[Platform.OS][permission]
            request(_permission)
                .then((result) => {
                    switch (result) {
                        case RESULTS.UNAVAILABLE:
                            rejected('This feature is not available on this device')
                            break;
                        case RESULTS.DENIED:
                            rejected('The permission denied')
                            break;
                        case RESULTS.LIMITED:
                            resolved()
                            break;
                        case RESULTS.GRANTED:
                            resolved()
                            break;
                        case RESULTS.BLOCKED:
                            rejected('The permission is denied');
                            break;
                    }
                })
                .catch(() => {
                    rejected('This feature is not available on this device')
                });
        } catch (s) {
            rejected('This feature is not available on this device')
        }
    })

}
